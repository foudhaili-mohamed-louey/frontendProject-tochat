import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { RbacService } from '../services/rbac.service';
import { PermissionAction } from '../models/rbac.model';

export const rbacGuard: CanActivateFn = (route) => {
    const rbacService = inject(RbacService);
    const router = inject(Router);

    const moduleName = route.data?.['module'];
    const action = route.data?.['action'] as PermissionAction;

    if (!moduleName || !action) {
        return true;
    }

    const allowed = rbacService.hasPermission(moduleName, action);

    if (!allowed) {
        router.navigate(['/notfound']);
        return false;
    }

    return true;
};