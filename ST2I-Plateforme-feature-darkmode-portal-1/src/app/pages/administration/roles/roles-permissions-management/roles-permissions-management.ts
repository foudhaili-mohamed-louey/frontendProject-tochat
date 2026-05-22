import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { ModulesService } from '../../../Parametrages/modules/services/modules.service';
import { PermissionsService } from '../services/permissions.service';
import { RolePermissionsService } from '../services/role-permissions.service';
import { RolesService } from '../services/roles.service';

import { ModuleResponseDTO } from '../../../Parametrages/modules/models/ModuleResponseDTO';
import { PermissionResponseDTO } from '../models/permissions-models/permission-response.dto';
import { RolePermissionRequestDTO } from '../models/role-premission/role-permission-request.dto';
import { RoleResponseDTO } from '../models/role-models/role-response.dto';

@Component({
  selector: 'app-roles-permissions-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule],
  templateUrl: './roles-permissions-management.html',
  styleUrls: ['./roles-permissions-management.scss'],
  providers: [MessageService]
})
export class RolesPermissionsManagementComponent implements OnInit {

  roleId!: number;
  role?: RoleResponseDTO;

  modules: ModuleResponseDTO[] = [];
  filteredModules: ModuleResponseDTO[] = [];
  permissions: PermissionResponseDTO[] = [];
  selectedPermissions: Set<number> = new Set();

  searchTerm = '';
  loading = true;
  saving = false;
  expandedModuleId: number | null = null;
  actions: string[] = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modulesService: ModulesService,
    private permissionsService: PermissionsService,
    private rolePermissionsService: RolePermissionsService,
    private rolesService: RolesService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/administration/roles']);
      return;
    }
    this.roleId = +id;
    this.loadData();
  }

  // ================================================================
  // STEP 1 — load modules + permissions + role info in sequence
  // ================================================================
  loadData(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.modulesService.getModules().subscribe({
      next: (mods) => {
        this.modules = mods || [];
        this.filteredModules = [...this.modules];
        this.cd.detectChanges();

        this.permissionsService.getAllPermissions().subscribe({
          next: (perms) => {
            this.permissions = perms || [];
            this.cd.detectChanges();

            // always load role info first — regardless of permissions
            this.loadRoleInfo();
          },
          error: () => {
            this.loading = false;
            this.cd.detectChanges();
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de charger les permissions'
            });
          }
        });
      },
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les modules'
        });
      }
    });
  }

  // ================================================================
  // STEP 2 — load role by ID first, then try to load its permissions
  // ================================================================
  loadRoleInfo(): void {

    // FIXED: load role by ID first — don't rely on getPermissionsByRole
    // because it returns null when role has no permissions yet
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        const found = roles.find(r => r.id === this.roleId);

        if (!found) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Rôle introuvable'
          });
          setTimeout(() =>
            this.router.navigate(['/administration/roles']), 1500);
          return;
        }

        this.role = found;
        this.cd.detectChanges();

        // block system roles
        if (found.isSystemRole) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Interdit',
            detail: 'Les rôles système ne peuvent pas être modifiés'
          });
          setTimeout(() =>
            this.router.navigate(['/administration/roles']), 1500);
          return;
        }

        // now load existing permissions for this role
        this.loadRolePermissions();
      },
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger le rôle'
        });
      }
    });
  }

  // ================================================================
  // STEP 3 — load existing role permissions (optional — role may have none)
  // ================================================================
  loadRolePermissions(): void {
    this.rolePermissionsService.getPermissionsByRole(this.roleId).subscribe({
      next: (rp) => {
        // FIXED: null check before accessing rp.permissions
        if (rp && rp.permissions) {
          this.selectedPermissions.clear();
          rp.permissions.forEach(p => this.selectedPermissions.add(p.id));
        }
        // if rp is null — role has no permissions yet, selectedPermissions stays empty
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        // role has no permissions yet — not an error, just empty
        this.selectedPermissions.clear();
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  // ================================================================
  // SEARCH
  // ================================================================
  filterModules(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredModules = !term
      ? [...this.modules]
      : this.modules.filter(m => m.name.toLowerCase().includes(term));
    this.cd.detectChanges();
  }

  // ================================================================
  // PERMISSION HELPERS
  // ================================================================
  getPermission(moduleId: number, action: string): PermissionResponseDTO | undefined {
    return this.permissions.find(
      p => p.moduleId === moduleId && p.action === action
    );
  }

  getPermissionsForModule(moduleId: number): PermissionResponseDTO[] {
    return this.permissions.filter(p => p.moduleId === moduleId);
  }

  isChecked(permissionId?: number): boolean {
    return permissionId != null
      ? this.selectedPermissions.has(permissionId)
      : false;
  }

  togglePermission(permission?: PermissionResponseDTO): void {
    if (!permission) return;
    if (this.selectedPermissions.has(permission.id)) {
      this.selectedPermissions.delete(permission.id);
    } else {
      this.selectedPermissions.add(permission.id);
    }
    this.cd.detectChanges();
  }

  toggleModule(moduleId: number): void {
    this.expandedModuleId =
      this.expandedModuleId === moduleId ? null : moduleId;
    this.cd.detectChanges();
  }

  getCheckedCount(moduleId: number): number {
    return this.getPermissionsForModule(moduleId)
      .filter(p => this.selectedPermissions.has(p.id)).length;
  }

  selectAllModule(moduleId: number): void {
    this.getPermissionsForModule(moduleId)
      .forEach(p => this.selectedPermissions.add(p.id));
    this.cd.detectChanges();
  }

  clearAllModule(moduleId: number): void {
    this.getPermissionsForModule(moduleId)
      .forEach(p => this.selectedPermissions.delete(p.id));
    this.cd.detectChanges();
  }

  // ================================================================
  // SAVE PERMISSIONS
  // ================================================================
  savePermissions(): void {
    if (!this.selectedPermissions.size) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Sélectionnez au moins une permission'
      });
      this.cd.detectChanges();
      return;
    }

    this.saving = true;
    this.cd.detectChanges();

    const dto: RolePermissionRequestDTO = {
      roleMetadataId: this.roleId,
      permissionIds: Array.from(this.selectedPermissions)
    };

    this.rolePermissionsService.assignPermissions(dto).subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Permissions sauvegardées avec succès'
        });
        this.cd.detectChanges();
        setTimeout(() =>
          this.router.navigate(['/administration/roles']), 1000);
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message || 'Échec de la sauvegarde des permissions'
        });
        this.cd.detectChanges();
      }
    });
  }

  // ================================================================
  // CLEAN ALL PERMISSIONS
  // ================================================================
  cleanAllPermissions(): void {
    if (!confirm('Supprimer toutes les permissions de ce rôle ?')) return;

    this.rolePermissionsService.deleteAll(this.roleId).subscribe({
      next: () => {
        this.selectedPermissions.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Nettoyé',
          detail: 'Toutes les permissions ont été supprimées'
        });
        this.cd.detectChanges();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message || 'Échec de la suppression des permissions'
        });
        this.cd.detectChanges();
      }
    });
  }

  back(): void {
    this.router.navigate(['/administration/roles']);
  }
}
