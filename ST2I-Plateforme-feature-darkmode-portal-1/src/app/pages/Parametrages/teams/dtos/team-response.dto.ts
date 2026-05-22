import { TeamStatus } from './team-status.enum';
import { TeamMemberResponseDTO } from './team-member-response.dto';

export interface TeamResponseDTO {
  id: number;
  name?: string;
  description?: string;
  status: TeamStatus;

  projectId?: number;
  projectName?: string;

  members: TeamMemberResponseDTO[];

  createdAt?: string;
  updatedAt?: string;
}