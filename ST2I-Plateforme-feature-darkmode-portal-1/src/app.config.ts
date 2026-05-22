import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';
import {
  ApplicationConfig,
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
import { initializeKeycloak } from '../src/app/core/keycloak-init.factory';


import { keycloakInterceptor } from '../src/app/core/keycloak.interceptor';

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

    provideAppInitializer(initializeKeycloak()),

    
  ]
};