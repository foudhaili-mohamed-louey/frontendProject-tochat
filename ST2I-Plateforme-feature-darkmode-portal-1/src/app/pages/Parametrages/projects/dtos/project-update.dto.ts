import { ProjectStatus } from './project-status.enum';

export interface ProjectUpdateDTO {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  clientName?: string;
}