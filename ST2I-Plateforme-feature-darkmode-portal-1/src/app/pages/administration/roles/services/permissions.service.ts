import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PermissionAction } from '../models/permissions-models/permission-action.enum';
import { PermissionRequestDTO } from '../models/permissions-models/permission-request.dto';
import { PermissionResponseDTO } from '../models/permissions-models/permission-response.dto';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  private apiUrl = 'http://localhost:8888/api/permissions';

  constructor(private http: HttpClient) {}

  // ===== CREATE =====
  // POST /api/permissions?action=&moduleId= → 201 + created permission
  createPermission(action: PermissionAction, moduleId: number): Observable<PermissionResponseDTO> {
    return this.http.post<PermissionResponseDTO>(
      this.apiUrl,
      {},
      { params: { action, moduleId } }
    );
  }

  // ===== UPDATE =====
  // PUT /api/permissions/{id}?action=&moduleId= → 200 + updated permission
  updatePermission(id: number, action: PermissionAction, moduleId: number): Observable<PermissionResponseDTO> {
    return this.http.put<PermissionResponseDTO>(
      `${this.apiUrl}/${id}`,
      {},
      { params: { action, moduleId } }
    );
  }

  // ===== DELETE =====
  // DELETE /api/permissions/{id} → 204 no content
  deletePermission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ===== GET ALL =====
  // GET /api/permissions → 200 + list of all permissions
  getAllPermissions(): Observable<PermissionResponseDTO[]> {
    return this.http.get<PermissionResponseDTO[]>(this.apiUrl);
  }

  // ===== GET BY MODULE =====
  // GET /api/permissions/module/{moduleId} → 200 + permissions of a module
  getPermissionsByModule(moduleId: number): Observable<PermissionResponseDTO[]> {
    return this.http.get<PermissionResponseDTO[]>(`${this.apiUrl}/module/${moduleId}`);
  }
}