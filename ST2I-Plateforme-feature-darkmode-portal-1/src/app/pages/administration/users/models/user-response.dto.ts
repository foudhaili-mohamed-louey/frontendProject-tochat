export interface UserResponseDTO {
  id: number;           
  keycloakId: string;   
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  cin?: string;
  phone?: string;
  photoUrl?: string;
  sex?: 'Male' | 'Female';
  hireDate?: string;
  profession?: string;
  roleMetadataId?: number;
  roleName?: string;
  roleLevel?: number;
  departmentId?: number;
  departmentName?: string; 
  departmentCode?: string; 
  departmentType?: string; 
}