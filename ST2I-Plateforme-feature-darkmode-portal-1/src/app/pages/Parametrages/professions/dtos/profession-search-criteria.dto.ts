export interface ProfessionSearchCriteriaDTO {
  name?: string;
  code?: string;
  idDepartment?: number;
  active?: boolean;
  uniqueByDepartment?: boolean;
}