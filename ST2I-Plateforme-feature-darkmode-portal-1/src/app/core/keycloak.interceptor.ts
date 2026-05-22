import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { keycloak } from './keycloak-init.factory';

export const keycloakInterceptor: HttpInterceptorFn = (req, next) => {
  return from(keycloak.updateToken(30)).pipe(
    switchMap(() => {
      const token = keycloak.token;

      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }

      return next(req);
    })
  );
};