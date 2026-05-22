import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ModulesService } from '../services/modules.service';
import { ModuleResponseDTO } from '../models/ModuleResponseDTO';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-modules-details',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './modules-details.html',
  styleUrls: ['./modules-details.scss'],
  providers: [MessageService]
})
export class ModulesDetailsComponent implements OnInit {

  module: ModuleResponseDTO | null = null;
  moduleId!: number;

  constructor(
    private route: ActivatedRoute,
    private modulesService: ModulesService,
    private router: Router,
    private messageService: MessageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.moduleId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadModule();

  }

  loadModule(): void {

    this.modulesService.getModules().subscribe({

      next: (modules) => {

        const found = modules.find(m => m.id === this.moduleId);

        if (found) {
          this.module = found;
        } else {

          this.messageService.add({
            severity: 'warn',
            summary: 'Not Found',
            detail: 'Module not found'
          });

          this.router.navigate(['Parametrages/modules']);
        }

        this.cd.detectChanges();
      },

      error: (err) => {

        console.error(err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load module'
        });

        this.cd.detectChanges();
      }

    });

  }

  back(): void {
    this.router.navigate(['Parametrages/modules']);
  }

}