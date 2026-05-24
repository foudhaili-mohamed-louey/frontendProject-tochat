export interface ProfessionResponseDTO {
  idProfession: number;
  name: string;
  code: string;

  idDepartment: number;
  departmentName?: string;
  departmentCode?: string;
  departmentType?: string;

  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}