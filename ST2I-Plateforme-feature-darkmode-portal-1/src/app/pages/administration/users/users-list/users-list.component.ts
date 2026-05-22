import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { UsersService } from '../services/users.service';
import { RolesService } from '../../roles/services/roles.service';
import { DepartmentService } from '../../../Parametrages/departments/services/department.service';
import { UserResponseDTO } from '../models/user-response.dto';
import { UserSearchCriteria } from '../models/UserSearchCriteria.dto';
import { RoleResponseDTO } from '../../roles/models/role-models/role-response.dto';
import { DepartmentResponseDTO } from '../../../Parametrages/departments/dtos/department-response.dto';
import { PageResponse } from '../models/page-response.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-users-list',
  standalone: true,
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService]
})
export class UsersListComponent implements OnInit, OnDestroy {

  rows: UserResponseDTO[] = [];
  loading = false;

  // pagination state
  currentPage = 0;
  pageSize = 7;
  totalElements = 0;
  totalPages = 0;
  isSearchMode = false;
  lastCriteria: UserSearchCriteria = {};

  // confirm delete
  showDeleteConfirm = false;
  userToDelete: UserResponseDTO | null = null;
  deleting = false;

  // ✅ local assets — always available, zero network dependency
  readonly defaultMale = 'assets/images/default-user-male.png';
  readonly defaultFemale = 'assets/images/default-user-female.png';

  // filters
  filters: UserSearchCriteria = {
    firstName: '',
    lastName: '',
    isActive: undefined,
    emailVerified: undefined
  };

  // dropdown data
  professions: string[] = [];
  roles: RoleResponseDTO[] = [];
  departments: DepartmentResponseDTO[] = [];

  // dropdown loading
  loadingProfessions = false;
  loadingRoles = false;
  loadingDepartments = false;

  private destroy$ = new Subject<void>();

  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private departmentService: DepartmentService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── load dropdown data ──────────────────────────────────────────────
  private loadDropdowns(): void {
    this.loadProfessions();
    this.loadRoles();
    this.loadDepartments();
  }

