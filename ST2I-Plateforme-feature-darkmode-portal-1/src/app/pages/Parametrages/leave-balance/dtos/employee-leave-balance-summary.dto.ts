import { UserResponseDTO } from '@/app/pages/administration/users/models/user-response.dto';

export interface EmployeeLeaveBalanceSummaryDTO {

  idEmployee: number;

  employee?: UserResponseDTO | null;

  year: number;

  totalLeaveTypes: number;

  active: boolean;
}