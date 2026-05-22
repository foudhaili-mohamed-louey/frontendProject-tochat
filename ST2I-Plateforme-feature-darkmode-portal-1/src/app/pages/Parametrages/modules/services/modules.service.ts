import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ModuleRequestDTO } from '../models/ModuleRequestDTO';
import { ModuleResponseDTO } from '../models/ModuleResponseDTO';

@Injectable({
  providedIn: 'root'
})
export class ModulesService {

  private apiUrl = 'http://localhost:8888/api/modules';

  constructor(private http: HttpClient) {}

  // GET ALL
  getModules(): Observable<ModuleResponseDTO[]> {
    return this.http.get<ModuleResponseDTO[]>(this.apiUrl);
  }

  // GET BY NAME
  getModuleByName(name: string): Observable<ModuleResponseDTO> {
    return this.http.get<ModuleResponseDTO>(`${this.apiUrl}/name/${name}`);
  }

  // CREATE
  createModule(payload: ModuleRequestDTO): Observable<ModuleResponseDTO> {
    return this.http.post<ModuleResponseDTO>(
      `${this.apiUrl}?name=${encodeURIComponent(payload.name)}`,
      null
    );
  }

  // UPDATE
  updateModule(id: number, newName: string): Observable<ModuleResponseDTO> {
    return this.http.put<ModuleResponseDTO>(
      `${this.apiUrl}/${id}?newName=${encodeURIComponent(newName)}`,
      null
    );
  }

  // DELETE
  deleteModule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}