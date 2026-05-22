import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectRoleService } from '../services/project-role.service';
import { RoleCategoryService } from '../../role-categories/services/role-category.service';

import { ProjectRoleUpdateDTO } from '../dtos/project-role-update.dto';
import { RoleCategoryResponseDTO } from '../../role-categories/dtos/role-category-response.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-project-role-edit',
  standalone: true,
  templateUrl: './project-role-edit.html',
  styleUrls: ['./project-role-edit.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class ProjectRoleEditComponent implements OnInit {

  id!: number;

  loading = false;
  saving = false;
  loadingCategories = false;

  categories: RoleCategoryResponseDTO[] = [];

  form: ProjectRoleUpdateDTO = {
    name: '',
    description: '',
    uniqueRole: false,
    hierarchyLevel: 4,
    roleCategoryId: undefined
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectRoleService: ProjectRoleService,
    private roleCategoryService: RoleCategoryService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCategories();
    this.loadRole();
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.cd.detectChanges();

    this.roleCategoryService.getAll(0, 100).subscribe({
      next: (res) => {
        this.categories = res.content || [];
        this.loadingCategories = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.loadingCategories = false;
        this.showError('Erreur lors du chargement des catégories');
      }
    });
  }

  loadRole(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.projectRoleService.getById(this.id).subscribe({
      next: (role) => {
        this.form = {
          name: role.name,
          description: role.description || '',
          uniqueRole: role.uniqueRole,
          hierarchyLevel: role.hierarchyLevel || 4,
          roleCategoryId: role.roleCategoryId
        };

        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cd.detectChanges();

        this.showError(
          err?.error?.message ||
          'Erreur lors du chargement du rôle projet'
        );
      }
    });
  }

  save(): void {
    if (!this.form.name?.trim()) {
      this.showError('Le nom du rôle est requis');
      return;
    }

    if (!this.form.roleCategoryId) {
      this.showError('La catégorie est requise');
      return;
    }

    if (!this.form.hierarchyLevel || this.form.hierarchyLevel < 1) {
      this.showError('Le niveau hiérarchique est requis');
      return;
    }

    this.saving = true;
    this.cd.detectChanges();

    this.projectRoleService.update(this.id, this.form).subscribe({
      next: () => {
        this.saving = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Rôle projet modifié avec succès',
          life: 3000
        });

        setTimeout(() => {
          this.router.navigate(['/Parametrages/project-roles']);
        }, 1000);
      },
      error: (err) => {
        this.saving = false;
        this.cd.detectChanges();

        this.showError(
          err?.error?.message ||
          err?.error?.error ||
          'Erreur lors de la modification du rôle projet'
        );
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/Parametrages/project-roles']);
  }

  getHierarchyLabel(level?: number): string {
    switch (level) {
      case 1:
        return 'Niveau 1 — Direction';
      case 2:
        return 'Niveau 2 — Leadership';
      case 3:
        return 'Niveau 3 — Analyse / Senior';
      case 4:
        return 'Niveau 4 — Exécution';
      case 5:
        return 'Niveau 5 — Support';
      default:
        return 'Non défini';
    }
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