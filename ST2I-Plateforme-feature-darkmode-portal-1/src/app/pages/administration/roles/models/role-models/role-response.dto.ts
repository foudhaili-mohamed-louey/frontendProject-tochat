export interface RoleResponseDTO {
  id: number;
  keycloakRoleId?: string;
  name: string;
  level: number;
  description?: string;
  isSystemRole?: boolean;
  createdAt?: string;   
  updatedAt?: string;   
}