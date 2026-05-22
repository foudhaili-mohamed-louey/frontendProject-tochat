export interface ProjectRoleResponseDTO {
  id: number;
  name: string;
  description?: string;
  uniqueRole: boolean;
  hierarchyLevel: number;
  active: boolean;

  roleCategoryId?: number;
  roleCategoryName?: string;
  roleCategoryColor?: string;

  createdAt?: string;
  updatedAt?: string;
}