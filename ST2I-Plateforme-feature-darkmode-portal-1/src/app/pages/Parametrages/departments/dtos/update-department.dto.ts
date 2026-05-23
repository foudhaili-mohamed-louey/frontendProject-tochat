export interface UpdateDepartmentDTO {
  name?: string;
  description?: string;
  location?: string;
  phoneNumber?: string;
  email?: string;
  chefKeycloakId?: string | null;
}