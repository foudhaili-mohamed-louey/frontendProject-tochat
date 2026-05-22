import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ModulesService } from '../services/modules.service';
import { ModuleResponseDTO } from '../models/ModuleResponseDTO';

import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-modules-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './modules-edit.html',
  styleUrls: ['./modules-edit.scss'],
  providers: [MessageService]
})
export class ModulesEditComponent implements OnInit {

  module: ModuleResponseDTO = {
    id: 0,
    name: ''
  };

  moduleId!: number;
  loading = false;

  constructor(
    private modulesService: ModulesService,
    private route: ActivatedRoute,
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
        }

        this.cd.detectChanges();
      },

      error: (err) => {

        console.error('Error loading module', err);

        this.cd.detectChanges();
      }

    });

  }

  updateModule(): void {

    if (!this.module.name.trim()) return;

    this.loading = true;

    this.modulesService.updateModule(this.moduleId, this.module.name).subscribe({

      next: () => {

        this.loading = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Module updated successfully'
        });

        this.cd.detectChanges();

        setTimeout(() => {
          this.router.navigate(['Parametrages/modules']);
        }, 800);

      },

      error: () => {

        this.loading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update module'
        });

        this.cd.detectChanges();
      }

    });

  }

  cancel(): void {
    this.router.navigate(['Parametrages/modules']);
  }

}