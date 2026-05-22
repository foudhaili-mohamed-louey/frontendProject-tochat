import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserCreateDTO } from '../models/user-create.dto';
import { UserAdminUpdateDTO } from '../models/user-admin-update.dto';
import { UserProfileUpdateDTO } from '../models/user-profile-update.dto';
import { UserPasswordChangeDTO } from '../models/user-password-change.dto';
import { UserResponseDTO } from '../models/user-response.dto';
import { UserSearchCriteria } from '../models/UserSearchCriteria.dto';
import { PageResponse } from '../models/page-response.dto';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly apiUrl = 'http://localhost:8888/api/users';

  constructor(private http: HttpClient) {}

  // ================= CREATE =================
  // POST /api/users → 201 + created user
  createUser(payload: UserCreateDTO): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(this.apiUrl, payload);
  }

  // ================= UPDATE BY ADMIN =================
  // PUT /api/users/{id}/admin → 200 + updated user
  updateUserAsAdmin(id: string, payload: UserAdminUpdateDTO): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(`${this.apiUrl}/${id}/admin`, payload);
  }

  // ================= UPDATE OWN PROFILE =================
  // PUT /api/users/{id}/profile → 200 + updated user
  updateUserProfile(id: string, payload: UserProfileUpdateDTO): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(`${this.apiUrl}/${id}/profile`, payload);
  }

  // ================= CHANGE OWN PASSWORD =================
  // POST /api/users/{id}/change-password → 204 no content
  changePassword(id: string, payload: UserPasswordChangeDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/change-password`, payload);
  }

  // ================= RESET PASSWORD BY ADMIN =================
  // POST /api/users/{id}/reset-password → 204 no content
  resetUserPassword(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reset-password`, {});
  }

  // ================= FORGOT PASSWORD =================
  // POST /api/users/forgot-password?email= → 200
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/forgot-password`,
      {},
      { params: { email } }
    );
  }

  // ================= DELETE =================
  // DELETE /api/users/{id} → 204 no content
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ================= ASSIGN ROLE =================
  // POST /api/users/{id}/assign-role?roleMetadataId= → 200 + updated user
  assignRole(userId: string, roleMetadataId: number): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(
      `${this.apiUrl}/${userId}/assign-role`,
      {},
      { params: { roleMetadataId } }
    );
  }

  // ================= GET BY ID =================
  // GET /api/users/{id} → 200 + user
  getUserById(id: string): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.apiUrl}/${id}`);
  }

  // ================= GET ALL — paginated =================
  // GET /api/users?page=0&size=7
  getAllUsers(page: number = 0, size: number = 7): Observable<PageResponse<UserResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<UserResponseDTO>>(this.apiUrl, { params });
  }

  // ================= SEARCH — paginated =================
  // POST /api/users/search?page=0&size=7
  searchUsers(
    criteria: UserSearchCriteria,
    page: number = 0,
    size: number = 7
  ): Observable<PageResponse<UserResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.post<PageResponse<UserResponseDTO>>(
      `${this.apiUrl}/search`,
      criteria,
      { params }
    );
  }
   // ================= UPLOAD AVATAR =================
  // POST /api/users/{id}/upload-avatar → { photoUrl: string }
  uploadAvatar(keycloakId: string, file: File): Observable<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ photoUrl: string }>(
      `${this.apiUrl}/${keycloakId}/upload-avatar`,
      formData
    );
  }
  // INTER-SERVICE — batch fetch by keycloakIds
// POST /api/users/batch
getUsersByIds(keycloakIds: string[]): Observable<UserResponseDTO[]> {
  return this.http.post<UserResponseDTO[]>(`${this.apiUrl}/batch`, keycloakIds);
}
// ================= GET PROFESSIONS =================
// GET /api/users/professions → 200 + distinct profession list
getProfessions(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/professions`);
}


searchUsersPrioritized(
  request: {
    criteria: UserSearchCriteria;
    priorityUserIds: string[];
  },
  page: number = 0,
  size: number = 7
): Observable<PageResponse<UserResponseDTO>> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.post<PageResponse<UserResponseDTO>>(
    `${this.apiUrl}/search/prioritized`,
    request,
    { params }
  );
}
}