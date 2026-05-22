import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TraceLogPageResponseDTO } from '../models/trace-log-page-response.dto';
import { TraceLogSearchDTO } from '../models/trace-log-search.dto';

@Injectable({
  providedIn: 'root'
})
export class TraceLogService {

  private readonly baseUrl = 'http://localhost:8888/api/traces';

  constructor(private http: HttpClient) {}

  search(searchDTO: TraceLogSearchDTO): Observable<TraceLogPageResponseDTO> {
    return this.http.post<TraceLogPageResponseDTO>(`${this.baseUrl}/search`, searchDTO);
  }

  archive(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/archive`, {});
  }
}