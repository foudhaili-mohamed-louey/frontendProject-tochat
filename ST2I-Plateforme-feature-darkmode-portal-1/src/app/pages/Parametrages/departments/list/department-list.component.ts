import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DepartmentService } from '../services/department.service';
import { DepartmentResponseDTO } from '../dtos/department-response.dto';
import { DepartmentSearchCriteria } from '../dtos/department-search-criteria.dto';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RbacService } from '@/app/core/services/rbac.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class DepartmentListComponent implements OnInit {

  rows: DepartmentResponseDTO[] = [];
  loading = false;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  filters: DepartmentSearchCriteria = {
    name: '',
    code: '',
    localisation: '',
    isActive: null,
    type: null
  };

 constructor(
  private departmentService: DepartmentService,
  private router: Router,
  private cd: ChangeDetectorRef,
  private messageService: MessageService,
  private confirmationService: ConfirmationService,
  public rbacService: RbacService
) {}

  ngOnInit(): void {
    this.search();
  }
  private readonly MODULE_NAME = 'gestion des départments';

canCreate(): boolean {
  return this.rbacService.canCreate(this.MODULE_NAME);
}

canUpdate(): boolean {
  return this.rbacService.canUpdate(this.MODULE_NAME);
}

canDelete(): boolean {
  return this.rbacService.canDelete(this.MODULE_NAME);
}

  search(page: number = 0): void {
    this.loading = true;
    this.currentPage = page;
    this.cd.detectChanges();

    this.departmentService.searchDepartments(this.filters, this.currentPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.rows = data.content;
          this.totalPages = data.totalPages;
          this.totalElements = data.totalElements;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors du chargement des départements'
          });
          this.cd.detectChanges();
        }
      });
  }

  reset(): void {
    this.filters = {
      name: '',
      code: '',
      localisation: '',
      isActive: null,
      type: null
    };
    this.search(0);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.search(page);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  toggleActive(d: DepartmentResponseDTO): void {
    const isDeactivation = d.active;

    this.confirmationService.confirm({
      header: isDeactivation ? 'Confirmer la désactivation' : 'Confirmer l’activation',
      message: isDeactivation
        ? `Voulez-vous vraiment désactiver le département "${d.name}" ?`
        : `Voulez-vous vraiment activer le département "${d.name}" ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: isDeactivation ? 'p-button-warning' : 'p-button-success',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        const action$ = isDeactivation
          ? this.departmentService.deactivateDepartment(d.id)
          : this.departmentService.activateDepartment(d.id);

        action$.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: `Département "${d.name}" ${isDeactivation ? 'désactivé' : 'activé'}`
            });

            this.search(this.currentPage);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Action impossible',
              detail: this.extractErrorMessage(err)
            });

            this.cd.detectChanges();
          }
        });
      }
    });
  }

  private extractErrorMessage(err: any): string {
    if (typeof err?.error === 'string') {
      return err.error;
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.error?.error) {
      return err.error.error;
    }

    return 'Erreur lors de la mise à jour du département';
  }

  add(): void {
    this.router.navigate(['Parametrages/departments/new']);
  }

  details(d: DepartmentResponseDTO): void {
    this.router.navigate(['Parametrages/departments', d.id, 'details']);
  }

  edit(d: DepartmentResponseDTO): void {
    this.router.navigate(['Parametrages/departments', d.id, 'edit']);
  }

  export(): void {
    const header = ['Nom', 'Code', 'Type', 'Localisation', 'Téléphone', 'Email', 'Statut'];

    const csvRows = this.rows.map(d => [
      d.name,
      d.code,
      d.type === 'OPERATIONAL' ? 'Opérationnel' : 'Support',
      d.location || '',
      d.phoneNumber || '',
      d.email || '',
      d.active ? 'Actif' : 'Inactif'
    ].join(','));

    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'departments.csv';
    a.click();

    URL.revokeObjectURL(url);
  }
}