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
