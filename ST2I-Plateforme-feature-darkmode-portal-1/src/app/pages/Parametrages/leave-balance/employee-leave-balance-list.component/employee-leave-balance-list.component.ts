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
import { EmployeeLeaveBalanceResponseDTO } from '../dtos/employee-leave-balance-response.dto';
import { EmployeeLeaveBalanceSearchDTO } from '../dtos/employee-leave-balance-search.dto';

import { LeaveTypeService } from '../../leave-request-types/services/leave-type.service';
import { LeaveTypeResponseDTO } from '../../leave-request-types/dtos/leave-type-response.dto';

import { UsersService } from '@/app/pages/administration/users/services/users.service';
import { UserResponseDTO } from '@/app/pages/administration/users/models/user-response.dto';

type LeaveTypeOption = {
  id: number | null;
  name: string;
  code?: string;
  all?: boolean;
};

type EmployeeOption = {
  id: number | null;
  fullName: string;
  email?: string;
  profession?: string;
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

  rows: EmployeeLeaveBalanceResponseDTO[] = [];
  loading = false;

  loadingEmployees = false;
  loadingLeaveTypes = false;

  employees: EmployeeOption[] = [];
  leaveTypes: LeaveTypeOption[] = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;

  filters: EmployeeLeaveBalanceSearchDTO = {
    idEmployee: null,
    idLeaveType: null,
    year: new Date().getFullYear(),
    active: null
  };

  years: number[] = [];

  statusOptions: { label: string; value: boolean | null }[] = [
    { label: 'Tous les statuts', value: null },
    { label: 'Actif', value: true },
    { label: 'Inactif', value: false }
  ];

  private employeeSearchTimeout: any;
  private destroy$ = new Subject<void>();

  constructor(
    private balanceService: EmployeeLeaveBalanceService,
    private leaveTypeService: LeaveTypeService,
    private usersService: UsersService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initYears();
    this.loadEmployees();
    this.loadLeaveTypes();
    this.search(0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.employeeSearchTimeout);
  }

  private initYears(): void {
    const current = new Date().getFullYear();
    this.years = Array.from({ length: 7 }, (_, i) => current - 3 + i);
  }

  loadEmployees(searchTerm: string = ''): void {
    this.loadingEmployees = true;
    this.cd.detectChanges();

    const keyword = searchTerm?.trim() || '';

    this.usersService.searchUsers(
      {
        firstName: keyword,
        lastName: keyword,
        isActive: true
      } as any,
      0,
      20
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const content = res?.content || [];

          this.employees = [
            {
              id: null,
              fullName: 'Tous les employés',
              all: true
            },
            ...content.map((u: UserResponseDTO) => ({
              id: u.id,
              fullName: this.getUserFullName(u),
              email: u.email,
              profession: u.profession,
              all: false
            }))
          ];

          this.loadingEmployees = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.employees = [{ id: null, fullName: 'Tous les employés', all: true }];
          this.loadingEmployees = false;
          this.showError('Erreur lors du chargement des employés');
          this.cd.detectChanges();
        }
      });
  }

  onEmployeeFilter(event: any): void {
    const searchTerm = event?.filter || '';

    clearTimeout(this.employeeSearchTimeout);

    this.employeeSearchTimeout = setTimeout(() => {
      this.loadEmployees(searchTerm);
    }, 300);
  }

  loadLeaveTypes(): void {
    this.loadingLeaveTypes = true;
    this.cd.detectChanges();

    this.leaveTypeService.search({ active: true }, 0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const content = res?.content || [];

          this.leaveTypes = [
            {
              id: null,
              name: 'Tous les types de congé',
              all: true
            },
            ...content.map((lt: LeaveTypeResponseDTO) => ({
              id: lt.idLeaveType,
              name: lt.name,
              code: lt.code,
              all: false
            }))
          ];

          this.loadingLeaveTypes = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.leaveTypes = [{ id: null, name: 'Tous les types de congé', all: true }];
          this.loadingLeaveTypes = false;
          this.showError('Erreur lors du chargement des types de congé');
          this.cd.detectChanges();
        }
      });
  }

  search(page: number = 0): void {
    this.loading = true;
    this.currentPage = page;
    this.cd.detectChanges();

    const criteria: EmployeeLeaveBalanceSearchDTO = {};

    if (this.filters.idEmployee !== null && this.filters.idEmployee !== undefined) {
      criteria.idEmployee = this.filters.idEmployee;
    }

    if (this.filters.idLeaveType !== null && this.filters.idLeaveType !== undefined) {
      criteria.idLeaveType = this.filters.idLeaveType;
    }

    if (this.filters.year !== null && this.filters.year !== undefined) {
      criteria.year = this.filters.year;
    }

    if (this.filters.active !== null && this.filters.active !== undefined) {
      criteria.active = this.filters.active;
    }

    this.balanceService.search(criteria, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.rows = res.content || [];
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.currentPage = res.number;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.rows = [];
          this.loading = false;
          this.showError('Erreur lors du chargement des soldes de congé');
          this.cd.detectChanges();
        }
      });
  }

  reset(): void {
    this.filters = {
      idEmployee: null,
      idLeaveType: null,
      year: new Date().getFullYear(),
      active: null
    };

    this.loadEmployees();
    this.loadLeaveTypes();
    this.search(0);
  }

  onPageChange(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.search(page);
  }

  

  details(row: EmployeeLeaveBalanceResponseDTO): void {
    this.router.navigate(['/Parametrages/leave-balances', row.idBalance, 'details']);
  }

  edit(row: EmployeeLeaveBalanceResponseDTO): void {
    this.router.navigate(['/Parametrages/leave-balances', row.idBalance, 'edit']);
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

  getRemainingClass(row: EmployeeLeaveBalanceResponseDTO): string {
    const remaining = Number(row.remainingBalance || 0);

    if (remaining <= 0) return 'danger';
    if (remaining <= 3) return 'warning';
    return 'success';
  }

  getUsagePercent(row: EmployeeLeaveBalanceResponseDTO): number {
    const current = Number(row.currentBalance || 0);
    const used = Number(row.usedBalance || 0);

    if (current <= 0) return 0;

    const percent = (used / current) * 100;

    return Math.max(0, Math.min(100, Math.round(percent)));
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