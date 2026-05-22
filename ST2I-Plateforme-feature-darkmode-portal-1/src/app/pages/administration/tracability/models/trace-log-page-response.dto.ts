import { TraceLogResponseDTO } from './trace-log-response.dto';

export interface TraceLogPageResponseDTO {
  content: TraceLogResponseDTO[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  pageSize: number;
}