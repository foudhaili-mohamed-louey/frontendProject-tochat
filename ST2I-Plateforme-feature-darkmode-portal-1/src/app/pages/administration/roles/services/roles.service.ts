import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { RoleRequestDTO } from '../models/role-models/role-request.dto';
import { RoleResponseDTO } from '../models/role-models/role-response.dto';
import { RolePageDTO } from '../models/role-models/role-page.dto';
import { RoleSearchCriteriaDTO } from '../models/role-models/role-search-criteria.dto';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl = 'http://localhost:8888/api/roles';

  constructor(private http: HttpClient) {}

  // ===== CREATE =====
  // POST /api/roles → 201 + created role
  createRole(payload: RoleRequestDTO): Observable<RoleResponseDTO> {
    return this.http.post<RoleResponseDTO>(this.apiUrl, payload);
  }

  // ===== UPDATE =====
  // PUT /api/roles/{name} → 200 + updated role
  updateRole(name: string, payload: RoleRequestDTO): Observable<RoleResponseDTO> {
    return this.http.put<RoleResponseDTO>(`${this.apiUrl}/${name}`, payload);
  }

  // ===== DELETE =====
  // DELETE /api/roles/{name} → 204 no content
  deleteRole(name: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${name}`);
  }

  // ===== GET ALL =====
  // GET /api/roles → 200 + list of all roles
  getRoles(): Observable<RoleResponseDTO[]> {
    return this.http.get<RoleResponseDTO[]>(this.apiUrl);
  }

  // ===== SEARCH + PAGINATION =====
  // GET /api/roles/search?page=0&size=5&name=a&isSystemRole=true
  searchRoles(
    criteria: RoleSearchCriteriaDTO,
    page: number = 0,
    size: number = 5
  ): Observable<RolePageDTO> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (criteria.name?.trim()) {
      params = params.set('name', criteria.name.trim());
    }

    if (criteria.isSystemRole !== null && criteria.isSystemRole !== undefined) {
      params = params.set('isSystemRole', criteria.isSystemRole);
    }

    return this.http.get<RolePageDTO>(`${this.apiUrl}/search`, { params });
  }

  // ===== GET BY NAME =====
  // GET /api/roles/{name} → 200 + single role
  getRoleByName(name: string): Observable<RoleResponseDTO> {
    return this.http.get<RoleResponseDTO>(`${this.apiUrl}/${name}`);
  }

  // ===== GET MANAGEABLE ROLES =====
  // GET /api/roles/manageable → 200 + roles below current user's level
  // used to populate dropdowns and role assignment UI
  getManageableRoles(): Observable<RoleResponseDTO[]> {
    return this.http.get<RoleResponseDTO[]>(`${this.apiUrl}/manageable`);
  }
}