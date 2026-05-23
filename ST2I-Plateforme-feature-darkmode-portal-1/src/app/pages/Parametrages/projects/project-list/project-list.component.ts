import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ProjectService } from '../services/project.service';
import { ProjectResponseDTO } from '../dtos/project-response.dto';
import { ProjectSearchCriteriaDTO } from '../dtos/project-search-criteria.dto';
import { ProjectStatus } from '../dtos/project-status.enum';
import { PageResponse } from '../dtos/page-response.dto';

import { TeamService } from '../../teams/service/team.service';
import { TeamResponseDTO } from '../../teams/dtos/team-response.dto';
import { TeamStatus } from '../../teams/dtos/team-status.enum';

import { RbacService } from '@/app/core/services/rbac.service';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

type ConfirmActionType = 'DELETE' | 'CANCEL' | 'END';

type TeamFilterOption = {
  id: number | null;
  name: string;
  projectName?: string;
  membersCount: number;
  allTeams?: boolean;
};

@Component({
  selector: 'app-project-list',
  standalone: true,
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TooltipModule,
    SelectModule
  ],
  providers: [MessageService]
})
export class ProjectListComponent implements OnInit, OnDestroy {

  private readonly MODULE_NAME = 'gestion des projets';

  readonly ProjectStatus = ProjectStatus;

  rows: ProjectResponseDTO[] = [];
  loading = false;
  loadingAssignedTeams = false;

  assignedTeams: TeamResponseDTO[] = [];
  teamOptions: TeamFilterOption[] = [];

  currentPage = 0;
  pageSize = 7;
  totalElements = 0;
  totalPages = 0;
  isSearchMode = false;

  statuses: ProjectStatus[] = [
    ProjectStatus.DRAFT,
    ProjectStatus.READY,
    ProjectStatus.RUNNING,
    ProjectStatus.ON_HOLD,
    ProjectStatus.ENDED,
    ProjectStatus.CANCELLED
  ];

  filters: ProjectSearchCriteriaDTO = {
    keyword: '',
    status: undefined,
    startDateFrom: undefined,
    endDateTo: undefined,
    clientName: '',
    teamId: undefined
  };

  showConfirm = false;
  confirmActionType: ConfirmActionType | null = null;
  projectToConfirm: ProjectResponseDTO | null = null;
  confirming = false;

  changingStatusId?: number;

