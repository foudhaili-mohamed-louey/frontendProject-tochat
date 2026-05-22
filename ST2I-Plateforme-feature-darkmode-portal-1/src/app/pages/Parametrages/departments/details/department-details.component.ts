import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { DepartmentService } from '../services/department.service';
import { DepartmentResponseDTO } from '../dtos/department-response.dto';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-department-details',
  standalone: true,
  templateUrl: './department-details.component.html',
  styleUrls: ['./department-details.component.scss'],
  imports: [CommonModule, ButtonModule, ToastModule],
  providers: [MessageService]
})
export class DepartmentDetailsComponent implements OnInit {

  dept?: DepartmentResponseDTO;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        this.loading = false;
        this.cd.detectChanges();
        return;
      }

      this.departmentService.getById(Number(id)).subscribe({
        next: (data) => {
          this.dept    = data;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error loading department', err);
          this.dept    = undefined;
          this.loading = false;
          this.cd.detectChanges();
        }
      });
    });
  }

  // ===== AVATAR FALLBACK =====
  onAvatarError(event: Event, sex?: string): void {
    const img = event.target as HTMLImageElement;
    img.src = sex === 'Female'
      ? '/assets/images/default-user-female.png'
      : '/assets/images/default-user-male.png';
  }

  // ===== NAVIGATE =====
  edit(): void {
    this.router.navigate(['Parametrages/departments', this.dept?.id, 'edit']);
  }
}