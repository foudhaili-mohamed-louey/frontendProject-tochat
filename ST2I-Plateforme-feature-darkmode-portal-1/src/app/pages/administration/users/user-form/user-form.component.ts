import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UsersService } from '../services/users.service';
import { RolesService } from '../../roles/services/roles.service';
import { DepartmentService } from '../../../Parametrages/departments/services/department.service';
import { ProfessionService } from '../../../Parametrages/professions/services/profession.service';

import { UserCreateDTO } from '../models/user-create.dto';
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
  selector: 'app-user-form',
  standalone: true,
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService]
})
export class UserFormComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  sexOptions: ('Male' | 'Female')[] = ['Male', 'Female'];
  manageableRoles: RoleResponseDTO[] = [];
  departments: DepartmentResponseDTO[] = [];
  professions: ProfessionResponseDTO[] = [];

  rolesLoading = false;
  departmentsLoading = false;
  professionsLoading = false;
  saving = false;
  uploading = false;
  showDepartment = false;

  readonly defaultMale = 'assets/images/default-user-male.png';
  readonly defaultFemale = 'assets/images/default-user-female.png';

  photoPreview = 'assets/images/default-user-male.png';

  private pendingFile: File | null = null;

  form: UserCreateDTO = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    isActive: true,
    cin: '',
    phone: '',
    photoUrl: '',
    sex: 'Male',
    hireDate: '',
    professionId: 0,
    roleMetadataId: 0,
    departmentId: undefined
  };

  constructor(
    private router: Router,
    private usersService: UsersService,
    private rolesService: RolesService,
    private departmentService: DepartmentService,
    private professionService: ProfessionService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadManageableRoles();
    this.loadDepartments();
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

    this.pendingFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview = e.target?.result as string;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.pendingFile = null;
    this.form.photoUrl = '';
    this.photoPreview = this.form.sex === 'Female'
      ? this.defaultFemale
      : this.defaultMale;
    this.cd.detectChanges();
  }

  onSexChange(): void {
    if (!this.pendingFile && !this.form.photoUrl?.trim()) {
      this.photoPreview = this.form.sex === 'Female'
        ? this.defaultFemale
        : this.defaultMale;
      this.cd.detectChanges();
    }
  }

  onPreviewError(): void {
    this.photoPreview = this.form.sex === 'Female'
      ? this.defaultFemale
      : this.defaultMale;
    this.cd.detectChanges();
  }

  loadManageableRoles(): void {
    this.rolesLoading = true;
    this.cd.detectChanges();

    this.rolesService.getManageableRoles().subscribe({
      next: (roles) => {
        this.manageableRoles = roles;
        this.rolesLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.rolesLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  loadDepartments(): void {
    this.departmentsLoading = true;
    this.cd.detectChanges();

    this.departmentService.getActiveDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.departmentsLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.departmentsLoading = false;
        this.cd.detectChanges();
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

    this.cd.detectChanges();
  }

  onDepartmentChange(departmentId: number): void {
    this.form.professionId = 0;
    this.professions = [];

    if (!departmentId) {
      this.cd.detectChanges();
      return;
    }

    this.loadProfessionsByDepartment(Number(departmentId));
  }

  private loadProfessionsByDepartment(departmentId: number): void {
    this.professionsLoading = true;
    this.cd.detectChanges();

    this.professionService.getSelectableByDepartment(departmentId).subscribe({
      next: (data) => {
        this.professions = data || [];
        this.professionsLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.professions = [];
        this.professionsLoading = false;
        this.showError('Erreur lors du chargement des professions');
      }
    });
  }

  save(): void {
    if (!this.form.username.trim()) { this.showError("Le nom d'utilisateur est requis"); return; }
    if (!this.form.firstName.trim()) { this.showError('Le prénom est requis'); return; }
    if (!this.form.lastName.trim()) { this.showError('Le nom est requis'); return; }
    if (!this.form.email.trim()) { this.showError("L'email est requis"); return; }
    if (!this.form.cin.trim()) { this.showError('Le CIN est requis'); return; }
    if (!/^\d{8}$/.test(this.form.cin.trim())) { this.showError('Le CIN doit contenir exactement 8 chiffres'); return; }
    if (!this.form.phone.trim()) { this.showError('Le téléphone est requis'); return; }
    if (!/^\d{8}$/.test(this.form.phone.trim())) { this.showError('Le téléphone doit contenir exactement 8 chiffres'); return; }
    if (!this.form.hireDate) { this.showError("La date d'embauche est requise"); return; }
    if (!this.form.roleMetadataId) { this.showError('Le rôle est requis'); return; }

    if (this.showDepartment && !this.form.departmentId) {
      this.showError('Le département est requis pour ce rôle');
      return;
    }

    if (this.showDepartment && !this.form.professionId) {
      this.showError('La profession est requise');
      return;
    }

    this.saving = true;
    this.cd.detectChanges();

    const payload: UserCreateDTO = {
      ...this.form,
      username: this.form.username.trim(),
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      email: this.form.email.trim(),
      cin: this.form.cin.trim(),
      phone: this.form.phone.trim(),
      departmentId: this.showDepartment ? Number(this.form.departmentId) : undefined,
      professionId: Number(this.form.professionId)
    };

    this.usersService.createUser(payload).subscribe({
      next: (created) => {
        if (this.pendingFile) {
          this.uploading = true;
          this.cd.detectChanges();

          this.usersService.uploadAvatar(created.keycloakId, this.pendingFile).subscribe({
            next: () => {
              this.uploading = false;
              this.saving = false;
              this.cd.detectChanges();

              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Utilisateur créé avec photo de profil',
                life: 3000
              });

              setTimeout(() => this.router.navigate(['/administration/users']), 1500);
            },
            error: () => {
              this.uploading = false;
              this.saving = false;
              this.cd.detectChanges();

              this.messageService.add({
                severity: 'warn',
                summary: 'Utilisateur créé',
                detail: "L'upload de la photo a échoué, vous pouvez le refaire depuis la modification",
                life: 6000
              });

              setTimeout(() => this.router.navigate(['/administration/users']), 2000);
            }
          });
        } else {
          this.saving = false;
          this.cd.detectChanges();

          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Utilisateur créé avec succès',
            life: 3000
          });

          setTimeout(() => this.router.navigate(['/administration/users']), 1500);
        }
      },
      error: (err) => {
        this.saving = false;
        this.cd.detectChanges();

        this.showError(
          err?.error?.message || err?.error?.error || err?.message ||
          "Erreur lors de la création de l'utilisateur"
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
}