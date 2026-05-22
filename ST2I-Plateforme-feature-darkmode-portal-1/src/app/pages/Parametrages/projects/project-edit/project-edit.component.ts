import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';

import { ProjectService } from '../services/project.service';
import { TeamService } from '../../teams/service/team.service';
import { DepartmentService } from '../../departments/services/department.service';

import { ProjectUpdateDTO } from '../dtos/project-update.dto';
import { ProjectResponseDTO } from '../dtos/project-response.dto';
import { TeamResponseDTO } from '../../teams/dtos/team-response.dto';
import { DepartmentResponseDTO } from '../../departments/dtos/department-response.dto';
import { ProjectStatus } from '../dtos/project-status.enum';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';

type TeamSelectOption = {
  id: number | null;
  name: string;
  membersCount: number;
  statusLabel: string;
  noTeam: boolean;
  currentTeam: boolean;
};

@Component({
  selector: 'app-project-edit',
  standalone: true,
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    SelectModule,
    MultiSelectModule
  ],
  providers: [MessageService]
})
export class ProjectEditComponent implements OnInit {

  projectId!: number;

  loadingProject = false;
  saving = false;
  loadingTeams = false;
  loadingDepartments = false;

  project: ProjectResponseDTO | null = null;

  teams: TeamResponseDTO[] = [];
  teamOptions: TeamSelectOption[] = [];

  departments: DepartmentResponseDTO[] = [];

  selectedTeamId: number | null = null;
  originalTeamId: number | null = null;

  selectedDepartmentIds: number[] = [];
  originalDepartmentIds: number[] = [];

  private teamSearchTimeout: any;

  form: ProjectUpdateDTO = {
    name: '',
    description: '',
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    budget: undefined,
    clientName: ''
  };

  constructor(
    private projectService: ProjectService,
    private teamService: TeamService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.showError('Identifiant du projet invalide');
      this.cancel();
      return;
    }

