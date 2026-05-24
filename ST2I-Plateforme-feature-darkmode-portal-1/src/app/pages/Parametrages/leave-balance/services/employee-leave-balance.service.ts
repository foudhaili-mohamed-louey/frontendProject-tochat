import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeLeaveBalanceRequestDTO } from '../dtos/employee-leave-balance-request.dto';
import { EmployeeLeaveBalanceResponseDTO } from '../dtos/employee-leave-balance-response.dto';
import { EmployeeLeaveBalanceSearchDTO } from '../dtos/employee-leave-balance-search.dto';
import { PageResponse } from '../dtos/page-response.dto';

@Injectable({
  providedIn: 'root'
})
export class EmployeeLeaveBalanceService {

  private readonly apiUrl = 'http://localhost:8888/api/leave-balances';

  constructor(private http: HttpClient) {}

  getAll(
    page: number = 0,
    size: number = 5
  ): Observable<PageResponse<EmployeeLeaveBalanceResponseDTO>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.post<PageResponse<EmployeeLeaveBalanceResponseDTO>>(
      `${this.apiUrl}/search`,
      {},
      { params }
    );
  }

  search(
    criteria: EmployeeLeaveBalanceSearchDTO,
    page: number = 0,
    size: number = 5
  ): Observable<PageResponse<EmployeeLeaveBalanceResponseDTO>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.post<PageResponse<EmployeeLeaveBalanceResponseDTO>>(
      `${this.apiUrl}/search`,
      criteria,
      { params }
    );
  }

  getById(id: number): Observable<EmployeeLeaveBalanceResponseDTO> {
    return this.http.get<EmployeeLeaveBalanceResponseDTO>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    dto: EmployeeLeaveBalanceRequestDTO
  ): Observable<EmployeeLeaveBalanceResponseDTO> {

    return this.http.post<EmployeeLeaveBalanceResponseDTO>(
      this.apiUrl,
      dto
    );
  }

  update(
    id: number,
    dto: EmployeeLeaveBalanceRequestDTO
  ): Observable<EmployeeLeaveBalanceResponseDTO> {

    return this.http.put<EmployeeLeaveBalanceResponseDTO>(
      `${this.apiUrl}/${id}`,
      dto
    );
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/deactivate`,
      {}
    );
  }

  reactivate(
    id: number
  ): Observable<EmployeeLeaveBalanceResponseDTO> {

    return this.http.patch<EmployeeLeaveBalanceResponseDTO>(
      `${this.apiUrl}/${id}/reactivate`,
      {}
    );
  }
}