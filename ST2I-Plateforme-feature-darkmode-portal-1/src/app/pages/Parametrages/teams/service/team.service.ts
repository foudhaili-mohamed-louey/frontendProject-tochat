import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PageResponse } from '../../projects/dtos/page-response.dto';
import { TeamCreateDTO } from '../dtos/team-create.dto';
import { TeamUpdateDTO } from '../dtos/team-update.dto';
import { TeamResponseDTO } from '../dtos/team-response.dto';
import { TeamSearchCriteriaDTO } from '../dtos/team-search-criteria.dto';
import { TeamMemberCreateDTO } from '../dtos/team-member-create.dto';
import { TeamMemberUpdateDTO } from '../dtos/team-member-update.dto';
import { TeamMemberResponseDTO } from '../dtos/team-member-response.dto';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private readonly apiUrl = 'http://localhost:8888/api/teams';

  constructor(private http: HttpClient) {}

  create(payload: TeamCreateDTO): Observable<TeamResponseDTO> {
    return this.http.post<TeamResponseDTO>(this.apiUrl, payload);
  }

  update(id: number, payload: TeamUpdateDTO): Observable<TeamResponseDTO> {
    return this.http.put<TeamResponseDTO>(`${this.apiUrl}/${id}`, payload);
  }

  getById(id: number): Observable<TeamResponseDTO> {
    return this.http.get<TeamResponseDTO>(`${this.apiUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 7): Observable<PageResponse<TeamResponseDTO>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<TeamResponseDTO>>(this.apiUrl, { params });
  }

  search(
    criteria: TeamSearchCriteriaDTO,
    page: number = 0,
    size: number = 7
  ): Observable<PageResponse<TeamResponseDTO>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.post<PageResponse<TeamResponseDTO>>(
      `${this.apiUrl}/search`,
      criteria,
      { params }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addMember(teamId: number, payload: TeamMemberCreateDTO): Observable<TeamResponseDTO> {
    return this.http.post<TeamResponseDTO>(`${this.apiUrl}/${teamId}/members`, payload);
  }

  updateMember(
    teamId: number,
    memberId: number,
    payload: TeamMemberUpdateDTO
  ): Observable<TeamResponseDTO> {
    return this.http.put<TeamResponseDTO>(
      `${this.apiUrl}/${teamId}/members/${memberId}`,
      payload
    );
  }

  removeMember(teamId: number, memberId: number): Observable<TeamResponseDTO> {
    return this.http.delete<TeamResponseDTO>(`${this.apiUrl}/${teamId}/members/${memberId}`);
  }

  getFreeTeams(page: number = 0, size: number = 100): Observable<PageResponse<TeamResponseDTO>> {
    return this.search({ status: 'FREE' }, page, size);
  }

  saveHierarchy(
    teamId: number,
    hierarchy: { memberId: number; supervisorId?: number | null }[]
  ): Observable<TeamResponseDTO> {
    return this.http.put<TeamResponseDTO>(
      `${this.apiUrl}/${teamId}/hierarchy`,
      hierarchy
    );
  }

  getValidSupervisors(
    teamId: number,
    memberId: number
  ): Observable<TeamMemberResponseDTO[]> {
    return this.http.get<TeamMemberResponseDTO[]>(
      `${this.apiUrl}/${teamId}/members/${memberId}/valid-supervisors`
    );
  }
}