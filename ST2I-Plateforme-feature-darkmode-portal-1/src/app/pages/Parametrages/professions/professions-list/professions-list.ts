import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ProfessionService } from '../services/profession.service';
import { ProfessionResponseDTO } from '../dtos/profession-response.dto';
import { ProfessionSearchCriteriaDTO } from '../dtos/profession-search-criteria.dto';
import { PageResponse } from '../../projects/dtos/page-response.dto';

import { DepartmentService } from '../../departments/services/department.service';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { RbacService } from '@/app/core/services/rbac.service';

@Component({
  selector: 'app-professions-list',
  standalone: true,
  templateUrl: './professions-list.html',
  styleUrls: ['./professions-list.scss'],
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
export class ProfessionsListComponent implements OnInit, OnDestroy {

  rows: ProfessionResponseDTO[] = [];
  departments: any[] = [];

  loading = false;
  loadingDepartments = false;

  currentPage = 0;
  pageSize = 7;
  totalElements = 0;
  totalPages = 0;

  filters: ProfessionSearchCriteriaDTO = {
    name: '',
    code: '',
    idDepartment: undefined,
    active: true,
    uniqueByDepartment: undefined
  };

  showDeleteConfirm = false;
  professionToDelete: ProfessionResponseDTO | null = null;
  deleting = false;

  private destroy$ = new Subject<void>();
  private readonly MODULE_NAME = 'gestion des professions';

  constructor(
    private professionService: ProfessionService,
    private departmentService: DepartmentService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private messageService: MessageService,
    public rbacService: RbacService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.search(0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  loadDepartments(): void {
    this.loadingDepartments = true;
    this.refresh();

    this.departmentService.getActiveDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.departments = [...(res || [])];
            this.loadingDepartments = false;
            this.refresh();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.departments = [];
            this.loadingDepartments = false;
            this.refresh();
          });
        }
      });
  }

  search(page: number = 0): void {
    const criteria: ProfessionSearchCriteriaDTO = {};

    if (this.filters.name?.trim()) {
      criteria.name = this.filters.name.trim();
    }

    if (this.filters.code?.trim()) {
      criteria.code = this.filters.code.trim();
    }

    if (this.filters.idDepartment) {
      criteria.idDepartment = Number(this.filters.idDepartment);
    }

    if (this.filters.active !== undefined && this.filters.active !== null) {
      criteria.active = this.filters.active;
    }

    if (
      this.filters.uniqueByDepartment !== undefined &&
      this.filters.uniqueByDepartment !== null
    ) {
      criteria.uniqueByDepartment = this.filters.uniqueByDepartment;
    }

    this.loading = true;
    this.refresh();

    this.professionService.search(criteria, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<ProfessionResponseDTO>) => {
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
              detail: err?.error?.message || 'Erreur lors du chargement des professions',
              life: 5000
            });
          });
        }
      });
  }

  reset(): void {
    this.filters = {
      name: '',
      code: '',
      idDepartment: undefined,
      active: true,
      uniqueByDepartment: undefined
    };

    this.search(0);
  }

  onPageChange(newPage: number): void {
    this.search(newPage);
  }

  add(): void {
    this.router.navigate(['/Parametrages/professions/new']);
  }

  details(row: ProfessionResponseDTO): void {
    this.router.navigate(['/Parametrages/professions', row.idProfession, 'details']);
  }

  edit(row: ProfessionResponseDTO): void {
    this.router.navigate(['/Parametrages/professions', row.idProfession, 'edit']);
  }

  delete(row: ProfessionResponseDTO): void {
    this.professionToDelete = row;
    this.showDeleteConfirm = true;
    this.refresh();
  }

  cancelDelete(): void {
    this.professionToDelete = null;
    this.showDeleteConfirm = false;
    this.deleting = false;
    this.refresh();
  }

  confirmDelete(): void {
    if (!this.professionToDelete?.idProfession) return;

    this.deleting = true;
    this.refresh();

    this.professionService.deactivate(this.professionToDelete.idProfession)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Profession désactivée avec succès',
              life: 3000
            });

            this.showDeleteConfirm = false;
            this.professionToDelete = null;
            this.deleting = false;

            const reloadPage = this.rows.length === 1 && this.currentPage > 0
              ? this.currentPage - 1
              : this.currentPage;

            this.search(reloadPage);
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

            this.cancelDelete();
          });
        }
      });
  }

  export(): void {
    const header = ['Code', 'Nom', 'Département', 'Type', 'Statut'];

    const csvRows = this.rows.map(r => [
      r.code || '—',
      r.name || '—',
      r.departmentCode || '—',
      r.uniqueByDepartment ? 'Unique' : 'Normale',
      r.active === false ? 'Inactive' : 'Active'
    ].join(','));

    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'professions.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}