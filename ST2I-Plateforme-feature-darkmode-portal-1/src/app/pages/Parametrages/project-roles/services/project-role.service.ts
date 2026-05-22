import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PageResponse } from '../../projects/dtos/page-response.dto';
import { ProjectRoleCreateDTO } from '../dtos/project-role-create.dto';
import { ProjectRoleUpdateDTO } from '../dtos/project-role-update.dto';
import { ProjectRoleResponseDTO } from '../dtos/project-role-response.dto';
import { ProjectRoleSearchCriteriaDTO } from '../dtos/project-role-search-criteria.dto';

@Injectable({
  providedIn: 'root'
})
export class ProjectRoleService {

  private readonly apiUrl = 'http://localhost:8888/api/project-roles';

  constructor(private http: HttpClient) {}

  create(payload: ProjectRoleCreateDTO): Observable<ProjectRoleResponseDTO> {
    return this.http.post<ProjectRoleResponseDTO>(this.apiUrl, payload);
  }

  update(id: number, payload: ProjectRoleUpdateDTO): Observable<ProjectRoleResponseDTO> {
    return this.http.put<ProjectRoleResponseDTO>(`${this.apiUrl}/${id}`, payload);
  }

  getById(id: number): Observable<ProjectRoleResponseDTO> {
    return this.http.get<ProjectRoleResponseDTO>(`${this.apiUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 7): Observable<PageResponse<ProjectRoleResponseDTO>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<ProjectRoleResponseDTO>>(this.apiUrl, { params });
  }

  search(
    criteria: ProjectRoleSearchCriteriaDTO,
    page: number = 0,
    size: number = 7
  ): Observable<PageResponse<ProjectRoleResponseDTO>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.post<PageResponse<ProjectRoleResponseDTO>>(
      `${this.apiUrl}/search`,
      criteria,
      { params }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}