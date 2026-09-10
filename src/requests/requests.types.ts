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
