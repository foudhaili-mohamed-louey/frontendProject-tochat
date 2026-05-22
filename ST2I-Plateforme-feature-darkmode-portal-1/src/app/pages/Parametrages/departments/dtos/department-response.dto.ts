import { DepartmentType } from './department-type';
import { UserMapperResponseDTO } from './user-mapper-response.dto';

export interface DepartmentResponseDTO {
  id: number;
  name: string;
  code: string;
  description?: string;
  location?: string;
  phoneNumber?: string;
  email?: string;
  type: DepartmentType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  users: UserMapperResponseDTO[];
}