import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';

import { TeamService } from '../service/team.service';
import { ProjectService } from '../../projects/services/project.service';
import { ProjectRoleService } from '../../project-roles/services/project-role.service';
import { DepartmentService } from '../../departments/services/department.service';
import { UsersService } from '../../../administration/users/services/users.service';

import { TeamUpdateDTO } from '../dtos/team-update.dto';
import { TeamResponseDTO } from '../dtos/team-response.dto';
import { ProjectResponseDTO } from '../../projects/dtos/project-response.dto';
import { ProjectRoleResponseDTO } from '../../project-roles/dtos/project-role-response.dto';
import { DepartmentResponseDTO } from '../../departments/dtos/department-response.dto';
import { UserResponseDTO } from '../../../administration/users/models/user-response.dto';
import { UserSearchCriteria } from '../../../administration/users/models/UserSearchCriteria.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  templateUrl: './team-edit.html',
  styleUrls: ['./team-edit.scss'],
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService]
})
export class TeamEditComponent implements OnInit {

  teamId!: number;

  loadingTeam = false;
  saving = false;

  loadingProjects = false;
  loadingRoles = false;
  loadingUsers = false;
  loadingDepartments = false;

  team: TeamResponseDTO | null = null;

  projects: ProjectResponseDTO[] = [];
  roles: ProjectRoleResponseDTO[] = [];
  users: UserResponseDTO[] = [];
  departments: DepartmentResponseDTO[] = [];

  operationalDepartmentIds: number[] = [];
  priorityUserIds: string[] = [];

  originalProjectId?: number;
  selectedProjectId?: number;

  userPage = 0;
  userPageSize = 7;
  userTotalElements = 0;
  userTotalPages = 0;

  userFilters = {
    firstName: '',
    lastName: '',
    departmentId: undefined as number | undefined
  };

  selectedUsers = new Map<string, UserResponseDTO>();
  selectedRoles = new Map<string, number>();

  existingMemberIds = new Map<string, number>();
  removedMemberIds = new Set<number>();

  form: TeamUpdateDTO = {
    name: '',
    description: ''
  };

  readonly defaultMale = 'assets/images/default-user-male.png';
  readonly defaultFemale = 'assets/images/default-user-female.png';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private projectService: ProjectService,
    private projectRoleService: ProjectRoleService,
    private departmentService: DepartmentService,
    private usersService: UsersService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.teamId = Number(
      this.route.snapshot.paramMap.get('teamId') ||
      this.route.snapshot.paramMap.get('id')
    );

