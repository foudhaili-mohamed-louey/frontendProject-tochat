import { PermissionResponseDTO } from '../permissions-models/permission-response.dto';

export interface RolePermissionResponseDTO {
  roleMetadataId: number;
  roleName: string;
  roleLevel: number;
  permissions: PermissionResponseDTO[];
}