import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { EmployeeLeaveBalanceService } from '../services/employee-leave-balance.service';
import { EmployeeLeaveBalanceResponseDTO } from '../dtos/employee-leave-balance-response.dto';
import { EmployeeLeaveBalanceUpdateDTO } from '../dtos/employee-leave-balance-update.dto';

import { UserResponseDTO } from '@/app/pages/administration/users/models/user-response.dto';

type BalanceOption = {
  label: string;
  code: string;
  value: number;
};

@Component({
  selector: 'app-employee-leave-balance-edit',
  standalone: true,
  templateUrl: './employee-leave-balance-edit.component.html',
  styleUrls: ['./employee-leave-balance-edit.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    SelectModule
  ],
  providers: [MessageService]
})
export class EmployeeLeaveBalanceEditComponent implements OnInit {

  idEmployee!: number;

  loading = true;
  saving = false;

  currentYear = new Date().getFullYear();

  employee: UserResponseDTO | null = null;

  balances: EmployeeLeaveBalanceResponseDTO[] = [];
  balanceOptions: BalanceOption[] = [];

  selectedBalanceId: number | null = null;
  selectedBalance: EmployeeLeaveBalanceResponseDTO | null = null;

  originalCurrentBalance = 0;
  validationMessage = '';

  form = {
    currentBalance: 0
  };

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
    this.loadCurrentYearBalances();
  }

  loadCurrentYearBalances(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.balanceService.search(
      {
        idEmployee: this.idEmployee,
        year: this.currentYear,
        active: true
      },
      0,
      100
    ).subscribe({
      next: (res) => {
        this.balances = res?.content || [];

        if (this.balances.length > 0) {
          this.employee = this.balances[0].employee || null;

          this.balanceOptions = this.balances.map(balance => ({
            label: `${balance.leaveType?.name || 'Type inconnu'} (${balance.leaveType?.code || '—'})`,
            code: balance.leaveType?.code || '',
            value: balance.idBalance
          }));

          this.selectedBalanceId = this.balances[0].idBalance;
          this.onBalanceSelected();
        } else {
          this.employee = null;
          this.balanceOptions = [];
          this.selectedBalance = null;
          this.selectedBalanceId = null;
        }

        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.balances = [];
        this.balanceOptions = [];
        this.selectedBalance = null;
        this.selectedBalanceId = null;
        this.showError(this.extractErrorMessage(err));
        this.cd.detectChanges();
      }
    });
  }

  onBalanceSelected(): void {
    this.selectedBalance =
      this.balances.find(balance => balance.idBalance === this.selectedBalanceId) || null;

    if (!this.selectedBalance) {
      this.originalCurrentBalance = 0;
      this.form.currentBalance = 0;
      this.validationMessage = '';
      return;
    }

    this.originalCurrentBalance = Number(this.selectedBalance.currentBalance || 0);
    this.form.currentBalance = this.originalCurrentBalance;

    this.onBalanceChange();
  }

  onBalanceChange(): void {
    this.validationMessage = '';

    if (!this.selectedBalance) {
      this.validationMessage = 'Veuillez choisir un type de congé.';
      return;
    }

    const currentBalance = Number(this.form.currentBalance);
    const usedBalance = Number(this.selectedBalance.usedBalance || 0);
    const maxBalance = this.getMaxBalance();

    if (this.form.currentBalance === null || this.form.currentBalance === undefined) {
      this.validationMessage = 'Le solde total est requis.';
      return;
    }

    if (isNaN(currentBalance)) {
      this.validationMessage = 'Le solde total doit être un nombre valide.';
      return;
    }

    if (currentBalance < 0) {
      this.validationMessage = 'Le solde total ne peut pas être négatif.';
      return;
    }

    if (currentBalance < usedBalance) {
      this.validationMessage = 'Le solde total ne peut pas être inférieur au solde utilisé.';
      return;
    }

    if (maxBalance > 0 && currentBalance > maxBalance) {
      this.validationMessage = `Le solde total ne peut pas dépasser le maximum autorisé (${maxBalance}).`;
      return;
    }
  }

  save(): void {
    this.onBalanceChange();

    if (this.validationMessage) {
      this.showError(this.validationMessage);
      return;
    }

    if (!this.selectedBalance) {
      this.showError('Veuillez choisir un type de congé.');
      return;
    }

    const dto: EmployeeLeaveBalanceUpdateDTO = {
      currentBalance: Number(this.form.currentBalance)
    };

    this.saving = true;
    this.cd.detectChanges();

    this.balanceService.update(this.selectedBalance.idBalance, dto).subscribe({
      next: () => {
        this.saving = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Solde corrigé avec succès',
          life: 2500
        });

        this.cd.detectChanges();

        setTimeout(() => {
          this.loadCurrentYearBalances();
        }, 500);
      },
      error: (err) => {
        this.saving = false;
        this.showError(this.extractErrorMessage(err));
        this.cd.detectChanges();
      }
    });
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

  getUnitLabel(): string {
    return this.selectedBalance?.leaveType?.unit === 'MONTH' ? 'mois' : 'jours';
  }

  getMaxBalance(): number {
    return Number(this.selectedBalance?.leaveType?.maxBalance || 0);
  }

  getCalculatedRemaining(): number {
    const current = Number(this.form.currentBalance || 0);
    const used = Number(this.selectedBalance?.usedBalance || 0);

    return Number(Math.max(0, current - used).toFixed(2));
  }

  getRemainingClass(): string {
    const remaining = this.getCalculatedRemaining();

    if (remaining <= 0) return 'danger';
    if (remaining <= 3) return 'warning';
    return 'success';
  }

  getUsagePercent(): number {
    const current = Number(this.form.currentBalance || 0);
    const used = Number(this.selectedBalance?.usedBalance || 0);

    if (current <= 0) return 0;

    return Math.max(0, Math.min(100, Math.round((used / current) * 100)));
  }

  back(): void {
    this.router.navigate(['/Parametrages/leave-balances']);
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
    return err?.error?.message || err?.error?.error || err?.message || 'Erreur lors de la modification';
  }
}