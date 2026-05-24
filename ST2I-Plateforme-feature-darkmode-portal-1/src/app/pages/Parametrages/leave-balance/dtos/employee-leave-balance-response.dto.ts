import { LeaveTypeResponseDTO } from '../../leave-request-types/dtos/leave-type-response.dto';
import { UserResponseDTO } from '@/app/pages/administration/users/models/user-response.dto';

export interface EmployeeLeaveBalanceResponseDTO {
  idBalance: number;

  idEmployee: number;
  employee?: UserResponseDTO | null;

  leaveType: LeaveTypeResponseDTO;

  year: number;

  currentBalance: number;
  usedBalance: number;
  remainingBalance: number;

  active: boolean;

  createdAt: string;
  updatedAt: string;
}