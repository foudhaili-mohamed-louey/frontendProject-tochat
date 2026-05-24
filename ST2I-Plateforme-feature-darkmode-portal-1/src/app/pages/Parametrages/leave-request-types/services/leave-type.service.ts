import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LeaveTypeRequestDTO } from '../dtos/leave-type-request.dto';
import { LeaveTypeResponseDTO } from '../dtos/leave-type-response.dto';
import { LeaveTypeSearchDTO } from '../dtos/leave-type-search.dto';
import { PageResponse } from '../dtos/page-response.dto';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {

  private readonly baseUrl = 'http://localhost:8888/api/leave-types';

  constructor(private http: HttpClient) {}

  create(payload: LeaveTypeRequestDTO): Observable<LeaveTypeResponseDTO> {
    return this.http.post<LeaveTypeResponseDTO>(this.baseUrl, payload);
  }

  update(id: number, payload: LeaveTypeRequestDTO): Observable<LeaveTypeResponseDTO> {
    return this.http.put<LeaveTypeResponseDTO>(`${this.baseUrl}/${id}`, payload);
  }

  getById(id: number): Observable<LeaveTypeResponseDTO> {
    return this.http.get<LeaveTypeResponseDTO>(`${this.baseUrl}/${id}`);
  }

  search(
    filters: LeaveTypeSearchDTO,
    page: number = 0,
    size: number = 5
  ): Observable<PageResponse<LeaveTypeResponseDTO>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.post<PageResponse<LeaveTypeResponseDTO>>(
      `${this.baseUrl}/search`,
      filters || {},
      { params }
    );
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  reactivate(id: number): Observable<LeaveTypeResponseDTO> {
    return this.http.patch<LeaveTypeResponseDTO>(`${this.baseUrl}/${id}/reactivate`, {});
  }
}