export interface UserMapperResponseDTO {
  id: number;
  keycloakId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
  profession: string;
  phone: string;
  sex: string;
  hireDate: string; 
  isActive: boolean;
  roleMetadataId: number;
  roleName: string;
  roleLevel: number;
  departmentId: number;
}