import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { LeaveTypeService } from '../services/leave-type.service';
import { LeaveTypeRequestDTO } from '../dtos/leave-type-request.dto';
import { LeaveTypeResponseDTO } from '../dtos/leave-type-response.dto';
import { LeaveUnit } from '../dtos/leave-unit';
import { LeaveIncrementMode } from '../dtos/leave-increment-mode';
import { GenderRestriction } from '../dtos/gender-restriction';

@Component({
  selector: 'app-leave-type-edit',
  standalone: true,
  templateUrl: './leave-type-edit.html',
  styleUrls: ['./leave-type-edit.scss'],
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService]
})
export class LeaveTypeEditComponent implements OnInit {

  id!: number;
  loading = true;
  saving = false;
  current?: LeaveTypeResponseDTO;

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

    this.leaveTypeService.getById(this.id).subscribe({
      next: (data) => {
        this.current = data;

        this.form = {
          code: data.code ?? '',
          name: data.name ?? '',
          description: data.description ?? '',
          unit: data.unit,
          incrementMode: data.incrementMode,
          defaultBalance: data.defaultBalance ?? 0,
          monthlyIncrement: data.monthlyIncrement ?? 0,
          yearlyAllowance: data.yearlyAllowance ?? 0,
          maxBalance: data.maxBalance ?? 0,
          carryOverEnabled: data.carryOverEnabled ?? false,
          requiresJustification: data.requiresJustification ?? false,
          requiresApproval: data.requiresApproval ?? true,
          allowsHalfDay: data.allowsHalfDay ?? false,
          genderRestriction: data.genderRestriction ?? null
        };

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

    this.leaveTypeService.update(this.id, payload).subscribe({
      next: (updated) => {
        this.saving = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Type de congé "${updated.name}" modifié avec succès`,
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
    return err?.error?.message || err?.error?.error || err?.message || 'Erreur lors de la modification';
  }

  back(): void {
    this.router.navigate(['Parametrages/leave-request-types']);
  }
}