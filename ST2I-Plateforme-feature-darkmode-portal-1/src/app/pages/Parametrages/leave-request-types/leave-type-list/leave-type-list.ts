import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { LeaveTypeService } from '../services/leave-type.service';
import { LeaveTypeResponseDTO } from '../dtos/leave-type-response.dto';
import { LeaveTypeSearchDTO } from '../dtos/leave-type-search.dto';
import { LeaveUnit } from '../dtos/leave-unit';
import { LeaveIncrementMode } from '../dtos/leave-increment-mode';

@Component({
  selector: 'app-leave-type-list',
  standalone: true,
  templateUrl: './leave-type-list.html',
  styleUrls: ['./leave-type-list.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class LeaveTypeListComponent implements OnInit {

  rows: LeaveTypeResponseDTO[] = [];
  loading = false;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  filters: LeaveTypeSearchDTO = {
    keyword: '',
    unit: null,
    incrementMode: null,
    active: null
  };

  unitOptions: { label: string; value: LeaveUnit | null }[] = [
    { label: 'Unité', value: null },
    { label: 'Jour', value: 'DAY' },
    { label: 'Mois', value: 'MONTH' }
  ];

  incrementModeOptions: { label: string; value: LeaveIncrementMode | null }[] = [
    { label: 'Mode d’incrémentation', value: null },
    { label: 'Aucun', value: 'NONE' },
    { label: 'Mensuel', value: 'MONTHLY' },
    { label: 'Annuel', value: 'YEARLY' },
    { label: 'Fixe', value: 'FIXED' }
  ];

  statusOptions: { label: string; value: boolean | null }[] = [
    { label: 'Statut', value: null },
    { label: 'Actif', value: true },
    { label: 'Inactif', value: false }
  ];

  constructor(
    private leaveTypeService: LeaveTypeService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.search(0);
  }

  search(page: number = 0): void {
    this.loading = true;
    this.currentPage = page;
    this.cd.detectChanges();

    this.leaveTypeService.search(this.filters, this.currentPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.rows = data.content;
          this.totalPages = data.totalPages;
          this.totalElements = data.totalElements;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors du chargement des types de congé'
          });
          this.cd.detectChanges();
        }
      });
  }

  reset(): void {
    this.filters = {
      keyword: '',
      unit: null,
      incrementMode: null,
      active: null
    };

    this.search(0);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.search(page);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  add(): void {
    this.router.navigate(['Parametrages/leave-request-types/new']);
  }

  details(row: LeaveTypeResponseDTO): void {
    this.router.navigate(['Parametrages/leave-request-types', row.idLeaveType, 'details']);
  }

  edit(row: LeaveTypeResponseDTO): void {
    this.router.navigate(['Parametrages/leave-request-types', row.idLeaveType, 'edit']);
  }

  toggleActive(row: LeaveTypeResponseDTO): void {
    const isDeactivation = row.active;

    this.confirmationService.confirm({
      header: isDeactivation ? 'Confirmer la désactivation' : 'Confirmer l’activation',
      message: isDeactivation
        ? `Voulez-vous vraiment désactiver le type de congé "${row.name}" ?`
        : `Voulez-vous vraiment activer le type de congé "${row.name}" ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: isDeactivation ? 'p-button-warning' : 'p-button-success',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        if (isDeactivation) {
          this.leaveTypeService.deactivate(row.idLeaveType).subscribe({
            next: () => this.handleToggleSuccess(row, true),
            error: (err: any) => this.handleToggleError(err)
          });
        } else {
          this.leaveTypeService.reactivate(row.idLeaveType).subscribe({
            next: () => this.handleToggleSuccess(row, false),
            error: (err: any) => this.handleToggleError(err)
          });
        }
      }
    });
  }

  private handleToggleSuccess(row: LeaveTypeResponseDTO, deactivated: boolean): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: `Type de congé "${row.name}" ${deactivated ? 'désactivé' : 'activé'}`
    });

    this.search(this.currentPage);
  }

  private handleToggleError(err: any): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Action impossible',
      detail: this.extractErrorMessage(err)
    });

    this.cd.detectChanges();
  }

  getUnitLabel(unit: LeaveUnit): string {
    return unit === 'MONTH' ? 'Mois' : 'Jour';
  }

  getIncrementModeLabel(mode: LeaveIncrementMode): string {
    switch (mode) {
      case 'MONTHLY':
        return 'Mensuel';
      case 'YEARLY':
        return 'Annuel';
      case 'FIXED':
        return 'Fixe';
      case 'NONE':
      default:
        return 'Aucun';
    }
  }

  private extractErrorMessage(err: any): string {
    return err?.error?.message || err?.error?.error || err?.message || 'Erreur lors de l’action';
  }
}