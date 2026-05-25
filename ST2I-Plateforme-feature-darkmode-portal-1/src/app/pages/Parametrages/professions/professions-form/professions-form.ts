import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProfessionService } from '../services/profession.service';
import { ProfessionCreateDTO } from '../dtos/profession-create.dto';

import { DepartmentService } from '../../departments/services/department.service';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-professions-form',
  standalone: true,
  templateUrl: './professions-form.html',
  styleUrls: ['./professions-form.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class ProfessionsFormComponent implements OnInit {

  saving = false;
  loadingDepartments = false;

  departments: any[] = [];

  form: ProfessionCreateDTO = {
    name: '',
    code: '',
    idDepartment: 0,
    uniqueByDepartment: false
  };

  constructor(
    private professionService: ProfessionService,
    private departmentService: DepartmentService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loadingDepartments = true;
    this.cd.detectChanges();

    this.departmentService.getActiveDepartments().subscribe({
      next: (res) => {
        this.departments = res || [];
        this.loadingDepartments = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.loadingDepartments = false;
        this.showError('Erreur lors du chargement des départements');
      }
    });
  }

  save(): void {
    if (!this.form.name?.trim()) {
      this.showError('Le nom de la profession est requis');
      return;
    }

    if (!this.form.code?.trim()) {
      this.showError('Le code de la profession est requis');
      return;
    }

    if (!this.form.idDepartment) {
      this.showError('Le département est requis');
      return;
    }

    this.saving = true;
    this.cd.detectChanges();

    const payload: ProfessionCreateDTO = {
      name: this.form.name.trim(),
      code: this.form.code.trim(),
      idDepartment: Number(this.form.idDepartment),
      uniqueByDepartment: Boolean(this.form.uniqueByDepartment)
    };

    this.professionService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Profession créée avec succès',
          life: 3000
        });

        setTimeout(() => {
          this.router.navigate(['/Parametrages/professions']);
        }, 1000);
      },
      error: (err) => {
        this.saving = false;
        this.cd.detectChanges();

        this.showError(
          err?.error?.message ||
          err?.error?.error ||
          'Erreur lors de la création de la profession'
        );
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/Parametrages/professions']);
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail,
      life: 5000
    });

    this.cd.detectChanges();
  }
}