    this.projectId = id;
    this.loadDepartments();
    this.loadProject();
  }

  private applyView(): void {
    setTimeout(() => {
      try {
        this.cd.detectChanges();
      } catch {}
    }, 0);
  }

  private runView(callback: () => void): void {
    this.zone.run(() => {
      callback();
      this.applyView();
    });
  }

  private buildTeamOptions(): void {
    const options: TeamSelectOption[] = [
      {
        id: null,
        name: 'Aucune équipe / affecter plus tard',
        membersCount: 0,
        statusLabel: 'Projet sans équipe',
        noTeam: true,
        currentTeam: false
      }
    ];

    if (this.project?.teamId) {
      options.push({
        id: this.project.teamId,
        name: this.project.teamName || 'Équipe actuelle',
        membersCount: 0,
        statusLabel: 'Équipe actuellement affectée',
        noTeam: false,
        currentTeam: true
      });
    }

    for (const team of this.teams) {
      if (this.project?.teamId && team.id === this.project.teamId) {
        continue;
      }

      options.push({
        id: team.id,
        name: team.name || 'Équipe sans nom',
        membersCount: team.members?.length || 0,
        statusLabel: `${team.members?.length || 0} membre(s)`,
        noTeam: false,
        currentTeam: false
      });
    }

    this.teamOptions = options;
  }

  loadProject(): void {
    this.loadingProject = true;
    this.applyView();

    this.projectService.getById(this.projectId).subscribe({
      next: (project) => this.runView(() => {
        this.project = project;

        this.form = {
          name: project.name || '',
          description: project.description || '',
          status: project.status,
          startDate: project.startDate || undefined,
          endDate: project.endDate || undefined,
          budget: project.budget,
          clientName: project.clientName || ''
        };

        this.selectedTeamId = project.teamId || null;
        this.originalTeamId = project.teamId || null;

        this.selectedDepartmentIds = [...(project.departmentIds || [])];
        this.originalDepartmentIds = [...(project.departmentIds || [])];

        this.loadingProject = false;
        this.loadFreeTeams();
      }),
      error: (err) => this.runView(() => {
        this.loadingProject = false;
        this.showError(err?.error?.message || 'Erreur lors du chargement du projet');
      })
    });
  }

  loadFreeTeams(searchTerm: string = ''): void {
    this.loadingTeams = true;
    this.applyView();

    this.teamService.search(
      {
        keyword: searchTerm?.trim() || undefined,
        status: 'FREE'
      },
      0,
      50
    ).subscribe({
      next: (res) => this.runView(() => {
        this.teams = [...res.content];
        this.buildTeamOptions();
        this.loadingTeams = false;
      }),
      error: () => this.runView(() => {
        this.teams = [];
        this.buildTeamOptions();
        this.loadingTeams = false;
        this.showError('Erreur lors du chargement des équipes libres');
      })
    });
  }

  onTeamFilter(event: any): void {
    const searchTerm = event?.filter || '';

    clearTimeout(this.teamSearchTimeout);

    this.teamSearchTimeout = setTimeout(() => {
      this.loadFreeTeams(searchTerm);
    }, 300);
  }

  loadDepartments(): void {
    this.loadingDepartments = true;
    this.applyView();

    this.departmentService.getActiveOperationalDepartments().subscribe({
      next: (res) => this.runView(() => {
        this.departments = [...res];
        this.loadingDepartments = false;
      }),
      error: () => this.runView(() => {
        this.departments = [];
        this.loadingDepartments = false;
        this.showError('Erreur lors du chargement des départements opérationnels');
      })
    });
  }

  isStructuralEditionAllowed(): boolean {
    if (!this.project?.status) return false;

    return this.project.status === ProjectStatus.DRAFT ||
      this.project.status === ProjectStatus.READY;
  }

  save(): void {
    if (!this.form.name?.trim()) {
      this.showError('Le nom du projet est requis');
      return;
    }

    if (
      this.form.startDate &&
      this.form.endDate &&
      this.form.startDate > this.form.endDate
    ) {
      this.showError('La date de début doit être inférieure ou égale à la date de fin.');
      return;
    }

    if (this.form.budget !== undefined && this.form.budget !== null && this.form.budget <= 0) {
      this.showError('Le budget doit être supérieur à 0.');
      return;
    }

    const payload: ProjectUpdateDTO = {
      name: this.form.name?.trim(),
      description: this.form.description?.trim() || undefined,
      status: this.form.status,
      startDate: this.form.startDate || undefined,
      endDate: this.form.endDate || undefined,
      budget: this.form.budget || undefined,
      clientName: this.form.clientName?.trim() || undefined
    };

    this.saving = true;
    this.applyView();

    this.projectService.update(this.projectId, payload).pipe(
      switchMap((updatedProject) => {
        const actions = [];

        if (this.isStructuralEditionAllowed()) {
          if (this.originalTeamId !== this.selectedTeamId) {
            if (this.selectedTeamId !== null) {
              actions.push(this.projectService.assignTeam(updatedProject.id, this.selectedTeamId));
            } else if (this.originalTeamId !== null) {
              actions.push(this.projectService.removeTeam(updatedProject.id));
            }
          }

          const toAdd = this.selectedDepartmentIds.filter(
            id => !this.originalDepartmentIds.includes(id)
          );

          const toRemove = this.originalDepartmentIds.filter(
            id => !this.selectedDepartmentIds.includes(id)
          );

          for (const departmentId of toAdd) {
            actions.push(this.projectService.assignDepartment(updatedProject.id, departmentId));
          }

          for (const departmentId of toRemove) {
            actions.push(this.projectService.removeDepartment(updatedProject.id, departmentId));
          }
        }

        return actions.length > 0 ? forkJoin(actions) : of(updatedProject);
      })
    ).subscribe({
      next: () => this.runView(() => {
        this.saving = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Projet modifié avec succès',
          life: 3000
        });

        setTimeout(() => this.router.navigate(['/Parametrages/projects']), 1000);
      }),
      error: (err) => this.runView(() => {
        this.saving = false;

        this.showError(
          err?.error?.message ||
          err?.error?.error ||
          'Erreur lors de la modification du projet'
        );
      })
    });
  }

  cancel(): void {
    this.router.navigate(['/Parametrages/projects']);
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail,
      life: 5000
    });

    this.applyView();
  }
}