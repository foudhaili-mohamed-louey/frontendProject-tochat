import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { UsersService } from '../services/users.service';
import { UserResponseDTO } from '../models/user-response.dto';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-user-details',
  standalone: true,
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule]
})
export class UserDetailsComponent implements OnInit {

  user?: UserResponseDTO;
  loading = true;
  photo   = '';

  // local assets — always available, zero network dependency
  readonly defaultMale   = 'assets/images/default-user-male.png';
  readonly defaultFemale = 'assets/images/default-user-female.png';

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        this.loading = false;
        this.cd.detectChanges();
        return;
      }

      this.usersService.getUserById(id).subscribe({
        next: (u) => {
          this.user    = u;
          this.photo   = this.resolvePhoto(u);
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error loading user', err);
          this.loading = false;
          this.cd.detectChanges();
        }
      });
    });
  }

  // ── avatar chain ─────────────────────────────────────────────────
  // 1. Use Supabase photoUrl if present
  // 2. Fall back to local asset by sex if missing
  private resolvePhoto(u: UserResponseDTO): string {
    if (u.photoUrl && u.photoUrl.trim() !== '') return u.photoUrl;
    return u.sex === 'Female' ? this.defaultFemale : this.defaultMale;
  }

  // called when photoUrl breaks mid-load (network/Supabase error)
  onPhotoError(): void {
    this.photo = this.user?.sex === 'Female' ? this.defaultFemale : this.defaultMale;
    this.cd.detectChanges();
  }

  // ── level badge class ────────────────────────────────────────────
  getLevelClass(level: number | undefined): string {
    if (!level) return 'level-default';
    if (level >= 80) return 'level-high';
    if (level >= 50) return 'level-mid';
    return 'level-low';
  }
}