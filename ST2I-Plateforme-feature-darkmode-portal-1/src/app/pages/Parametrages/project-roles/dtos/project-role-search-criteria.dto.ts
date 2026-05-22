export interface ProjectRoleSearchCriteriaDTO {
  keyword?: string;
  uniqueRole?: boolean;
  active?: boolean;
  roleCategoryId?: number;
  hierarchyLevel?: number;
}