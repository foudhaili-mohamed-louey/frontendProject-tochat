import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ModulesService } from '../services/modules.service';
import { ModuleResponseDTO } from '../models/ModuleResponseDTO';
import { RbacService } from '@/app/core/services/rbac.service';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-modules-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmDialogModule,
    ToastModule,
    ButtonModule
  ],
  templateUrl: './modules-list.html',
  styleUrls: ['./modules-list.scss'],
  providers: [ConfirmationService, MessageService]
})
export class ModulesListComponent implements OnInit {

  private readonly MODULE_NAME = 'gestion des des modules';

  modules: ModuleResponseDTO[] = [];
  filteredModules: ModuleResponseDTO[] = [];

  searchTerm: string = '';
  loading: boolean = true;

  constructor(
    private modulesService: ModulesService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef,
    public rbacService: RbacService
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }

  canCreate(): boolean {
    return this.rbacService.canCreate(this.MODULE_NAME);
  }

  canUpdate(): boolean {
    return this.rbacService.canUpdate(this.MODULE_NAME);
  }

  canDelete(): boolean {
    return this.rbacService.canDelete(this.MODULE_NAME);
  }

  loadModules(): void {

    this.loading = true;

    this.modulesService.getModules().subscribe({

      next: (data) => {

        this.modules = data;
        this.filteredModules = data;
        this.loading = false;

        this.cd.detectChanges();
      },

      error: (err) => {

        console.error('Error loading modules', err);
        this.loading = false;

        this.cd.detectChanges();
      }

    });

  }

  searchByName(): void {

    if (!this.searchTerm.trim()) {
      this.filteredModules = this.modules;
    } else {

      this.filteredModules = this.modules.filter(module =>
        module.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );

    }

    this.cd.detectChanges();
  }

  goToDetails(id: number): void {
    this.router.navigate(['Parametrages/modules', id, 'details']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['Parametrages/modules', id, 'edit']);
  }

  deleteModule(id: number): void {

    const module = this.modules.find(m => m.id === id);
    if (!module) return;

    this.confirmationService.confirm({

      message: `Delete module "${module.name}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',

      accept: () => {

        this.modulesService.deleteModule(module.id).subscribe({

          next: () => {

            this.modules = this.modules.filter(m => m.id !== module.id);
            this.filteredModules = this.filteredModules.filter(m => m.id !== module.id);

            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Module deleted successfully'
            });

            this.cd.detectChanges();
          },

          error: () => {

            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete module'
            });

            this.cd.detectChanges();
          }

        });

      }

    });

  }

  goToCreate(): void {
    this.router.navigate(['Parametrages/modules/new']);
  }

}