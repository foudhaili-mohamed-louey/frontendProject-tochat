import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { RoleCategoryService } from '../services/role-category.service';
import { RoleCategoryResponseDTO } from '../dtos/role-category-response.dto';
import { RoleCategorySearchCriteriaDTO } from '../dtos/role-category-search-criteria.dto';
import { PageResponse } from '../../projects/dtos/page-response.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-role-category-list',
  standalone: true,
  templateUrl: './role-category-list.html',
  styleUrls: ['./role-category-list.scss'],
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
export class RoleCategoryListComponent implements OnInit, OnDestroy {

  rows: RoleCategoryResponseDTO[] = [];
  loading = false;

  currentPage = 0;
  pageSize = 7;
  totalElements = 0;
  totalPages = 0;
  isSearchMode = false;

  filters: RoleCategorySearchCriteriaDTO = {
    keyword: '',
    active: true
  };

  showDeleteConfirm = false;
  categoryToDelete: RoleCategoryResponseDTO | null = null;
  deleting = false;

  private destroy$ = new Subject<void>();

  constructor(
    private roleCategoryService: RoleCategoryService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAll(page: number = 0): void {
    this.loading = true;
    this.isSearchMode = false;
    this.cd.detectChanges();

    this.roleCategoryService.getAll(page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<RoleCategoryResponseDTO>) => {
          this.rows = res.content || [];
          this.totalElements = res.totalElements || 0;
          this.totalPages = res.totalPages || 0;
          this.currentPage = res.number || 0;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.cd.detectChanges();

          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err?.error?.message || 'Erreur lors du chargement des catégories',
            life: 5000
          });
        }
      });
  }

  search(page: number = 0): void {
    const criteria: RoleCategorySearchCriteriaDTO = {
      active: true
    };

    if (this.filters.keyword?.trim()) {
      criteria.keyword = this.filters.keyword.trim();
    }

    this.loading = true;
    this.isSearchMode = true;
    this.cd.detectChanges();

    this.roleCategoryService.search(criteria, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<RoleCategoryResponseDTO>) => {
          this.rows = res.content || [];
          this.totalElements = res.totalElements || 0;
          this.totalPages = res.totalPages || 0;
          this.currentPage = res.number || 0;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.cd.detectChanges();

          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err?.error?.message || 'Erreur lors de la recherche',
            life: 5000
          });
        }
      });
  }

  reset(): void {
    this.filters = {
      keyword: '',
      active: true
    };

    this.loadAll(0);
  }

  onPageChange(newPage: number): void {
    this.isSearchMode ? this.search(newPage) : this.loadAll(newPage);
  }

  add(): void {
    this.router.navigate(['/Parametrages/role-categories/new']);
  }

  details(category: RoleCategoryResponseDTO): void {
    this.router.navigate(['/Parametrages/role-categories', category.id, 'details']);
  }

  edit(category: RoleCategoryResponseDTO): void {
    this.router.navigate(['/Parametrages/role-categories', category.id, 'edit']);
  }

  delete(category: RoleCategoryResponseDTO): void {
    this.categoryToDelete = category;
    this.showDeleteConfirm = true;
    this.cd.detectChanges();
  }

  cancelDelete(): void {
    this.categoryToDelete = null;
    this.showDeleteConfirm = false;
    this.deleting = false;
    this.cd.detectChanges();
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;

    this.deleting = true;
    this.cd.detectChanges();

    this.roleCategoryService.delete(this.categoryToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Catégorie désactivée avec succès',
            life: 3000
          });

          this.showDeleteConfirm = false;
          this.categoryToDelete = null;
          this.deleting = false;

          const reloadPage = this.rows.length === 1 && this.currentPage > 0
            ? this.currentPage - 1
            : this.currentPage;

          this.isSearchMode ? this.search(reloadPage) : this.loadAll(reloadPage);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err?.error?.message || 'Erreur lors de la désactivation',
            life: 5000
          });

          this.showDeleteConfirm = false;
          this.categoryToDelete = null;
          this.deleting = false;
          this.cd.detectChanges();
        }
      });
  }

  export(): void {
    const header = ['Nom', 'Couleur', 'Statut'];

    const csvRows = this.rows.map(c => [
      c.name || '—',
      c.color || '—',
      c.active === false ? 'Inactive' : 'Active'
    ].join(','));

    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'role-categories.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}