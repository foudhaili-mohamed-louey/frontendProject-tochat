export interface ProfessionCreateDTO {
  name: string;
  code: string;
  idDepartment: number;
  uniqueByDepartment?: boolean;
}