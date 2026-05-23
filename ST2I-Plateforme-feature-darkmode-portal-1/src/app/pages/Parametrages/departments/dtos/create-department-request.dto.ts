import { DepartmentType } from './department-type';

export interface CreateDepartmentRequestDTO {
  name: string;
  code: string;
  description: string;
  location: string;
  phoneNumber: string;
  email: string;
  type: DepartmentType;
  chefKeycloakId?: string | null;
}