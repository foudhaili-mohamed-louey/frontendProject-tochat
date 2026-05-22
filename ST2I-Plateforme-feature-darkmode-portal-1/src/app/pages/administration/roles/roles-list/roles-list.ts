import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { RolesService } from '../services/roles.service';
import { RoleResponseDTO } from '../models/role-models/role-response.dto';
import { RoleSearchCriteriaDTO } from '../models/role-models/role-search-criteria.dto';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule],
  templateUrl: './roles-list.html',
  styleUrls: ['./roles-list.scss'],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.Default
})
export class RolesListComponent implements OnInit {

  // expose Math to template for Math.min() in pagination
  Math = Math;

  // type dropdown bound value
  typeFilter = '';

  roles: RoleResponseDTO[] = [];

  searchCriteria: RoleSearchCriteriaDTO = {
    name: '',
    isSystemRole: null
  };

  loading = true;
  deleting = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;
  isLastPage = false;

  // confirm dialog state
  showConfirm = false;
  roleToDelete: RoleResponseDTO | null = null;

  constructor(
    private rolesService: RolesService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.rolesService.searchRoles(this.searchCriteria, this.currentPage, this.pageSize).subscribe({
      next: (pageData) => {
        this.roles = pageData.content || [];
        this.totalElements = pageData.totalElements;
        this.totalPages = pageData.totalPages;
        this.currentPage = pageData.number;
        this.pageSize = pageData.size;
        this.isLastPage = pageData.last;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading roles', err);
        this.roles = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadRoles();
  }

  onTypeChange(value: string): void {
    if (value === '') {
      this.searchCriteria.isSystemRole = null;
    } else {
      this.searchCriteria.isSystemRole = value === 'true';
    }
    this.currentPage = 0;
    this.loadRoles();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadRoles();
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadRoles();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadRoles();
    }
  }

  goToCreate(): void {
    this.router.navigate(['/administration/roles/new']);
  }

  goToEdit(name: string): void {
    this.router.navigate(['/administration/roles', name, 'edit']);
  }

  goToDetails(name: string): void {
    this.router.navigate(['/administration/roles', name, 'details']);
  }

  goToPermissions(roleId: number): void {
    this.router.navigate(['/administration/roles', roleId, 'permissions']);
  }

  // ===== OPEN CONFIRM DIALOG =====
  deleteRole(role: RoleResponseDTO): void {
    if (role.isSystemRole) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Interdit',
        detail: 'Impossible de supprimer un rôle système'
      });
      this.cd.detectChanges();
      return;
    }
    this.roleToDelete = role;
    this.showConfirm = true;
    this.cd.detectChanges();
  }

  // ===== CANCEL DELETE =====
  cancelDelete(): void {
    this.roleToDelete = null;
    this.showConfirm = false;
    this.cd.detectChanges();
  }

  // ===== CONFIRM DELETE =====
  confirmDelete(): void {
    if (!this.roleToDelete) return;

    this.deleting = true;
    this.cd.detectChanges();

    this.rolesService.deleteRole(this.roleToDelete.name).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Rôle "${this.roleToDelete?.name}" supprimé avec succès`
        });

        this.showConfirm = false;
        this.roleToDelete = null;
        this.deleting = false;

        if (this.currentPage > 0 && this.roles.length === 1) {
          this.currentPage--;
        }

        this.cd.detectChanges();
        this.loadRoles();
      },
      error: (err) => {
        const message = err?.error?.message || 'Erreur lors de la suppression';
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: message
        });

        this.showConfirm = false;
        this.roleToDelete = null;
        this.deleting = false;
        this.cd.detectChanges();
      }
    });
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}