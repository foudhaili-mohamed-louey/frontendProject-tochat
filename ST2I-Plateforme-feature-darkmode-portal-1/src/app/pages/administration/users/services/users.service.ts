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

  createUser(payload: UserCreateDTO): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(
      this.apiUrl,
      payload
    );
  }

  updateUserAsAdmin(
    id: string,
    payload: UserAdminUpdateDTO
  ): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(
      `${this.apiUrl}/${id}/admin`,
      payload
    );
  }

  updateUserProfile(
    id: string,
    payload: UserProfileUpdateDTO
  ): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(
      `${this.apiUrl}/${id}/profile`,
      payload
    );
  }

  changePassword(
    id: string,
    payload: UserPasswordChangeDTO
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${id}/change-password`,
      payload
    );
  }

  resetUserPassword(id: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${id}/reset-password`,
      {}
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/forgot-password`,
      {},
      {
        params: new HttpParams().set('email', email)
      }
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  assignRole(
    userId: string,
    roleMetadataId: number
  ): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(
      `${this.apiUrl}/${userId}/assign-role`,
      {},
      {
        params: new HttpParams().set(
          'roleMetadataId',
          roleMetadataId.toString()
        )
      }
    );
  }

  getUserById(id: string): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(
      `${this.apiUrl}/${id}`
    );
  }

  getAllUsers(
    page: number = 0,
    size: number = 7
  ): Observable<PageResponse<UserResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<UserResponseDTO>>(
      this.apiUrl,
      { params }
    );
  }

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

  getByKeycloakId(
    keycloakId: string
  ): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(
      `${this.apiUrl}/mapper/keycloak/${keycloakId}`
    );
  }

  getByMapperId(
    id: number
  ): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(
      `${this.apiUrl}/mapper/${id}`
    );
  }

  getUsersByDepartment(
    departmentId: number
  ): Observable<UserResponseDTO[]> {
    return this.http.get<UserResponseDTO[]>(
      `${this.apiUrl}/mapper/by-department/${departmentId}`
    );
  }

  uploadAvatar(
    keycloakId: string,
    file: File
  ): Observable<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ photoUrl: string }>(
      `${this.apiUrl}/${keycloakId}/upload-avatar`,
      formData
    );
  }

  getUsersByIds(
    keycloakIds: string[]
  ): Observable<UserResponseDTO[]> {
    return this.http.post<UserResponseDTO[]>(
      `${this.apiUrl}/batch`,
      keycloakIds
    );
  }

  // Legacy endpoint, avoid using it for new profession table logic.
  getProfessions(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/professions`
    );
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