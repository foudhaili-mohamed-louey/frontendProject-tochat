import { ProjectStatus } from './project-status.enum';

export interface ProjectSearchCriteriaDTO {
  keyword?: string;
  status?: ProjectStatus;
  startDateFrom?: string;
  endDateTo?: string;
  clientName?: string;
  teamId?: number;
}