import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { LeaveTypeService } from '../services/leave-type.service';
import { LeaveTypeRequestDTO } from '../dtos/leave-type-request.dto';
import { LeaveUnit } from '../dtos/leave-unit';
import { LeaveIncrementMode } from '../dtos/leave-increment-mode';
import { GenderRestriction } from '../dtos/gender-restriction';

@Component({
  selector: 'app-leave-type-form',
  standalone: true,
  templateUrl: './leave-type-form.html',
  styleUrls: ['./leave-type-form.scss'],
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService]
})
export class LeaveTypeFormComponent {
  saving = false;

  form: LeaveTypeRequestDTO = {
    code: '',
    name: '',
    description: '',
    unit: 'DAY',
    incrementMode: 'NONE',
    defaultBalance: 0,
    monthlyIncrement: 0,
    yearlyAllowance: 0,
    maxBalance: 0,
    carryOverEnabled: false,
    requiresJustification: false,
    requiresApproval: true,
    allowsHalfDay: false,
    genderRestriction: null
  };

  genderOptions: { label: string; value: GenderRestriction | null }[] = [
  { label: 'Tous les employés', value: null },
  { label: 'Hommes uniquement', value: 'MALE' },
  { label: 'Femmes uniquement', value: 'FEMALE' }
];

  units: { label: string; value: LeaveUnit }[] = [
    { label: 'Jour', value: 'DAY' },
    { label: 'Mois', value: 'MONTH' }
  ];

  modes: { label: string; value: LeaveIncrementMode; hint: string }[] = [
    { label: 'Aucun', value: 'NONE', hint: 'Aucun solde automatique. Exemple: congé sans solde.' },
    { label: 'Mensuel', value: 'MONTHLY', hint: 'Le solde augmente chaque mois. Exemple: congé annuel.' },
    { label: 'Annuel', value: 'YEARLY', hint: 'Le solde est réinitialisé chaque année. Exemple: congé maladie.' },
    { label: 'Fixe', value: 'FIXED', hint: 'Solde fixe attribué. Exemple: maternité, paternité.' }
  ];

  constructor(
    private router: Router,
    private leaveTypeService: LeaveTypeService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  onModeChange(): void {
    if (this.form.incrementMode === 'NONE') {
      this.form.defaultBalance = 0;
      this.form.monthlyIncrement = 0;
      this.form.yearlyAllowance = 0;
      this.form.maxBalance = 0;
      this.form.carryOverEnabled = false;
    }

    if (this.form.incrementMode === 'MONTHLY') {
      this.form.defaultBalance = 0;
      this.form.yearlyAllowance = 0;
      this.form.carryOverEnabled = true;
    }

    if (this.form.incrementMode === 'YEARLY') {
      this.form.defaultBalance = 0;
      this.form.monthlyIncrement = 0;
      this.form.carryOverEnabled = false;
    }

    if (this.form.incrementMode === 'FIXED') {
      this.form.monthlyIncrement = 0;
      this.form.yearlyAllowance = 0;
      this.form.carryOverEnabled = false;
    }
  }

  get selectedModeHint(): string {
    return this.modes.find(m => m.value === this.form.incrementMode)?.hint || '';
  }

  get estimatedAnnualBalance(): number {
    if (this.form.incrementMode !== 'MONTHLY') return 0;
    return Number((Number(this.form.monthlyIncrement || 0) * 12).toFixed(2));
  }

  private validate(): boolean {
    if (!this.form.code.trim()) return this.showError('Le code est requis.');
    if (!this.form.name.trim()) return this.showError('Le nom est requis.');
    if (!this.form.unit) return this.showError("L'unité est requise.");
    if (!this.form.incrementMode) return this.showError("Le mode d'incrémentation est requis.");

    if (this.form.incrementMode === 'MONTHLY') {
      if (this.form.monthlyIncrement <= 0) return this.showError("L'incrément mensuel doit être supérieur à 0.");
      if (this.form.maxBalance <= 0) return this.showError('Le solde maximum doit être supérieur à 0.');
    }

    if (this.form.incrementMode === 'YEARLY') {
      if (this.form.yearlyAllowance <= 0) return this.showError("L'allocation annuelle doit être supérieure à 0.");
      if (this.form.maxBalance <= 0) return this.showError('Le solde maximum doit être supérieur à 0.');
    }

    if (this.form.incrementMode === 'FIXED') {
      if (this.form.defaultBalance <= 0) return this.showError('Le solde fixe doit être supérieur à 0.');
      if (this.form.maxBalance <= 0) this.form.maxBalance = this.form.defaultBalance;
    }

    return true;
  }

  save(): void {
    if (!this.validate()) return;

    this.saving = true;
    this.cd.detectChanges();

    const payload: LeaveTypeRequestDTO = {
      ...this.form,
      code: this.form.code.trim().toUpperCase(),
      name: this.form.name.trim(),
      description: this.form.description?.trim() || ''
    };

    this.leaveTypeService.create(payload).subscribe({
      next: (created) => {
        this.saving = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Type de congé "${created.name}" créé avec succès`,
          life: 3000
        });

        setTimeout(() => this.back(), 1000);
      },
      error: (err: any) => {
        this.saving = false;
        this.cd.detectChanges();
        this.showError(this.extractErrorMessage(err));
      }
    });
  }

  private showError(detail: string): false {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 5000 });
    this.cd.detectChanges();
    return false;
  }

  private extractErrorMessage(err: any): string {
    return err?.error?.message || err?.error?.error || err?.message || 'Erreur lors de la création';
  }

  back(): void {
    this.router.navigate(['Parametrages/leave-request-types']);
  }
}