import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TeamService } from '../service/team.service';
import { UsersService } from '../../../administration/users/services/users.service';

import { TeamResponseDTO } from '../dtos/team-response.dto';
import { UserResponseDTO } from '../../../administration/users/models/user-response.dto';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

type MemberRow = {
  id: number;
  userId: string;
  fullName: string;
  email?: string;
  photoUrl: string;
  projectRoleName?: string;
  hierarchyLevel?: number;
  roleCategoryName?: string;
  roleCategoryColor?: string;
};

@Component({
  selector: 'app-team-details',
  standalone: true,
  templateUrl: './team-detail.html',
  styleUrls: ['./team-detail.scss'],
  imports: [CommonModule, ButtonModule, ToastModule],
  providers: [MessageService]
})
export class TeamDetailsComponent implements OnInit {

  teamId!: number;

  loading = false;
  loadingMembers = false;

  team: TeamResponseDTO | null = null;

  members: MemberRow[] = [];
  pagedMembers: MemberRow[] = [];

  memberPage = 0;
  memberPageSize = 7;
  memberTotalPages = 0;

  readonly defaultMale = 'assets/images/default-user-male.png';
  readonly defaultFemale = 'assets/images/default-user-female.png';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private usersService: UsersService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.teamId = Number(
      this.route.snapshot.paramMap.get('teamId') ||
      this.route.snapshot.paramMap.get('id')
    );

    this.loadTeam();
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

  loadTeam(): void {
    this.loading = true;
    this.applyView();

    this.teamService.getById(this.teamId).subscribe({
      next: (team) => this.runView(() => {
        this.team = team;
        this.loading = false;
        this.loadMembers();
      }),
      error: (err) => this.runView(() => {
        this.loading = false;
        this.showError(err?.error?.message || "Erreur lors du chargement de l'équipe");
      })
    });
  }

  loadMembers(): void {
    if (!this.team?.members?.length) {
      this.members = [];
      this.refreshPagination();
      return;
    }

    this.loadingMembers = true;
    this.applyView();

    const userIds = this.team.members.map(m => m.userId);

    this.usersService.getUsersByIds(userIds).subscribe({
      next: (users) => this.runView(() => {
        const usersMap = new Map<string, UserResponseDTO>();
        users.forEach(u => usersMap.set(u.keycloakId, u));

        this.members = this.team!.members.map(member => {
          const user = usersMap.get(member.userId);

          return {
            id: member.id,
            userId: member.userId,
            fullName: user ? this.fullName(user) : member.userId,
            email: user?.email,
            photoUrl: user ? this.getAvatar(user) : this.defaultMale,
            projectRoleName: member.projectRoleName || '—',
            hierarchyLevel: member.hierarchyLevel,
            roleCategoryName: member.roleCategoryName,
            roleCategoryColor: member.roleCategoryColor
          };
        });

        this.loadingMembers = false;
        this.refreshPagination();
      }),
      error: () => this.runView(() => {
        this.members = this.team!.members.map(member => ({
          id: member.id,
          userId: member.userId,
          fullName: member.userId,
          photoUrl: this.defaultMale,
          projectRoleName: member.projectRoleName || '—',
          hierarchyLevel: member.hierarchyLevel,
          roleCategoryName: member.roleCategoryName,
          roleCategoryColor: member.roleCategoryColor
        }));

        this.loadingMembers = false;
        this.refreshPagination();
      })
    });
  }

  refreshPagination(): void {
    this.memberTotalPages = Math.ceil(this.members.length / this.memberPageSize);

    if (this.memberPage >= this.memberTotalPages) {
      this.memberPage = 0;
    }

    const start = this.memberPage * this.memberPageSize;
    const end = start + this.memberPageSize;

    this.pagedMembers = this.members.slice(start, end);
    this.applyView();
  }

  onMemberPageChange(page: number): void {
    this.memberPage = page;
    this.refreshPagination();
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

  formatStatus(status?: string): string {
    switch (status) {
      case 'FREE': return 'Libre';
      case 'ASSIGNED': return 'Affectée';
      default: return '—';
    }
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'FREE': return 'badge-green';
      case 'ASSIGNED': return 'badge-blue';
      default: return 'badge-gray';
    }
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

  back(): void {
    this.router.navigate(['/Parametrages/teams']);
  }

  edit(): void {
    if (!this.team) return;
    this.router.navigate(['/Parametrages/teams', this.team.projectId || 0, this.team.id, 'edit']);
  }

  get memberPages(): number[] {
    return Array.from({ length: this.memberTotalPages }, (_, i) => i);
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