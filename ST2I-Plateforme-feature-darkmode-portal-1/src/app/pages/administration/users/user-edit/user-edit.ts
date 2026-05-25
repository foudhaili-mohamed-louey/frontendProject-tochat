import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UsersService } from '../services/users.service';
import { RolesService } from '../../roles/services/roles.service';
import { DepartmentService } from '../../../Parametrages/departments/services/department.service';
import { ProfessionService } from '../../../Parametrages/professions/services/profession.service';

import { UserAdminUpdateDTO } from '../models/user-admin-update.dto';
import { UserResponseDTO } from '../models/user-response.dto';
import { RoleResponseDTO } from '../../roles/models/role-models/role-response.dto';
import { DepartmentResponseDTO } from '../../../Parametrages/departments/dtos/department-response.dto';
import { ProfessionResponseDTO } from '../../../Parametrages/professions/dtos/profession-response.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

const FREE_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

@Component({
  selector: 'app-user-edit',
  standalone: true,
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.scss'],
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService]
})
export class UserEditComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  userId!: string;

  loading = true;
  saving = false;
  uploading = false;
  rolesLoading = false;
  departmentsLoading = false;
  professionsLoading = false;

  today = new Date().toISOString().split('T')[0];

  sexOptions: ('Male' | 'Female')[] = ['Male', 'Female'];
  manageableRoles: RoleResponseDTO[] = [];
  departments: DepartmentResponseDTO[] = [];
  professions: ProfessionResponseDTO[] = [];

  showDepartment = false;

  readonly defaultMale = 'assets/images/default-user-male.png';
  readonly defaultFemale = 'assets/images/default-user-female.png';

  photoPreview = 'assets/images/default-user-male.png';

  form: UserAdminUpdateDTO = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cin: '',
    photoUrl: '',
    sex: 'Male',
    hireDate: '',
    professionId: 0,
    isActive: true,
    roleMetadataId: 0,
    departmentId: undefined
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private rolesService: RolesService,
    private departmentService: DepartmentService,
    private professionService: ProfessionService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/administration/users']);
      return;
    }

    this.userId = id;

    this.loadManageableRoles();
    this.loadDepartments();
    this.loadUser();
  }

  onSexChange(): void {
    if (!this.form.photoUrl?.trim()) {
      this.photoPreview = this.form.sex === 'Female'
        ? this.defaultFemale
        : this.defaultMale;
      this.cdr.markForCheck();
    }
  }

  onPreviewError(): void {
    this.photoPreview = this.form.sex === 'Female'
      ? this.defaultFemale
      : this.defaultMale;
    this.cdr.markForCheck();
  }

  triggerFilePicker(): void {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      this.showError('La taille du fichier dépasse 2 Mo');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      this.photoPreview = e.target?.result as string;
      this.cdr.markForCheck();
    };

    reader.readAsDataURL(file);

    this.uploading = true;
    this.cdr.markForCheck();

    this.usersService.uploadAvatar(this.userId, file).subscribe({
      next: (res) => {
        this.form.photoUrl = res.photoUrl;
        this.photoPreview = res.photoUrl;
        this.uploading = false;
        this.cdr.markForCheck();

        this.messageService.add({
          severity: 'success',
          summary: 'Photo mise à jour',
          detail: 'La photo de profil a été uploadée avec succès',
          life: 3000
        });
      },
      error: () => {
        this.uploading = false;
        this.photoPreview = this.form.sex === 'Female'
          ? this.defaultFemale
          : this.defaultMale;
        this.cdr.markForCheck();

        this.showError("Échec de l'upload de la photo");
      }
    });
  }

  removePhoto(): void {
    this.form.photoUrl = '';
    this.photoPreview = this.form.sex === 'Female'
      ? this.defaultFemale
      : this.defaultMale;
    this.cdr.markForCheck();
  }

  loadManageableRoles(): void {
    this.rolesLoading = true;

    this.rolesService.getManageableRoles().subscribe({
      next: (roles) => {
        this.manageableRoles = roles;
        this.rolesLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.rolesLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadDepartments(): void {
    this.departmentsLoading = true;

    this.departmentService.getActiveDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.departmentsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.departmentsLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadUser(): void {
    this.usersService.getUserById(this.userId).subscribe({
      next: (u: UserResponseDTO) => {
        this.form = {
          firstName: u.firstName ?? '',
          lastName: u.lastName ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          cin: u.cin ?? '',
          photoUrl: u.photoUrl ?? '',
          sex: this.parseSex(u.sex),
          hireDate: u.hireDate ?? '',
          professionId: u.professionId ?? 0,
          isActive: u.isActive ?? true,
          roleMetadataId: u.roleMetadataId ?? 0,
          departmentId: u.departmentId ?? undefined
        };

        this.photoPreview = u.photoUrl?.trim()
          ? u.photoUrl
          : (u.sex === 'Female' ? this.defaultFemale : this.defaultMale);

        this.showDepartment = !FREE_ROLES.includes((u.roleName ?? '').toUpperCase());

        if (this.showDepartment && this.form.departmentId) {
          this.loadProfessionsByDepartment(Number(this.form.departmentId), this.form.professionId);
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.router.navigate(['/administration/users']);
      }
    });
  }

  onRoleChange(roleId: number): void {
    const selected = this.manageableRoles.find(r => r.id === roleId);

    if (selected && FREE_ROLES.includes(selected.name.toUpperCase())) {
      this.showDepartment = false;
      this.form.departmentId = undefined;
      this.form.professionId = 0;
      this.professions = [];
    } else {
      this.showDepartment = true;
    }

    this.cdr.markForCheck();
  }

  onDepartmentChange(departmentId: number): void {
    this.form.professionId = 0;
    this.professions = [];

    if (!departmentId) {
      this.cdr.markForCheck();
      return;
    }

    this.loadProfessionsByDepartment(Number(departmentId));
  }

  private loadProfessionsByDepartment(
    departmentId: number,
    selectedProfessionId?: number
  ): void {
    this.professionsLoading = true;
    this.cdr.markForCheck();

    this.professionService.getSelectableByDepartment(departmentId).subscribe({
      next: (data) => {
        this.professions = data || [];

        if (selectedProfessionId) {
          this.form.professionId = selectedProfessionId;
        }

        this.professionsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.professions = [];
        this.professionsLoading = false;
        this.cdr.markForCheck();
        this.showError('Erreur lors du chargement des professions');
      }
    });
  }

  save(formRef: NgForm): void {
    if (formRef.invalid) return;

    if (!this.form.roleMetadataId) {
      this.showError('Le rôle est requis');
      return;
    }

    if (this.showDepartment && !this.form.departmentId) {
      this.showError('Le département est requis pour ce rôle');
      return;
    }

    if (this.showDepartment && !this.form.professionId) {
      this.showError('La profession est requise');
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const payload: UserAdminUpdateDTO = {
      ...this.form,
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      email: this.form.email.trim(),
      phone: this.form.phone.trim(),
      departmentId: this.showDepartment ? Number(this.form.departmentId) : undefined,
      professionId: Number(this.form.professionId)
    };

    this.usersService.updateUserAsAdmin(this.userId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.cdr.markForCheck();

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Utilisateur modifié avec succès',
          life: 3000
        });

        setTimeout(() => this.router.navigate(['/administration/users']), 1500);
      },
      error: (err) => {
        this.saving = false;
        this.cdr.markForCheck();

        this.showError(
          err?.error?.message ||
          err?.error?.error ||
          err?.message ||
          'Erreur lors de la modification'
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
  }

  private parseSex(value?: string): 'Male' | 'Female' {
    return value === 'Female' ? 'Female' : 'Male';
  }
}