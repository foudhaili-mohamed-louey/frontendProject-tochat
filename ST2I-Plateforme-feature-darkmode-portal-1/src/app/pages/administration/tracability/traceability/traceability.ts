import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { TraceLogService } from '../service/trace-log.service';
import { TraceLogResponseDTO } from '../models/trace-log-response.dto';
import { TraceLogSearchDTO } from '../models/trace-log-search.dto';

@Component({
  selector: 'app-trace-log-list',
  standalone: true,
  templateUrl: './traceability.html',
  styleUrls: ['./traceability.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class TraceLogListComponent implements OnInit {

  rows: TraceLogResponseDTO[] = [];
  loading = false;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  filters: {
    username: string;
    serviceName: string;
    method: string;
    endpoint: string;
    ipAddress: string;
    statusCode: number | null;
    from: string;
    to: string;
  } = {
    username: '',
    serviceName: '',
    method: '',
    endpoint: '',
    ipAddress: '',
    statusCode: null,
    from: '',
    to: ''
  };

  constructor(
    private traceLogService: TraceLogService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  // ✅ Converts "2026-04-04T13:00" → "2026-04-04T13:00:00" (no Z, no timezone)
  private toLocalDateTimeString(value: string): string | undefined {
    if (!value) return undefined;
    // datetime-local input gives "yyyy-MM-ddTHH:mm" — just add seconds
    return value.length === 16 ? value + ':00' : value.substring(0, 19);
  }

  private buildSearchDTO(page: number): TraceLogSearchDTO {
    const dto: TraceLogSearchDTO = { page, size: this.pageSize };

    if (this.filters.username)    dto.username    = this.filters.username;
    if (this.filters.serviceName) dto.serviceName = this.filters.serviceName;
    if (this.filters.method)      dto.method      = this.filters.method;
    if (this.filters.endpoint)    dto.endpoint    = this.filters.endpoint;
    if (this.filters.ipAddress)   dto.ipAddress   = this.filters.ipAddress;
    if (this.filters.statusCode)  dto.statusCode  = this.filters.statusCode;

    // ✅ Send as "yyyy-MM-ddTHH:mm:ss" not ISO with Z
    const from = this.toLocalDateTimeString(this.filters.from);
    const to   = this.toLocalDateTimeString(this.filters.to);
    if (from) dto.from = from;
    if (to)   dto.to   = to;

    return dto;
  }

  loadPage(page: number): void {
    this.loading = true;
    this.cd.detectChanges();

    this.traceLogService.search(this.buildSearchDTO(page)).subscribe({
      next: (data) => {
        this.rows          = data.content;
        this.currentPage   = data.currentPage;
        this.totalElements = data.totalElements;
        this.totalPages    = data.totalPages;
        this.loading       = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        const message = err?.error?.message || 'Erreur lors du chargement des traces';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: message });
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  search(): void {
    this.loadPage(0);
  }

  reset(): void {
    this.filters = {
      username: '',
      serviceName: '',
      method: '',
      endpoint: '',
      ipAddress: '',
      statusCode: null,
      from: '',
      to: ''
    };
    this.loadPage(0);
  }

  onPageChange(event: any): void {
    const page = event.first / event.rows;
    this.pageSize = event.rows;
    this.loadPage(page);
  }

  getStatusClass(statusCode: number): string {
    if (!statusCode) return 'unknown-status';
    if (statusCode >= 200 && statusCode < 300) return 'success-status';
    if (statusCode >= 300 && statusCode < 400) return 'redirect-status';
    if (statusCode >= 400 && statusCode < 500) return 'client-error-status';
    if (statusCode >= 500) return 'server-error-status';
    return 'unknown-status';
  }

  exportCsv(): void {
    if (!this.rows.length) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
      this.cd.detectChanges();
      return;
    }

    const header = ['ID', 'Utilisateur', 'Service', 'Méthode', 'Chemin',
                    'Adresse IP', 'Statut', 'Résultat', 'Latence (ms)', 'Horodatage'];
    const csvRows = this.rows.map(t => [
      t.id, t.username || 'anonymous', t.serviceName, t.method,
      t.endpoint, t.ipAddress, t.statusCode, t.result, t.latency, t.timestamp
    ].map(v => `"${v ?? ''}"`).join(','));

    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traces_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.messageService.add({ severity: 'success', summary: 'Export', detail: 'CSV exporté avec succès' });
    this.cd.detectChanges();
  }
}