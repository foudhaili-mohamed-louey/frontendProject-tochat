import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { TeamService } from '../service/team.service';
import { TeamResponseDTO } from '../dtos/team-response.dto';
import { TeamSearchCriteriaDTO } from '../dtos/team-search-criteria.dto';
import { TeamStatus } from '../dtos/team-status.enum';
import { PageResponse } from '../../projects/dtos/page-response.dto';

import { ProjectService } from '../../projects/services/project.service';
import { ProjectResponseDTO } from '../../projects/dtos/project-response.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

type ProjectFilterOption = {
  id: number | null;
  name: string;
  status?: string;
  allProjects?: boolean;
};

@Component({
  selector: 'app-team-list',
  standalone: true,
  templateUrl: './team-list.html',
  styleUrls: ['./team-list.scss'],
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
export class TeamListComponent implements OnInit, OnDestroy {

  rows: TeamResponseDTO[] = [];
  loading = false;

  projects: ProjectResponseDTO[] = [];
  projectOptions: ProjectFilterOption[] = [];
  loadingProjects = false;

  currentPage = 0;
  pageSize = 7;
  totalElements = 0;
  totalPages = 0;
  isSearchMode = false;

  statuses: TeamStatus[] = ['FREE', 'ASSIGNED'];

  filters: TeamSearchCriteriaDTO = {
    keyword: '',
    status: undefined,
    projectId: undefined
  };

  showDeleteConfirm = false;
  teamToDelete: TeamResponseDTO | null = null;
  deleting = false;

  private projectSearchTimeout: any;
  private destroy$ = new Subject<void>();

  constructor(
    private teamService: TeamService,
    private projectService: ProjectService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.projectSearchTimeout);
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

  private buildProjectOptions(): void {
    this.projectOptions = [
      {
        id: null,
        name: 'Tous les projets',
        allProjects: true
      },
      ...this.projects.map(project => ({
        id: project.id,
        name: project.name || 'Projet sans nom',
        status: project.status,
        allProjects: false
      }))
    ];
  }

  loadProjects(searchTerm: string = ''): void {
    this.loadingProjects = true;
    this.applyView();

    const criteria = searchTerm?.trim()
      ? { keyword: searchTerm.trim() }
      : {};

    this.projectService.search(criteria, 0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<ProjectResponseDTO>) => this.runView(() => {
          this.projects = [...res.content];
          this.buildProjectOptions();
          this.loadingProjects = false;
        }),
        error: () => this.runView(() => {
          this.projects = [];
          this.buildProjectOptions();
          this.loadingProjects = false;
          this.showError('Erreur lors du chargement des projets');
        })
      });
  }

  onProjectFilter(event: any): void {
    const searchTerm = event?.filter || '';

    clearTimeout(this.projectSearchTimeout);

    this.projectSearchTimeout = setTimeout(() => {
      this.loadProjects(searchTerm);
    }, 300);
  }

  loadAll(page: number = 0): void {
    this.loading = true;
    this.isSearchMode = false;
    this.applyView();

    this.teamService.getAll(page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<TeamResponseDTO>) => this.runView(() => {
          this.rows = [...res.content];
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.currentPage = res.number;
          this.loading = false;
        }),
        error: () => this.runView(() => {
          this.loading = false;
          this.showError('Erreur lors du chargement des équipes');
        })
      });
  }

  search(page: number = 0): void {
    const criteria: TeamSearchCriteriaDTO = {};

    if (this.filters.keyword?.trim()) {
      criteria.keyword = this.filters.keyword.trim();
    }

    if (this.filters.status) {
      criteria.status = this.filters.status;
    }

    if (this.filters.projectId !== undefined && this.filters.projectId !== null) {
      criteria.projectId = this.filters.projectId;
    }

    if (Object.keys(criteria).length === 0) {
      this.loadAll(0);
      return;
    }

    this.loading = true;
    this.isSearchMode = true;
    this.applyView();

    this.teamService.search(criteria, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PageResponse<TeamResponseDTO>) => this.runView(() => {
          this.rows = [...res.content];
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.currentPage = res.number;
          this.loading = false;
        }),
        error: () => this.runView(() => {
          this.loading = false;
          this.showError('Erreur lors de la recherche');
        })
      });
  }

  reset(): void {
    this.filters = {
      keyword: '',
      status: undefined,
      projectId: undefined
    };

    this.loadProjects();
    this.loadAll(0);
  }

  onPageChange(newPage: number): void {
    if (newPage < 0 || newPage >= this.totalPages) return;
    this.isSearchMode ? this.search(newPage) : this.loadAll(newPage);
  }

  add(): void {
    this.router.navigate(['/Parametrages/teams/new']);
  }

  details(team: TeamResponseDTO): void {
    this.router.navigate(['/Parametrages/teams', team.projectId || 0, team.id, 'details']);
  }

  edit(team: TeamResponseDTO): void {
    this.router.navigate(['/Parametrages/teams', team.projectId || 0, team.id, 'edit']);
  }

  delete(team: TeamResponseDTO): void {
    this.teamToDelete = team;
    this.showDeleteConfirm = true;
    this.applyView();
  }

  cancelDelete(): void {
    this.teamToDelete = null;
    this.showDeleteConfirm = false;
    this.applyView();
  }

  confirmDelete(): void {
    if (!this.teamToDelete) return;

    this.deleting = true;
    this.applyView();

    this.teamService.delete(this.teamToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.runView(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Équipe supprimée avec succès'
          });

          this.showDeleteConfirm = false;
          this.teamToDelete = null;
          this.deleting = false;

          const reloadPage = this.rows.length === 1 && this.currentPage > 0
            ? this.currentPage - 1
            : this.currentPage;

          this.isSearchMode ? this.search(reloadPage) : this.loadAll(reloadPage);
        }),
        error: (err) => this.runView(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err?.error?.message || 'Erreur lors de la suppression'
          });

          this.showDeleteConfirm = false;
          this.teamToDelete = null;
          this.deleting = false;
        })
      });
  }

  export(): void {
    const header = ['Nom', 'Statut', 'Projet', 'Membres'];

    const csvRows = this.rows.map(t => [
      this.cleanCsv(t.name || '—'),
      this.cleanCsv(this.formatStatus(t.status)),
      this.cleanCsv(t.projectName || '—'),
      t.members?.length || 0
    ].join(','));

    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'teams.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  cleanCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  formatStatus(status?: TeamStatus): string {
    switch (status) {
      case 'FREE': return 'Libre';
      case 'ASSIGNED': return 'Affectée';
      default: return '—';
    }
  }

  statusClass(status?: TeamStatus): string {
    switch (status) {
      case 'FREE': return 'badge-green';
      case 'ASSIGNED': return 'badge-blue';
      default: return 'badge-gray';
    }
  }

  formatProjectStatus(status?: string): string {
    switch (status) {
      case 'DRAFT': return 'Brouillon';
      case 'READY': return 'Prêt';
      case 'RUNNING': return 'En cours';
      case 'ON_HOLD': return 'En pause';
      case 'ENDED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      default: return '—';
    }
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

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}