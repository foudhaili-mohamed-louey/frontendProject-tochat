export interface TeamMemberResponseDTO {
  id: number;
  userId: string;

  supervisorId?: number;
  supervisorUserId?: string;

  projectRoleId?: number;
  projectRoleName?: string;

  hierarchyLevel?: number;

  roleCategoryName?: string;
  roleCategoryColor?: string;

  createdAt?: string;
  updatedAt?: string;
}