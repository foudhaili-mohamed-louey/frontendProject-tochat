export interface TeamMemberCreateDTO {
  userId: string;
  supervisorId?: number;
  projectRoleId: number;
}