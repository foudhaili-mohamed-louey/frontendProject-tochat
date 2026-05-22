export interface UserSearchCriteria {
  username?: string;
  firstName?: string;
  lastName?: string;
  cin?: string;
  sex?: 'Male' | 'Female';
  profession?: string;
  roleMetadataId?: number;
  isActive?: boolean;
  emailVerified?: boolean;
  departmentId?: number;
  departmentIds?: number[];
  hireDateFrom?: string;
  hireDateTo?: string;
}