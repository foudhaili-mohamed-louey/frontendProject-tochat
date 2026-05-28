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

  firstAccrualDate?: string | null;

  active: boolean;

  createdAt?: string | null;
  updatedAt?: string | null;
}