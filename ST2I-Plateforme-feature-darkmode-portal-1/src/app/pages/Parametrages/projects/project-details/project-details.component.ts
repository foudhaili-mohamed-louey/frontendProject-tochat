import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectService } from '../services/project.service';
import { TeamService } from '../../teams/service/team.service';
import { DepartmentService } from '../../departments/services/department.service';

import { ProjectResponseDTO } from '../dtos/project-response.dto';
import { ProjectStatus } from '../dtos/project-status.enum';
import { TeamResponseDTO } from '../../teams/dtos/team-response.dto';
import { DepartmentResponseDTO } from '../../departments/dtos/department-response.dto';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

type TimelineStep = {
  status: ProjectStatus;
  label: string;
  icon: string;
  description: string;
};

@Component({
  selector: 'app-project-details',
  standalone: true,
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
  imports: [CommonModule, ButtonModule, ToastModule],
  providers: [MessageService]
})
export class ProjectDetailsComponent implements OnInit {

  project?: ProjectResponseDTO;
  team?: TeamResponseDTO;

  departments: DepartmentResponseDTO[] = [];

  loading = true;
  loadingTeam = false;
  loadingDepartments = false;

  readonly ProjectStatus = ProjectStatus;

  timeline: TimelineStep[] = [
    {
      status: ProjectStatus.DRAFT,
      label: 'Brouillon',
      icon: 'pi pi-pencil',
      description: 'Projet en préparation'
    },
    {
      status: ProjectStatus.READY,
      label: 'Prêt',
      icon: 'pi pi-check',
      description: 'Équipe et départements affectés'
    },
    {
      status: ProjectStatus.RUNNING,
      label: 'En cours',
      icon: 'pi pi-play',
      description: 'Projet démarré'
    },
    {
      status: ProjectStatus.ON_HOLD,
      label: 'En pause',
      icon: 'pi pi-pause',
      description: 'Projet suspendu temporairement'
    },
    {
      status: ProjectStatus.ENDED,
      label: 'Terminé',
      icon: 'pi pi-check-circle',
      description: 'Projet clôturé'
    },
    {
      status: ProjectStatus.CANCELLED,
      label: 'Annulé',
      icon: 'pi pi-ban',
      description: 'Projet annulé'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private teamService: TeamService,
    private departmentService: DepartmentService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        this.loading = false;
        this.cd.detectChanges();
        return;
      }

      this.loadProject(Number(id));
    });
  }

  loadProject(id: number): void {
    this.loading = true;
    this.project = undefined;
    this.team = undefined;
    this.departments = [];
    this.cd.detectChanges();

    this.projectService.getById(id).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
        this.cd.detectChanges();

        this.loadTeamIfExists();
        this.loadDepartmentsIfExists();
      },
      error: (err) => {
        console.error('Error loading project', err);
        this.project = undefined;
        this.loading = false;
        this.showError('Erreur lors du chargement du projet');
        this.cd.detectChanges();
      }
    });
  }

  loadTeamIfExists(): void {
    if (!this.project?.teamId) return;

    this.loadingTeam = true;
    this.cd.detectChanges();

    this.teamService.getById(this.project.teamId).subscribe({
      next: (team) => {
        this.team = team;
        this.loadingTeam = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.team = undefined;
        this.loadingTeam = false;
        this.cd.detectChanges();
      }
    });
  }

  loadDepartmentsIfExists(): void {
    if (!this.project?.departmentIds || this.project.departmentIds.length === 0) {
      this.departments = [];
      return;
    }

    this.loadingDepartments = true;
    this.cd.detectChanges();

    this.departmentService.getActiveOperationalDepartments().subscribe({
      next: (allDepartments) => {
        const ids = this.project?.departmentIds || [];
        this.departments = allDepartments.filter(dep => ids.includes(dep.id));
        this.loadingDepartments = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.departments = [];
        this.loadingDepartments = false;
        this.cd.detectChanges();
      }
    });
  }

  edit(): void {
    if (!this.project) return;
    this.router.navigate(['/Parametrages/projects', this.project.id, 'edit']);
  }

  back(): void {
    this.router.navigate(['/Parametrages/projects']);
  }

  canEdit(): boolean {
    if (!this.project) return false;

    return this.project.status !== ProjectStatus.ENDED &&
      this.project.status !== ProjectStatus.CANCELLED;
  }

  hasTeam(): boolean {
    return !!this.project?.teamId || !!this.project?.teamName;
  }

  formatStatus(status?: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.DRAFT: return 'Brouillon';
      case ProjectStatus.READY: return 'Prêt';
      case ProjectStatus.RUNNING: return 'En cours';
      case ProjectStatus.ON_HOLD: return 'En pause';
      case ProjectStatus.ENDED: return 'Terminé';
      case ProjectStatus.CANCELLED: return 'Annulé';
      default: return '—';
    }
  }

  statusClass(status?: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.DRAFT: return 'badge-gray';
      case ProjectStatus.READY: return 'badge-blue';
      case ProjectStatus.RUNNING: return 'badge-green';
      case ProjectStatus.ON_HOLD: return 'badge-orange';
      case ProjectStatus.ENDED: return 'badge-purple';
      case ProjectStatus.CANCELLED: return 'badge-red';
      default: return 'badge-gray';
    }
  }

  timelineClass(step: TimelineStep): string {
    if (!this.project) return 'pending';

    if (step.status === this.project.status) {
      return 'current';
    }

    if (this.isStepPassed(step.status)) {
      return 'done';
    }

    return 'pending';
  }

  isStepPassed(status: ProjectStatus): boolean {
    if (!this.project) return false;

    const order = [
      ProjectStatus.DRAFT,
      ProjectStatus.READY,
      ProjectStatus.RUNNING,
      ProjectStatus.ON_HOLD,
      ProjectStatus.ENDED
    ];

    if (this.project.status === ProjectStatus.CANCELLED) {
      return status !== ProjectStatus.CANCELLED;
    }

    const currentIndex = order.indexOf(this.project.status);
    const stepIndex = order.indexOf(status);

    return currentIndex !== -1 && stepIndex !== -1 && stepIndex < currentIndex;
  }

  formatDate(date?: string): string {
    if (!date) return '—';

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString('fr-FR');
  }

  formatDateTime(date?: string): string {
    if (!date) return '—';

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleString('fr-FR');
  }

  formatBudget(budget?: number): string {
    if (budget === null || budget === undefined) return '—';

    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(budget);
  }

  getDepartmentFallbackIds(): number[] {
    if (!this.project?.departmentIds) return [];

    const loadedIds = this.departments.map(d => d.id);
    return this.project.departmentIds.filter(id => !loadedIds.includes(id));
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail,
      life: 5000
    });
  }
}