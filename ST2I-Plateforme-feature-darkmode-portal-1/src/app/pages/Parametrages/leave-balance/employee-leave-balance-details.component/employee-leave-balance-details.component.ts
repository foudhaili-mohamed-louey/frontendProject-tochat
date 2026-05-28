import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { EmployeeLeaveBalanceService } from '../services/employee-leave-balance.service';
import { EmployeeLeaveBalanceResponseDTO } from '../dtos/employee-leave-balance-response.dto';

import { UserResponseDTO } from '@/app/pages/administration/users/models/user-response.dto';

@Component({
  selector: 'app-employee-leave-balance-details',
  standalone: true,
  templateUrl: './employee-leave-balance-details.component.html',
  styleUrls: ['./employee-leave-balance-details.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    SelectModule
  ],
  providers: [MessageService]
})
export class EmployeeLeaveBalanceDetailsComponent implements OnInit {

  idEmployee!: number;

  loading = true;
  loadingBalances = false;

  currentYear = new Date().getFullYear();
  selectedYear = new Date().getFullYear();

  years: { label: string; value: number }[] = [];

  balances: EmployeeLeaveBalanceResponseDTO[] = [];
  selectedBalance: EmployeeLeaveBalanceResponseDTO | null = null;
  employee: UserResponseDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private balanceService: EmployeeLeaveBalanceService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('idEmployee');

    if (!idParam || isNaN(Number(idParam))) {
      this.back();
      return;
    }

    this.idEmployee = Number(idParam);

    const yearParam = this.route.snapshot.queryParamMap.get('year');
    this.selectedYear = yearParam && !isNaN(Number(yearParam))
      ? Number(yearParam)
      : this.currentYear;

    this.initYears();
    this.loadBalances();
  }

  private initYears(): void {
    this.years = Array.from({ length: 8 }, (_, i) => {
      const year = this.currentYear - i;

      return {
        label: year === this.currentYear ? `${year} (année courante)` : `${year}`,
        value: year
      };
    });
  }

  loadBalances(): void {
    this.loading = true;
    this.loadingBalances = true;
    this.selectedBalance = null;
    this.cd.detectChanges();

    this.balanceService.search(
      {
        idEmployee: this.idEmployee,
        year: this.selectedYear,
        active: null
      },
      0,
      100
    ).subscribe({
      next: (res) => {
        this.balances = res?.content || [];

        if (this.balances.length > 0) {
          this.employee = this.balances[0].employee || this.employee;
          this.selectedBalance = this.balances[0];
        }

        this.loading = false;
        this.loadingBalances = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.balances = [];
        this.selectedBalance = null;
        this.loading = false;
        this.loadingBalances = false;
        this.showError(this.extractErrorMessage(err));
        this.cd.detectChanges();
      }
    });
  }

  onYearChange(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        year: this.selectedYear
      },
      queryParamsHandling: 'merge'
    });

    this.loadBalances();
  }

  selectBalance(balance: EmployeeLeaveBalanceResponseDTO): void {
    this.selectedBalance = balance;
  }

  back(): void {
    this.router.navigate(['/Parametrages/leave-balances']);
  }

  getUserFullName(user?: UserResponseDTO | null): string {
    if (!user) return `Employé #${this.idEmployee}`;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

    return fullName || user.username || user.email || `Employé #${this.idEmployee}`;
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

  getUnitLabel(balance?: EmployeeLeaveBalanceResponseDTO | null): string {
    return balance?.leaveType?.unit === 'MONTH' ? 'Mois' : 'Jours';
  }

  getModeLabel(balance?: EmployeeLeaveBalanceResponseDTO | null): string {
    switch (balance?.leaveType?.incrementMode) {
      case 'MONTHLY':
        return 'Mensuel';
      case 'YEARLY':
        return 'Annuel';
      case 'FIXED':
        return 'Fixe';
      case 'NONE':
      default:
        return 'Aucun';
    }
  }

  getRemainingClass(balance: EmployeeLeaveBalanceResponseDTO): string {
    const remaining = Number(balance.remainingBalance || 0);

    if (remaining <= 0) return 'danger';
    if (remaining <= 3) return 'warning';
    return 'success';
  }

  getUsagePercent(balance: EmployeeLeaveBalanceResponseDTO): number {
    const current = Number(balance.currentBalance || 0);
    const used = Number(balance.usedBalance || 0);

    if (current <= 0) return 0;

    return Math.max(0, Math.min(100, Math.round((used / current) * 100)));
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail,
      life: 5000
    });
  }

  private extractErrorMessage(err: any): string {
    return err?.error?.message || err?.error?.error || err?.message || 'Erreur lors du chargement des soldes';
  }
}