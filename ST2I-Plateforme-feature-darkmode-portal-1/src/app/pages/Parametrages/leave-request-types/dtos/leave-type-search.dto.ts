import { LeaveUnit } from './leave-unit';
import { LeaveIncrementMode } from './leave-increment-mode';

export interface LeaveTypeSearchDTO {
  keyword?: string;
  unit?: LeaveUnit | null;
  incrementMode?: LeaveIncrementMode | null;
  active?: boolean | null;
}