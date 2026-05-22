import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ModulesService } from '../../../Parametrages/modules/services/modules.service';
import { PermissionsService } from '../services/permissions.service';
import { RolePermissionsService } from '../services/role-permissions.service';
import { RolesService } from '../services/roles.service';

import { ModuleResponseDTO } from '../../..//Parametrages/modules/models/ModuleResponseDTO';
import { PermissionResponseDTO } from '../models/permissions-models/permission-response.dto';
import { PermissionAction } from '../models/permissions-models/permission-action.enum';
import { RoleResponseDTO } from '../models/role-models/role-response.dto';

@Component({
  selector: 'app-role-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-details.html',
  styleUrls: ['./role-details.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesDetailsComponent implements OnInit {

  // FIXED: use roleId (number) instead of roleName (string)
  // because getPermissionsByRole expects number (roleMetadataId)
  roleName!: string;
  roleId!: number;
  role?: RoleResponseDTO;

  modules: ModuleResponseDTO[] = [];
  permissions: PermissionResponseDTO[] = [];
  rolePermissions: PermissionResponseDTO[] = [];

  expandedModuleId: number | null = null;
  loading = true;

  actions = [
    PermissionAction.CREATE,
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.DELETE
  ];

  constructor(
    private route: ActivatedRoute,
    private modulesService: ModulesService,
    private permissionsService: PermissionsService,
    private rolePermissionsService: RolePermissionsService,
    private rolesService: RolesService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // route is /:name/details — get name first then fetch id
    this.roleName = this.route.snapshot.paramMap.get('name')!;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // step 1 — load modules
    this.modulesService.getModules().subscribe({
      next: (modules) => {
        this.modules = modules || [];
        this.cd.markForCheck();

        // step 2 — load all permissions
        // FIXED: getAllPermissions() instead of getPermissions()
        this.permissionsService.getAllPermissions().subscribe({
          next: (perms: PermissionResponseDTO[]) => {
            // FIXED: explicit type on perms — fixes implicit any error
            this.permissions = perms || [];
            this.cd.markForCheck();

            // step 3 — get role by name to get its id
            this.rolesService.getRoleByName(this.roleName).subscribe({
              next: (role: RoleResponseDTO) => {
                this.role = role;
                this.roleId = role.id;
                this.cd.markForCheck();

                // step 4 — load role permissions using roleId (number)
                // FIXED: pass roleId (number) not roleName (string)
                this.rolePermissionsService
                  .getPermissionsByRole(this.roleId)
                  .subscribe({
                    next: (rolePerms) => {
                      this.rolePermissions = rolePerms?.permissions || [];
                      this.loading = false;
                      this.cd.markForCheck();
                    },
                    error: () => {
                      // role exists but has no permissions yet
                      this.rolePermissions = [];
                      this.loading = false;
                      this.cd.markForCheck();
                    }
                  });
              },
              error: () => {
                this.loading = false;
                this.cd.markForCheck();
              }
            });
          },
          error: () => {
            this.loading = false;
            this.cd.markForCheck();
          }
        });
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      }
    });
  }

  toggleModule(moduleId: number): void {
    this.expandedModuleId =
      this.expandedModuleId === moduleId ? null : moduleId;
    this.cd.markForCheck();
  }

  getPermission(
    moduleId: number,
    action: PermissionAction
  ): PermissionResponseDTO | undefined {
    return this.permissions.find(
      p => p.moduleId === moduleId && p.action === action
    );
  }

  hasRolePermission(permissionId: number): boolean {
    return this.rolePermissions.some(p => p.id === permissionId);
  }
}
