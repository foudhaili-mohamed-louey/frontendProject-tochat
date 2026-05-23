import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { rbacGuard } from './app/core/guards/rbac.guard';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', component: Dashboard, data: { breadcrumb: 'Dashboard' } },

      {
        path: 'Parametrages/departments',
        loadComponent: () => import('./app/pages/Parametrages/departments/list/department-list.component').then(m => m.DepartmentListComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Gestion des départements', module: 'gestion des départments', action: 'READ' }
      },
      {
        path: 'Parametrages/departments/new',
        loadComponent: () => import('./app/pages/Parametrages/departments/form/department-form.component').then(m => m.DepartmentFormComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Ajouter un département', module: 'gestion des départments', action: 'CREATE' }
      },
      {
        path: 'Parametrages/departments/:id/details',
        loadComponent: () => import('./app/pages/Parametrages/departments/details/department-details.component').then(m => m.DepartmentDetailsComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Détails du département', module: 'gestion des départments', action: 'READ' }
      },
      {
        path: 'Parametrages/departments/:id/edit',
        loadComponent: () => import('./app/pages/Parametrages/departments/edit/edit').then(m => m.DepartmentEditComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Modifier le département', module: 'gestion des départments', action: 'UPDATE' }
      },

      {
        path: 'administration/users',
        loadComponent: () => import('./app/pages/administration/users/users-list/users-list.component').then(m => m.UsersListComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Gestion des utilisateurs', module: 'gestion des utilisateurs', action: 'READ' }
      },
      {
        path: 'administration/users/new',
        loadComponent: () => import('./app/pages/administration/users/user-form/user-form.component').then(m => m.UserFormComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Ajouter un utilisateur', module: 'gestion des utilisateurs', action: 'CREATE' }
      },
      {
        path: 'administration/users/:id/edit',
        loadComponent: () => import('./app/pages/administration/users/user-edit/user-edit').then(m => m.UserEditComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Modifier utilisateur', module: 'gestion des utilisateurs', action: 'UPDATE' }
      },
      {
        path: 'administration/users/:id/details',
        loadComponent: () => import('./app/pages/administration/users/user-details/user-details.component').then(m => m.UserDetailsComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Détails utilisateur', module: 'gestion des utilisateurs', action: 'READ' }
      },

      {
        path: 'administration/roles',
        loadComponent: () => import('./app/pages/administration/roles/roles-list/roles-list').then(m => m.RolesListComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Gestion des rôles', module: 'gestion des roles', action: 'READ' }
      },
      {
        path: 'administration/roles/new',
        loadComponent: () => import('./app/pages/administration/roles/roles-form/roles-form').then(m => m.RolesFormComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Ajouter un rôle', module: 'gestion des roles', action: 'CREATE' }
      },
      {
        path: 'administration/roles/:name/edit',
        loadComponent: () => import('./app/pages/administration/roles/roles-edit/roles-edit').then(m => m.RolesEditComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Modifier rôle', module: 'gestion des roles', action: 'UPDATE' }
      },
      {
        path: 'administration/roles/:name/details',
        loadComponent: () => import('./app/pages/administration/roles/role-details/role-details').then(m => m.RolesDetailsComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Détails rôle', module: 'gestion des roles', action: 'READ' }
      },
      {
        path: 'administration/roles/:id/permissions',
        loadComponent: () => import('./app/pages/administration/roles/roles-permissions-management/roles-permissions-management').then(m => m.RolesPermissionsManagementComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Permissions du rôle', module: 'gestion des roles', action: 'UPDATE' }
      },

      {
        path: 'Parametrages/modules',
        loadComponent: () => import('./app/pages/Parametrages/modules/modules-list/modules-list').then(m => m.ModulesListComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Gestion des modules', module: 'gestion des des modules', action: 'READ' }
      },
      {
        path: 'Parametrages/modules/new',
        loadComponent: () => import('./app/pages/Parametrages/modules/modules-form/modules-form').then(m => m.ModulesFormComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Ajouter un module', module: 'gestion des des modules', action: 'CREATE' }
      },
      {
        path: 'Parametrages/modules/:id/edit',
        loadComponent: () => import('./app/pages/Parametrages/modules/modules-edit/modules-edit').then(m => m.ModulesEditComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Modifier module', module: 'gestion des des modules', action: 'UPDATE' }
      },
      {
        path: 'Parametrages/modules/:id/details',
        loadComponent: () => import('./app/pages/Parametrages/modules/modules-details/modules-details').then(m => m.ModulesDetailsComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Détails module', module: 'gestion des des modules', action: 'READ' }
      },

      {
        path: 'administration/tracability',
        loadComponent: () => import('./app/pages/administration/tracability/traceability/traceability').then(m => m.TraceLogListComponent),
        canActivate: [rbacGuard],
        data: {
          breadcrumb: 'Traçabilité',
          module: 'traçabilité',
          action: 'READ'
        }
      },

      {
        path: 'Parametrages/projects',
        loadComponent: () => import('./app/pages/Parametrages/projects/project-list/project-list.component').then(m => m.ProjectListComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Gestion des projets', module: 'gestion des projets', action: 'READ' }
      },
      {
        path: 'Parametrages/projects/new',
        loadComponent: () => import('./app/pages/Parametrages/projects/project-form/project-form.component').then(m => m.ProjectFormComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Ajouter un projet', module: 'gestion des projets', action: 'CREATE' }
      },
      {
        path: 'Parametrages/projects/:id/edit',
        loadComponent: () => import('./app/pages/Parametrages/projects/project-edit/project-edit.component').then(m => m.ProjectEditComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Modifier projet', module: 'gestion des projets', action: 'UPDATE' }
      },
      {
        path: 'Parametrages/projects/:id/details',
        loadComponent: () => import('./app/pages/Parametrages/projects/project-details/project-details.component').then(m => m.ProjectDetailsComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Détails projet', module: 'gestion des projets', action: 'READ' }
      },

      {
        path: 'Parametrages/project-roles',
        loadComponent: () => import('./app/pages/Parametrages/project-roles/project-role-list/project-role-list').then(m => m.ProjectRoleListComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Rôles projet', module: 'gestion les roles des projets', action: 'READ' }
      },
      {
        path: 'Parametrages/project-roles/new',
        loadComponent: () => import('./app/pages/Parametrages/project-roles/project-role-form/project-role-form').then(m => m.ProjectRoleFormComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Ajouter rôle projet', module: 'gestion les roles des projets', action: 'CREATE' }
      },
      {
        path: 'Parametrages/project-roles/:id/edit',
        loadComponent: () => import('./app/pages/Parametrages/project-roles/project-role-edit/project-role-edit').then(m => m.ProjectRoleEditComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Modifier rôle projet', module: 'gestion les roles des projets', action: 'UPDATE' }
      },
      {
        path: 'Parametrages/project-roles/:id/details',
        loadComponent: () => import('./app/pages/Parametrages/project-roles/project-role-details/project-role-details').then(m => m.ProjectRoleDetailsComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Détails rôle projet', module: 'gestion les roles des projets', action: 'READ' }
      },

      {
        path: 'Parametrages/role-categories',
        loadComponent: () => import('./app/pages/Parametrages/role-categories/role-category-list/role-category-list').then(m => m.RoleCategoryListComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Catégories des rôles', module: 'gestion les Catégories des roles', action: 'READ' }
      },
      {
        path: 'Parametrages/role-categories/new',
        loadComponent: () => import('./app/pages/Parametrages/role-categories/role-category-form/role-category-form').then(m => m.RoleCategoryFormComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Ajouter catégorie', module: 'gestion les Catégories des roles', action: 'CREATE' }
      },
      {
        path: 'Parametrages/role-categories/:id/edit',
        loadComponent: () => import('./app/pages/Parametrages/role-categories/role-category-edit/role-category-edit').then(m => m.RoleCategoryEditComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Modifier catégorie', module: 'gestion les Catégories des roles', action: 'UPDATE' }
      },
      {
        path: 'Parametrages/role-categories/:id/details',
        loadComponent: () => import('./app/pages/Parametrages/role-categories/role-category-details/role-category-details').then(m => m.RoleCategoryDetailComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Détails catégorie', module: 'gestion les Catégories des roles', action: 'READ' }
      },

      {
        path: 'Parametrages/teams',
        loadComponent: () => import('./app/pages/Parametrages/teams/team-list/team-list').then(m => m.TeamListComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Gestion des équipes', module: 'gestion des projets', action: 'READ' }
      },
      {
        path: 'Parametrages/teams/new',
        loadComponent: () => import('./app/pages/Parametrages/teams/team-form/team-form').then(m => m.TeamFormComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Ajouter une équipe', module: 'gestion des projets', action: 'CREATE' }
      },
      {
        path: 'Parametrages/teams/hierarchie',
        loadComponent: () => import('./app/pages/Parametrages/teams/team-hierarchie/team-hierarchie').then(m => m.TeamHierarchyComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Hiérarchie des équipes', module: 'gestion des projets', action: 'UPDATE' }
      },
      {
        path: 'Parametrages/teams/:projectId/:teamId/edit',
        loadComponent: () => import('./app/pages/Parametrages/teams/team-edit/team-edit').then(m => m.TeamEditComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Modifier équipe', module: 'gestion des projets', action: 'UPDATE' }
      },
      {
        path: 'Parametrages/teams/:projectId/:teamId/details',
        loadComponent: () => import('./app/pages/Parametrages/teams/team-detail/team-detail').then(m => m.TeamDetailsComponent),
        canActivate: [rbacGuard],
        data: { breadcrumb: 'Détails équipe', module: 'gestion des projets', action: 'READ' }
      },

      { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes'), data: { breadcrumb: 'UI Kit' } },
      { path: 'documentation', component: Documentation, data: { breadcrumb: 'Documentation' } },
      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes'), data: { breadcrumb: 'Pages' } }
    ]
  },

  { path: 'landing', component: Landing, data: { breadcrumb: 'Landing' } },
  { path: 'notfound', component: Notfound, data: { breadcrumb: 'Not Found' } },
  {
    path: 'portal',
    loadComponent: () => import('./app/pages/portal/portal.component').then(m => m.PortalComponent),
    data: { breadcrumb: 'Portal' }
  },
  {
    path: 'auth',
    loadChildren: () => import('./app/pages/auth/auth.routes'),
    data: { breadcrumb: 'Authentification' }
  },
  { path: '**', redirectTo: '/notfound' }
];