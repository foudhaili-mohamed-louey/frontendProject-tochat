import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PageResponse } from '../../projects/dtos/page-response.dto';
import { RoleCategoryCreateDTO } from '../dtos/role-category-create.dto';
import { RoleCategoryUpdateDTO } from '../dtos/role-category-update.dto';
import { RoleCategoryResponseDTO } from '../dtos/role-category-response.dto';
import { RoleCategorySearchCriteriaDTO } from '../dtos/role-category-search-criteria.dto';

@Injectable({
  providedIn: 'root'
})
export class RoleCategoryService {

  private readonly apiUrl = 'http://localhost:8888/api/role-categories';

  constructor(private http: HttpClient) {}

  create(payload: RoleCategoryCreateDTO): Observable<RoleCategoryResponseDTO> {
    return this.http.post<RoleCategoryResponseDTO>(this.apiUrl, payload);
  }

  update(id: number, payload: RoleCategoryUpdateDTO): Observable<RoleCategoryResponseDTO> {
    return this.http.put<RoleCategoryResponseDTO>(`${this.apiUrl}/${id}`, payload);
  }

  getById(id: number): Observable<RoleCategoryResponseDTO> {
    return this.http.get<RoleCategoryResponseDTO>(`${this.apiUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 7): Observable<PageResponse<RoleCategoryResponseDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<RoleCategoryResponseDTO>>(this.apiUrl, { params });
  }

  search(criteria: RoleCategorySearchCriteriaDTO, page: number = 0, size: number = 7): Observable<PageResponse<RoleCategoryResponseDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post<PageResponse<RoleCategoryResponseDTO>>(`${this.apiUrl}/search`, criteria, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}