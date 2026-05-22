import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { RoleCategoryService } from '../services/role-category.service';
import { RoleCategoryCreateDTO } from '../dtos/role-category-create.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-role-category-form',
  standalone: true,
  templateUrl: './role-category-form.html',
  styleUrls: ['./role-category-form.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class RoleCategoryFormComponent {

  saving = false;

  form: RoleCategoryCreateDTO = {
    name: '',
    description: '',
    color: '#1f3b6d'
  };

  constructor(
    private roleCategoryService: RoleCategoryService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  save(): void {
    if (!this.form.name.trim()) {
      this.showError('Le nom de la catégorie est requis');
      return;
    }

    this.saving = true;
    this.cd.detectChanges();

    this.roleCategoryService.create(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Catégorie créée avec succès',
          life: 3000
        });

        setTimeout(() => {
          this.router.navigate(['/Parametrages/role-categories']);
        }, 1000);
      },
      error: (err) => {
        this.saving = false;
        this.cd.detectChanges();

        this.showError(
          err?.error?.message ||
          err?.error?.error ||
          'Erreur lors de la création de la catégorie'
        );
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/Parametrages/role-categories']);
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