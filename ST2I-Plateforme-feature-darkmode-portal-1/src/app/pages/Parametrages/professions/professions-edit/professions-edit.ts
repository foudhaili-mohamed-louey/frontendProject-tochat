import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProfessionService } from '../services/profession.service';
import { ProfessionUpdateDTO } from '../dtos/profession-update.dto';
import { ProfessionResponseDTO } from '../dtos/profession-response.dto';

import { DepartmentService } from '../../departments/services/department.service';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-professions-edit',
  standalone: true,
  templateUrl: './professions-edit.html',
  styleUrls: ['./professions-edit.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class ProfessionsEditComponent implements OnInit {

  professionId!: number;

  loading = false;
  saving = false;
  loadingDepartments = false;

  departments: any[] = [];

  profession: ProfessionResponseDTO | null = null;

  form: ProfessionUpdateDTO = {
    name: '',
    code: '',
    idDepartment: undefined
  };

  constructor(
    private professionService: ProfessionService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.professionId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.professionId) {
      this.router.navigate(['/Parametrages/professions']);
      return;
    }

    this.loadDepartments();
    this.loadProfession();
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

  loadProfession(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.professionService.getById(this.professionId).subscribe({
      next: (res) => {
        this.profession = res;

        this.form = {
          name: res.name,
          code: res.code,
          idDepartment: res.idDepartment
        };

        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cd.detectChanges();

        this.showError(
          err?.error?.message ||
          'Erreur lors du chargement de la profession'
        );

        setTimeout(() => {
          this.router.navigate(['/Parametrages/professions']);
        }, 1200);
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

    const payload: ProfessionUpdateDTO = {
      name: this.form.name.trim(),
      code: this.form.code.trim(),
      idDepartment: Number(this.form.idDepartment)
    };

    this.professionService.update(this.professionId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Profession modifiée avec succès',
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
          'Erreur lors de la modification'
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