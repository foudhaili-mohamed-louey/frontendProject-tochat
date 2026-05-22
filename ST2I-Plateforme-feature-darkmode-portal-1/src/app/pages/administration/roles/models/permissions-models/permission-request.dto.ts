import { PermissionAction } from './permission-action.enum';
export interface PermissionRequestDTO {
  action: PermissionAction;
  moduleId: number;
}