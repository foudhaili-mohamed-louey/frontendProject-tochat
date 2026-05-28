import { LeaveUnit } from './leave-unit';
import { LeaveIncrementMode } from './leave-increment-mode';
import { GenderRestriction } from './gender-restriction';

export interface LeaveTypeResponseDTO {
  idLeaveType: number;

  code: string;
  name: string;
  description?: string;

  unit: LeaveUnit;
  incrementMode: LeaveIncrementMode;

  defaultBalance: number;
  monthlyIncrement: number;
  yearlyAllowance: number;
  maxBalance: number;

  carryOverEnabled: boolean;
  requiresJustification: boolean;
  requiresApproval: boolean;

  allowsHalfDay: boolean;
  genderRestriction?: GenderRestriction | null;

  active: boolean;

  createdAt: string;
  updatedAt: string;
}