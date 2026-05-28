import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EmployeeLeaveBalanceRequestDTO } from '../dtos/employee-leave-balance-request.dto';
import { EmployeeLeaveBalanceUpdateDTO } from '../dtos/employee-leave-balance-update.dto';
import { EmployeeLeaveBalanceResponseDTO } from '../dtos/employee-leave-balance-response.dto';
import { EmployeeLeaveBalanceSearchDTO } from '../dtos/employee-leave-balance-search.dto';
import { EmployeeLeaveBalanceSummaryDTO } from '../dtos/employee-leave-balance-summary.dto';
import { PageResponse } from '../dtos/page-response.dto';

@Injectable({
  providedIn: 'root'
})
export class EmployeeLeaveBalanceService {

  private readonly apiUrl = 'http://localhost:8888/api/leave-balances';

  constructor(private http: HttpClient) {}

  search(
    criteria: EmployeeLeaveBalanceSearchDTO = {},
    page: number = 0,
    size: number = 5
  ): Observable<PageResponse<EmployeeLeaveBalanceResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.post<PageResponse<EmployeeLeaveBalanceResponseDTO>>(
      `${this.apiUrl}/search`,
      criteria,
      { params }
    );
  }

  searchEmployeeSummaries(
    criteria: EmployeeLeaveBalanceSearchDTO = {},
    page: number = 0,
    size: number = 5
  ): Observable<PageResponse<EmployeeLeaveBalanceSummaryDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.post<PageResponse<EmployeeLeaveBalanceSummaryDTO>>(
      `${this.apiUrl}/employees-summary`,
      criteria,
      { params }
    );
  }

  getAll(
    page: number = 0,
    size: number = 5
  ): Observable<PageResponse<EmployeeLeaveBalanceResponseDTO>> {
    return this.search({}, page, size);
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
    dto: EmployeeLeaveBalanceUpdateDTO
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

  reactivate(id: number): Observable<EmployeeLeaveBalanceResponseDTO> {
    return this.http.patch<EmployeeLeaveBalanceResponseDTO>(
      `${this.apiUrl}/${id}/reactivate`,
      {}
    );
  }

  initializeForUser(idEmployee: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/initialize/${idEmployee}`,
      {}
    );
  }
}