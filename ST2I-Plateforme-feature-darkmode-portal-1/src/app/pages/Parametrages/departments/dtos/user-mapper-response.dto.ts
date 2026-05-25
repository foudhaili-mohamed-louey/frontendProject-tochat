export interface UserMapperResponseDTO {
  id?: number | null;
  keycloakId?: string | null;

  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  email?: string | null;
  emailVerified?: boolean | null;

  photoUrl?: string | null;

  professionId?: number | null;
  professionName?: string | null;
  professionCode?: string | null;

  phone?: string | null;
  sex?: string | null;
  hireDate?: string | null;

  isActive?: boolean | null;

  roleMetadataId?: number | null;
  roleName?: string | null;
  roleLevel?: number | null;

  departmentId?: number | null;
  departmentName?: string | null;
  departmentCode?: string | null;
  departmentType?: string | null;
}