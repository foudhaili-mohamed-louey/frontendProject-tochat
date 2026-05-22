import { ProjectStatus } from './project-status.enum';

export interface ProjectResponseDTO {
  id: number;

  name?: string;
  description?: string;
  status: ProjectStatus;

  startDate?: string;
  endDate?: string;
  budget?: number;
  clientName?: string;

  active: boolean;

  teamId?: number;
  teamName?: string;

  departmentIds?: number[];

  createdAt?: string;
  updatedAt?: string;
}