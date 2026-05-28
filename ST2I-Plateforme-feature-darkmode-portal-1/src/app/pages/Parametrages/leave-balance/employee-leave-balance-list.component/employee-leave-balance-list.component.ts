import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { EmployeeLeaveBalanceService } from '../services/employee-leave-balance.service';
import { EmployeeLeaveBalanceSearchDTO } from '../dtos/employee-leave-balance-search.dto';
import { EmployeeLeaveBalanceSummaryDTO } from '../dtos/employee-leave-balance-summary.dto';

import { UserResponseDTO } from '@/app/pages/administration/users/models/user-response.dto';

import { DepartmentService } from '@/app/pages/Parametrages/departments/services/department.service';
import { DepartmentResponseDTO } from '@/app/pages/Parametrages/departments/dtos/department-response.dto';

type DepartmentOption = {
  id: number | null;
  name: string;
  code?: string;
  all?: boolean;
};

@Component({
  selector: 'app-employee-leave-balance-list',
  standalone: true,
  templateUrl: './employee-leave-balance-list.component.html',
  styleUrls: ['./employee-leave-balance-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TooltipModule,
    SelectModule
  ],
  providers: [MessageService]
})
export class EmployeeLeaveBalanceListComponent implements OnInit, OnDestroy {

  rows: EmployeeLeaveBalanceSummaryDTO[] = [];
  loading = false;

  departments: DepartmentOption[] = [];
  loadingDepartments = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;

  filters: EmployeeLeaveBalanceSearchDTO = {
    keyword: null,
    departmentId: null
  };

  private destroy$ = new Subject<void>();

  constructor(
    private balanceService: EmployeeLeaveBalanceService,
    private departmentService: DepartmentService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.search(0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments(): void {
    this.loadingDepartments = true;
    this.cd.detectChanges();

    this.departmentService.getActiveDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: DepartmentResponseDTO[]) => {
          this.departments = [
            {
              id: null,
              name: 'Tous les départements',
              all: true
            },
            ...res.map((d: DepartmentResponseDTO) => ({
              id: (d as any).idDepartment || (d as any).id,
              name: d.name,
              code: d.code,
              all: false
            }))
          ];

          this.loadingDepartments = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.departments = [
            {
              id: null,
              name: 'Tous les départements',
              all: true
            }
          ];

          this.loadingDepartments = false;
          this.showError('Erreur lors du chargement des départements');
          this.cd.detectChanges();
        }
      });
  }

  search(page: number = 0): void {
    this.loading = true;
    this.currentPage = page;
    this.cd.detectChanges();

    const criteria: EmployeeLeaveBalanceSearchDTO = {};

    const keyword = this.filters.keyword?.trim();

    if (keyword) {
      criteria.keyword = keyword;
    }

    if (this.filters.departmentId !== null && this.filters.departmentId !== undefined) {
      criteria.departmentId = Number(this.filters.departmentId);
    }

    this.balanceService.searchEmployeeSummaries(criteria, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.rows = res?.content || [];
          this.totalElements = res?.totalElements || 0;
          this.totalPages = res?.totalPages || 0;
          this.currentPage = res?.number || 0;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.rows = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.loading = false;
          this.showError('Erreur lors du chargement des employés');
          this.cd.detectChanges();
        }
      });
  }

  reset(): void {
    this.filters = {
      keyword: null,
      departmentId: null
    };

    this.search(0);
  }

  onPageChange(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.search(page);
  }

  details(row: EmployeeLeaveBalanceSummaryDTO): void {
  this.router.navigate([
    '/Parametrages/leave-balances/employee',
    row.idEmployee,
    'details'
  ]);
}

update(row: EmployeeLeaveBalanceSummaryDTO): void {
  this.router.navigate([
    '/Parametrages/leave-balances/employee',
    row.idEmployee,
    'edit'
  ]);
}

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getUserFullName(user?: UserResponseDTO | null): string {
    if (!user) return 'Employé non disponible';

    const first = user.firstName || '';
    const last = user.lastName || '';
    const fullName = `${first} ${last}`.trim();

    return fullName || user.username || user.email || 'Employé sans nom';
  }

  getInitials(user?: UserResponseDTO | null): string {
    if (!user) return '?';

    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';

    return `${first}${last}`.toUpperCase() || '?';
  }

  getDepartment(user?: UserResponseDTO | null): string {
    return user?.departmentName || user?.departmentCode || '—';
  }

  getProfession(user?: UserResponseDTO | null): string {
    return user?.professionName || user?.professionCode || '—';
  }

  getStatusLabel(user?: UserResponseDTO | null): string {
    return user?.isActive ? 'Actif' : 'Inactif';
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail,
      life: 5000
    });
  }
}