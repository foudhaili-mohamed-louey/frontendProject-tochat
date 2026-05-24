import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { EmployeeLeaveBalanceService } from '../services/employee-leave-balance.service';
import { EmployeeLeaveBalanceResponseDTO } from '../dtos/employee-leave-balance-response.dto';
import { UserResponseDTO } from '@/app/pages/administration/users/models/user-response.dto';

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
    ToastModule
  ],
  providers: [MessageService]
})
export class EmployeeLeaveBalanceEditComponent implements OnInit {

  id!: number;
  loading = true;
  saving = false;

  data: EmployeeLeaveBalanceResponseDTO | null = null;

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
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.back();
      return;
    }

    this.id = Number(idParam);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.balanceService.getById(this.id).subscribe({
      next: (res) => {
        this.data = res;
        this.form.currentBalance = Number(res.currentBalance || 0);
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.showError(this.extractErrorMessage(err));
        this.cd.detectChanges();
      }
    });
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

  getUnitLabel(): string {
    const unit = this.data?.leaveType?.unit;
    return unit === 'MONTH' ? 'Mois' : 'Jour';
  }

  getCalculatedRemaining(): number {
    const current = Number(this.form.currentBalance || 0);
    const used = Number(this.data?.usedBalance || 0);

    const remaining = current - used;

    return Number(Math.max(0, remaining).toFixed(2));
  }

  getRemainingClass(): string {
    const remaining = this.getCalculatedRemaining();

    if (remaining <= 0) return 'danger';
    if (remaining <= 3) return 'warning';
    return 'success';
  }

  getMaxBalance(): number {
    return Number(this.data?.leaveType?.maxBalance || 0);
  }

  private validate(): boolean {
    if (!this.data) return this.showError('Données introuvables.');

    if (this.form.currentBalance === null || this.form.currentBalance === undefined) {
      return this.showError('Le solde total est requis.');
    }

    if (Number(this.form.currentBalance) < 0) {
      return this.showError('Le solde total ne peut pas être négatif.');
    }

    if (Number(this.form.currentBalance) < Number(this.data.usedBalance || 0)) {
      return this.showError('Le solde total ne peut pas être inférieur au solde déjà utilisé.');
    }

    const maxBalance = this.getMaxBalance();

    if (maxBalance > 0 && Number(this.form.currentBalance) > maxBalance) {
      return this.showError(`Le solde total ne peut pas dépasser le maximum du type de congé (${maxBalance}).`);
    }

    return true;
  }

  save(): void {
    if (!this.validate()) return;

    this.saving = true;
    this.cd.detectChanges();

    this.balanceService.update(this.id, {
      currentBalance: Number(this.form.currentBalance)
    } as any).subscribe({
      next: () => {
        this.saving = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Solde modifié avec succès',
          life: 3000
        });

        setTimeout(() => this.back(), 1000);
      },
      error: (err: any) => {
        this.saving = false;
        this.showError(this.extractErrorMessage(err));
        this.cd.detectChanges();
      }
    });
  }

  private showError(detail: string): false {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail,
      life: 5000
    });

    this.cd.detectChanges();
    return false;
  }

  private extractErrorMessage(err: any): string {
    return err?.error?.message || err?.error?.error || err?.message || 'Erreur lors de la modification';
  }

  back(): void {
    this.router.navigate(['/Parametrages/leave-balances']);
  }
}