import { Module } from '@nestjs/common';

import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [RequestsModule],
})
export class AppModule {}



import { Module } from '@nestjs/common';

import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}


export enum RequestStatus {
  RECEIVED = 'Received',
  CLASSIFYING = 'Classifying',
  NEEDS_CLARIFICATION = 'Needs Clarification',
  CLASSIFIED = 'Classified',
  ROUTED = 'Routed',
  IN_REVIEW = 'In Review',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
}

export enum RequestCategory {
  HR = 'HR',
  IT = 'IT',
  FACULTY = 'Faculty',
  OTHER = 'Other',
}

export enum ResolutionType {
  LIVE_CHAT = 'Live Chat',
  REMOTE_FIX = 'Remote Fix',
}

export interface RequestHistory {
  old_status: RequestStatus | null;
  new_status: RequestStatus;
  changed_by_id: number;
  message?: string;
  timestamp: Date;
}

export interface Request {
  request_id: number;
  employee_id: number;
  type: string;
  description: string;

  status: RequestStatus;

  category?: RequestCategory;
  classification_confidence?: number;
  sensitive?: boolean;

  assigned_to?: string;

  resolution_type?: ResolutionType;

  clarification_message?: string;
  employee_response?: string;

  history: RequestHistory[];

  created_at: Date;
  updated_at: Date;
}

export interface CreateRequestDto {
  employee_id: number;
  type: string;
  description: string;
}

export interface ClassifyRequestDto {
  category: RequestCategory;
  confidence: number;
  sensitive: boolean;
}

export interface ClarificationDto {
  message: string;
}

export interface ResolveRequestDto {
  resolution_type: ResolutionType;
  message: string;
}



import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Request,
  RequestStatus,
  RequestCategory,
  ResolutionType,
  CreateRequestDto,
  ClassifyRequestDto,
  ClarificationDto,
  ResolveRequestDto,
} from './requests.types';

@Injectable()
export class RequestsService {
  private requests: Request[] = [];
  private nextId = 1;

  create(dto: CreateRequestDto): Request {
    if (!dto.employee_id || !dto.type || !dto.description) {
      throw new BadRequestException(
        'employee_id, type and description are required',
      );
    }

    const now = new Date();

    const request: Request = {
      request_id: this.nextId++,
      employee_id: dto.employee_id,
      type: dto.type,
      description: dto.description,

      status: RequestStatus.RECEIVED,

      history: [
        {
          old_status: null,
          new_status: RequestStatus.RECEIVED,
          changed_by_id: dto.employee_id,
          timestamp: now,
        },
      ],

      created_at: now,
      updated_at: now,
    };

    this.requests.push(request);

    return request;
  }

  findAll(): Request[] {
    return this.requests;
  }

