import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProfessionCreateDTO } from '../dtos/profession-create.dto';
import { ProfessionUpdateDTO } from '../dtos/profession-update.dto';
import { ProfessionResponseDTO } from '../dtos/profession-response.dto';
import { ProfessionSearchCriteriaDTO } from '../dtos/profession-search-criteria.dto';

@Injectable({
  providedIn: 'root'
})
export class ProfessionService {

  private readonly apiUrl = 'http://localhost:8888/api/professions';

  constructor(private http: HttpClient) {}

  create(dto: ProfessionCreateDTO): Observable<ProfessionResponseDTO> {

    return this.http.post<ProfessionResponseDTO>(
      this.apiUrl,
      dto
    );
  }

  update(
    id: number,
    dto: ProfessionUpdateDTO
  ): Observable<ProfessionResponseDTO> {

    return this.http.put<ProfessionResponseDTO>(
      `${this.apiUrl}/${id}`,
      dto
    );
  }

  getById(id: number): Observable<ProfessionResponseDTO> {

    return this.http.get<ProfessionResponseDTO>(
      `${this.apiUrl}/${id}`
    );
  }

  activate(id: number): Observable<void> {

    return this.http.patch<void>(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }

  deactivate(id: number): Observable<void> {

    return this.http.patch<void>(
      `${this.apiUrl}/${id}/deactivate`,
      {}
    );
  }

  search(
    criteria: ProfessionSearchCriteriaDTO,
    page: number,
    size: number
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.post<any>(
      `${this.apiUrl}/search`,
      criteria,
      { params }
    );
  }

  // Used in profession pages
  // Includes unique professions
  getActiveByDepartment(
    idDepartment: number
  ): Observable<ProfessionResponseDTO[]> {

    return this.http.get<ProfessionResponseDTO[]>(
      `${this.apiUrl}/department/${idDepartment}/active`
    );
  }
  getSelectableByDepartment(
    idDepartment: number
  ): Observable<ProfessionResponseDTO[]> {

    return this.http.get<ProfessionResponseDTO[]>(
      `${this.apiUrl}/department/${idDepartment}/selectable`
    );
  }
}