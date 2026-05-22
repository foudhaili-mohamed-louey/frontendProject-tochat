export interface UserCreateDTO {
  // ===== KEYCLOAK FIELDS =====
  username: string;
  firstName: string;
  lastName: string;
  email: string;
 

  isActive: boolean;

  // ===== CUSTOM ATTRIBUTES =====
  cin: string;
  phone: string;
  photoUrl?: string; 
  sex: 'Male' | 'Female';
  hireDate: string; // format: YYYY-MM-DD
  profession: string;

  // ===== ROLE =====
  roleMetadataId: number;

    // ===== DEPARTMENT =====
  // optional — null for ADMIN and SUPER_ADMIN
  departmentId?: number;
}
