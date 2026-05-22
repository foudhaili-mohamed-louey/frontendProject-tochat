export interface ProjectRoleCreateDTO {
  name: string;
  description?: string;
  uniqueRole?: boolean;
  hierarchyLevel: number;
  roleCategoryId: number;
}