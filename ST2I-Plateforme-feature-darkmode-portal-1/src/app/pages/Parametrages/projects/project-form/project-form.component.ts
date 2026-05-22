import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';

import { ProjectService } from '../services/project.service';
import { TeamService } from '../../teams/service/team.service';
import { DepartmentService } from '../../departments/services/department.service';

import { ProjectCreateDTO } from '../dtos/project-create.dto';
import { ProjectResponseDTO } from '../dtos/project-response.dto';
import { TeamResponseDTO } from '../../teams/dtos/team-response.dto';
import { DepartmentResponseDTO } from '../../departments/dtos/department-response.dto';

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
  noTeam: boolean;
};

@Component({
  selector: 'app-project-form',
  standalone: true,
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
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
export class ProjectFormComponent implements OnInit {

  saving = false;
  loadingTeams = false;
  loadingDepartments = false;

  teams: TeamResponseDTO[] = [];
  teamOptions: TeamSelectOption[] = [];

  departments: DepartmentResponseDTO[] = [];

  selectedTeamId: number | null = null;
  selectedDepartmentIds: number[] = [];

  private teamSearchTimeout: any;

  form: ProjectCreateDTO = {
    name: '',
    description: '',
    startDate: undefined,
    endDate: undefined,
    budget: undefined,
    clientName: ''
  };

  constructor(
    private projectService: ProjectService,
    private teamService: TeamService,
    private departmentService: DepartmentService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadFreeTeams();
    this.loadDepartments();
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
    this.teamOptions = [
      {
        id: null,
        name: 'Aucune équipe / affecter plus tard',
        membersCount: 0,
        noTeam: true
      },
      ...this.teams.map(team => ({
        id: team.id,
        name: team.name || 'Équipe sans nom',
        membersCount: team.members?.length || 0,
        noTeam: false
      }))
    ];
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

    const payload: ProjectCreateDTO = {
      name: this.form.name?.trim(),
      description: this.form.description?.trim() || undefined,
      startDate: this.form.startDate || undefined,
      endDate: this.form.endDate || undefined,
      budget: this.form.budget || undefined,
      clientName: this.form.clientName?.trim() || undefined
    };

    this.saving = true;
    this.applyView();

    this.projectService.create(payload).pipe(
      switchMap((createdProject: ProjectResponseDTO) => {
        const actions = [];

        if (this.selectedTeamId !== null) {
          actions.push(this.projectService.assignTeam(createdProject.id, this.selectedTeamId));
        }

        for (const departmentId of this.selectedDepartmentIds) {
          actions.push(this.projectService.assignDepartment(createdProject.id, departmentId));
        }

        return actions.length > 0 ? forkJoin(actions) : of(createdProject);
      })
    ).subscribe({
      next: () => this.runView(() => {
        this.saving = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Projet créé avec succès',
          life: 3000
        });

        setTimeout(() => this.router.navigate(['/Parametrages/projects']), 1000);
      }),
      error: (err) => this.runView(() => {
        this.saving = false;

        this.showError(
          err?.error?.message ||
          err?.error?.error ||
          'Erreur lors de la création du projet'
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