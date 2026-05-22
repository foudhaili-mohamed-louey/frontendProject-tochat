import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { RoleCategoryService } from '../services/role-category.service';
import { RoleCategoryUpdateDTO } from '../dtos/role-category-update.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-role-category-edit',
  standalone: true,
  templateUrl: './role-category-edit.html',
  styleUrls: ['./role-category-edit.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class RoleCategoryEditComponent implements OnInit {

  id!: number;

  loading = false;
  saving = false;

  form: RoleCategoryUpdateDTO = {
    name: '',
    description: '',
    color: '#1f3b6d'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleCategoryService: RoleCategoryService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCategory();
  }

  loadCategory(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.roleCategoryService.getById(this.id).subscribe({
      next: (category) => {
        this.form = {
          name: category.name,
          description: category.description || '',
          color: category.color || '#1f3b6d'
        };

        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cd.detectChanges();

        this.showError(
          err?.error?.message ||
          'Erreur lors du chargement de la catégorie'
        );
      }
    });
  }

  save(): void {
    if (!this.form.name?.trim()) {
      this.showError('Le nom de la catégorie est requis');
      return;
    }

    this.saving = true;
    this.cd.detectChanges();

    this.roleCategoryService.update(this.id, this.form).subscribe({
      next: () => {
        this.saving = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Catégorie modifiée avec succès',
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
          'Erreur lors de la modification de la catégorie'
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