import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TeamService } from '../service/team.service';
import { UsersService } from '../../../administration/users/services/users.service';

import { TeamResponseDTO } from '../dtos/team-response.dto';
import { TeamMemberResponseDTO } from '../dtos/team-member-response.dto';
import { UserResponseDTO } from '../../../administration/users/models/user-response.dto';
import { PageResponse } from '../../projects/dtos/page-response.dto';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { MessageService, TreeNode } from 'primeng/api';
import { RbacService } from '@/app/core/services/rbac.service';
type TeamOption = {
  id: number;
  label: string;
  projectName?: string;
  status?: string;
  statusLabel: string;
};

type HierarchyMemberRow = {
  id: number;
  userId: string;
  fullName: string;
  email?: string;
  photoUrl: string;

  supervisorId?: number | null;

  projectRoleId?: number;
  projectRoleName?: string;
  hierarchyLevel?: number;

  roleCategoryName?: string;
  roleCategoryColor?: string;
};

@Component({
  selector: 'app-team-hierarchy',
  standalone: true,
  templateUrl: './team-hierarchie.html',
  styleUrls: ['./team-hierarchie.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    SelectModule,
    OrganizationChartModule
  ],
  providers: [MessageService]
})
export class TeamHierarchyComponent implements OnInit {

  loadingTeams = false;
  loadingTeam = false;
  loadingMembers = false;
  saving = false;

  allTeams: TeamResponseDTO[] = [];
  teamOptions: TeamOption[] = [];
  selectedTeamId?: number;

  team: TeamResponseDTO | null = null;

  members: HierarchyMemberRow[] = [];
  chartNodes: TreeNode[] = [];

  hierarchyMap = new Map<number, number | null>();
  validSupervisorsMap = new Map<number, HierarchyMemberRow[]>();
  loadingSupervisors = new Set<number>();

  readonly defaultMale = 'assets/images/default-user-male.png';
  readonly defaultFemale = 'assets/images/default-user-female.png';

  constructor(
  private teamService: TeamService,
  private usersService: UsersService,
  private cd: ChangeDetectorRef,
  private zone: NgZone,
  private messageService: MessageService,
  public rbacService: RbacService
) {}

