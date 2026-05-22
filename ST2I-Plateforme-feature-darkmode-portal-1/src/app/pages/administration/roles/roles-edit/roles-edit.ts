import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { RolesService } from '../services/roles.service';
import { RoleRequestDTO } from '../models/role-models/role-request.dto';
import { RoleResponseDTO } from '../models/role-models/role-response.dto';

@Component({
  selector: 'app-roles-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, InputTextModule],
  templateUrl: './roles-edit.html',
  styleUrls: ['./roles-edit.scss'],
  providers: [MessageService]
})
export class RolesEditComponent implements OnInit {

  originalName = '';
  loading = true;
  saving = false;

  form: RoleRequestDTO = {
    name: '',
    level: 0,
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rolesService: RolesService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');

    if (!name) {
      this.router.navigate(['/administration/roles']);
      return;
    }

    this.originalName = name;

    // fetch full role data to prefill all fields
    this.rolesService.getRoleByName(name).subscribe({
      next: (role: RoleResponseDTO) => {

        // block editing system roles
        if (role.isSystemRole) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Interdit',
            detail: 'Les rôles système ne peuvent pas être modifiés'
          });
          setTimeout(() => this.router.navigate(['/administration/roles']), 1500);
          return;
        }

        this.form = {
          name: role.name,
          level: role.level,
          description: role.description ?? ''
        };

        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load role', err);
        this.router.navigate(['/administration/roles']);
      }
    });
  }

  save(formRef: NgForm): void {
    if (formRef.invalid) return;

    this.saving = true;

    this.rolesService.updateRole(this.originalName, this.form).subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Rôle mis à jour avec succès'
        });
        this.cd.detectChanges();
        setTimeout(() => this.router.navigate(['/administration/roles']), 1000);
      },
      error: (err) => {
        console.error('Update failed', err);
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la mise à jour du rôle'
        });
        this.cd.detectChanges();
      }
    });
  }

  back(): void {
    this.router.navigate(['/administration/roles']);
  }
}