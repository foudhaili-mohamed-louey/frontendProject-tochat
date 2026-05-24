import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
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
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class EmployeeLeaveBalanceDetailsComponent implements OnInit {

  id!: number;
  loading = true;
  data: EmployeeLeaveBalanceResponseDTO | null = null;

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
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.extractErrorMessage(err)
        });
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

  getUsagePercent(): number {
    if (!this.data) return 0;

    const current = Number(this.data.currentBalance || 0);
    const used = Number(this.data.usedBalance || 0);

    if (current <= 0) return 0;

    return Math.max(0, Math.min(100, Math.round((used / current) * 100)));
  }

  getRemainingClass(): string {
    if (!this.data) return 'success';

    const remaining = Number(this.data.remainingBalance || 0);

    if (remaining <= 0) return 'danger';
    if (remaining <= 3) return 'warning';
    return 'success';
  }

  getUnitLabel(): string {
    const unit = this.data?.leaveType?.unit;
    return unit === 'MONTH' ? 'Mois' : 'Jour';
  }

  getModeLabel(): string {
    const mode = this.data?.leaveType?.incrementMode;

    switch (mode) {
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

  private extractErrorMessage(err: any): string {
    return err?.error?.message || err?.error?.error || err?.message || 'Erreur lors du chargement';
  }

  back(): void {
    this.router.navigate(['/Parametrages/leave-balances']);
  }
}