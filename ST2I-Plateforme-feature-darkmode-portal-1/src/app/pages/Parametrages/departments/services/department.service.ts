import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreateDepartmentRequestDTO } from '../dtos/create-department-request.dto';
import { UpdateDepartmentDTO } from '../dtos/update-department.dto';
import { DepartmentResponseDTO } from '../dtos/department-response.dto';
import { DepartmentSearchCriteria } from '../dtos/department-search-criteria.dto';
import { PageResponse } from '../dtos/page-response.dto';
import { UserMapperResponseDTO } from '../dtos/user-mapper-response.dto';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private readonly BASE_URL  = 'http://localhost:8888/api/departments';
  private readonly USERS_URL = 'http://localhost:8888/api/users';

  constructor(private http: HttpClient) {}

  createDepartment(dto: CreateDepartmentRequestDTO): Observable<DepartmentResponseDTO> {
    return this.http.post<DepartmentResponseDTO>(this.BASE_URL, dto);
  }

  getById(id: number): Observable<DepartmentResponseDTO> {
    return this.http.get<DepartmentResponseDTO>(`${this.BASE_URL}/${id}`);
  }

  getByCode(code: string): Observable<DepartmentResponseDTO> {
    return this.http.get<DepartmentResponseDTO>(`${this.BASE_URL}/code/${code}`);
  }

  getAll(): Observable<DepartmentResponseDTO[]> {
    return this.http.get<DepartmentResponseDTO[]>(this.BASE_URL);
  }

  searchDepartments(
    criteria: DepartmentSearchCriteria,
    page: number = 0,
    size: number = 5
  ): Observable<PageResponse<DepartmentResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.post<PageResponse<DepartmentResponseDTO>>(
      `${this.BASE_URL}/search`,
      criteria,
      { params }
    );
  }

  updateDepartment(id: number, dto: UpdateDepartmentDTO): Observable<DepartmentResponseDTO> {
    return this.http.put<DepartmentResponseDTO>(`${this.BASE_URL}/${id}`, dto);
  }

  activateDepartment(id: number): Observable<void> {
    return this.http.patch<void>(`${this.BASE_URL}/${id}/activate`, {});
  }

  deactivateDepartment(id: number): Observable<void> {
    return this.http.patch<void>(`${this.BASE_URL}/${id}/deactivate`, {});
  }

  getActiveDepartments(): Observable<DepartmentResponseDTO[]> {
    return this.http.get<DepartmentResponseDTO[]>(`${this.BASE_URL}/active`);
  }

  getActiveOperationalDepartments(): Observable<DepartmentResponseDTO[]> {
    return this.http.get<DepartmentResponseDTO[]>(`${this.BASE_URL}/operational/active`);
  }

  // GET /api/users/mapper/by-department/{departmentId}
  getUsersByDepartment(departmentId: number): Observable<UserMapperResponseDTO[]> {
    return this.http.get<UserMapperResponseDTO[]>(
      `${this.USERS_URL}/mapper/by-department/${departmentId}`
    );
  }
  getOperationalDepartments(): Observable<DepartmentResponseDTO[]> {
  return this.http.get<DepartmentResponseDTO[]>(`${this.BASE_URL}/operational`);
}
}