import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ProjectRoleService } from '../services/project-role.service';
import { RoleCategoryService } from '../../role-categories/services/role-category.service';

import { ProjectRoleResponseDTO } from '../dtos/project-role-response.dto';
import { ProjectRoleSearchCriteriaDTO } from '../dtos/project-role-search-criteria.dto';
import { RoleCategoryResponseDTO } from '../../role-categories/dtos/role-category-response.dto';
import { PageResponse } from '../../projects/dtos/page-response.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { RbacService } from '@/app/core/services/rbac.service';

@Component({
  selector: 'app-project-role-list',
  standalone: true,
  templateUrl: './project-role-list.html',
  styleUrls: ['./project-role-list.scss'],
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
export class ProjectRoleListComponent implements OnInit, OnDestroy {

  rows: ProjectRoleResponseDTO[] = [];
  categories: RoleCategoryResponseDTO[] = [];

  loading = false;
  loadingCategories = false;

  currentPage = 0;
  pageSize = 7;
  totalElements = 0;
  totalPages = 0;
  isSearchMode = false;

  filters: ProjectRoleSearchCriteriaDTO = {
    keyword: '',
    uniqueRole: undefined,
    active: true,
    roleCategoryId: undefined,
    hierarchyLevel: undefined
  };

  showDeleteConfirm = false;
  roleToDelete: ProjectRoleResponseDTO | null = null;
  deleting = false;

  private destroy$ = new Subject<void>();

  constructor(
  private projectRoleService: ProjectRoleService,
  private roleCategoryService: RoleCategoryService,
  private router: Router,
  private cd: ChangeDetectorRef,
  private zone: NgZone,
  private messageService: MessageService,
  public rbacService: RbacService
) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private readonly MODULE_NAME = 'gestion les roles des projets';

canCreate(): boolean {
  return this.rbacService.canCreate(this.MODULE_NAME);
}

canUpdate(): boolean {
  return this.rbacService.canUpdate(this.MODULE_NAME);
}

canDelete(): boolean {
  return this.rbacService.canDelete(this.MODULE_NAME);
}

  private refresh(): void {
    this.cd.detectChanges();
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.refresh();

    this.roleCategoryService.getAll(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.categories = [...(res.content || [])];
            this.loadingCategories = false;
            this.refresh();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.categories = [];
            this.loadingCategories = false;
            this.refresh();
          });
        }
      });
  }

  loadAll(page: number = 0): void {
    this.loading = true;
    this.isSearchMode = false;
    this.refresh();

    this.projectRoleService.getAll(page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<ProjectRoleResponseDTO>) => {
          this.zone.run(() => {
            this.rows = [...(res.content || [])];
            this.totalElements = res.totalElements || 0;
            this.totalPages = res.totalPages || 0;
            this.currentPage = res.number || 0;
            this.loading = false;
            this.refresh();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.rows = [];
            this.totalElements = 0;
            this.totalPages = 0;
            this.currentPage = 0;
            this.loading = false;
            this.refresh();

            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err?.error?.message || 'Erreur lors du chargement des rôles projet',
              life: 5000
            });
          });
        }
      });
  }

  search(page: number = 0): void {
    const criteria: ProjectRoleSearchCriteriaDTO = {
      active: true
    };

    if (this.filters.keyword?.trim()) {
      criteria.keyword = this.filters.keyword.trim();
    }

    if (this.filters.uniqueRole !== undefined && this.filters.uniqueRole !== null) {
      criteria.uniqueRole = this.filters.uniqueRole;
    }

    if (this.filters.roleCategoryId) {
      criteria.roleCategoryId = this.filters.roleCategoryId;
    }

    if (this.filters.hierarchyLevel) {
      criteria.hierarchyLevel = Number(this.filters.hierarchyLevel);
    }

    this.loading = true;
    this.isSearchMode = true;
    this.refresh();

    this.projectRoleService.search(criteria, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<ProjectRoleResponseDTO>) => {
          this.zone.run(() => {
            this.rows = [...(res.content || [])];
            this.totalElements = res.totalElements || 0;
            this.totalPages = res.totalPages || 0;
            this.currentPage = res.number || 0;
            this.loading = false;
            this.refresh();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.rows = [];
            this.totalElements = 0;
            this.totalPages = 0;
            this.currentPage = 0;
            this.loading = false;
            this.refresh();

            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err?.error?.message || 'Erreur lors de la recherche',
              life: 5000
            });
          });
        }
      });
  }

  reset(): void {
    this.filters = {
      keyword: '',
      uniqueRole: undefined,
      active: true,
      roleCategoryId: undefined,
      hierarchyLevel: undefined
    };

    this.loadAll(0);
  }

  onPageChange(newPage: number): void {
    this.isSearchMode ? this.search(newPage) : this.loadAll(newPage);
  }

  add(): void {
    this.router.navigate(['/Parametrages/project-roles/new']);
  }

  details(role: ProjectRoleResponseDTO): void {
    this.router.navigate(['/Parametrages/project-roles', role.id, 'details']);
  }

  edit(role: ProjectRoleResponseDTO): void {
    this.router.navigate(['/Parametrages/project-roles', role.id, 'edit']);
  }

  delete(role: ProjectRoleResponseDTO): void {
    this.roleToDelete = role;
    this.showDeleteConfirm = true;
    this.refresh();
  }

  cancelDelete(): void {
    this.roleToDelete = null;
    this.showDeleteConfirm = false;
    this.deleting = false;
    this.refresh();
  }

  confirmDelete(): void {
    if (!this.roleToDelete) return;

    this.deleting = true;
    this.refresh();

    this.projectRoleService.delete(this.roleToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Rôle projet désactivé avec succès',
              life: 3000
            });

            this.showDeleteConfirm = false;
            this.roleToDelete = null;
            this.deleting = false;

            const reloadPage = this.rows.length === 1 && this.currentPage > 0
              ? this.currentPage - 1
              : this.currentPage;

            this.isSearchMode ? this.search(reloadPage) : this.loadAll(reloadPage);
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err?.error?.message || 'Erreur lors de la désactivation',
              life: 5000
            });

            this.showDeleteConfirm = false;
            this.roleToDelete = null;
            this.deleting = false;
            this.refresh();
          });
        }
      });
  }

  getHierarchyLabel(level?: number): string {
    switch (level) {
      case 1:
        return 'Niveau 1 — Direction';
      case 2:
        return 'Niveau 2 — Leadership';
      case 3:
        return 'Niveau 3 — Analyse';
      case 4:
        return 'Niveau 4 — Exécution';
      case 5:
        return 'Niveau 5 — Support';
      default:
        return 'Non défini';
    }
  }

  export(): void {
    const header = ['Nom', 'Type', 'Niveau', 'Catégorie', 'Statut'];

    const csvRows = this.rows.map(r => [
      r.name || '—',
      r.uniqueRole ? 'Unique' : 'Multiple',
      this.getHierarchyLabel(r.hierarchyLevel),
      r.roleCategoryName || '—',
      r.active === false ? 'Inactive' : 'Active'
    ].join(','));

    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-roles.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}