  private loadProfessions(): void {
    this.loadingProfessions = true;
    this.usersService.getProfessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profs) => {
          this.professions = profs;
          this.loadingProfessions = false;
        },
        error: () => this.loadingProfessions = false
      });
  }

  private loadRoles(): void {
    this.loadingRoles = true;
    this.rolesService.getManageableRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.roles = roles;
          this.loadingRoles = false;
        },
        error: () => this.loadingRoles = false
      });
  }

  private loadDepartments(): void {
    this.loadingDepartments = true;
    this.departmentService.getActiveDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (depts) => {
          this.departments = depts;
          this.loadingDepartments = false;
        },
        error: () => this.loadingDepartments = false
      });
  }

  // ── avatar resolver ──────────────────────────────────────────────
  getAvatar(u: UserResponseDTO): string {
    if (u.photoUrl && u.photoUrl.trim() !== '') return u.photoUrl;
    return u.sex === 'Female' ? this.defaultFemale : this.defaultMale;
  }

  onAvatarError(event: Event, u: UserResponseDTO): void {
    (event.target as HTMLImageElement).src =
      u.sex === 'Female' ? this.defaultFemale : this.defaultMale;
  }

  // ── load all (no filters) ────────────────────────────────────────
  loadAll(page: number = 0): void {
    this.loading = true;
    this.isSearchMode = false;
    this.cd.detectChanges();

    this.usersService.getAllUsers(page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<UserResponseDTO>) => {
          this.rows = res.content;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.currentPage = res.number;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cd.detectChanges();
        }
      });
  }

  // ── search with filters ──────────────────────────────────────────
  search(page: number = 0): void {
    const criteria: UserSearchCriteria = {};

    if (this.filters.firstName?.trim()) criteria.firstName = this.filters.firstName.trim();
    if (this.filters.lastName?.trim()) criteria.lastName = this.filters.lastName.trim();
    if (this.filters.isActive !== undefined && this.filters.isActive !== null) criteria.isActive = this.filters.isActive;
    if (this.filters.emailVerified !== undefined && this.filters.emailVerified !== null) criteria.emailVerified = this.filters.emailVerified;
    if (this.filters.profession?.trim()) criteria.profession = this.filters.profession.trim();
    if (this.filters.roleMetadataId) criteria.roleMetadataId = this.filters.roleMetadataId;
    if (this.filters.departmentId) criteria.departmentId = this.filters.departmentId;

    if (Object.keys(criteria).length === 0) {
      this.loadAll(0);
      return;
    }

    this.lastCriteria = criteria;
    this.isSearchMode = true;
    this.loading = true;
    this.cd.detectChanges();

    this.usersService.searchUsers(criteria, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<UserResponseDTO>) => {
          this.rows = res.content;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.currentPage = res.number;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cd.detectChanges();
        }
      });
  }

  // ── page change ──────────────────────────────────────────────────
  onPageChange(newPage: number): void {
    if (this.isSearchMode) {
      this.search(newPage);
    } else {
      this.loadAll(newPage);
    }
  }

  // ── reset ────────────────────────────────────────────────────────
  reset(): void {
    this.filters = {
      firstName: '',
      lastName: '',
      isActive: undefined,
      emailVerified: undefined,
      profession: '',
      roleMetadataId: undefined,
      departmentId: undefined
    };
    this.loadAll(0);
  }

  // ── navigation ───────────────────────────────────────────────────
  add(): void { 
    this.router.navigate(['/administration/users/new']); 
  }

  details(u: UserResponseDTO): void {
    this.router.navigate(['/administration/users', u.keycloakId, 'details']);
  }

  edit(u: UserResponseDTO): void {
    this.router.navigate(['/administration/users', u.keycloakId, 'edit']);
  }

  // ── delete flow ──────────────────────────────────────────────────
  delete(u: UserResponseDTO): void {
    this.userToDelete = u;
    this.showDeleteConfirm = true;
    this.cd.detectChanges();
  }

  cancelDelete(): void {
    this.userToDelete = null;
    this.showDeleteConfirm = false;
    this.cd.detectChanges();
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;
    this.deleting = true;
    this.cd.detectChanges();

    this.usersService.deleteUser(this.userToDelete.keycloakId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: `Utilisateur "${this.userToDelete?.firstName} ${this.userToDelete?.lastName}" supprimé`
          });
          this.showDeleteConfirm = false;
          this.userToDelete = null;
          this.deleting = false;
          this.cd.detectChanges();
          const reloadPage = this.rows.length === 1 && this.currentPage > 0
            ? this.currentPage - 1
            : this.currentPage;
          this.isSearchMode ? this.search(reloadPage) : this.loadAll(reloadPage);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err?.error?.message || 'Erreur lors de la suppression'
          });
          this.showDeleteConfirm = false;
          this.userToDelete = null;
          this.deleting = false;
          this.cd.detectChanges();
        }
      });
  }

  // ── reset password ───────────────────────────────────────────────
  resetPassword(u: UserResponseDTO): void {
    if (!u.emailVerified) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Email non vérifié',
        detail: `${u.firstName} ${u.lastName} doit d'abord vérifier son adresse email`,
        life: 6000
      });
      return;
    }

    this.usersService.resetUserPassword(u.keycloakId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Email envoyé',
            detail: `Email de réinitialisation envoyé à ${u.email}`,
            life: 5000
          });
          this.cd.detectChanges();
        },
        error: (err) => {
          const is409 = err?.status === 409;
          this.messageService.add({
            severity: is409 ? 'warn' : 'error',
            summary: is409 ? 'Email non vérifié' : 'Erreur',
            detail: err?.error?.message || 'Erreur lors de la réinitialisation',
            life: 6000
          });
          this.cd.detectChanges();
        }
      });
  }

  // ── export CSV ───────────────────────────────────────────────────
  export(): void {
    const header = ['Prénom & Nom', 'Email', 'Email Vérifié', 'Statut', 'Profession', 'Département', 'Rôle'];
    const csvRows = this.rows.map(u => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.emailVerified ? 'Oui' : 'Non',
      u.isActive ? 'Actif' : 'Inactif',
      u.profession || '—',
      u.departmentCode || '—',
      u.roleName || '—'
    ].join(','));
    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── pagination helpers ───────────────────────────────────────────
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}