  findOne(id: number): Request {
    const request = this.requests.find(
      (request) => request.request_id === id,
    );

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  classify(
    id: number,
    dto: ClassifyRequestDto,
  ): Request {
    const request = this.findOne(id);

    if (
      request.status !== RequestStatus.RECEIVED &&
      request.status !== RequestStatus.CLASSIFYING &&
      request.status !== RequestStatus.NEEDS_CLARIFICATION
    ) {
      throw new BadRequestException(
        'Request cannot be classified in its current status',
      );
    }

    if (dto.confidence < 0 || dto.confidence > 1) {
      throw new BadRequestException(
        'Confidence must be between 0 and 1',
      );
    }

    this.changeStatus(
      request,
      RequestStatus.CLASSIFYING,
      0,
    );

    request.category = dto.category;
    request.classification_confidence = dto.confidence;
    request.sensitive = dto.sensitive;

    if (dto.confidence < 0.7) {
      this.changeStatus(
        request,
        RequestStatus.NEEDS_CLARIFICATION,
        0,
      );
    } else {
      this.changeStatus(
        request,
        RequestStatus.CLASSIFIED,
        0,
      );
    }

    request.updated_at = new Date();

    return request;
  }

  clarification(
    id: number,
    dto: ClarificationDto,
  ): Request {
    const request = this.findOne(id);

    if (
      request.status !==
      RequestStatus.NEEDS_CLARIFICATION
    ) {
      throw new BadRequestException(
        'Request does not need clarification',
      );
    }

    if (!dto.message) {
      throw new BadRequestException(
        'Clarification message is required',
      );
    }

    request.employee_response = dto.message;

    this.changeStatus(
      request,
      RequestStatus.CLASSIFYING,
      request.employee_id,
    );

    request.updated_at = new Date();

    return request;
  }

  route(id: number): Request {
    const request = this.findOne(id);

    if (request.status !== RequestStatus.CLASSIFIED) {
      throw new BadRequestException(
        'Only classified requests can be routed',
      );
    }

    if (request.sensitive) {
      request.assigned_to = 'HR_QUEUE';
    } else if (
      request.category === RequestCategory.IT
    ) {
      request.assigned_to = 'IT_QUEUE';
    } else {
      request.assigned_to = 'FACULTY_QUEUE';
    }

    this.changeStatus(
      request,
      RequestStatus.ROUTED,
      0,
    );

    request.updated_at = new Date();

    return request;
  }

  review(id: number): Request {
    const request = this.findOne(id);

    if (request.status !== RequestStatus.ROUTED) {
      throw new BadRequestException(
        'Only routed requests can enter review',
      );
    }

    this.changeStatus(
      request,
      RequestStatus.IN_REVIEW,
      0,
    );

    request.updated_at = new Date();

    return request;
  }

  startProgress(id: number): Request {
    const request = this.findOne(id);

    if (request.status !== RequestStatus.IN_REVIEW) {
      throw new BadRequestException(
        'Only requests under review can enter progress',
      );
    }

    this.changeStatus(
      request,
      RequestStatus.IN_PROGRESS,
      0,
    );

    request.updated_at = new Date();

    return request;
  }

  resolve(
    id: number,
    dto: ResolveRequestDto,
  ): Request {
    const request = this.findOne(id);

    if (request.status !== RequestStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Only requests in progress can be resolved',
      );
    }

    if (!dto.message) {
      throw new BadRequestException(
        'Resolution message is required',
      );
    }

    request.resolution_type = dto.resolution_type;

    this.changeStatus(
      request,
      RequestStatus.RESOLVED,
      0,
      dto.message,
    );

    request.updated_at = new Date();

    return request;
  }

  getHistory(id: number) {
    const request = this.findOne(id);

    return request.history;
  }

  private changeStatus(
    request: Request,
    newStatus: RequestStatus,
    changedById: number,
    message?: string,
  ): void {
    const oldStatus = request.status;

    if (oldStatus === newStatus) {
      return;
    }

    request.status = newStatus;

    request.history.push({
      old_status: oldStatus,
      new_status: newStatus,
      changed_by_id: changedById,
      message,
      timestamp: new Date(),
    });
  }
}



import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { RequestsService } from './requests.service';

import {
  CreateRequestDto,
  ClassifyRequestDto,
  ClarificationDto,
  ResolveRequestDto,
} from './requests.types';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
  ) {}

  @Post()
  create(@Body() dto: CreateRequestDto) {
    return this.requestsService.create(dto);
  }

  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get(':id/history')
  getHistory(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.requestsService.getHistory(id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.requestsService.findOne(id);
  }

  @Post(':id/classify')
  classify(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ClassifyRequestDto,
  ) {
    return this.requestsService.classify(id, dto);
  }

  @Post(':id/clarification')
  clarification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ClarificationDto,
  ) {
    return this.requestsService.clarification(
      id,
      dto,
    );
  }

  @Post(':id/route')
  route(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.requestsService.route(id);
  }

  @Post(':id/review')
  review(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.requestsService.review(id);
  }

  @Post(':id/start')
  startProgress(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.requestsService.startProgress(id);
  }

  @Post(':id/resolve')
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolveRequestDto,
  ) {
    return this.requestsService.resolve(id, dto);
  }
}
