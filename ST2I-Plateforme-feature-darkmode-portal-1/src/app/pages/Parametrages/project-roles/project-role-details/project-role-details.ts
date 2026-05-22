import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectRoleService } from '../services/project-role.service';
import { ProjectRoleResponseDTO } from '../dtos/project-role-response.dto';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-project-role-details',
  standalone: true,
  templateUrl: './project-role-details.html',
  styleUrls: ['./project-role-details.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class ProjectRoleDetailsComponent implements OnInit {

  id!: number;
  loading = false;

  role: ProjectRoleResponseDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectRoleService: ProjectRoleService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRole();
  }

  loadRole(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.projectRoleService.getById(this.id).subscribe({
      next: (res) => {
        this.role = res;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message || 'Erreur lors du chargement du rôle projet',
          life: 5000
        });
      }
    });
  }

  back(): void {
    this.router.navigate(['/Parametrages/project-roles']);
  }

  edit(): void {
    if (!this.role) return;
    this.router.navigate(['/Parametrages/project-roles', this.role.id, 'edit']);
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
}