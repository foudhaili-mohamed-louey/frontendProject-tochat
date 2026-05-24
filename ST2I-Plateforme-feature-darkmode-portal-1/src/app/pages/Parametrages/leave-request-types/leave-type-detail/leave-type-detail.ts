import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { LeaveTypeService } from '../services/leave-type.service';
import { LeaveTypeResponseDTO } from '../dtos/leave-type-response.dto';
import { LeaveUnit } from '../dtos/leave-unit';
import { LeaveIncrementMode } from '../dtos/leave-increment-mode';

@Component({
  selector: 'app-leave-type-details',
  standalone: true,
  templateUrl: './leave-type-detail.html',
  styleUrls: ['./leave-type-detail.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class LeaveTypeDetailsComponent implements OnInit {

  id!: number;
  loading = true;
  data: LeaveTypeResponseDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leaveTypeService: LeaveTypeService,
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

    this.leaveTypeService.getById(this.id).subscribe({
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

  getUnitLabel(unit: LeaveUnit): string {
    return unit === 'MONTH' ? 'Mois' : 'Jour';
  }

  getIncrementModeLabel(mode: LeaveIncrementMode): string {
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

  getMainBalanceLabel(): string {
    if (!this.data) return '-';

    switch (this.data.incrementMode) {
      case 'MONTHLY':
        return `${this.data.monthlyIncrement} / mois`;
      case 'YEARLY':
        return `${this.data.yearlyAllowance} / an`;
      case 'FIXED':
        return `${this.data.defaultBalance} fixe`;
      case 'NONE':
      default:
        return 'Aucun solde automatique';
    }
  }

  getEstimatedAnnualBalance(): number {
    if (!this.data || this.data.incrementMode !== 'MONTHLY') return 0;
    return Number((Number(this.data.monthlyIncrement || 0) * 12).toFixed(2));
  }

  getModeClass(): string {
    if (!this.data) return 'none';
    return this.data.incrementMode.toLowerCase();
  }

  private extractErrorMessage(err: any): string {
    return err?.error?.message || err?.error?.error || err?.message || 'Erreur lors du chargement';
  }

  back(): void {
    this.router.navigate(['Parametrages/leave-request-types']);
  }
}