    this.loadTeam();
    this.loadProjects();
    this.loadRoles();
    this.loadDepartmentsThenUsers();
  }

  private applyView(): void {
    setTimeout(() => {
      try {
        this.cd.detectChanges();
      } catch {}
    }, 0);
  }

  private runView(callback: () => void): void {
    this.zone.run(() => {
      callback();
      this.applyView();
    });
  }

  loadTeam(): void {
    this.loadingTeam = true;
    this.applyView();

    this.teamService.getById(this.teamId).subscribe({
      next: (team) => this.runView(() => {
        this.team = team;

        this.form = {
          name: team.name || '',
          description: team.description || ''
        };

        this.originalProjectId = team.projectId;
        this.selectedProjectId = team.projectId;

        this.priorityUserIds = (team.members || []).map(m => m.userId);

        (team.members || []).forEach(member => {
          this.existingMemberIds.set(member.userId, member.id);
          this.selectedRoles.set(member.userId, member.projectRoleId || 0);
        });

        if (this.priorityUserIds.length > 0) {
          this.loadSelectedUsers(this.priorityUserIds);
        }

        this.loadingTeam = false;

        if (this.operationalDepartmentIds.length > 0) {
          this.searchUsers(this.userPage);
        }
      }),
      error: (err) => this.runView(() => {
        this.loadingTeam = false;
        this.showError(err?.error?.message || "Erreur lors du chargement de l'équipe");
      })
    });
  }

  loadSelectedUsers(userIds: string[]): void {
    this.usersService.getUsersByIds(userIds).subscribe({
      next: (res) => this.runView(() => {
        res.forEach(user => {
          this.selectedUsers.set(user.keycloakId, user);
        });
      }),
      error: () => this.runView(() => {
        this.showError('Erreur lors du chargement des membres existants');
      })
    });
  }

  loadProjects(): void {
    this.loadingProjects = true;
    this.applyView();

    this.projectService.getAll(0, 100).subscribe({
      next: (res) => this.runView(() => {
        this.projects = [...res.content.filter(p => !p.teamId || p.id === this.originalProjectId)];
        this.loadingProjects = false;
      }),
      error: () => this.runView(() => {
        this.projects = [];
        this.loadingProjects = false;
        this.showError('Erreur lors du chargement des projets');
      })
    });
  }

  loadRoles(): void {
    this.loadingRoles = true;
    this.applyView();

    this.projectRoleService.getAll(0, 100).subscribe({
      next: (res) => this.runView(() => {
        this.roles = [...res.content.filter(r => r.active !== false)];
        this.loadingRoles = false;
      }),
      error: () => this.runView(() => {
        this.roles = [];
        this.loadingRoles = false;
        this.showError('Erreur lors du chargement des rôles projet');
      })
    });
  }

  loadDepartmentsThenUsers(): void {
    this.loadingDepartments = true;
    this.loadingUsers = true;
    this.applyView();

    this.departmentService.getActiveOperationalDepartments().subscribe({
      next: (res) => this.runView(() => {
        this.departments = [...res];
        this.operationalDepartmentIds = this.departments.map(d => d.id);
        this.loadingDepartments = false;
        this.searchUsers(0);
      }),
      error: () => this.runView(() => {
        this.departments = [];
        this.operationalDepartmentIds = [];
        this.loadingDepartments = false;
        this.loadingUsers = false;
        this.showError('Erreur lors du chargement des départements opérationnels');
      })
    });
  }

  buildUserCriteria(): UserSearchCriteria {
    const criteria: UserSearchCriteria = {
      isActive: true,
      departmentIds: this.operationalDepartmentIds
    };

    if (this.userFilters.firstName.trim()) {
      criteria.firstName = this.userFilters.firstName.trim();
    }

    if (this.userFilters.lastName.trim()) {
      criteria.lastName = this.userFilters.lastName.trim();
    }

    if (this.userFilters.departmentId) {
      criteria.departmentId = this.userFilters.departmentId;
      criteria.departmentIds = undefined;
    }

    return criteria;
  }

  searchUsers(page: number = 0): void {
    if (this.operationalDepartmentIds.length === 0) {
      this.users = [];
      this.userTotalElements = 0;
      this.userTotalPages = 0;
      this.userPage = 0;
      this.loadingUsers = false;
      this.applyView();
      return;
    }

    this.loadingUsers = true;
    this.applyView();

    this.usersService.searchUsersPrioritized(
      {
        criteria: this.buildUserCriteria(),
        priorityUserIds: this.priorityUserIds
      },
      page,
      this.userPageSize
    ).subscribe({
      next: (res) => this.runView(() => {
        this.users = [...res.content];
        this.userTotalElements = res.totalElements;
        this.userTotalPages = res.totalPages;
        this.userPage = res.number;
        this.loadingUsers = false;
      }),
      error: () => this.runView(() => {
        this.users = [];
        this.userTotalElements = 0;
        this.userTotalPages = 0;
        this.userPage = 0;
        this.loadingUsers = false;
        this.showError('Erreur lors du chargement des utilisateurs');
      })
    });
  }

  resetUserFilters(): void {
    this.userFilters = {
      firstName: '',
      lastName: '',
      departmentId: undefined
    };

    this.searchUsers(0);
  }

  onUserPageChange(page: number): void {
    this.searchUsers(page);
  }

  toggleUser(user: UserResponseDTO, checked: boolean): void {
    if (checked) {
      this.selectedUsers.set(user.keycloakId, user);

      const existingId = this.existingMemberIds.get(user.keycloakId);
      if (existingId) {
        this.removedMemberIds.delete(existingId);
      }

      if (!this.priorityUserIds.includes(user.keycloakId)) {
        this.priorityUserIds.push(user.keycloakId);
      }
    } else {
      this.selectedUsers.delete(user.keycloakId);
      this.selectedRoles.delete(user.keycloakId);

      const existingId = this.existingMemberIds.get(user.keycloakId);
      if (existingId) {
        this.removedMemberIds.add(existingId);
      }

      this.priorityUserIds = this.priorityUserIds.filter(id => id !== user.keycloakId);
    }

    this.searchUsers(this.userPage);
  }

  isSelected(user: UserResponseDTO): boolean {
    return this.selectedUsers.has(user.keycloakId);
  }

  onRoleChange(user: UserResponseDTO, roleId: number): void {
    if (!this.isSelected(user)) return;

    if (!roleId) {
      this.selectedRoles.delete(user.keycloakId);
      this.applyView();
      return;
    }

    const role = this.roles.find(r => r.id === roleId);

    if (role?.uniqueRole && this.isUniqueRoleAlreadyUsed(roleId, user.keycloakId)) {
      this.selectedRoles.delete(user.keycloakId);
      this.showError(`Le rôle "${role.name}" est unique et déjà attribué à un autre membre.`);
      this.applyView();
      return;
    }

    this.selectedRoles.set(user.keycloakId, roleId);
    this.applyView();
  }

  isRoleDisabledForUser(role: ProjectRoleResponseDTO, user: UserResponseDTO): boolean {
    if (!this.isSelected(user)) return true;
    if (!role.uniqueRole) return false;

    return this.isUniqueRoleAlreadyUsed(role.id, user.keycloakId);
  }

  isUniqueRoleAlreadyUsed(roleId: number, currentUserKeycloakId?: string): boolean {
    const role = this.roles.find(r => r.id === roleId);

    if (!role?.uniqueRole) return false;

    for (const [userKeycloakId, selectedRoleId] of this.selectedRoles.entries()) {
      if (userKeycloakId !== currentUserKeycloakId && selectedRoleId === roleId) {
        return true;
      }
    }

    return false;
  }

  hasDuplicateUniqueRoles(): boolean {
    const usedUniqueRoles = new Set<number>();

    for (const roleId of this.selectedRoles.values()) {
      const role = this.roles.find(r => r.id === roleId);

      if (!role?.uniqueRole) continue;

      if (usedUniqueRoles.has(roleId)) return true;

      usedUniqueRoles.add(roleId);
    }

    return false;
  }

  save(): void {
    if (!this.form.name?.trim()) {
      this.showError("Le nom de l'équipe est requis");
      return;
    }

    for (const user of this.selectedUsers.values()) {
      const roleId = this.selectedRoles.get(user.keycloakId);

      if (!roleId) {
        this.showError(`Veuillez sélectionner un rôle projet pour ${this.fullName(user)}`);
        return;
      }
    }

    if (this.hasDuplicateUniqueRoles()) {
      this.showError('Un rôle projet unique ne peut être attribué qu’à un seul membre.');
      return;
    }

    this.saving = true;
    this.applyView();

    this.teamService.update(this.teamId, this.form).pipe(
      switchMap(() => {
        const actions = [];

        if (this.originalProjectId !== this.selectedProjectId) {
          if (this.originalProjectId && !this.selectedProjectId) {
            actions.push(this.projectService.removeTeam(this.originalProjectId));
          }

          if (this.selectedProjectId) {
            actions.push(this.projectService.assignTeam(this.selectedProjectId, this.teamId));
          }
        }

        for (const memberId of this.removedMemberIds.values()) {
          actions.push(this.teamService.removeMember(this.teamId, memberId));
        }

        for (const user of this.selectedUsers.values()) {
          const roleId = this.selectedRoles.get(user.keycloakId)!;
          const existingMemberId = this.existingMemberIds.get(user.keycloakId);

          if (existingMemberId && !this.removedMemberIds.has(existingMemberId)) {
            actions.push(this.teamService.updateMember(this.teamId, existingMemberId, {
              projectRoleId: roleId
            }));
          }

          if (!existingMemberId) {
            actions.push(this.teamService.addMember(this.teamId, {
              userId: user.keycloakId,
              projectRoleId: roleId,
              supervisorId: undefined
            }));
          }
        }

        return actions.length > 0 ? forkJoin(actions) : of(null);
      })
    ).subscribe({
      next: () => this.runView(() => {
        this.saving = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Équipe modifiée avec succès',
          life: 3000
        });

        setTimeout(() => this.router.navigate(['/Parametrages/teams']), 1000);
      }),
      error: (err) => this.runView(() => {
        this.saving = false;

        this.showError(
          err?.error?.message ||
          err?.error?.error ||
          "Erreur lors de la modification de l'équipe"
        );
      })
    });
  }

  getSelectedCount(): number {
    return this.selectedUsers.size;
  }

  getAvatar(user: UserResponseDTO): string {
    if (user.photoUrl && user.photoUrl.trim() !== '') {
      return user.photoUrl;
    }

    return user.sex === 'Female' ? this.defaultFemale : this.defaultMale;
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultMale;
  }

  fullName(user: UserResponseDTO): string {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email;
  }

  cancel(): void {
    this.router.navigate(['/Parametrages/teams']);
  }

  get userPages(): number[] {
    return Array.from({ length: this.userTotalPages }, (_, i) => i);
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail,
      life: 5000
    });

    this.applyView();
  }
  getSelectedRole(user: UserResponseDTO): ProjectRoleResponseDTO | undefined {
  const roleId = this.selectedRoles.get(user.keycloakId);
  return this.roles.find(role => role.id === roleId);
}

getHierarchyLabel(level?: number): string {
  switch (level) {
    case 1:
      return 'Niv. 1 Direction';
    case 2:
      return 'Niv. 2 Leadership';
    case 3:
      return 'Niv. 3 Analyse';
    case 4:
      return 'Niv. 4 Exécution';
    case 5:
      return 'Niv. 5 Support';
    default:
      return 'Niv. ?';
  }
}
}