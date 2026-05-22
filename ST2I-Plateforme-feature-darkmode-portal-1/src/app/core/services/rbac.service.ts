import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrentUserPermissions, PermissionAction } from '../models/rbac.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private readonly apiUrl = 'http://localhost:8888/api/rbac';

  private readonly permissionsState = signal<CurrentUserPermissions | null>(null);

  readonly currentPermissions = computed(() => this.permissionsState());
  readonly roleName = computed(() => this.permissionsState()?.roleName ?? null);
  readonly roleLevel = computed(() => this.permissionsState()?.roleLevel ?? null);

  constructor(private http: HttpClient) {}

  loadCurrentUserPermissions(): Observable<CurrentUserPermissions> {
    return this.http.get<CurrentUserPermissions>(`${this.apiUrl}/me`).pipe(
      tap((response) => this.permissionsState.set(response))
    );
  }

  hasPermission(moduleName: string, action: PermissionAction): boolean {
    const data = this.permissionsState();

    if (!data || !data.permissions) {
      return false;
    }

    const modulePermissions = data.permissions[moduleName];

    if (!modulePermissions) {
      return false;
    }

    return modulePermissions.includes(action);
  }

  canRead(moduleName: string): boolean {
    return this.hasPermission(moduleName, 'READ');
  }

  canCreate(moduleName: string): boolean {
    return this.hasPermission(moduleName, 'CREATE');
  }

  canUpdate(moduleName: string): boolean {
    return this.hasPermission(moduleName, 'UPDATE');
  }

  canDelete(moduleName: string): boolean {
    return this.hasPermission(moduleName, 'DELETE');
  }

  clear(): void {
    this.permissionsState.set(null);
  }
}