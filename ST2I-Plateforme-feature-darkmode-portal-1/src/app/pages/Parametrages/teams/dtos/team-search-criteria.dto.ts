import { TeamStatus } from './team-status.enum';

export interface TeamSearchCriteriaDTO {
  keyword?: string;
  status?: TeamStatus;
  projectId?: number;
}