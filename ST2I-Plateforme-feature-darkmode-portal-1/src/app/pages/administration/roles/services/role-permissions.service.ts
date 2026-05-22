import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { RolePermissionRequestDTO } from '../models/role-premission/role-permission-request.dto';
import { RolePermissionResponseDTO } from '../models/role-premission/role-permission-response.dto';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionsService {

  private apiUrl = 'http://localhost:8888/api/role-permissions';

  constructor(private http: HttpClient) {}

  // ===== ASSIGN / SYNC PERMISSIONS =====
  // POST /api/role-permissions → 200 + updated role permissions
  assignPermissions(dto: RolePermissionRequestDTO): Observable<RolePermissionResponseDTO> {
    return this.http.post<RolePermissionResponseDTO>(this.apiUrl, dto);
  }

  // ===== GET BY ROLE =====
  // GET /api/role-permissions/{roleMetadataId} → 200 + role with permissions
  getPermissionsByRole(roleMetadataId: number): Observable<RolePermissionResponseDTO> {
    return this.http.get<RolePermissionResponseDTO>(`${this.apiUrl}/${roleMetadataId}`);
  }

  // ===== DELETE ALL BY ROLE =====
  // DELETE /api/role-permissions/{roleMetadataId} → 204 no content
  deleteAll(roleMetadataId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roleMetadataId}`);
  }

  // ===== REMOVE ONE PERMISSION =====
  // DELETE /api/role-permissions/{roleMetadataId}/{permissionId} → 204 no content
  removePermission(roleMetadataId: number, permissionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roleMetadataId}/${permissionId}`);
  }
}