import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProfessionService } from '../services/profession.service';
import { ProfessionResponseDTO } from '../dtos/profession-response.dto';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-professions-detail',
  standalone: true,
  templateUrl: './professions-detail.html',
  styleUrls: ['./professions-detail.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class ProfessionsDetailComponent implements OnInit {

  id!: number;
  loading = false;

  profession: ProfessionResponseDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private professionService: ProfessionService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.id) {
      this.router.navigate(['/Parametrages/professions']);
      return;
    }

    this.loadProfession();
  }

  loadProfession(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.professionService.getById(this.id).subscribe({
      next: (res) => {
        this.profession = res;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message || 'Erreur lors du chargement de la profession',
          life: 5000
        });
      }
    });
  }

  back(): void {
    this.router.navigate(['/Parametrages/professions']);
  }

  edit(): void {
    if (!this.profession) return;
    this.router.navigate(['/Parametrages/professions', this.profession.idProfession, 'edit']);
  }
}