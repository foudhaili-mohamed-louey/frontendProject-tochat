import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';

import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection
} from '@angular/core';

import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling
} from '@angular/router';

import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { appRoutes } from './app.routes';
import { initializeKeycloak } from './app/core/keycloak-init.factory';
import { keycloakInterceptor } from './app/core/keycloak.interceptor';
import { RbacService } from './app/core/services/rbac.service';
import { Router } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      }),
      withEnabledBlockingInitialNavigation()
    ),

    provideHttpClient(withFetch(), withInterceptors([keycloakInterceptor])),

    provideZonelessChangeDetection(),

    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.app-dark' }
      }
    }),

    provideAppInitializer(() => {
      const rbacService = inject(RbacService);
      const router = inject(Router);
      return initializeKeycloak(rbacService , router)();
    })
  ]
};