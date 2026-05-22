import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { RoleCategoryService } from '../services/role-category.service';
import { RoleCategoryResponseDTO } from '../dtos/role-category-response.dto';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-role-category-detail',
  standalone: true,
  templateUrl: './role-category-details.html',
  styleUrls: ['./role-category-details.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class RoleCategoryDetailComponent implements OnInit {

  id!: number;
  loading = false;

  category: RoleCategoryResponseDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleCategoryService: RoleCategoryService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCategory();
  }

  loadCategory(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.roleCategoryService.getById(this.id).subscribe({
      next: (res) => {
        this.category = res;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cd.detectChanges();

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message || 'Erreur lors du chargement de la catégorie',
          life: 5000
        });
      }
    });
  }

  back(): void {
    this.router.navigate(['/Parametrages/role-categories']);
  }

  edit(): void {
    if (!this.category) return;
    this.router.navigate(['/Parametrages/role-categories', this.category.id, 'edit']);
  }
}