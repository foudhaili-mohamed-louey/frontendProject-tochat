import { Component, ChangeDetectorRef, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DepartmentService } from '../services/department.service';
import { CreateDepartmentRequestDTO } from '../dtos/create-department-request.dto';
import { DepartmentType } from '../dtos/department-type';

import { UsersService } from '../../../administration/users/services/users.service';
import { UserResponseDTO } from '../../../administration/users/models/user-response.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-department-form',
  standalone: true,
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class DepartmentFormComponent implements OnInit {

  saving = false;
  loadingChefs = false;

  chefDropdownOpen = false;
  chefSearch = '';
  chefUsers: UserResponseDTO[] = [];
  selectedChef: UserResponseDTO | null = null;

  form: CreateDepartmentRequestDTO = {
    name: '',
    code: '',
    description: '',
    location: '',
    phoneNumber: '',
    email: '',
    type: '' as DepartmentType,
    chefKeycloakId: null
  };

  departmentTypes: { label: string; value: DepartmentType }[] = [
    { label: 'Opérationnel', value: 'OPERATIONAL' },
    { label: 'Support', value: 'SUPPORT' }
  ];

  constructor(
    private router: Router,
    private departmentService: DepartmentService,
    private usersService: UsersService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.searchChefs();
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.chefDropdownOpen = false;
  }

  stopClose(event: Event): void {
    event.stopPropagation();
  }

  openChefDropdown(event: Event): void {
    event.stopPropagation();
    this.chefDropdownOpen = true;
  }

  searchChefs(): void {
    this.loadingChefs = true;
    this.chefDropdownOpen = true;
    this.cd.detectChanges();

    this.usersService.searchUsers(
      {
        firstName: this.chefSearch,
        isActive: true
      },
      0,
      20
    ).subscribe({
      next: (res) => {
        this.chefUsers = res?.content || [];
        this.loadingChefs = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.chefUsers = [];
        this.loadingChefs = false;
        this.cd.detectChanges();
      }
    });
  }

  selectChef(user: UserResponseDTO): void {
    this.selectedChef = user;
    this.form.chefKeycloakId = user.keycloakId;
    this.chefSearch = `${user.firstName} ${user.lastName}`;
    this.chefDropdownOpen = false;
    this.cd.detectChanges();
  }

  clearChef(event?: Event): void {
    if (event) event.stopPropagation();

    this.selectedChef = null;
    this.form.chefKeycloakId = null;
    this.chefSearch = '';
    this.searchChefs();
  }

  getUserInitials(user: UserResponseDTO): string {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  }

  private validate(): boolean {
    if (!this.form.name.trim()) {
      this.showError('Le nom du département est requis.');
      return false;
    }

    if (!this.form.code.trim()) {
      this.showError('Le code du département est requis.');
      return false;
    }

    if (this.form.code.trim().length > 10) {
      this.showError('Le code ne doit pas dépasser 10 caractères.');
      return false;
    }

    if (!this.form.type) {
      this.showError('Le type du département est requis.');
      return false;
    }

    if (!this.form.email.trim()) {
      this.showError("L'email du département est requis.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.form.email.trim())) {
      this.showError("L'adresse email n'est pas valide.");
      return false;
    }

    return true;
  }

  save(): void {
    if (!this.validate()) return;

    this.saving = true;
    this.cd.detectChanges();

    const payload: CreateDepartmentRequestDTO = {
      ...this.form,
      name: this.form.name.trim(),
      code: this.form.code.trim().toUpperCase(),
      email: this.form.email.trim(),
      chefKeycloakId: this.form.chefKeycloakId || null
    };

    this.departmentService.createDepartment(payload).subscribe({
      next: (created) => {
        this.saving = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Département "${created.name}" créé avec succès`,
          life: 3000
        });

        setTimeout(() => this.back(), 1200);
      },
      error: (err) => {
        this.saving = false;
        this.cd.detectChanges();

        this.showError(
          err?.error?.message ||
          err?.error?.error ||
          err?.message ||
          'Erreur lors de la création du département'
        );
      }
    });
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail,
      life: 5000
    });

    this.cd.detectChanges();
  }

  back(): void {
    this.router.navigate(['Parametrages/departments']);
  }
}