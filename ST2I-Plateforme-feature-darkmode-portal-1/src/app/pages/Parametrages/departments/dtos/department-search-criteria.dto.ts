export interface DepartmentSearchCriteria {
  name?: string;
  code?: string;
  localisation?: string;
  isActive?: boolean | null;
  type?: string | null;
}