  ngOnInit(): void {
    this.loadAllTeams();
  }
  private readonly MODULE_NAME = 'gestion des projets';
  canManageHierarchy(): boolean {
  return this.rbacService.canUpdate(this.MODULE_NAME);
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

  reload(): void {
    this.loadAllTeams();

    if (this.selectedTeamId) {
      this.loadTeam(this.selectedTeamId);
    }
  }

  loadAllTeams(): void {
    this.loadingTeams = true;
    this.applyView();

    this.teamService.getAll(0, 500).subscribe({
      next: (res: PageResponse<TeamResponseDTO>) => this.runView(() => {
        this.allTeams = res.content || [];
        this.teamOptions = this.allTeams.map(team => ({
          id: team.id,
          label: team.name || 'Équipe sans nom',
          projectName: team.projectName,
          status: team.status,
          statusLabel: this.formatStatus(team.status)
        }));

        this.loadingTeams = false;
      }),
      error: (err) => this.runView(() => {
        this.allTeams = [];
        this.teamOptions = [];
        this.loadingTeams = false;
        this.showError(err?.error?.message || 'Erreur lors du chargement des équipes');
      })
    });
  }

  onTeamSelected(teamId?: number): void {
    this.team = null;
    this.members = [];
    this.chartNodes = [];
    this.hierarchyMap.clear();
    this.validSupervisorsMap.clear();
    this.loadingSupervisors.clear();

    if (!teamId) {
      this.selectedTeamId = undefined;
      this.applyView();
      return;
    }

    this.selectedTeamId = teamId;
    this.loadTeam(teamId);
  }

  loadTeam(teamId: number): void {
    this.loadingTeam = true;
    this.applyView();

    this.teamService.getById(teamId).subscribe({
      next: (team) => this.runView(() => {
        this.team = team;
        this.loadingTeam = false;
        this.loadMembers();
      }),
      error: (err) => this.runView(() => {
        this.team = null;
        this.loadingTeam = false;
        this.showError(err?.error?.message || "Erreur lors du chargement de l'équipe");
      })
    });
  }

  loadMembers(): void {
    if (!this.team?.members?.length) {
      this.members = [];
      this.chartNodes = [];
      this.applyView();
      return;
    }

    this.loadingMembers = true;
    this.applyView();

    const userIds = this.team.members.map(member => member.userId);

    this.usersService.getUsersByIds(userIds).subscribe({
      next: (users) => this.runView(() => {
        this.buildMembers(users);
        this.loadingMembers = false;
        this.loadValidSupervisorsForAll();
        this.buildChart();
      }),
      error: () => this.runView(() => {
        this.buildMembers([]);
        this.loadingMembers = false;
        this.loadValidSupervisorsForAll();
        this.buildChart();
      })
    });
  }

  private buildMembers(users: UserResponseDTO[]): void {
    const usersMap = new Map<string, UserResponseDTO>();
    users.forEach(user => usersMap.set(user.keycloakId, user));

    this.hierarchyMap.clear();

    this.members = (this.team?.members || []).map(member => {
      const user = usersMap.get(member.userId);

      const row: HierarchyMemberRow = {
        id: member.id,
        userId: member.userId,
        fullName: user ? this.fullName(user) : member.userId,
        email: user?.email,
        photoUrl: user ? this.getAvatar(user) : this.defaultMale,

        supervisorId: member.supervisorId ?? null,

        projectRoleId: member.projectRoleId,
        projectRoleName: member.projectRoleName,
        hierarchyLevel: member.hierarchyLevel,

        roleCategoryName: member.roleCategoryName,
        roleCategoryColor: member.roleCategoryColor
      };

      this.hierarchyMap.set(row.id, row.supervisorId ?? null);

      return row;
    });

    this.sortMembers();
  }

  private sortMembers(): void {
    this.members = [...this.members].sort((a, b) => {
      const levelA = a.hierarchyLevel ?? 99;
      const levelB = b.hierarchyLevel ?? 99;

      if (levelA !== levelB) {
        return levelA - levelB;
      }

      return a.fullName.localeCompare(b.fullName);
    });
  }

  loadValidSupervisorsForAll(): void {
    if (!this.team?.id || this.members.length === 0) {
      return;
    }

    this.validSupervisorsMap.clear();
    this.loadingSupervisors.clear();

    this.members.forEach(member => this.loadingSupervisors.add(member.id));
    this.applyView();

    const requests = this.members.map(member =>
      this.teamService.getValidSupervisors(this.team!.id, member.id).pipe(
        catchError(() => of([] as TeamMemberResponseDTO[]))
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => this.runView(() => {
        results.forEach((validSupervisors, index) => {
          const member = this.members[index];

          this.validSupervisorsMap.set(
            member.id,
            this.mapSupervisorRows(validSupervisors)
          );

          this.loadingSupervisors.delete(member.id);
        });
      }),
      error: () => this.runView(() => {
        this.members.forEach(member => this.loadingSupervisors.delete(member.id));
        this.showError('Erreur lors du chargement des superviseurs valides');
      })
    });
  }

  private mapSupervisorRows(validSupervisors: TeamMemberResponseDTO[]): HierarchyMemberRow[] {
    return validSupervisors
      .map(supervisor => {
        const existing = this.members.find(member => member.id === supervisor.id);

        if (existing) {
          return existing;
        }

        return {
          id: supervisor.id,
          userId: supervisor.userId,
          fullName: supervisor.userId,
          photoUrl: this.defaultMale,
          supervisorId: supervisor.supervisorId ?? null,
          projectRoleId: supervisor.projectRoleId,
          projectRoleName: supervisor.projectRoleName,
          hierarchyLevel: supervisor.hierarchyLevel,
          roleCategoryName: supervisor.roleCategoryName,
          roleCategoryColor: supervisor.roleCategoryColor
        };
      })
      .sort((a, b) => {
        const levelA = a.hierarchyLevel ?? 99;
        const levelB = b.hierarchyLevel ?? 99;

        if (levelA !== levelB) {
          return levelA - levelB;
        }

        return a.fullName.localeCompare(b.fullName);
      });
  }

  onSupervisorChange(memberId: number, supervisorId: number | null): void {
    this.hierarchyMap.set(memberId, supervisorId ?? null);
    this.buildChart();
    this.applyView();
  }

  getValidSupervisorsFor(memberId: number): HierarchyMemberRow[] {
    return this.validSupervisorsMap.get(memberId) || [];
  }

  isSupervisorLoading(memberId: number): boolean {
    return this.loadingSupervisors.has(memberId);
  }

  buildChart(): void {
    const roots = this.members.filter(member => this.hierarchyMap.get(member.id) == null);

    this.chartNodes = roots.map(root => this.buildNode(root, new Set<number>()));
  }

  private buildNode(member: HierarchyMemberRow, visited: Set<number>): TreeNode {
    if (visited.has(member.id)) {
      return {
        type: 'default',
        expanded: true,
        data: member,
        children: []
      };
    }

    visited.add(member.id);

    const children = this.members
      .filter(child => this.hierarchyMap.get(child.id) === member.id)
      .sort((a, b) => {
        const levelA = a.hierarchyLevel ?? 99;
        const levelB = b.hierarchyLevel ?? 99;

        if (levelA !== levelB) {
          return levelA - levelB;
        }

        return a.fullName.localeCompare(b.fullName);
      })
      .map(child => this.buildNode(child, new Set<number>(visited)));

    return {
      type: 'default',
      expanded: true,
      data: member,
      children
    };
  }

  isHierarchyLocallyValid(): boolean {
    return this.getLeaderCount() === 1;
  }

  getLeaderCount(): number {
    return this.members.filter(member => this.hierarchyMap.get(member.id) == null).length;
  }

  getLeaderName(): string {
    const leader = this.members.find(member => this.hierarchyMap.get(member.id) == null);
    return leader ? leader.fullName : 'Aucun leader';
  }

  save(): void {
    if (!this.team) return;

    if (!this.isHierarchyLocallyValid()) {
      this.showError('La hiérarchie doit contenir exactement un seul leader.');
      return;
    }

    const hierarchy = this.members.map(member => ({
      memberId: member.id,
      supervisorId: this.hierarchyMap.get(member.id) ?? null
    }));

    this.saving = true;
    this.applyView();

    this.teamService.saveHierarchy(this.team.id, hierarchy).subscribe({
      next: () => this.runView(() => {
        this.saving = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Hiérarchie sauvegardée avec succès',
          life: 3000
        });

        this.loadTeam(this.team!.id);
      }),
      error: (err) => this.runView(() => {
        this.saving = false;

        this.showError(
          err?.error?.message ||
          err?.error?.error ||
          'Erreur lors de la sauvegarde de la hiérarchie'
        );
      })
    });
  }

  fullName(user: UserResponseDTO): string {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email;
  }

  getAvatar(user: UserResponseDTO): string {
    if (user.photoUrl && user.photoUrl.trim() !== '') {
      return user.photoUrl;
    }

    return user.sex === 'Female' ? this.defaultFemale : this.defaultMale;
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultMale;
  }

  getHierarchyLabel(level?: number): string {
    switch (level) {
      case 1:
        return 'Niv. 1 Direction';
      case 2:
        return 'Niv. 2 Leadership';
      case 3:
        return 'Niv. 3 Analyse';
      case 4:
        return 'Niv. 4 Exécution';
      case 5:
        return 'Niv. 5 Support';
      default:
        return 'Niv. ?';
    }
  }

  formatStatus(status?: string): string {
    switch (status) {
      case 'FREE':
        return 'Libre';
      case 'ASSIGNED':
        return 'Affectée';
      default:
        return '—';
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
}