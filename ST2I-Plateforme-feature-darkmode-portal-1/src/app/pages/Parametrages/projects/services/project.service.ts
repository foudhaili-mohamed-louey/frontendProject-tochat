import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PageResponse } from '../dtos/page-response.dto';

import { ProjectCreateDTO } from '../dtos/project-create.dto';
import { ProjectUpdateDTO } from '../dtos/project-update.dto';
import { ProjectResponseDTO } from '../dtos/project-response.dto';
import { ProjectSearchCriteriaDTO } from '../dtos/project-search-criteria.dto';
import { ProjectStatus } from '../dtos/project-status.enum';
import { ProjectStatusUpdateDTO } from '../dtos/project-status-update.dto';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private readonly apiUrl = 'http://localhost:8888/api/projects';

  constructor(private http: HttpClient) {}

  create(payload: ProjectCreateDTO): Observable<ProjectResponseDTO> {
    return this.http.post<ProjectResponseDTO>(this.apiUrl, payload);
  }

  update(id: number, payload: ProjectUpdateDTO): Observable<ProjectResponseDTO> {
    return this.http.put<ProjectResponseDTO>(`${this.apiUrl}/${id}`, payload);
  }

  getById(id: number): Observable<ProjectResponseDTO> {
    return this.http.get<ProjectResponseDTO>(`${this.apiUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 7): Observable<PageResponse<ProjectResponseDTO>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<ProjectResponseDTO>>(this.apiUrl, { params });
  }

  search(
    criteria: ProjectSearchCriteriaDTO,
    page: number = 0,
    size: number = 7
  ): Observable<PageResponse<ProjectResponseDTO>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.post<PageResponse<ProjectResponseDTO>>(
      `${this.apiUrl}/search`,
      criteria,
      { params }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignTeam(projectId: number, teamId: number): Observable<ProjectResponseDTO> {
    return this.http.post<ProjectResponseDTO>(
      `${this.apiUrl}/${projectId}/assign-team/${teamId}`,
      {}
    );
  }

  removeTeam(projectId: number): Observable<ProjectResponseDTO> {
    return this.http.delete<ProjectResponseDTO>(
      `${this.apiUrl}/${projectId}/remove-team`
    );
  }

  assignDepartment(
    projectId: number,
    departmentId: number,
    assignedBy?: string
  ): Observable<ProjectResponseDTO> {
    let params = new HttpParams();

    if (assignedBy && assignedBy.trim() !== '') {
      params = params.set('assignedBy', assignedBy.trim());
    }

    return this.http.post<ProjectResponseDTO>(
      `${this.apiUrl}/${projectId}/departments/${departmentId}`,
      {},
      { params }
    );
  }

  removeDepartment(projectId: number, departmentId: number): Observable<ProjectResponseDTO> {
    return this.http.delete<ProjectResponseDTO>(
      `${this.apiUrl}/${projectId}/departments/${departmentId}`
    );
  }

  changeStatus(projectId: number, status: ProjectStatus): Observable<ProjectResponseDTO> {
    const payload: ProjectStatusUpdateDTO = { status };

    return this.http.patch<ProjectResponseDTO>(
      `${this.apiUrl}/${projectId}/status`,
      payload
    );
  }
}