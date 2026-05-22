import { PermissionAction } from "./permission-action.enum";

export interface PermissionResponseDTO {
  id: number;
  action: PermissionAction;
  moduleId: number;
  moduleName: string;
}