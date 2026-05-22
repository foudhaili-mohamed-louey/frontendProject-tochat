import { RoleResponseDTO } from './role-response.dto';

export interface RolePageDTO {
  content: RoleResponseDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}