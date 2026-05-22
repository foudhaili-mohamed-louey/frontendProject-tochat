import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DepartmentService } from '../services/department.service';
import { UpdateDepartmentDTO } from '../dtos/update-department.dto';
import { DepartmentType } from '../dtos/department-type';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-department-edit',
  standalone: true,
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class DepartmentEditComponent implements OnInit {

  deptId!: number;
  loading = true;
  saving  = false;

  currentType: DepartmentType | null = null;

  form: UpdateDepartmentDTO = {
    name:        '',
    description: '',
    location:    '',
    phoneNumber: '',
    email:       ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['Parametrages/departments']);
      return;
    }
    this.deptId = Number(id);
    this.loadDepartment();
  }

  // ===== LOAD =====
  loadDepartment(): void {
    this.departmentService.getById(this.deptId).subscribe({
      next: (dept) => {
        this.currentType = dept.type;
        this.form = {
          name:        dept.name        ?? '',
          description: dept.description ?? '',
          location:    dept.location    ?? '',
          phoneNumber: dept.phoneNumber ?? '',
          email:       dept.email       ?? ''
        };
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.showError(
          err?.error?.message ||
          err?.error?.error   ||
          'Impossible de charger le département'
        );
        this.loading = false;
        this.cd.detectChanges();
        setTimeout(() => this.router.navigate(['Parametrages/departments']), 2000);
      }
    });
  }

  // ===== SAVE =====
  save(formRef: NgForm): void {
    formRef.control.markAllAsTouched();
    this.cd.detectChanges();

    if (formRef.invalid) {
      this.showError('Veuillez corriger les champs invalides avant de sauvegarder.');
      return;
    }

    this.saving = true;
    this.cd.detectChanges();

    this.departmentService.updateDepartment(this.deptId, this.form).subscribe({
      next: (updated) => {
        this.saving = false;
        this.cd.detectChanges();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Département "${updated.name}" mis à jour avec succès`,
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
          'Erreur lors de la mise à jour du département'
        );
      }
    });
  }

  // ===== HELPERS =====
  get typeLabel(): string {
    if (this.currentType === 'OPERATIONAL') return 'Opérationnel';
    if (this.currentType === 'SUPPORT')     return 'Support';
    return '—';
  }

  get typeClass(): string {
    if (this.currentType === 'OPERATIONAL') return 'operational';
    if (this.currentType === 'SUPPORT')     return 'support';
    return '';
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

  back(): void {
    this.router.navigate(['Parametrages/departments']);
  }
}