import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { RolesService } from '../services/roles.service';
import { RoleRequestDTO } from '../models/role-models/role-request.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './roles-form.html',
  styleUrls: ['./roles-form.scss']
})
export class RolesFormComponent {

  saving = false;

  form: RoleRequestDTO = {
    name: '',
    level: 0,
    description: ''
  };

  constructor(
    private router: Router,
    private rolesService: RolesService
  ) {}

  save(formRef: NgForm): void {
    if (formRef.invalid) return;

    this.saving = true;
    this.rolesService.createRole(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.back();
      },
      error: (err) => {
        console.error('Failed to create role', err);
        this.saving = false;
        alert('Erreur lors de la création du rôle. Vérifiez le niveau et le nom.');
      }
    });
  }

  back(): void {
    this.router.navigate(['/administration/roles']);
  }
}