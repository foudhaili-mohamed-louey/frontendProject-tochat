import { firstValueFrom } from 'rxjs';
import Keycloak from 'keycloak-js';
import { Router } from '@angular/router';

import { RbacService } from './services/rbac.service';

export const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'pfe-realm',
  clientId: 'angular-portal',
});

export function initializeKeycloak(
  rbacService: RbacService,
  router: Router
): () => Promise<boolean> {
  return async () => {
    try {
      const currentPath = window.location.pathname;

      if (currentPath !== '/' && currentPath !== '/portal') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }

      const authenticated = await keycloak.init({
        onLoad: 'login-required',
        redirectUri: window.location.origin + '/',
        checkLoginIframe: false,
      });

      if (authenticated) {
        await firstValueFrom(rbacService.loadCurrentUserPermissions());

        const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');

        if (redirectAfterLogin) {
          sessionStorage.removeItem('redirectAfterLogin');
          setTimeout(() => {
            router.navigateByUrl(redirectAfterLogin);
          }, 0);
        }
      }

      return authenticated;
    } catch (error) {
      console.error('Keycloak init failed:', error);
      return false;
    }
  };
}