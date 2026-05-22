export interface UserAdminUpdateDTO {
  firstName: string;
  lastName: string;
  email: string;

  phone: string;
  photoUrl?: string;
  sex: 'Male' | 'Female';
  hireDate: string;
  profession: string;

  isActive: boolean;

  roleMetadataId: number;


  departmentId?: number;
}