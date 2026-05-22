export type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

export interface CurrentUserPermissions {
  roleMetadataId: number;
  roleName: string;
  roleLevel: number;
  isSystemRole: boolean;
  permissions: Record<string, PermissionAction[]>;
}