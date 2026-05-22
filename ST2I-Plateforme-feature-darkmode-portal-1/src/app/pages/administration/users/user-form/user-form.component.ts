import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UsersService } from '../services/users.service';
import { RolesService } from '../../roles/services/roles.service';
import { DepartmentService } from '../../../Parametrages/departments/services/department.service';
import { UserCreateDTO } from '../models/user-create.dto';
import { RoleResponseDTO } from '../../roles/models/role-models/role-response.dto';
import { DepartmentResponseDTO } from '../../../Parametrages/departments/dtos/department-response.dto';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

const FREE_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

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

  rolesLoading       = false;
  departmentsLoading = false;
  saving             = false;
  uploading          = false;
  showDepartment     = false;

  // avatar defaults — local assets, always available
  readonly defaultMale   = 'assets/images/default-user-male.png';
  readonly defaultFemale = 'assets/images/default-user-female.png';

  photoPreview = 'assets/images/default-user-male.png';

  // keycloakId is unknown at create-time — upload happens AFTER user creation
  private pendingFile: File | null = null;

  form: UserCreateDTO = {
    username:       '',
    firstName:      '',
    lastName:       '',
    email:          '',
    isActive:       true,
    cin:            '',
    phone:          '',
    photoUrl:       '',
    sex:            'Male',
    hireDate:       '',
    profession:     '',
    roleMetadataId: 0,
    departmentId:   undefined
  };

  constructor(
    private router: Router,
    private usersService: UsersService,
    private rolesService: RolesService,
    private departmentService: DepartmentService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadManageableRoles();
    this.loadDepartments();
  }

  // ── file picker ───────────────────────────────────────────────────

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

    // store for upload after user creation
    this.pendingFile = file;

    // show local preview immediately — no network call yet
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview = e.target?.result as string;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.pendingFile       = null;
    this.form.photoUrl     = '';
    this.photoPreview      = this.form.sex === 'Female'
      ? this.defaultFemale
      : this.defaultMale;
    this.cd.detectChanges();
  }

  // ── sex change — update avatar preview ───────────────────────────
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

  // ── data loading ──────────────────────────────────────────────────
  loadManageableRoles(): void {
    this.rolesLoading = true;
    this.cd.detectChanges();
    this.rolesService.getManageableRoles().subscribe({
      next: (roles) => { this.manageableRoles = roles; this.rolesLoading = false; this.cd.detectChanges(); },
      error: ()      => { this.rolesLoading = false; this.cd.detectChanges(); }
    });
  }

  loadDepartments(): void {
    this.departmentsLoading = true;
    this.cd.detectChanges();
    this.departmentService.getActiveDepartments().subscribe({
      next: (data) => { this.departments = data; this.departmentsLoading = false; this.cd.detectChanges(); },
      error: ()    => { this.departmentsLoading = false; this.cd.detectChanges(); }
    });
  }

  // ── role change ───────────────────────────────────────────────────
  onRoleChange(roleId: number): void {
    const selected = this.manageableRoles.find(r => r.id === roleId);
    if (selected && FREE_ROLES.includes(selected.name.toUpperCase())) {
      this.showDepartment    = false;
      this.form.departmentId = undefined;
    } else {
      this.showDepartment = true;
    }
    this.cd.detectChanges();
  }

  // ── save — create user THEN upload avatar if pending ─────────────
  save(): void {
    if (!this.form.username.trim())   { this.showError("Le nom d'utilisateur est requis"); return; }
    if (!this.form.firstName.trim())  { this.showError('Le prénom est requis'); return; }
    if (!this.form.lastName.trim())   { this.showError('Le nom est requis'); return; }
    if (!this.form.email.trim())      { this.showError("L'email est requis"); return; }
    if (!this.form.cin.trim())        { this.showError('Le CIN est requis'); return; }
    if (!/^\d{8}$/.test(this.form.cin.trim()))
      { this.showError('Le CIN doit contenir exactement 8 chiffres'); return; }
    if (!this.form.phone.trim())      { this.showError('Le téléphone est requis'); return; }
    if (!/^\d{8}$/.test(this.form.phone.trim()))
      { this.showError('Le téléphone doit contenir exactement 8 chiffres'); return; }
    if (!this.form.hireDate)          { this.showError("La date d'embauche est requise"); return; }
    if (!this.form.profession.trim()) { this.showError('La profession est requise'); return; }
    if (!this.form.roleMetadataId)    { this.showError('Le rôle est requis'); return; }
    if (this.showDepartment && !this.form.departmentId)
      { this.showError('Le département est requis pour ce rôle'); return; }

    this.saving = true;
    this.cd.detectChanges();

    this.usersService.createUser(this.form).subscribe({
      next: (created) => {
        // If a file was selected, upload it now using the new keycloakId
        if (this.pendingFile) {
          this.uploading = true;
          this.cd.detectChanges();

          this.usersService.uploadAvatar(created.keycloakId, this.pendingFile).subscribe({
            next: () => {
              this.uploading = false;
              this.saving    = false;
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
              // user was created — only avatar failed
              this.uploading = false;
              this.saving    = false;
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
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 5000 });
    this.cd.detectChanges();
  }
}