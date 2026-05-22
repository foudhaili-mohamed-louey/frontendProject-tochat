import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ModulesService } from '../services/modules.service';
import { ModuleRequestDTO } from '../models/ModuleRequestDTO';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-modules-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './modules-form.html',
  styleUrls: ['./modules-form.scss'],
  providers: [MessageService]
})
export class ModulesFormComponent {

  module: ModuleRequestDTO = {
    name: ''
  };

  loading = false;

  constructor(
    private modulesService: ModulesService,
    public router: Router,
    private messageService: MessageService
  ) {}

  createModule() {

    if (!this.module.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Module name is required'
      });
      return;
    }

    this.loading = true;

    this.modulesService.createModule(this.module).subscribe({

      next: () => {

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Module created successfully'
        });

        setTimeout(() => {
          this.router.navigate(['Parametrages/modules']);
        }, 800);

      },

      error: (err) => {

        console.error(err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create module'
        });

        this.loading = false;

      }

    });

  }
}