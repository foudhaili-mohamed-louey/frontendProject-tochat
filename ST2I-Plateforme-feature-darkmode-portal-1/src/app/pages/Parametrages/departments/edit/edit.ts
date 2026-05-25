import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DepartmentService } from '../services/department.service';
import { UpdateDepartmentDTO } from '../dtos/update-department.dto';
import { DepartmentType } from '../dtos/department-type';
import { UserMapperResponseDTO } from '../dtos/user-mapper-response.dto';

import { UsersService } from '../../../administration/users/services/users.service';
import { UserResponseDTO } from '../../../administration/users/models/user-response.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

type ChefUser = UserResponseDTO | UserMapperResponseDTO;

@Component({
  selector: 'app-department-edit',
  standalone: true,
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class DepartmentEditComponent implements OnInit {

  deptId!: number;
  loading = true;
  saving = false;
  loadingChefs = false;

  chefDropdownOpen = false;
  chefSearch = '';
  chefUsers: UserResponseDTO[] = [];
  selectedChef: ChefUser | null = null;

  currentType: DepartmentType | null = null;

  form: UpdateDepartmentDTO = {
    name: '',
    description: '',
    location: '',
    phoneNumber: '',
    email: '',
    chefKeycloakId: null
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private usersService: UsersService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['Parametrages/departments']);
      return;
    }

    this.deptId = Number(id);
    this.loadDepartment();
    this.searchChefs(false);
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

  loadDepartment(): void {
    this.departmentService.getById(this.deptId).subscribe({
      next: (dept) => {
        this.currentType = dept.type;

        this.form = {
          name: dept.name ?? '',
          description: dept.description ?? '',
          location: dept.location ?? '',
          phoneNumber: dept.phoneNumber ?? '',
          email: dept.email ?? '',
          chefKeycloakId: dept.chefKeycloakId ?? null
        };

        if (dept.chefDepartment) {
          this.selectedChef = dept.chefDepartment;

          this.chefSearch = `${dept.chefDepartment.firstName ?? ''} ${dept.chefDepartment.lastName ?? ''}`.trim();
        } else {
          this.selectedChef = null;
          this.chefSearch = '';
          this.form.chefKeycloakId = null;
        }

        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.showError(
          err?.error?.message ||
          err?.error?.error ||
          'Impossible de charger le département'
        );

        this.loading = false;
        this.cd.detectChanges();

        setTimeout(() => this.router.navigate(['Parametrages/departments']), 2000);
      }
    });
  }

  searchChefs(openDropdown: boolean = true): void {
    this.loadingChefs = true;

    if (openDropdown) {
      this.chefDropdownOpen = true;
    }

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

  selectChef(user: UserResponseDTO, event?: Event): void {
  if (event) {
    event.stopPropagation();
  }

  this.selectedChef = user;
  this.form.chefKeycloakId = user.keycloakId || null;
  this.chefSearch = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  this.chefDropdownOpen = false;
  this.cd.detectChanges();
}

  clearChef(event?: Event): void {
    if (event) event.stopPropagation();

    this.selectedChef = null;
    this.form.chefKeycloakId = null;
    this.chefSearch = '';
    this.chefDropdownOpen = false;
    this.cd.detectChanges();
  }

  clearChefAndOpen(event?: Event): void {
    if (event) event.stopPropagation();

    this.selectedChef = null;
    this.form.chefKeycloakId = null;
    this.chefSearch = '';
    this.chefDropdownOpen = true;
    this.searchChefs(true);
  }

  getUserInitials(user: ChefUser): string {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  }

  save(formRef: NgForm): void {
    formRef.control.markAllAsTouched();
    this.cd.detectChanges();

    if (formRef.invalid) {
      this.showError('Veuillez corriger les champs invalides avant de sauvegarder.');
      return;
    }

    this.saving = true;
    this.cd.detectChanges();

    const payload: UpdateDepartmentDTO = {
      ...this.form,
      name: this.form.name?.trim(),
      email: this.form.email?.trim(),
      chefKeycloakId: this.form.chefKeycloakId || null
    };

    this.departmentService.updateDepartment(this.deptId, payload).subscribe({
      next: (updated) => {
        this.saving = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Département "${updated.name}" mis à jour avec succès`,
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
          'Erreur lors de la mise à jour du département'
        );
      }
    });
  }

  get typeLabel(): string {
    if (this.currentType === 'OPERATIONAL') return 'Opérationnel';
    if (this.currentType === 'SUPPORT') return 'Support';
    return '—';
  }

  get typeClass(): string {
    if (this.currentType === 'OPERATIONAL') return 'operational';
    if (this.currentType === 'SUPPORT') return 'support';
    return '';
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