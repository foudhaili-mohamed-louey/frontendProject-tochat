import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DepartmentService } from '../services/department.service';
import { CreateDepartmentRequestDTO } from '../dtos/create-department-request.dto';
import { DepartmentType } from '../dtos/department-type';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-department-form',
  standalone: true,
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class DepartmentFormComponent {

  saving = false;

  form: CreateDepartmentRequestDTO = {
    name:        '',
    code:        '',
    description: '',
    location:    '',
    phoneNumber: '',
    email:       '',
    type:        '' as DepartmentType
  };

  departmentTypes: { label: string; value: DepartmentType }[] = [
    { label: 'Opérationnel', value: 'OPERATIONAL' },
    { label: 'Support',      value: 'SUPPORT'      }
  ];

  constructor(
    private router: Router,
    private departmentService: DepartmentService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  // ===== VALIDATION =====
  private validate(): boolean {
    if (!this.form.name.trim()) {
      this.showError('Le nom du département est requis.');
      return false;
    }
    if (!this.form.code.trim()) {
      this.showError('Le code du département est requis.');
      return false;
    }
    if (this.form.code.trim().length > 10) {
      this.showError('Le code ne doit pas dépasser 10 caractères.');
      return false;
    }
    if (!this.form.type) {
      this.showError('Le type du département est requis.');
      return false;
    }
    if (!this.form.email.trim()) {
      this.showError("L'email du département est requis.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.form.email.trim())) {
      this.showError("L'adresse email n'est pas valide.");
      return false;
    }
    return true;
  }

  // ===== SAVE =====
  save(): void {
    if (!this.validate()) return;

    this.saving = true;
    this.cd.detectChanges();

    this.departmentService.createDepartment(this.form).subscribe({
      next: (created) => {
        this.saving = false;
        this.cd.detectChanges();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Département "${created.name}" créé avec succès`,
          life: 3000
        });
        setTimeout(() => this.back(), 1500);
      },
      error: (err) => {
        this.saving = false;
        this.cd.detectChanges();
        this.showError(
          err?.error?.message ||
          err?.error?.error   ||
          err?.message        ||
          'Erreur lors de la création du département'
        );
      }
    });
  }

  // ===== HELPERS =====
  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail,
      life: 5000
    });
    this.cd.detectChanges();
  }

  back(): void {
    this.router.navigate(['Parametrages/departments']);
  }
}