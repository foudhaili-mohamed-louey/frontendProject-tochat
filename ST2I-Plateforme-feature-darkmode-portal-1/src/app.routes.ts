import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: '',
                component: Dashboard,
                data: { breadcrumb: 'Dashboard' }
            },

            // ================= DEPARTMENTS =================
            {
                path: 'Parametrages/departments',
                loadComponent: () => import('./app/pages/Parametrages/departments/list/department-list.component').then((m) => m.DepartmentListComponent),
                data: { breadcrumb: 'Gestion des départements' }
            },
            {
                path: 'Parametrages/departments/new',
                loadComponent: () => import('./app/pages/Parametrages/departments/form/department-form.component').then((m) => m.DepartmentFormComponent),
                data: { breadcrumb: 'Ajouter un département' }
            },
            {
                path: 'Parametrages/departments/:id/details',
                loadComponent: () => import('./app/pages/Parametrages/departments/details/department-details.component').then((m) => m.DepartmentDetailsComponent),
                data: { breadcrumb: 'Détails du département' }
            },
            {
                path: 'Parametrages/departments/:id/edit',
                loadComponent: () => import('./app/pages/Parametrages/departments/edit/edit').then((m) => m.DepartmentEditComponent),
                data: { breadcrumb: 'Modifier le département' }
            },

            // ================= USERS =================
            {
                path: 'administration/users',
                loadComponent: () => import('./app/pages/administration/users/users-list/users-list.component').then((m) => m.UsersListComponent),
                data: { breadcrumb: 'Gestion des utilisateurs' }
            },
            {
                path: 'administration/users/new',
                loadComponent: () => import('./app/pages/administration/users/user-form/user-form.component').then((m) => m.UserFormComponent),
                data: { breadcrumb: 'Ajouter un utilisateur' }
            },
            {
                path: 'administration/users/:id/edit',
                loadComponent: () => import('./app/pages/administration/users/user-edit/user-edit').then((m) => m.UserEditComponent),
                data: { breadcrumb: 'Modifier utilisateur' }
            },
            {
                path: 'administration/users/:id/details',
                loadComponent: () => import('./app/pages/administration/users/user-details/user-details.component').then((m) => m.UserDetailsComponent),
                data: { breadcrumb: 'Détails utilisateur' }
            },

            // ================= ROLES =================
            {
                path: 'administration/roles',
                loadComponent: () => import('./app/pages/administration/roles/roles-list/roles-list').then((m) => m.RolesListComponent),
                data: { breadcrumb: 'Gestion des rôles' }
            },
            {
                path: 'administration/roles/new',
                loadComponent: () => import('./app/pages/administration/roles/roles-form/roles-form').then((m) => m.RolesFormComponent),
                data: { breadcrumb: 'Ajouter un rôle' }
            },
            {
                path: 'administration/roles/:name/edit',
                loadComponent: () => import('./app/pages/administration/roles/roles-edit/roles-edit').then((m) => m.RolesEditComponent),
                data: { breadcrumb: 'Modifier rôle' }
            },
            {
                path: 'administration/roles/:name/details',
                loadComponent: () => import('./app/pages/administration/roles/role-details/role-details').then((m) => m.RolesDetailsComponent),
                data: { breadcrumb: 'Détails rôle' }
            },
            {
                path: 'administration/roles/:id/permissions',
                loadComponent: () => import('./app/pages/administration/roles/roles-permissions-management/roles-permissions-management').then((m) => m.RolesPermissionsManagementComponent),
                data: { breadcrumb: 'Permissions du rôle' }
            },

            // ================= MODULES =================
            {
                path: 'Parametrages/modules',
                loadComponent: () => import('./app/pages/Parametrages/modules/modules-list/modules-list').then((m) => m.ModulesListComponent),
                data: { breadcrumb: 'Gestion des modules' }
            },
            {
                path: 'Parametrages/modules/new',
                loadComponent: () => import('./app/pages/Parametrages/modules/modules-form/modules-form').then((m) => m.ModulesFormComponent),
                data: { breadcrumb: 'Ajouter un module' }
            },
            {
                path: 'Parametrages/modules/:id/edit',
                loadComponent: () => import('./app/pages/Parametrages/modules/modules-edit/modules-edit').then((m) => m.ModulesEditComponent),
                data: { breadcrumb: 'Modifier module' }
            },
            {
                path: 'Parametrages/modules/:id/details',
                loadComponent: () => import('./app/pages/Parametrages/modules/modules-details/modules-details').then((m) => m.ModulesDetailsComponent),
                data: { breadcrumb: 'Détails module' }
            },

            // ================= TRACABILITY =================
            {
                path: 'administration/tracability',
                loadComponent: () => import('./app/pages/administration/tracability/traceability/traceability').then((m) => m.TraceLogListComponent),
                data: { breadcrumb: 'Traçabilité' }
            },

            // ================= PROJECTS =================
            {
                path: 'Parametrages/projects',
                loadComponent: () => import('./app/pages/Parametrages/projects/project-list/project-list.component').then((m) => m.ProjectListComponent),
                data: { breadcrumb: 'Gestion des projets' }
            },
            {
                path: 'Parametrages/projects/new',
                loadComponent: () => import('./app/pages/Parametrages/projects/project-form/project-form.component').then((m) => m.ProjectFormComponent),
                data: { breadcrumb: 'Ajouter un projet' }
            },
            {
                path: 'Parametrages/projects/:id/edit',
                loadComponent: () => import('./app/pages/Parametrages/projects/project-edit/project-edit.component').then((m) => m.ProjectEditComponent),
                data: { breadcrumb: 'Modifier projet' }
            },
            {
                path: 'Parametrages/projects/:id/details',
                loadComponent: () => import('./app/pages/Parametrages/projects/project-details/project-details.component').then((m) => m.ProjectDetailsComponent),
                data: { breadcrumb: 'Détails projet' }
            },

            // ================= PROJECT ROLES =================
            {
                path: 'Parametrages/project-roles',
                loadComponent: () => import('./app/pages/Parametrages/project-roles/project-role-list/project-role-list').then((m) => m.ProjectRoleListComponent),
                data: { breadcrumb: 'Rôles projet' }
            },
            {
                path: 'Parametrages/project-roles/new',
                loadComponent: () => import('./app/pages/Parametrages/project-roles/project-role-form/project-role-form').then((m) => m.ProjectRoleFormComponent),
                data: { breadcrumb: 'Ajouter rôle projet' }
            },
            {
                path: 'Parametrages/project-roles/:id/edit',
                loadComponent: () => import('./app/pages/Parametrages/project-roles/project-role-edit/project-role-edit').then((m) => m.ProjectRoleEditComponent),
                data: { breadcrumb: 'Modifier rôle projet' }
            },
            {
                path: 'Parametrages/project-roles/:id/details',
                loadComponent: () => import('./app/pages/Parametrages/project-roles/project-role-details/project-role-details').then((m) => m.ProjectRoleDetailsComponent),
                data: { breadcrumb: 'Détails rôle projet' }
            },

            // ================= ROLE CATEGORIES =================
            {
                path: 'Parametrages/role-categories',
                loadComponent: () => import('./app/pages/Parametrages/role-categories/role-category-list/role-category-list').then((m) => m.RoleCategoryListComponent),
                data: { breadcrumb: 'Catégories des rôles' }
            },
            {
                path: 'Parametrages/role-categories/new',
                loadComponent: () => import('./app/pages/Parametrages/role-categories/role-category-form/role-category-form').then((m) => m.RoleCategoryFormComponent),
                data: { breadcrumb: 'Ajouter catégorie' }
            },
            {
                path: 'Parametrages/role-categories/:id/edit',
                loadComponent: () => import('./app/pages/Parametrages/role-categories/role-category-edit/role-category-edit').then((m) => m.RoleCategoryEditComponent),
                data: { breadcrumb: 'Modifier catégorie' }
            },
            {
                path: 'Parametrages/role-categories/:id/details',
                loadComponent: () => import('./app/pages/Parametrages/role-categories/role-category-details/role-category-details').then((m) => m.RoleCategoryDetailComponent),
                data: { breadcrumb: 'Détails catégorie' }
            },

            {
                path: 'uikit',
                loadChildren: () => import('./app/pages/uikit/uikit.routes'),
                data: { breadcrumb: 'UI Kit' }
            },

            {
                path: 'documentation',
                component: Documentation,
                data: { breadcrumb: 'Documentation' }
            },

            {
                path: 'pages',
                loadChildren: () => import('./app/pages/pages.routes'),
                data: { breadcrumb: 'Pages' }
            },

            // ================= TEAMS =================
            {
                path: 'Parametrages/teams',
                loadComponent: () => import('./app/pages/Parametrages/teams/team-list/team-list').then((m) => m.TeamListComponent),
                data: { breadcrumb: 'Gestion des équipes' }
            },
            {
                path: 'Parametrages/teams/new',
                loadComponent: () => import('./app/pages/Parametrages/teams/team-form/team-form').then((m) => m.TeamFormComponent),
                data: { breadcrumb: 'Ajouter une équipe' }
            },
            {
                path: 'Parametrages/teams/hierarchie',
                loadComponent: () => import('./app/pages/Parametrages/teams/team-hierarchie/team-hierarchie').then((m) => m.TeamHierarchyComponent),
                data: { breadcrumb: 'Hiérarchie des équipes' }
            },
            {
                path: 'Parametrages/teams/:projectId/:teamId/edit',
                loadComponent: () => import('./app/pages/Parametrages/teams/team-edit/team-edit').then((m) => m.TeamEditComponent),
                data: { breadcrumb: 'Modifier équipe' }
            },
            {
                path: 'Parametrages/teams/:projectId/:teamId/details',
                loadComponent: () => import('./app/pages/Parametrages/teams/team-detail/team-detail').then((m) => m.TeamDetailsComponent),
                data: { breadcrumb: 'Détails équipe' }
            }
        ]
    },

    {
        path: 'landing',
        component: Landing,
        data: { breadcrumb: 'Landing' }
    },

    {
        path: 'notfound',
        component: Notfound,
        data: { breadcrumb: 'Not Found' }
    },

    {
        path: 'portal',
        loadComponent: () => import('./app/pages/portal/portal.component').then((m) => m.PortalComponent),
        data: { breadcrumb: 'Portal' }
    },

    {
        path: 'auth',
        loadChildren: () => import('./app/pages/auth/auth.routes'),
        data: { breadcrumb: 'Authentification' }
    },

    {
        path: '**',
        redirectTo: '/notfound'
    }
];