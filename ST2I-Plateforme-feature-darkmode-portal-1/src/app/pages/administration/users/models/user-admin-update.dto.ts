export interface UserAdminUpdateDTO {
  firstName: string;
  lastName: string;
  email: string;

  phone: string;
  photoUrl?: string;
  sex: 'Male' | 'Female';
  cin: string;
  hireDate: string;
  professionId: number;

  isActive: boolean;

  roleMetadataId: number;


  departmentId?: number;
}