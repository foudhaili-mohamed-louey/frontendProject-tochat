export interface ProjectRoleUpdateDTO {
  name?: string;
  description?: string;
  uniqueRole?: boolean;
  hierarchyLevel?: number;
  roleCategoryId?: number;
}