  private teamSearchTimeout: any;
  private destroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private teamService: TeamService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    public rbacService: RbacService
  ) {}

  ngOnInit(): void {
    this.loadAssignedTeams();
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.teamSearchTimeout);
  }

  canCreateProject(): boolean {
    return this.rbacService.canCreate(this.MODULE_NAME);
  }

  canUpdateProject(): boolean {
    return this.rbacService.canUpdate(this.MODULE_NAME);
  }

  canDeleteProject(): boolean {
    return this.rbacService.canDelete(this.MODULE_NAME);
  }

  private buildTeamOptions(): void {
    this.teamOptions = [
      {
        id: null,
        name: 'Toutes les équipes',
        membersCount: 0,
        allTeams: true
      },
      ...this.assignedTeams.map(team => ({
        id: team.id,
        name: team.name || 'Équipe sans nom',
        projectName: team.projectName,
        membersCount: team.members?.length || 0,
        allTeams: false
      }))
    ];
  }

  loadAssignedTeams(searchTerm: string = ''): void {
    this.loadingAssignedTeams = true;
    this.cd.detectChanges();

    this.teamService.search(
      {
        keyword: searchTerm?.trim() || undefined,
        status: 'ASSIGNED' as TeamStatus
      },
      0,
      100
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.assignedTeams = [...res.content];
          this.buildTeamOptions();
          this.loadingAssignedTeams = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.assignedTeams = [];
          this.buildTeamOptions();
          this.loadingAssignedTeams = false;
          this.showError('Erreur lors du chargement des équipes affectées');
          this.cd.detectChanges();
        }
      });
  }

  onTeamFilter(event: any): void {
    const searchTerm = event?.filter || '';

    clearTimeout(this.teamSearchTimeout);

    this.teamSearchTimeout = setTimeout(() => {
      this.loadAssignedTeams(searchTerm);
    }, 300);
  }

  loadAll(page: number = 0): void {
    this.loading = true;
    this.isSearchMode = false;
    this.cd.detectChanges();

    this.projectService.getAll(page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<ProjectResponseDTO>) => {
          this.rows = res.content;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.currentPage = res.number;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.showError('Erreur lors du chargement des projets');
          this.cd.detectChanges();
        }
      });
  }

  search(page: number = 0): void {
    if (
      this.filters.startDateFrom &&
      this.filters.endDateTo &&
      this.filters.startDateFrom > this.filters.endDateTo
    ) {
      this.showError('La date de début doit être inférieure ou égale à la date de fin.');
      return;
    }

    const criteria: ProjectSearchCriteriaDTO = {};

    if (this.filters.keyword?.trim()) {
      criteria.keyword = this.filters.keyword.trim();
    }

    if (this.filters.status) {
      criteria.status = this.filters.status;
    }

    if (this.filters.clientName?.trim()) {
      criteria.clientName = this.filters.clientName.trim();
    }

    if (this.filters.teamId !== undefined && this.filters.teamId !== null) {
      criteria.teamId = this.filters.teamId;
    }

    if (this.filters.startDateFrom) {
      criteria.startDateFrom = this.filters.startDateFrom;
    }

    if (this.filters.endDateTo) {
      criteria.endDateTo = this.filters.endDateTo;
    }

    if (Object.keys(criteria).length === 0) {
      this.loadAll(0);
      return;
    }

    this.loading = true;
    this.isSearchMode = true;
    this.cd.detectChanges();

    this.projectService.search(criteria, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<ProjectResponseDTO>) => {
          this.rows = res.content;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.currentPage = res.number;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.showError('Erreur lors de la recherche');
          this.cd.detectChanges();
        }
      });
  }

  reset(): void {
    this.filters = {
      keyword: '',
      status: undefined,
      startDateFrom: undefined,
      endDateTo: undefined,
      clientName: '',
      teamId: undefined
    };

    this.loadAssignedTeams();
    this.loadAll(0);
  }

  onPageChange(newPage: number): void {
    if (newPage < 0 || newPage >= this.totalPages) return;
    this.isSearchMode ? this.search(newPage) : this.loadAll(newPage);
  }

  add(): void {
    this.router.navigate(['/Parametrages/projects/new']);
  }

  details(project: ProjectResponseDTO): void {
    this.router.navigate(['/Parametrages/projects', project.id, 'details']);
  }

  edit(project: ProjectResponseDTO): void {
    this.router.navigate(['/Parametrages/projects', project.id, 'edit']);
  }

  openDeleteConfirm(project: ProjectResponseDTO): void {
    this.openConfirm(project, 'DELETE');
  }

  openCancelConfirm(project: ProjectResponseDTO): void {
    this.openConfirm(project, 'CANCEL');
  }

  openEndConfirm(project: ProjectResponseDTO): void {
    this.openConfirm(project, 'END');
  }

  private openConfirm(project: ProjectResponseDTO, type: ConfirmActionType): void {
    this.projectToConfirm = project;
    this.confirmActionType = type;
    this.showConfirm = true;
    this.cd.detectChanges();
  }

  cancelConfirm(): void {
    this.projectToConfirm = null;
    this.confirmActionType = null;
    this.showConfirm = false;
    this.confirming = false;
    this.cd.detectChanges();
  }

  confirmAction(): void {
    if (!this.projectToConfirm || !this.confirmActionType) return;

    if (this.confirmActionType === 'DELETE') {
      this.confirmDelete();
      return;
    }

    if (this.confirmActionType === 'CANCEL') {
      this.confirmStatusChange(ProjectStatus.CANCELLED);
      return;
    }

    if (this.confirmActionType === 'END') {
      this.confirmStatusChange(ProjectStatus.ENDED);
    }
  }

  private confirmDelete(): void {
    if (!this.projectToConfirm) return;

    this.confirming = true;
    this.cd.detectChanges();

    this.projectService.delete(this.projectToConfirm.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Projet supprimé avec succès'
          });

          this.cancelConfirm();

          const reloadPage = this.rows.length === 1 && this.currentPage > 0
            ? this.currentPage - 1
            : this.currentPage;

          this.isSearchMode ? this.search(reloadPage) : this.loadAll(reloadPage);
        },
        error: (err) => {
          this.cancelConfirm();
          this.showError(err?.error?.message || 'Erreur lors de la suppression du projet');
        }
      });
  }

  private confirmStatusChange(status: ProjectStatus): void {
    if (!this.projectToConfirm) return;

    const project = this.projectToConfirm;

    this.confirming = true;
    this.changingStatusId = project.id;
    this.cd.detectChanges();

    this.projectService.changeStatus(project.id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Statut du projet modifié avec succès',
            life: 3000
          });

          this.changingStatusId = undefined;
          this.cancelConfirm();

          this.isSearchMode ? this.search(this.currentPage) : this.loadAll(this.currentPage);
        },
        error: (err) => {
          this.changingStatusId = undefined;
          this.cancelConfirm();

          this.showError(
            err?.error?.message ||
            err?.error?.error ||
            'Erreur lors du changement de statut'
          );
        }
      });
  }

  changeStatusDirect(project: ProjectResponseDTO, status: ProjectStatus): void {
    this.changingStatusId = project.id;
    this.cd.detectChanges();

    this.projectService.changeStatus(project.id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Statut du projet modifié avec succès',
            life: 3000
          });

          this.changingStatusId = undefined;
          this.isSearchMode ? this.search(this.currentPage) : this.loadAll(this.currentPage);
        },
        error: (err) => {
          this.changingStatusId = undefined;

          this.showError(
            err?.error?.message ||
            err?.error?.error ||
            'Erreur lors du changement de statut'
          );

          this.cd.detectChanges();
        }
      });
  }

  export(): void {
    const header = ['Nom', 'Client', 'Statut', 'Equipe'];

    const csvRows = this.rows.map(p => [
      this.cleanCsv(p.name || '—'),
      this.cleanCsv(p.clientName || '—'),
      this.cleanCsv(this.formatStatus(p.status)),
      this.cleanCsv(p.teamName || '—')
    ].join(','));

    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  cleanCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
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

  getConfirmTitle(): string {
    switch (this.confirmActionType) {
      case 'DELETE': return 'Confirmer la suppression';
      case 'CANCEL': return 'Confirmer l’annulation';
      case 'END': return 'Confirmer la clôture';
      default: return 'Confirmation';
    }
  }

  getConfirmButtonLabel(): string {
    switch (this.confirmActionType) {
      case 'DELETE': return 'Supprimer';
      case 'CANCEL': return 'Annuler le projet';
      case 'END': return 'Terminer le projet';
      default: return 'Confirmer';
    }
  }

  getConfirmButtonIcon(): string {
    switch (this.confirmActionType) {
      case 'DELETE': return 'pi pi-trash';
      case 'CANCEL': return 'pi pi-ban';
      case 'END': return 'pi pi-check-circle';
      default: return 'pi pi-check';
    }
  }

  hasTeam(project: ProjectResponseDTO): boolean {
    return !!project.teamId || !!project.teamName;
  }

  canEdit(project: ProjectResponseDTO): boolean {
    return this.canUpdateProject() &&
      project.status !== ProjectStatus.ENDED &&
      project.status !== ProjectStatus.CANCELLED;
  }

  canDelete(project: ProjectResponseDTO): boolean {
    return this.canDeleteProject() &&
      project.status !== ProjectStatus.RUNNING &&
      project.status !== ProjectStatus.ON_HOLD;
  }

  canStart(project: ProjectResponseDTO): boolean {
    return this.canUpdateProject() && project.status === ProjectStatus.READY;
  }

  canPause(project: ProjectResponseDTO): boolean {
    return this.canUpdateProject() && project.status === ProjectStatus.RUNNING;
  }

  canResume(project: ProjectResponseDTO): boolean {
    return this.canUpdateProject() && project.status === ProjectStatus.ON_HOLD;
  }

  canEnd(project: ProjectResponseDTO): boolean {
    return this.canUpdateProject() &&
      (project.status === ProjectStatus.RUNNING ||
        project.status === ProjectStatus.ON_HOLD);
  }

  canCancel(project: ProjectResponseDTO): boolean {
    return this.canUpdateProject() &&
      (project.status === ProjectStatus.DRAFT ||
        project.status === ProjectStatus.READY ||
        project.status === ProjectStatus.RUNNING ||
        project.status === ProjectStatus.ON_HOLD);
  }

  isChanging(project: ProjectResponseDTO): boolean {
    return this.changingStatusId === project.id;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
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