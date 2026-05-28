# ST2I Frontend Resume File

Generated from the local source tree on 2026-05-25. File name intentionally follows the requested spelling: `frontent-resumefile.md`.

> Purpose: a detailed handoff/resume document for the Angular frontend, covering project logic, DTOs, services, components, routes, authentication, RBAC, UI libraries, and feature modules.

## 1. Executive Summary

- Project type: Angular 21 standalone frontend based on Sakai/PrimeNG structure.
- Business domain: ST2I internal portal/admin platform for users, roles, permissions, departments, projects, teams, professions, leave request types, leave balances, role categories, modules, and traceability.
- Main API backend base URL found in services: `http://localhost:8888/api/...`.
- Authentication provider: Keycloak at `http://localhost:8080`, realm `pfe-realm`, client `angular-portal`.
- Authorization model: frontend RBAC guard reads route metadata `{ module, action }` and asks `RbacService.hasPermission(moduleName, action)`.
- Source inventory: 190 TypeScript files, 49 HTML templates, 65 SCSS files, 22 extracted service classes, 93 extracted component/layout classes, 67 extracted DTO/model/type declarations.

## 2. Technology Stack

- Angular: ^21 with standalone components and zoneless change detection.
- TypeScript: ~5.9.3.
- UI: PrimeNG ^21.0.2, PrimeIcons ^7.0.0, Aura theme from @primeuix/themes, TailwindCSS ^4.1.11, tailwindcss-primeui.
- Charts/editor helpers: Chart.js ^4.4.2, Quill ^2.0.3.
- Auth: keycloak-js ^26.2.3.
- HTTP/state: Angular HttpClient, RxJS ~7.8.0, Angular signals/computed in RBAC and layout.
- Build scripts: `npm start` runs `ng serve`, `npm run build` runs `ng build`, `npm test` runs `ng test`, `npm run format` uses Prettier.

## 3. Application Bootstrap and Global Configuration

- `src/main.ts` bootstraps the root Angular app using `appConfig`.
- `src/app.config.ts` provides router, HttpClient with fetch, the Keycloak interceptor, zoneless change detection, PrimeNG Aura theme, and a blocking app initializer that initializes Keycloak and loads RBAC permissions before normal app use.
- PrimeNG dark mode is controlled by the CSS selector `.app-dark`, so layout/theme logic can toggle that class to switch themes.
- In-memory scroll restoration and anchor scrolling are enabled. Initial navigation is blocking, which matters because auth/RBAC setup happens during application startup.

## 4. Authentication, Token Flow, and RBAC

### Keycloak Initialization

- File: `src/app/core/keycloak-init.factory.ts`.
- Creates a Keycloak client with URL `http://localhost:8080`, realm `pfe-realm`, clientId `angular-portal`.
- Uses `onLoad: login-required`, so every route is protected by login at app startup unless changed later.
- Stores `redirectAfterLogin` in `sessionStorage` for paths other than `/` and `/portal`, then navigates back after permissions are loaded.
- Calls `RbacService.loadCurrentUserPermissions()` immediately after successful authentication.

### Token Interceptor

- File: `src/app/core/keycloak.interceptor.ts`.
- Before every HTTP request, calls `keycloak.updateToken(30)`. If a token is available, clones the request with `Authorization: Bearer <token>`.
- Uses an Angular functional interceptor and RxJS `from(...).pipe(switchMap(...))`.

### RBAC Service

- File: `src/app/core/services/rbac.service.ts`.
- Backend endpoint: `GET http://localhost:8888/api/rbac/me`.
- Stores permissions in a private Angular `signal<CurrentUserPermissions | null>`.
- Exposes computed values: `currentPermissions`, `roleName`, `roleLevel`.
- Main decision method: `hasPermission(moduleName, action)`, with convenience wrappers `canRead`, `canCreate`, `canUpdate`, `canDelete`.

### RBAC Guard

- File: `src/app/core/guards/rbac.guard.ts`.
- Reads `route.data.module` and `route.data.action`.
- If metadata is missing, the route is allowed. If metadata exists and permission is missing, navigates to `/notfound`.
- Permission actions are `CREATE`, `READ`, `UPDATE`, `DELETE`.

## 5. Route Map

| Path | Component / Lazy Target | Guarded | Module | Action | Breadcrumb | File |
|---|---|---:|---|---|---|---|
| `(empty)` | `AppLayout` | no |  |  |  | `src/app.routes.ts` |
| `(empty)` | `Dashboard` | no |  |  | Dashboard | `src/app.routes.ts` |
| `Parametrages/departments` | `DepartmentListComponent` | yes | gestion des départments | READ | Gestion des départements | `src/app.routes.ts` |
| `Parametrages/departments/new` | `DepartmentFormComponent` | yes | gestion des départments | CREATE | Ajouter un département | `src/app.routes.ts` |
| `Parametrages/departments/:id/details` | `DepartmentDetailsComponent` | yes | gestion des départments | READ | Détails du département | `src/app.routes.ts` |
| `Parametrages/departments/:id/edit` | `DepartmentEditComponent` | yes | gestion des départments | UPDATE | Modifier le département | `src/app.routes.ts` |
| `Parametrages/leave-request-types` | `LeaveTypeListComponent` | no |  |  |  | `src/app.routes.ts` |
| `Parametrages/leave-request-types/new` | `LeaveTypeFormComponent` | no |  |  |  | `src/app.routes.ts` |
| `Parametrages/leave-request-types/:id/edit` | `LeaveTypeEditComponent` | no |  |  |  | `src/app.routes.ts` |
| `Parametrages/leave-request-types/:id/details` | `LeaveTypeDetailsComponent` | no |  |  |  | `src/app.routes.ts` |
| `administration/users` | `UsersListComponent` | yes | gestion des utilisateurs | READ | Gestion des utilisateurs | `src/app.routes.ts` |
| `administration/users/new` | `UserFormComponent` | yes | gestion des utilisateurs | CREATE | Ajouter un utilisateur | `src/app.routes.ts` |
| `administration/users/:id/edit` | `UserEditComponent` | yes | gestion des utilisateurs | UPDATE | Modifier utilisateur | `src/app.routes.ts` |
| `administration/users/:id/details` | `UserDetailsComponent` | yes | gestion des utilisateurs | READ | Détails utilisateur | `src/app.routes.ts` |
| `administration/roles` | `RolesListComponent` | yes | gestion des roles | READ | Gestion des rôles | `src/app.routes.ts` |
| `administration/roles/new` | `RolesFormComponent` | yes | gestion des roles | CREATE | Ajouter un rôle | `src/app.routes.ts` |
| `administration/roles/:name/edit` | `RolesEditComponent` | yes | gestion des roles | UPDATE | Modifier rôle | `src/app.routes.ts` |
| `administration/roles/:name/details` | `RolesDetailsComponent` | yes | gestion des roles | READ | Détails rôle | `src/app.routes.ts` |
| `administration/roles/:id/permissions` | `RolesPermissionsManagementComponent` | yes | gestion des roles | UPDATE | Permissions du rôle | `src/app.routes.ts` |
| `Parametrages/modules` | `ModulesListComponent` | yes | gestion des des modules | READ | Gestion des modules | `src/app.routes.ts` |
| `Parametrages/modules/new` | `ModulesFormComponent` | yes | gestion des des modules | CREATE | Ajouter un module | `src/app.routes.ts` |
| `Parametrages/modules/:id/edit` | `ModulesEditComponent` | yes | gestion des des modules | UPDATE | Modifier module | `src/app.routes.ts` |
| `Parametrages/modules/:id/details` | `ModulesDetailsComponent` | yes | gestion des des modules | READ | Détails module | `src/app.routes.ts` |
| `administration/tracability` | `TraceLogListComponent` | yes | traçabilité | READ | Traçabilité | `src/app.routes.ts` |
| `Parametrages/projects` | `ProjectListComponent` | yes | gestion des projets | READ | Gestion des projets | `src/app.routes.ts` |
| `Parametrages/projects/new` | `ProjectFormComponent` | yes | gestion des projets | CREATE | Ajouter un projet | `src/app.routes.ts` |
| `Parametrages/projects/:id/edit` | `ProjectEditComponent` | yes | gestion des projets | UPDATE | Modifier projet | `src/app.routes.ts` |
| `Parametrages/projects/:id/details` | `ProjectDetailsComponent` | yes | gestion des projets | READ | Détails projet | `src/app.routes.ts` |
| `Parametrages/project-roles` | `ProjectRoleListComponent` | yes | gestion les roles des projets | READ | Rôles projet | `src/app.routes.ts` |
| `Parametrages/project-roles/new` | `ProjectRoleFormComponent` | yes | gestion les roles des projets | CREATE | Ajouter rôle projet | `src/app.routes.ts` |
| `Parametrages/project-roles/:id/edit` | `ProjectRoleEditComponent` | yes | gestion les roles des projets | UPDATE | Modifier rôle projet | `src/app.routes.ts` |
| `Parametrages/project-roles/:id/details` | `ProjectRoleDetailsComponent` | yes | gestion les roles des projets | READ | Détails rôle projet | `src/app.routes.ts` |
| `Parametrages/role-categories` | `RoleCategoryListComponent` | yes | gestion les Catégories des roles | READ | Catégories des rôles | `src/app.routes.ts` |
| `Parametrages/role-categories/new` | `RoleCategoryFormComponent` | yes | gestion les Catégories des roles | CREATE | Ajouter catégorie | `src/app.routes.ts` |
| `Parametrages/role-categories/:id/edit` | `RoleCategoryEditComponent` | yes | gestion les Catégories des roles | UPDATE | Modifier catégorie | `src/app.routes.ts` |
| `Parametrages/role-categories/:id/details` | `RoleCategoryDetailComponent` | yes | gestion les Catégories des roles | READ | Détails catégorie | `src/app.routes.ts` |
| `Parametrages/teams` | `TeamListComponent` | yes | gestion des projets | READ | Gestion des équipes | `src/app.routes.ts` |
| `Parametrages/teams/new` | `TeamFormComponent` | yes | gestion des projets | CREATE | Ajouter une équipe | `src/app.routes.ts` |
| `Parametrages/teams/hierarchie` | `TeamHierarchyComponent` | yes | gestion des projets | UPDATE | Hiérarchie des équipes | `src/app.routes.ts` |
| `Parametrages/teams/:projectId/:teamId/edit` | `TeamEditComponent` | yes | gestion des projets | UPDATE | Modifier équipe | `src/app.routes.ts` |
| `Parametrages/teams/:projectId/:teamId/details` | `TeamDetailsComponent` | yes | gestion des projets | READ | Détails équipe | `src/app.routes.ts` |
| `Parametrages/leave-balances` | `EmployeeLeaveBalanceListComponent` | no |  |  |  | `src/app.routes.ts` |
| `Parametrages/leave-balances/:id/details` | `EmployeeLeaveBalanceDetailsComponent` | no |  |  |  | `src/app.routes.ts` |
| `Parametrages/leave-balances/:id/edit` | `EmployeeLeaveBalanceEditComponent` | no |  |  |  | `src/app.routes.ts` |
| `Parametrages/professions` | `ProfessionsListComponent` | no |  |  | Gestion des professions | `src/app.routes.ts` |
| `Parametrages/professions/new` | `ProfessionsFormComponent` | no |  |  | Ajouter une profession | `src/app.routes.ts` |
| `Parametrages/professions/:id/edit` | `ProfessionsEditComponent` | no |  |  | Modifier profession | `src/app.routes.ts` |
| `Parametrages/professions/:id/details` | `ProfessionsDetailComponent` | no |  |  | Détails profession | `src/app.routes.ts` |
| `uikit` | `./app/pages/uikit/uikit.routes` | no |  |  | UI Kit | `src/app.routes.ts` |
| `documentation` | `Documentation` | no |  |  | Documentation | `src/app.routes.ts` |
| `pages` | `./app/pages/pages.routes` | no |  |  | Pages | `src/app.routes.ts` |
| `landing` | `Landing` | no |  |  | Landing | `src/app.routes.ts` |
| `notfound` | `Notfound` | no |  |  | Not Found | `src/app.routes.ts` |
| `portal` | `PortalComponent` | no |  |  | Portal | `src/app.routes.ts` |
| `auth` | `./app/pages/auth/auth.routes` | no |  |  | Authentification | `src/app.routes.ts` |
| `**` | `` | no |  |  |  | `src/app.routes.ts` |
| `documentation` | `Documentation` | no |  |  |  | `src/app/pages/pages.routes.ts` |
| `crud` | `Crud` | no |  |  |  | `src/app/pages/pages.routes.ts` |
| `empty` | `Empty` | no |  |  |  | `src/app/pages/pages.routes.ts` |
| `**` | `` | no |  |  |  | `src/app/pages/pages.routes.ts` |
| `access` | `Access` | no |  |  |  | `src/app/pages/auth/auth.routes.ts` |
| `error` | `Error` | no |  |  |  | `src/app/pages/auth/auth.routes.ts` |
| `login` | `Login` | no |  |  |  | `src/app/pages/auth/auth.routes.ts` |
| `button` | `ButtonDemo` | no |  |  | Button | `src/app/pages/uikit/uikit.routes.ts` |
| `charts` | `ChartDemo` | no |  |  | Charts | `src/app/pages/uikit/uikit.routes.ts` |
| `file` | `FileDemo` | no |  |  | File | `src/app/pages/uikit/uikit.routes.ts` |
| `formlayout` | `FormLayoutDemo` | no |  |  | Form Layout | `src/app/pages/uikit/uikit.routes.ts` |
| `input` | `InputDemo` | no |  |  | Input | `src/app/pages/uikit/uikit.routes.ts` |
| `list` | `ListDemo` | no |  |  | List | `src/app/pages/uikit/uikit.routes.ts` |
| `media` | `MediaDemo` | no |  |  | Media | `src/app/pages/uikit/uikit.routes.ts` |
| `message` | `MessagesDemo` | no |  |  | Message | `src/app/pages/uikit/uikit.routes.ts` |
| `misc` | `MiscDemo` | no |  |  | Misc | `src/app/pages/uikit/uikit.routes.ts` |
| `panel` | `PanelsDemo` | no |  |  | Panel | `src/app/pages/uikit/uikit.routes.ts` |
| `timeline` | `TimelineDemo` | no |  |  | Timeline | `src/app/pages/uikit/uikit.routes.ts` |
| `table` | `TableDemo` | no |  |  | Table | `src/app/pages/uikit/uikit.routes.ts` |
| `overlay` | `OverlayDemo` | no |  |  | Overlay | `src/app/pages/uikit/uikit.routes.ts` |
| `tree` | `TreeDemo` | no |  |  | Tree | `src/app/pages/uikit/uikit.routes.ts` |
| `menu` | `MenuDemo` | no |  |  | Menu | `src/app/pages/uikit/uikit.routes.ts` |
| `**` | `` | no |  |  |  | `src/app/pages/uikit/uikit.routes.ts` |

## 6. Feature Modules and Business Logic

### Administration - Roles and Permissions

- Services: `src/app/pages/administration/roles/services/permissions.service.ts`, `src/app/pages/administration/roles/services/role-permissions.service.ts`, `src/app/pages/administration/roles/services/roles.service.ts`.
- Components/classes: `RolesDetailsComponent`, `RolesEditComponent`, `RolesFormComponent`, `RolesListComponent`, `RolesPermissionsManagementComponent`.
- DTO/model files: `src/app/pages/administration/roles/models/permissions-models/permission-action.enum.ts`, `src/app/pages/administration/roles/models/permissions-models/permission-request.dto.ts`, `src/app/pages/administration/roles/models/permissions-models/permission-response.dto.ts`, `src/app/pages/administration/roles/models/role-models/role-page.dto.ts`, `src/app/pages/administration/roles/models/role-models/role-request.dto.ts`, `src/app/pages/administration/roles/models/role-models/role-response.dto.ts`, `src/app/pages/administration/roles/models/role-models/role-search-criteria.dto.ts`, `src/app/pages/administration/roles/models/role-premission/role-permission-request.dto.ts`, `src/app/pages/administration/roles/models/role-premission/role-permission-response.dto.ts`.
- Main logic: Handles role CRUD, role details/editing, permission listing by module, and role-permission assignment/removal.

### Administration - Traceability

- Services: `src/app/pages/administration/tracability/service/trace-log.service.ts`.
- Components/classes: `TraceLogListComponent`.
- DTO/model files: `src/app/pages/administration/tracability/models/trace-log-page-response.dto.ts`, `src/app/pages/administration/tracability/models/trace-log-response.dto.ts`, `src/app/pages/administration/tracability/models/trace-log-search.dto.ts`.
- Main logic: Handles audit/trace log search and archive operations.

### Administration - Users

- Services: `src/app/pages/administration/users/services/users.service.ts`.
- Components/classes: `UserDetailsComponent`, `UserEditComponent`, `UserFormComponent`, `UsersListComponent`.
- DTO/model files: `src/app/pages/administration/users/models/page-response.dto.ts`, `src/app/pages/administration/users/models/user-admin-update.dto.ts`, `src/app/pages/administration/users/models/user-create.dto.ts`, `src/app/pages/administration/users/models/user-password-change.dto.ts`, `src/app/pages/administration/users/models/user-profile-update.dto.ts`, `src/app/pages/administration/users/models/user-response.dto.ts`, `src/app/pages/administration/users/models/UserSearchCriteria.dto.ts`.
- Main logic: Handles user listing, search/filter, creation, admin update, details, avatar upload, role assignment support, department/profession selection, pagination, CSV export, and deletion.

### Core - Security and RBAC

- Services: `src/app/core/services/rbac.service.ts`.
- DTO/model files: `src/app/core/models/rbac.model.ts`.
- Main logic: Centralizes authentication, token interception, RBAC state, permission checks, and route guard behavior.

### Dashboard

- Components/classes: `BestSellingWidget`, `NotificationsWidget`, `RecentSalesWidget`, `RevenueStreamWidget`, `StatsWidget`, `Dashboard`.
- Main logic: Provides dashboard shell and composed widgets for stats, recent sales, best selling data, revenue stream, and notifications.

### Landing

- Components/classes: `FeaturesWidget`, `FooterWidget`, `HeroWidget`, `HighlightsWidget`, `PricingWidget`, `TopbarWidget`, `Landing`.

### Layout Shell

- Services: `src/app/layout/service/layout.service.ts`.
- Components/classes: `AppBreadcrumb`, `AppConfigurator`, `AppFloatingConfigurator`, `AppFooter`, `AppLayout`, `AppMenu`, `AppMenuitem`, `AppSidebar`, `AppTopbar`.
- Main logic: Provides shell layout, menu, sidebar, topbar, breadcrumbs, theme/configurator behavior, and responsive menu state.

### Parametrages - Departments

- Services: `src/app/pages/Parametrages/departments/services/department.service.ts`.
- Components/classes: `DepartmentDetailsComponent`, `DepartmentEditComponent`, `DepartmentFormComponent`, `DepartmentListComponent`.
- DTO/model files: `src/app/pages/Parametrages/departments/dtos/create-department-request.dto.ts`, `src/app/pages/Parametrages/departments/dtos/department-response.dto.ts`, `src/app/pages/Parametrages/departments/dtos/department-search-criteria.dto.ts`, `src/app/pages/Parametrages/departments/dtos/department-type.ts`, `src/app/pages/Parametrages/departments/dtos/page-response.dto.ts`, `src/app/pages/Parametrages/departments/dtos/update-department.dto.ts`, `src/app/pages/Parametrages/departments/dtos/user-mapper-response.dto.ts`.
- Main logic: Handles department CRUD, department type selection, active/inactive state, chef/user lookup, operational department lookups, and department details.

### Parametrages - Leave Balances

- Services: `src/app/pages/Parametrages/leave-balance/services/employee-leave-balance.service.ts`.
- Components/classes: `EmployeeLeaveBalanceDetailsComponent`, `EmployeeLeaveBalanceEditComponent`, `EmployeeLeaveBalanceFormComponent`, `EmployeeLeaveBalanceListComponent`.
- DTO/model files: `src/app/pages/Parametrages/leave-balance/dtos/employee-leave-balance-request.dto.ts`, `src/app/pages/Parametrages/leave-balance/dtos/employee-leave-balance-response.dto.ts`, `src/app/pages/Parametrages/leave-balance/dtos/employee-leave-balance-search.dto.ts`, `src/app/pages/Parametrages/leave-balance/dtos/page-response.dto.ts`.
- Main logic: Handles employee leave balance search/listing/details/edit, balance creation/update, deactivation/reactivation, and balance status display.

### Parametrages - Leave Request Types

- Services: `src/app/pages/Parametrages/leave-request-types/services/leave-type.service.ts`.
- Components/classes: `LeaveTypeDetailsComponent`, `LeaveTypeEditComponent`, `LeaveTypeFormComponent`, `LeaveTypeListComponent`.
- DTO/model files: `src/app/pages/Parametrages/leave-request-types/dtos/leave-increment-mode.ts`, `src/app/pages/Parametrages/leave-request-types/dtos/leave-type-request.dto.ts`, `src/app/pages/Parametrages/leave-request-types/dtos/leave-type-response.dto.ts`, `src/app/pages/Parametrages/leave-request-types/dtos/leave-type-search.dto.ts`, `src/app/pages/Parametrages/leave-request-types/dtos/leave-unit.ts`, `src/app/pages/Parametrages/leave-request-types/dtos/page-response.dto.ts`.
- Main logic: Handles leave type CRUD-like flow, search, deactivation/reactivation, units, increment modes, yearly limits, carry-over/medical-document flags, and paid/unpaid behavior.

### Parametrages - Modules

- Services: `src/app/pages/Parametrages/modules/services/modules.service.ts`.
- Components/classes: `ModulesDetailsComponent`, `ModulesEditComponent`, `ModulesFormComponent`, `ModulesListComponent`.
- DTO/model files: `src/app/pages/Parametrages/modules/models/ModuleRequestDTO.ts`, `src/app/pages/Parametrages/modules/models/ModuleResponseDTO.ts`.
- Main logic: Handles module listing, creation by name, lookup by name, update by id/newName, deletion, and details.

### Parametrages - Professions

- Services: `src/app/pages/Parametrages/professions/services/profession.service.ts`.
- Components/classes: `ProfessionsDetailComponent`, `ProfessionsEditComponent`, `ProfessionsFormComponent`, `ProfessionsListComponent`.
- DTO/model files: `src/app/pages/Parametrages/professions/dtos/profession-create.dto.ts`, `src/app/pages/Parametrages/professions/dtos/profession-response.dto.ts`, `src/app/pages/Parametrages/professions/dtos/profession-search-criteria.dto.ts`, `src/app/pages/Parametrages/professions/dtos/profession-update.dto.ts`.
- Main logic: Handles profession CRUD, active/inactive state, search, department-linked profession loading, and selectable active professions.

### Parametrages - Project Roles

- Services: `src/app/pages/Parametrages/project-roles/services/project-role.service.ts`.
- Components/classes: `ProjectRoleDetailsComponent`, `ProjectRoleEditComponent`, `ProjectRoleFormComponent`, `ProjectRoleListComponent`.
- DTO/model files: `src/app/pages/Parametrages/project-roles/dtos/project-role-create.dto.ts`, `src/app/pages/Parametrages/project-roles/dtos/project-role-response.dto.ts`, `src/app/pages/Parametrages/project-roles/dtos/project-role-search-criteria.dto.ts`, `src/app/pages/Parametrages/project-roles/dtos/project-role-update.dto.ts`.
- Main logic: Handles project role CRUD, search/listing, details, edit/create forms, and deletion.

### Parametrages - Projects

- Services: `src/app/pages/Parametrages/projects/services/project.service.ts`.
- Components/classes: `ProjectDetailsComponent`, `ProjectEditComponent`, `ProjectFormComponent`, `ProjectListComponent`.
- DTO/model files: `src/app/pages/Parametrages/projects/dtos/page-response.dto.ts`, `src/app/pages/Parametrages/projects/dtos/project-create.dto.ts`, `src/app/pages/Parametrages/projects/dtos/project-response.dto.ts`, `src/app/pages/Parametrages/projects/dtos/project-search-criteria.dto.ts`, `src/app/pages/Parametrages/projects/dtos/project-status-update.dto.ts`, `src/app/pages/Parametrages/projects/dtos/project-status.enum.ts`, `src/app/pages/Parametrages/projects/dtos/project-update.dto.ts`.
- Main logic: Handles project CRUD, search/filtering, assigned team dropdowns, project-team assignment/removal, department assignment/removal, project status updates, soft delete/archive, CSV export, and details/edit pages.

### Parametrages - Role Categories

- Services: `src/app/pages/Parametrages/role-categories/services/role-category.service.ts`.
- Components/classes: `RoleCategoryDetailComponent`, `RoleCategoryEditComponent`, `RoleCategoryFormComponent`, `RoleCategoryListComponent`.
- DTO/model files: `src/app/pages/Parametrages/role-categories/dtos/role-category-create.dto.ts`, `src/app/pages/Parametrages/role-categories/dtos/role-category-response.dto.ts`, `src/app/pages/Parametrages/role-categories/dtos/role-category-search-criteria.dto.ts`, `src/app/pages/Parametrages/role-categories/dtos/role-category-update.dto.ts`.
- Main logic: Handles role category CRUD, search, details, editing, and deletion.

### Parametrages - Teams

- Services: `src/app/pages/Parametrages/teams/service/team.service.ts`.
- Components/classes: `TeamDetailsComponent`, `TeamEditComponent`, `TeamFormComponent`, `TeamHierarchyComponent`, `TeamListComponent`.
- DTO/model files: `src/app/pages/Parametrages/teams/dtos/team-create.dto.ts`, `src/app/pages/Parametrages/teams/dtos/team-member-create.dto.ts`, `src/app/pages/Parametrages/teams/dtos/team-member-response.dto.ts`, `src/app/pages/Parametrages/teams/dtos/team-member-update.dto.ts`, `src/app/pages/Parametrages/teams/dtos/team-response.dto.ts`, `src/app/pages/Parametrages/teams/dtos/team-search-criteria.dto.ts`, `src/app/pages/Parametrages/teams/dtos/team-status.enum.ts`, `src/app/pages/Parametrages/teams/dtos/team-update.dto.ts`.
- Main logic: Handles team CRUD, project-scoped team routing, member add/update/remove, hierarchy/supervisor management, valid supervisor lookup, team status, CSV export, and details/edit pages.

### Portal

- Components/classes: `PortalComponent`.

## 7. Service Layer Detail

### src/app/core/services/rbac.service.ts

- Class: `RbacService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/rbac'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `loadCurrentUserPermissions` | `loadCurrentUserPermissions()` | `Observable<CurrentUserPermissions>` | GET `${this.apiUrl}/me`).pipe( -> CurrentUserPermissions |
| `hasPermission` | `hasPermission(moduleName: string, action: PermissionAction)` | `boolean` | Calls: permissionsState |
| `canRead` | `canRead(moduleName: string)` | `boolean` | Calls: hasPermission |
| `canCreate` | `canCreate(moduleName: string)` | `boolean` | Calls: hasPermission |
| `canUpdate` | `canUpdate(moduleName: string)` | `boolean` | Calls: hasPermission |
| `canDelete` | `canDelete(moduleName: string)` | `boolean` | Calls: hasPermission |
| `clear` | `clear()` | `void` | No direct HTTP call detected |

### src/app/layout/service/layout.service.ts

- Class: `LayoutService`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `handleDarkModeTransition` | `handleDarkModeTransition(config: LayoutConfig)` | `void` | Calls: startViewTransition, toggleDarkMode |
| `startViewTransition` | `startViewTransition(config: LayoutConfig)` | `void` | Calls: toggleDarkMode |
| `toggleDarkMode` | `toggleDarkMode(config?: LayoutConfig)` | `void` | Calls: layoutConfig |
| `onMenuToggle` | `onMenuToggle()` | `implicit` | Calls: isOverlay, layoutState, isDesktop |
| `showConfigSidebar` | `showConfigSidebar()` | `implicit` | No direct HTTP call detected |
| `hideConfigSidebar` | `hideConfigSidebar()` | `implicit` | No direct HTTP call detected |
| `isDesktop` | `isDesktop()` | `implicit` | No direct HTTP call detected |
| `isMobile` | `isMobile()` | `implicit` | Calls: isDesktop |

### src/app/pages/administration/roles/services/permissions.service.ts

- Class: `PermissionsService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/permissions'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `createPermission` | `createPermission(action: PermissionAction, moduleId: number)` | `Observable<PermissionResponseDTO>` | POST  -> PermissionResponseDTO |
| `updatePermission` | `updatePermission(id: number, action: PermissionAction, moduleId: number)` | `Observable<PermissionResponseDTO>` | PUT  -> PermissionResponseDTO |
| `deletePermission` | `deletePermission(id: number)` | `Observable<void>` | DELETE `${this.apiUrl}/${id}`) -> void |
| `getAllPermissions` | `getAllPermissions()` | `Observable<PermissionResponseDTO[]>` | GET this.apiUrl) -> PermissionResponseDTO[] |
| `getPermissionsByModule` | `getPermissionsByModule(moduleId: number)` | `Observable<PermissionResponseDTO[]>` | GET `${this.apiUrl}/module/${moduleId}`) -> PermissionResponseDTO[] |

### src/app/pages/administration/roles/services/role-permissions.service.ts

- Class: `RolePermissionsService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/role-permissions'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `assignPermissions` | `assignPermissions(dto: RolePermissionRequestDTO)` | `Observable<RolePermissionResponseDTO>` | POST this.apiUrl, dto) -> RolePermissionResponseDTO |
| `getPermissionsByRole` | `getPermissionsByRole(roleMetadataId: number)` | `Observable<RolePermissionResponseDTO>` | GET `${this.apiUrl}/${roleMetadataId}`) -> RolePermissionResponseDTO |
| `deleteAll` | `deleteAll(roleMetadataId: number)` | `Observable<void>` | DELETE `${this.apiUrl}/${roleMetadataId}`) -> void |
| `removePermission` | `removePermission(roleMetadataId: number, permissionId: number)` | `Observable<void>` | DELETE `${this.apiUrl}/${roleMetadataId}/${permissionId}`) -> void |

### src/app/pages/administration/roles/services/roles.service.ts

- Class: `RolesService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/roles'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `createRole` | `createRole(payload: RoleRequestDTO)` | `Observable<RoleResponseDTO>` | POST this.apiUrl, payload) -> RoleResponseDTO |
| `updateRole` | `updateRole(name: string, payload: RoleRequestDTO)` | `Observable<RoleResponseDTO>` | PUT `${this.apiUrl}/${name}`, payload) -> RoleResponseDTO |
| `deleteRole` | `deleteRole(name: string)` | `Observable<void>` | DELETE `${this.apiUrl}/${name}`) -> void |
| `getRoles` | `getRoles()` | `Observable<RoleResponseDTO[]>` | GET this.apiUrl) -> RoleResponseDTO[] |
| `searchRoles` | `searchRoles(criteria: RoleSearchCriteriaDTO, page: number, size: number)` | `Observable<RolePageDTO>` | GET `${this.apiUrl}/search`, { params }) -> RolePageDTO |
| `getRoleByName` | `getRoleByName(name: string)` | `Observable<RoleResponseDTO>` | GET `${this.apiUrl}/${name}`) -> RoleResponseDTO |
| `getManageableRoles` | `getManageableRoles()` | `Observable<RoleResponseDTO[]>` | GET `${this.apiUrl}/manageable`) -> RoleResponseDTO[] |

### src/app/pages/administration/tracability/service/trace-log.service.ts

- Class: `TraceLogService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `baseUrl` = `'http://localhost:8888/api/traces'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `search` | `search(searchDTO: TraceLogSearchDTO)` | `Observable<TraceLogPageResponseDTO>` | POST `${this.baseUrl}/search`, searchDTO) -> TraceLogPageResponseDTO |
| `archive` | `archive()` | `Observable<void>` | POST `${this.baseUrl}/archive`, {}) -> void |

### src/app/pages/administration/users/services/users.service.ts

- Class: `UsersService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/users'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `createUser` | `createUser(payload: UserCreateDTO)` | `Observable<UserResponseDTO>` | POST  -> UserResponseDTO |
| `updateUserAsAdmin` | `updateUserAsAdmin(id: string, payload: UserAdminUpdateDTO)` | `Observable<UserResponseDTO>` | PUT  -> UserResponseDTO |
| `updateUserProfile` | `updateUserProfile(id: string, payload: UserProfileUpdateDTO)` | `Observable<UserResponseDTO>` | PUT  -> UserResponseDTO |
| `changePassword` | `changePassword(id: string, payload: UserPasswordChangeDTO)` | `Observable<void>` | POST  -> void |
| `resetUserPassword` | `resetUserPassword(id: string)` | `Observable<void>` | POST  -> void |
| `forgotPassword` | `forgotPassword(email: string)` | `Observable<void>` | POST  -> void |
| `deleteUser` | `deleteUser(id: string)` | `Observable<void>` | DELETE  -> void |
| `assignRole` | `assignRole(userId: string, roleMetadataId: number)` | `Observable<UserResponseDTO>` | POST  -> UserResponseDTO |
| `getUserById` | `getUserById(id: string)` | `Observable<UserResponseDTO>` | GET  -> UserResponseDTO |
| `getAllUsers` | `getAllUsers(page: number, size: number)` | `Observable<PageResponse<UserResponseDTO>>` | No direct HTTP call detected |
| `searchUsers` | `searchUsers(criteria: UserSearchCriteria, page: number, size: number)` | `Observable<PageResponse<UserResponseDTO>>` | No direct HTTP call detected |
| `getByKeycloakId` | `getByKeycloakId(keycloakId: string)` | `Observable<UserResponseDTO>` | GET  -> UserResponseDTO |
| `getByMapperId` | `getByMapperId(id: number)` | `Observable<UserResponseDTO>` | GET  -> UserResponseDTO |
| `getUsersByDepartment` | `getUsersByDepartment(departmentId: number)` | `Observable<UserResponseDTO[]>` | GET  -> UserResponseDTO[] |
| `uploadAvatar` | `uploadAvatar(keycloakId: string, file: File)` | `Observable<{ photoUrl: string }>` | POST  -> { photoUrl: string } |
| `getUsersByIds` | `getUsersByIds(keycloakIds: string[])` | `Observable<UserResponseDTO[]>` | POST  -> UserResponseDTO[] |
| `getProfessions` | `getProfessions()` | `Observable<string[]>` | GET  -> string[] |
| `searchUsersPrioritized` | `searchUsersPrioritized(request: {
      criteria: UserSearchCriteria;
      priorityUserIds: string[];
    }, page: number, size: number)` | `Observable<PageResponse<UserResponseDTO>>` | No direct HTTP call detected |

### src/app/pages/Parametrages/departments/services/department.service.ts

- Class: `DepartmentService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `BASE_URL` = `'http://localhost:8888/api/departments'`.
- Endpoint constant/property: `USERS_URL` = `'http://localhost:8888/api/users'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `createDepartment` | `createDepartment(dto: CreateDepartmentRequestDTO)` | `Observable<DepartmentResponseDTO>` | POST this.BASE_URL, dto) -> DepartmentResponseDTO |
| `getById` | `getById(id: number)` | `Observable<DepartmentResponseDTO>` | GET `${this.BASE_URL}/${id}`) -> DepartmentResponseDTO |
| `getByCode` | `getByCode(code: string)` | `Observable<DepartmentResponseDTO>` | GET `${this.BASE_URL}/code/${code}`) -> DepartmentResponseDTO |
| `getAll` | `getAll()` | `Observable<DepartmentResponseDTO[]>` | GET this.BASE_URL) -> DepartmentResponseDTO[] |
| `searchDepartments` | `searchDepartments(criteria: DepartmentSearchCriteria, page: number, size: number)` | `Observable<PageResponse<DepartmentResponseDTO>>` | No direct HTTP call detected |
| `updateDepartment` | `updateDepartment(id: number, dto: UpdateDepartmentDTO)` | `Observable<DepartmentResponseDTO>` | PUT `${this.BASE_URL}/${id}`, dto) -> DepartmentResponseDTO |
| `activateDepartment` | `activateDepartment(id: number)` | `Observable<void>` | PATCH `${this.BASE_URL}/${id}/activate`, {}) -> void |
| `deactivateDepartment` | `deactivateDepartment(id: number)` | `Observable<void>` | PATCH `${this.BASE_URL}/${id}/deactivate`, {}) -> void |
| `getActiveDepartments` | `getActiveDepartments()` | `Observable<DepartmentResponseDTO[]>` | GET `${this.BASE_URL}/active`) -> DepartmentResponseDTO[] |
| `getActiveOperationalDepartments` | `getActiveOperationalDepartments()` | `Observable<DepartmentResponseDTO[]>` | GET `${this.BASE_URL}/operational/active`) -> DepartmentResponseDTO[] |
| `getUsersByDepartment` | `getUsersByDepartment(departmentId: number)` | `Observable<UserMapperResponseDTO[]>` | GET  -> UserMapperResponseDTO[] |
| `getOperationalDepartments` | `getOperationalDepartments()` | `Observable<DepartmentResponseDTO[]>` | GET `${this.BASE_URL}/operational`) -> DepartmentResponseDTO[] |

### src/app/pages/Parametrages/leave-balance/services/employee-leave-balance.service.ts

- Class: `EmployeeLeaveBalanceService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/leave-balances'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `getAll` | `getAll(page: number, size: number)` | `Observable<PageResponse<EmployeeLeaveBalanceResponseDTO>>` | No direct HTTP call detected |
| `search` | `search(criteria: EmployeeLeaveBalanceSearchDTO, page: number, size: number)` | `Observable<PageResponse<EmployeeLeaveBalanceResponseDTO>>` | No direct HTTP call detected |
| `getById` | `getById(id: number)` | `Observable<EmployeeLeaveBalanceResponseDTO>` | GET  -> EmployeeLeaveBalanceResponseDTO |
| `create` | `create(dto: EmployeeLeaveBalanceRequestDTO)` | `Observable<EmployeeLeaveBalanceResponseDTO>` | POST  -> EmployeeLeaveBalanceResponseDTO |
| `update` | `update(id: number, dto: EmployeeLeaveBalanceRequestDTO)` | `Observable<EmployeeLeaveBalanceResponseDTO>` | PUT  -> EmployeeLeaveBalanceResponseDTO |
| `deactivate` | `deactivate(id: number)` | `Observable<void>` | PATCH  -> void |
| `reactivate` | `reactivate(id: number)` | `Observable<EmployeeLeaveBalanceResponseDTO>` | PATCH  -> EmployeeLeaveBalanceResponseDTO |

### src/app/pages/Parametrages/leave-request-types/services/leave-type.service.ts

- Class: `LeaveTypeService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `baseUrl` = `'http://localhost:8888/api/leave-types'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `create` | `create(payload: LeaveTypeRequestDTO)` | `Observable<LeaveTypeResponseDTO>` | POST this.baseUrl, payload) -> LeaveTypeResponseDTO |
| `update` | `update(id: number, payload: LeaveTypeRequestDTO)` | `Observable<LeaveTypeResponseDTO>` | PUT `${this.baseUrl}/${id}`, payload) -> LeaveTypeResponseDTO |
| `getById` | `getById(id: number)` | `Observable<LeaveTypeResponseDTO>` | GET `${this.baseUrl}/${id}`) -> LeaveTypeResponseDTO |
| `search` | `search(filters: LeaveTypeSearchDTO, page: number, size: number)` | `Observable<PageResponse<LeaveTypeResponseDTO>>` | No direct HTTP call detected |
| `deactivate` | `deactivate(id: number)` | `Observable<void>` | PATCH `${this.baseUrl}/${id}/deactivate`, {}) -> void |
| `reactivate` | `reactivate(id: number)` | `Observable<LeaveTypeResponseDTO>` | PATCH `${this.baseUrl}/${id}/reactivate`, {}) -> LeaveTypeResponseDTO |

### src/app/pages/Parametrages/modules/services/modules.service.ts

- Class: `ModulesService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/modules'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `getModules` | `getModules()` | `Observable<ModuleResponseDTO[]>` | GET this.apiUrl) -> ModuleResponseDTO[] |
| `getModuleByName` | `getModuleByName(name: string)` | `Observable<ModuleResponseDTO>` | GET `${this.apiUrl}/name/${name}`) -> ModuleResponseDTO |
| `createModule` | `createModule(payload: ModuleRequestDTO)` | `Observable<ModuleResponseDTO>` | POST  -> ModuleResponseDTO |
| `updateModule` | `updateModule(id: number, newName: string)` | `Observable<ModuleResponseDTO>` | PUT  -> ModuleResponseDTO |
| `deleteModule` | `deleteModule(id: number)` | `Observable<void>` | DELETE `${this.apiUrl}/${id}`) -> void |

### src/app/pages/Parametrages/professions/services/profession.service.ts

- Class: `ProfessionService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/professions'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `create` | `create(dto: ProfessionCreateDTO)` | `Observable<ProfessionResponseDTO>` | POST  -> ProfessionResponseDTO |
| `update` | `update(id: number, dto: ProfessionUpdateDTO)` | `Observable<ProfessionResponseDTO>` | PUT  -> ProfessionResponseDTO |
| `getById` | `getById(id: number)` | `Observable<ProfessionResponseDTO>` | GET  -> ProfessionResponseDTO |
| `activate` | `activate(id: number)` | `Observable<void>` | PATCH  -> void |
| `deactivate` | `deactivate(id: number)` | `Observable<void>` | PATCH  -> void |
| `search` | `search(criteria: ProfessionSearchCriteriaDTO, page: number, size: number)` | `Observable<any>` | POST  -> any |
| `getActiveByDepartment` | `getActiveByDepartment(idDepartment: number)` | `Observable<ProfessionResponseDTO[]>` | GET  -> ProfessionResponseDTO[] |
| `getSelectableByDepartment` | `getSelectableByDepartment(idDepartment: number)` | `Observable<ProfessionResponseDTO[]>` | GET  -> ProfessionResponseDTO[] |

### src/app/pages/Parametrages/project-roles/services/project-role.service.ts

- Class: `ProjectRoleService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/project-roles'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `create` | `create(payload: ProjectRoleCreateDTO)` | `Observable<ProjectRoleResponseDTO>` | POST this.apiUrl, payload) -> ProjectRoleResponseDTO |
| `update` | `update(id: number, payload: ProjectRoleUpdateDTO)` | `Observable<ProjectRoleResponseDTO>` | PUT `${this.apiUrl}/${id}`, payload) -> ProjectRoleResponseDTO |
| `getById` | `getById(id: number)` | `Observable<ProjectRoleResponseDTO>` | GET `${this.apiUrl}/${id}`) -> ProjectRoleResponseDTO |
| `getAll` | `getAll(page: number, size: number)` | `Observable<PageResponse<ProjectRoleResponseDTO>>` | No direct HTTP call detected |
| `search` | `search(criteria: ProjectRoleSearchCriteriaDTO, page: number, size: number)` | `Observable<PageResponse<ProjectRoleResponseDTO>>` | No direct HTTP call detected |
| `delete` | `delete(id: number)` | `Observable<void>` | DELETE `${this.apiUrl}/${id}`) -> void |

### src/app/pages/Parametrages/projects/services/project.service.ts

- Class: `ProjectService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/projects'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `create` | `create(payload: ProjectCreateDTO)` | `Observable<ProjectResponseDTO>` | POST this.apiUrl, payload) -> ProjectResponseDTO |
| `update` | `update(id: number, payload: ProjectUpdateDTO)` | `Observable<ProjectResponseDTO>` | PUT `${this.apiUrl}/${id}`, payload) -> ProjectResponseDTO |
| `getById` | `getById(id: number)` | `Observable<ProjectResponseDTO>` | GET `${this.apiUrl}/${id}`) -> ProjectResponseDTO |
| `getAll` | `getAll(page: number, size: number)` | `Observable<PageResponse<ProjectResponseDTO>>` | No direct HTTP call detected |
| `search` | `search(criteria: ProjectSearchCriteriaDTO, page: number, size: number)` | `Observable<PageResponse<ProjectResponseDTO>>` | No direct HTTP call detected |
| `delete` | `delete(id: number)` | `Observable<void>` | DELETE `${this.apiUrl}/${id}`) -> void |
| `assignTeam` | `assignTeam(projectId: number, teamId: number)` | `Observable<ProjectResponseDTO>` | POST  -> ProjectResponseDTO |
| `removeTeam` | `removeTeam(projectId: number)` | `Observable<ProjectResponseDTO>` | DELETE  -> ProjectResponseDTO |
| `assignDepartment` | `assignDepartment(projectId: number, departmentId: number, assignedBy?: string)` | `Observable<ProjectResponseDTO>` | POST  -> ProjectResponseDTO |
| `removeDepartment` | `removeDepartment(projectId: number, departmentId: number)` | `Observable<ProjectResponseDTO>` | DELETE  -> ProjectResponseDTO |
| `changeStatus` | `changeStatus(projectId: number, status: ProjectStatus)` | `Observable<ProjectResponseDTO>` | PATCH  -> ProjectResponseDTO |

### src/app/pages/Parametrages/role-categories/services/role-category.service.ts

- Class: `RoleCategoryService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/role-categories'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `create` | `create(payload: RoleCategoryCreateDTO)` | `Observable<RoleCategoryResponseDTO>` | POST this.apiUrl, payload) -> RoleCategoryResponseDTO |
| `update` | `update(id: number, payload: RoleCategoryUpdateDTO)` | `Observable<RoleCategoryResponseDTO>` | PUT `${this.apiUrl}/${id}`, payload) -> RoleCategoryResponseDTO |
| `getById` | `getById(id: number)` | `Observable<RoleCategoryResponseDTO>` | GET `${this.apiUrl}/${id}`) -> RoleCategoryResponseDTO |
| `getAll` | `getAll(page: number, size: number)` | `Observable<PageResponse<RoleCategoryResponseDTO>>` | No direct HTTP call detected |
| `search` | `search(criteria: RoleCategorySearchCriteriaDTO, page: number, size: number)` | `Observable<PageResponse<RoleCategoryResponseDTO>>` | No direct HTTP call detected |
| `delete` | `delete(id: number)` | `Observable<void>` | DELETE `${this.apiUrl}/${id}`) -> void |

### src/app/pages/Parametrages/teams/service/team.service.ts

- Class: `TeamService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'http://localhost:8888/api/teams'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `create` | `create(payload: TeamCreateDTO)` | `Observable<TeamResponseDTO>` | POST this.apiUrl, payload) -> TeamResponseDTO |
| `update` | `update(id: number, payload: TeamUpdateDTO)` | `Observable<TeamResponseDTO>` | PUT `${this.apiUrl}/${id}`, payload) -> TeamResponseDTO |
| `getById` | `getById(id: number)` | `Observable<TeamResponseDTO>` | GET `${this.apiUrl}/${id}`) -> TeamResponseDTO |
| `getAll` | `getAll(page: number, size: number)` | `Observable<PageResponse<TeamResponseDTO>>` | No direct HTTP call detected |
| `search` | `search(criteria: TeamSearchCriteriaDTO, page: number, size: number)` | `Observable<PageResponse<TeamResponseDTO>>` | No direct HTTP call detected |
| `delete` | `delete(id: number)` | `Observable<void>` | DELETE `${this.apiUrl}/${id}`) -> void |
| `addMember` | `addMember(teamId: number, payload: TeamMemberCreateDTO)` | `Observable<TeamResponseDTO>` | POST `${this.apiUrl}/${teamId}/members`, payload) -> TeamResponseDTO |
| `updateMember` | `updateMember(teamId: number, memberId: number, payload: TeamMemberUpdateDTO)` | `Observable<TeamResponseDTO>` | PUT  -> TeamResponseDTO |
| `removeMember` | `removeMember(teamId: number, memberId: number)` | `Observable<TeamResponseDTO>` | DELETE `${this.apiUrl}/${teamId}/members/${memberId}`) -> TeamResponseDTO |
| `getFreeTeams` | `getFreeTeams(page: number, size: number)` | `Observable<PageResponse<TeamResponseDTO>>` | Calls: search |
| `saveHierarchy` | `saveHierarchy(teamId: number, hierarchy: { memberId: number; supervisorId?: number | null }[])` | `Observable<TeamResponseDTO>` | PUT  -> TeamResponseDTO |
| `getValidSupervisors` | `getValidSupervisors(teamId: number, memberId: number)` | `Observable<TeamMemberResponseDTO[]>` | GET  -> TeamMemberResponseDTO[] |

### src/app/pages/service/country.service.ts

- Class: `CountryService`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `getData` | `getData()` | `implicit` | No direct HTTP call detected |
| `getCountries` | `getCountries()` | `implicit` | Calls: getData |

### src/app/pages/service/customer.service.ts

- Class: `CustomerService`.
- Constructor injections: `http: HttpClient`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `getData` | `getData()` | `implicit` | No direct HTTP call detected |
| `getCustomersMini` | `getCustomersMini()` | `implicit` | Calls: getData |
| `getCustomersSmall` | `getCustomersSmall()` | `implicit` | Calls: getData |
| `getCustomersMedium` | `getCustomersMedium()` | `implicit` | Calls: getData |
| `getCustomersLarge` | `getCustomersLarge()` | `implicit` | Calls: getData |
| `getCustomersXLarge` | `getCustomersXLarge()` | `implicit` | Calls: getData |
| `getCustomers` | `getCustomers(params?: any)` | `implicit` | GET 'https://www.primefaces.org/data/customers', { params: params }).toPromise() -> any |

### src/app/pages/service/icon.service.ts

- Class: `IconService`.
- Constructor injections: `http: HttpClient`.
- Endpoint constant/property: `apiUrl` = `'assets/demo/data/icons.json'`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `getIcons` | `getIcons()` | `implicit` | No direct HTTP call detected |

### src/app/pages/service/node.service.ts

- Class: `NodeService`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `getTreeNodesData` | `getTreeNodesData()` | `implicit` | No direct HTTP call detected |
| `getTreeTableNodesData` | `getTreeTableNodesData()` | `implicit` | No direct HTTP call detected |
| `getLazyNodesData` | `getLazyNodesData()` | `implicit` | No direct HTTP call detected |
| `getFileSystemNodesData` | `getFileSystemNodesData()` | `implicit` | No direct HTTP call detected |
| `getDynamicTreeNodes` | `getDynamicTreeNodes(parentCount: number, childrenCount: number)` | `TreeNode[]` | No direct HTTP call detected |
| `getLargeTreeNodes` | `getLargeTreeNodes()` | `implicit` | Calls: getDynamicTreeNodes |
| `getTreeTableNodes` | `getTreeTableNodes()` | `implicit` | Calls: getTreeTableNodesData |
| `getTreeNodes` | `getTreeNodes()` | `implicit` | Calls: getTreeNodesData |
| `getFiles` | `getFiles()` | `implicit` | Calls: getTreeNodesData |
| `getLazyFiles` | `getLazyFiles()` | `implicit` | Calls: getLazyNodesData |
| `getFilesystem` | `getFilesystem()` | `implicit` | Calls: getFileSystemNodesData |

### src/app/pages/service/photo.service.ts

- Class: `PhotoService`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `getData` | `getData()` | `implicit` | No direct HTTP call detected |
| `getImages` | `getImages()` | `implicit` | Calls: getData |

### src/app/pages/service/product.service.ts

- Class: `ProductService`.
- Constructor injections: `http: HttpClient`.

| Method | Signature | Return | HTTP / Internal Logic |
|---|---|---|---|
| `getProductsData` | `getProductsData()` | `implicit` | No direct HTTP call detected |
| `getProductsWithOrdersData` | `getProductsWithOrdersData()` | `implicit` | No direct HTTP call detected |
| `getProductsMini` | `getProductsMini()` | `implicit` | Calls: getProductsData |
| `getProductsSmall` | `getProductsSmall()` | `implicit` | Calls: getProductsData |
| `getProducts` | `getProducts()` | `implicit` | Calls: getProductsData |
| `getProductsWithOrdersSmall` | `getProductsWithOrdersSmall()` | `implicit` | Calls: getProductsWithOrdersData |
| `generatePrduct` | `generatePrduct()` | `Product` | Calls: generateId, generateName, generatePrice, generateQuantity, generateStatus, generateRating |
| `generateId` | `generateId()` | `implicit` | No direct HTTP call detected |
| `generateName` | `generateName()` | `implicit` | No direct HTTP call detected |
| `generatePrice` | `generatePrice()` | `implicit` | No direct HTTP call detected |
| `generateQuantity` | `generateQuantity()` | `implicit` | No direct HTTP call detected |
| `generateStatus` | `generateStatus()` | `implicit` | No direct HTTP call detected |
| `generateRating` | `generateRating()` | `implicit` | No direct HTTP call detected |

## 8. DTOs, Models, Enums, and Types

### src/app/core/models/rbac.model.ts

- Type `PermissionAction`: `'CREATE' \| 'READ' \| 'UPDATE' \| 'DELETE'`.

#### CurrentUserPermissions

| Field | Type | Optional |
|---|---|---:|
| `roleMetadataId` | `number` | no |
| `roleName` | `string` | no |
| `roleLevel` | `number` | no |
| `isSystemRole` | `boolean` | no |
| `permissions` | `Record<string, PermissionAction[]>` | no |

### src/app/pages/administration/roles/models/permissions-models/permission-action.enum.ts

- Enum `PermissionAction`: `CREATE = 'CREATE'`, `READ = 'READ'`, `UPDATE = 'UPDATE'`, `DELETE = 'DELETE'`.

### src/app/pages/administration/roles/models/permissions-models/permission-request.dto.ts

#### PermissionRequestDTO

| Field | Type | Optional |
|---|---|---:|
| `action` | `PermissionAction` | no |
| `moduleId` | `number` | no |

### src/app/pages/administration/roles/models/permissions-models/permission-response.dto.ts

#### PermissionResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `action` | `PermissionAction` | no |
| `moduleId` | `number` | no |
| `moduleName` | `string` | no |

### src/app/pages/administration/roles/models/role-models/role-page.dto.ts

#### RolePageDTO

| Field | Type | Optional |
|---|---|---:|
| `content` | `RoleResponseDTO[]` | no |
| `totalElements` | `number` | no |
| `totalPages` | `number` | no |
| `size` | `number` | no |
| `number` | `number` | no |
| `last` | `boolean` | no |
| `first` | `boolean` | no |
| `numberOfElements` | `number` | no |
| `empty` | `boolean` | no |

### src/app/pages/administration/roles/models/role-models/role-request.dto.ts

#### RoleRequestDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | no |
| `level` | `number` | no |
| `description` | `string` | yes |

### src/app/pages/administration/roles/models/role-models/role-response.dto.ts

#### RoleResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `keycloakRoleId` | `string` | yes |
| `name` | `string` | no |
| `level` | `number` | no |
| `description` | `string` | yes |
| `isSystemRole` | `boolean` | yes |
| `createdAt` | `string` | yes |
| `updatedAt` | `string` | yes |

### src/app/pages/administration/roles/models/role-models/role-search-criteria.dto.ts

#### RoleSearchCriteriaDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `isSystemRole` | `boolean \| null` | yes |

### src/app/pages/administration/roles/models/role-premission/role-permission-request.dto.ts

#### RolePermissionRequestDTO

| Field | Type | Optional |
|---|---|---:|
| `roleMetadataId` | `number` | no |
| `permissionIds` | `number[]` | no |

### src/app/pages/administration/roles/models/role-premission/role-permission-response.dto.ts

#### RolePermissionResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `roleMetadataId` | `number` | no |
| `roleName` | `string` | no |
| `roleLevel` | `number` | no |
| `permissions` | `PermissionResponseDTO[]` | no |

### src/app/pages/administration/tracability/models/trace-log-page-response.dto.ts

#### TraceLogPageResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `content` | `TraceLogResponseDTO[]` | no |
| `currentPage` | `number` | no |
| `totalPages` | `number` | no |
| `totalElements` | `number` | no |
| `first` | `boolean` | no |
| `last` | `boolean` | no |
| `pageSize` | `number` | no |

### src/app/pages/administration/tracability/models/trace-log-response.dto.ts

#### TraceLogResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `userId` | `string` | no |
| `username` | `string` | no |
| `serviceName` | `string` | no |
| `method` | `string` | no |
| `endpoint` | `string` | no |
| `ipAddress` | `string` | no |
| `statusCode` | `number` | no |
| `result` | `string` | no |
| `latency` | `number` | no |
| `timestamp` | `string` | no |

### src/app/pages/administration/tracability/models/trace-log-search.dto.ts

#### TraceLogSearchDTO

| Field | Type | Optional |
|---|---|---:|
| `username` | `string` | yes |
| `serviceName` | `string` | yes |
| `method` | `string` | yes |
| `endpoint` | `string` | yes |
| `ipAddress` | `string` | yes |
| `statusCode` | `number` | yes |
| `from` | `string` | yes |
| `to` | `string` | yes |
| `page` | `number` | no |
| `size` | `number` | no |

### src/app/pages/administration/users/models/page-response.dto.ts

#### PageResponse

| Field | Type | Optional |
|---|---|---:|
| `content` | `T[]` | no |
| `totalElements` | `number` | no |
| `totalPages` | `number` | no |
| `size` | `number` | no |
| `number` | `number` | no |
| `first` | `boolean` | no |
| `last` | `boolean` | no |
| `empty` | `boolean` | no |

### src/app/pages/administration/users/models/user-admin-update.dto.ts

#### UserAdminUpdateDTO

| Field | Type | Optional |
|---|---|---:|
| `firstName` | `string` | no |
| `lastName` | `string` | no |
| `email` | `string` | no |
| `phone` | `string` | no |
| `photoUrl` | `string` | yes |
| `sex` | `'Male' \| 'Female'` | no |
| `cin` | `string` | no |
| `hireDate` | `string` | no |
| `professionId` | `number` | no |
| `isActive` | `boolean` | no |
| `roleMetadataId` | `number` | no |
| `departmentId` | `number` | yes |

### src/app/pages/administration/users/models/user-create.dto.ts

#### UserCreateDTO

| Field | Type | Optional |
|---|---|---:|
| `username` | `string` | no |
| `firstName` | `string` | no |
| `lastName` | `string` | no |
| `email` | `string` | no |
| `isActive` | `boolean` | no |
| `cin` | `string` | no |
| `phone` | `string` | no |
| `photoUrl` | `string` | yes |
| `sex` | `'Male' \| 'Female'` | no |
| `hireDate` | `string` | no |
| `professionId` | `number` | no |
| `roleMetadataId` | `number` | no |
| `departmentId` | `number` | yes |

### src/app/pages/administration/users/models/user-password-change.dto.ts

#### UserPasswordChangeDTO

| Field | Type | Optional |
|---|---|---:|
| `currentPassword` | `string` | no |
| `newPassword` | `string` | no |
| `confirmPassword` | `string` | no |

### src/app/pages/administration/users/models/user-profile-update.dto.ts

#### UserProfileUpdateDTO

| Field | Type | Optional |
|---|---|---:|
| `firstName` | `string` | no |
| `lastName` | `string` | no |
| `email` | `string` | no |
| `phone` | `string` | no |
| `photoUrl` | `string` | yes |
| `sex` | `'Male' \| 'Female'` | no |
| `hireDate` | `string` | no |
| `profession` | `string` | no |

### src/app/pages/administration/users/models/user-response.dto.ts

#### UserResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `keycloakId` | `string` | no |
| `username` | `string` | no |
| `firstName` | `string` | no |
| `lastName` | `string` | no |
| `email` | `string` | no |
| `emailVerified` | `boolean` | no |
| `isActive` | `boolean` | no |
| `cin` | `string` | yes |
| `phone` | `string` | yes |
| `photoUrl` | `string` | yes |
| `sex` | `'Male' \| 'Female'` | yes |
| `hireDate` | `string` | yes |
| `professionId` | `number \| null` | yes |
| `professionName` | `string \| null` | yes |
| `professionCode` | `string \| null` | yes |
| `roleMetadataId` | `number` | yes |
| `roleName` | `string` | yes |
| `roleLevel` | `number` | yes |
| `departmentId` | `number` | yes |
| `departmentName` | `string` | yes |
| `departmentCode` | `string` | yes |
| `departmentType` | `string` | yes |

### src/app/pages/administration/users/models/UserSearchCriteria.dto.ts

#### UserSearchCriteria

| Field | Type | Optional |
|---|---|---:|
| `username` | `string` | yes |
| `firstName` | `string` | yes |
| `lastName` | `string` | yes |
| `cin` | `string` | yes |
| `sex` | `'Male' \| 'Female'` | yes |
| `professionId` | `number` | yes |
| `roleMetadataId` | `number` | yes |
| `isActive` | `boolean` | yes |
| `emailVerified` | `boolean` | yes |
| `departmentId` | `number` | yes |
| `departmentIds` | `number[]` | yes |
| `hireDateFrom` | `string` | yes |
| `hireDateTo` | `string` | yes |

### src/app/pages/Parametrages/departments/dtos/create-department-request.dto.ts

#### CreateDepartmentRequestDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | no |
| `code` | `string` | no |
| `description` | `string` | no |
| `location` | `string` | no |
| `phoneNumber` | `string` | no |
| `email` | `string` | no |
| `type` | `DepartmentType` | no |
| `chefKeycloakId` | `string \| null` | yes |

### src/app/pages/Parametrages/departments/dtos/department-response.dto.ts

#### DepartmentResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `name` | `string` | no |
| `code` | `string` | no |
| `description` | `string` | yes |
| `location` | `string` | yes |
| `phoneNumber` | `string` | yes |
| `email` | `string` | yes |
| `type` | `DepartmentType` | no |
| `chefKeycloakId` | `string \| null` | yes |
| `chefDepartment` | `UserMapperResponseDTO \| null` | yes |
| `active` | `boolean` | no |
| `createdAt` | `string` | no |
| `updatedAt` | `string` | no |
| `users` | `UserMapperResponseDTO[]` | no |

### src/app/pages/Parametrages/departments/dtos/department-search-criteria.dto.ts

#### DepartmentSearchCriteria

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `code` | `string` | yes |
| `localisation` | `string` | yes |
| `isActive` | `boolean \| null` | yes |
| `type` | `string \| null` | yes |

### src/app/pages/Parametrages/departments/dtos/department-type.ts

- Type `DepartmentType`: `'OPERATIONAL' \| 'SUPPORT'`.

### src/app/pages/Parametrages/departments/dtos/page-response.dto.ts

#### PageResponse

| Field | Type | Optional |
|---|---|---:|
| `content` | `T[]` | no |
| `totalElements` | `number` | no |
| `totalPages` | `number` | no |
| `size` | `number` | no |
| `number` | `number` | no |
| `first` | `boolean` | no |
| `last` | `boolean` | no |
| `empty` | `boolean` | no |

### src/app/pages/Parametrages/departments/dtos/update-department.dto.ts

#### UpdateDepartmentDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `description` | `string` | yes |
| `location` | `string` | yes |
| `phoneNumber` | `string` | yes |
| `email` | `string` | yes |
| `chefKeycloakId` | `string \| null` | yes |

### src/app/pages/Parametrages/departments/dtos/user-mapper-response.dto.ts

#### UserMapperResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number \| null` | yes |
| `keycloakId` | `string \| null` | yes |
| `username` | `string \| null` | yes |
| `firstName` | `string \| null` | yes |
| `lastName` | `string \| null` | yes |
| `email` | `string \| null` | yes |
| `emailVerified` | `boolean \| null` | yes |
| `photoUrl` | `string \| null` | yes |
| `professionId` | `number \| null` | yes |
| `professionName` | `string \| null` | yes |
| `professionCode` | `string \| null` | yes |
| `phone` | `string \| null` | yes |
| `sex` | `string \| null` | yes |
| `hireDate` | `string \| null` | yes |
| `isActive` | `boolean \| null` | yes |
| `roleMetadataId` | `number \| null` | yes |
| `roleName` | `string \| null` | yes |
| `roleLevel` | `number \| null` | yes |
| `departmentId` | `number \| null` | yes |
| `departmentName` | `string \| null` | yes |
| `departmentCode` | `string \| null` | yes |
| `departmentType` | `string \| null` | yes |

### src/app/pages/Parametrages/leave-balance/dtos/employee-leave-balance-request.dto.ts

#### EmployeeLeaveBalanceRequestDTO

| Field | Type | Optional |
|---|---|---:|
| `idEmployee` | `number` | no |
| `idLeaveType` | `number` | no |
| `year` | `number` | no |
| `currentBalance` | `number` | no |

### src/app/pages/Parametrages/leave-balance/dtos/employee-leave-balance-response.dto.ts

#### EmployeeLeaveBalanceResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `idBalance` | `number` | no |
| `idEmployee` | `number` | no |
| `employee` | `UserResponseDTO \| null` | yes |
| `leaveType` | `LeaveTypeResponseDTO` | no |
| `year` | `number` | no |
| `currentBalance` | `number` | no |
| `usedBalance` | `number` | no |
| `remainingBalance` | `number` | no |
| `active` | `boolean` | no |
| `createdAt` | `string` | no |
| `updatedAt` | `string` | no |

### src/app/pages/Parametrages/leave-balance/dtos/employee-leave-balance-search.dto.ts

#### EmployeeLeaveBalanceSearchDTO

| Field | Type | Optional |
|---|---|---:|
| `idEmployee` | `number \| null` | yes |
| `idLeaveType` | `number \| null` | yes |
| `year` | `number \| null` | yes |
| `active` | `boolean \| null` | yes |

### src/app/pages/Parametrages/leave-balance/dtos/page-response.dto.ts

#### PageResponse

| Field | Type | Optional |
|---|---|---:|
| `content` | `T[]` | no |
| `totalElements` | `number` | no |
| `totalPages` | `number` | no |
| `size` | `number` | no |
| `number` | `number` | no |
| `first` | `boolean` | no |
| `last` | `boolean` | no |
| `empty` | `boolean` | no |

### src/app/pages/Parametrages/leave-request-types/dtos/leave-increment-mode.ts

- Type `LeaveIncrementMode`: `'NONE' \| 'MONTHLY' \| 'YEARLY' \| 'FIXED'`.

### src/app/pages/Parametrages/leave-request-types/dtos/leave-type-request.dto.ts

#### LeaveTypeRequestDTO

| Field | Type | Optional |
|---|---|---:|
| `code` | `string` | no |
| `name` | `string` | no |
| `description` | `string` | yes |
| `unit` | `LeaveUnit` | no |
| `incrementMode` | `LeaveIncrementMode` | no |
| `defaultBalance` | `number` | no |
| `monthlyIncrement` | `number` | no |
| `yearlyAllowance` | `number` | no |
| `maxBalance` | `number` | no |
| `carryOverEnabled` | `boolean` | no |
| `requiresJustification` | `boolean` | no |
| `requiresApproval` | `boolean` | no |

### src/app/pages/Parametrages/leave-request-types/dtos/leave-type-response.dto.ts

#### LeaveTypeResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `idLeaveType` | `number` | no |
| `code` | `string` | no |
| `name` | `string` | no |
| `description` | `string` | yes |
| `unit` | `LeaveUnit` | no |
| `incrementMode` | `LeaveIncrementMode` | no |
| `defaultBalance` | `number` | no |
| `monthlyIncrement` | `number` | no |
| `yearlyAllowance` | `number` | no |
| `maxBalance` | `number` | no |
| `carryOverEnabled` | `boolean` | no |
| `requiresJustification` | `boolean` | no |
| `requiresApproval` | `boolean` | no |
| `active` | `boolean` | no |
| `createdAt` | `string` | no |
| `updatedAt` | `string` | no |

### src/app/pages/Parametrages/leave-request-types/dtos/leave-type-search.dto.ts

#### LeaveTypeSearchDTO

| Field | Type | Optional |
|---|---|---:|
| `keyword` | `string` | yes |
| `unit` | `LeaveUnit \| null` | yes |
| `incrementMode` | `LeaveIncrementMode \| null` | yes |
| `active` | `boolean \| null` | yes |

### src/app/pages/Parametrages/leave-request-types/dtos/leave-unit.ts

- Type `LeaveUnit`: `'DAY' \| 'MONTH'`.

### src/app/pages/Parametrages/leave-request-types/dtos/page-response.dto.ts

#### PageResponse

| Field | Type | Optional |
|---|---|---:|
| `content` | `T[]` | no |
| `totalElements` | `number` | no |
| `totalPages` | `number` | no |
| `size` | `number` | no |
| `number` | `number` | no |
| `first` | `boolean` | no |
| `last` | `boolean` | no |
| `empty` | `boolean` | no |

### src/app/pages/Parametrages/modules/models/ModuleRequestDTO.ts

#### ModuleRequestDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | no |

### src/app/pages/Parametrages/modules/models/ModuleResponseDTO.ts

#### ModuleResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `name` | `string` | no |

### src/app/pages/Parametrages/professions/dtos/profession-create.dto.ts

#### ProfessionCreateDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | no |
| `code` | `string` | no |
| `idDepartment` | `number` | no |
| `uniqueByDepartment` | `boolean` | yes |

### src/app/pages/Parametrages/professions/dtos/profession-response.dto.ts

#### ProfessionResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `idProfession` | `number` | no |
| `name` | `string` | no |
| `code` | `string` | no |
| `idDepartment` | `number` | no |
| `departmentName` | `string` | yes |
| `departmentCode` | `string` | yes |
| `departmentType` | `string` | yes |
| `uniqueByDepartment` | `boolean` | yes |
| `active` | `boolean` | no |
| `createdAt` | `string` | yes |
| `updatedAt` | `string` | yes |

### src/app/pages/Parametrages/professions/dtos/profession-search-criteria.dto.ts

#### ProfessionSearchCriteriaDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `code` | `string` | yes |
| `idDepartment` | `number` | yes |
| `active` | `boolean` | yes |
| `uniqueByDepartment` | `boolean` | yes |

### src/app/pages/Parametrages/professions/dtos/profession-update.dto.ts

#### ProfessionUpdateDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `code` | `string` | yes |
| `idDepartment` | `number` | yes |
| `uniqueByDepartment` | `boolean` | yes |

### src/app/pages/Parametrages/project-roles/dtos/project-role-create.dto.ts

#### ProjectRoleCreateDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | no |
| `description` | `string` | yes |
| `uniqueRole` | `boolean` | yes |
| `hierarchyLevel` | `number` | no |
| `roleCategoryId` | `number` | no |

### src/app/pages/Parametrages/project-roles/dtos/project-role-response.dto.ts

#### ProjectRoleResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `name` | `string` | no |
| `description` | `string` | yes |
| `uniqueRole` | `boolean` | no |
| `hierarchyLevel` | `number` | no |
| `active` | `boolean` | no |
| `roleCategoryId` | `number` | yes |
| `roleCategoryName` | `string` | yes |
| `roleCategoryColor` | `string` | yes |
| `createdAt` | `string` | yes |
| `updatedAt` | `string` | yes |

### src/app/pages/Parametrages/project-roles/dtos/project-role-search-criteria.dto.ts

#### ProjectRoleSearchCriteriaDTO

| Field | Type | Optional |
|---|---|---:|
| `keyword` | `string` | yes |
| `uniqueRole` | `boolean` | yes |
| `active` | `boolean` | yes |
| `roleCategoryId` | `number` | yes |
| `hierarchyLevel` | `number` | yes |

### src/app/pages/Parametrages/project-roles/dtos/project-role-update.dto.ts

#### ProjectRoleUpdateDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `description` | `string` | yes |
| `uniqueRole` | `boolean` | yes |
| `hierarchyLevel` | `number` | yes |
| `roleCategoryId` | `number` | yes |

### src/app/pages/Parametrages/projects/dtos/page-response.dto.ts

#### PageResponse

| Field | Type | Optional |
|---|---|---:|
| `content` | `T[]` | no |
| `totalElements` | `number` | no |
| `totalPages` | `number` | no |
| `size` | `number` | no |
| `number` | `number` | no |
| `first` | `boolean` | no |
| `last` | `boolean` | no |
| `empty` | `boolean` | no |

### src/app/pages/Parametrages/projects/dtos/project-create.dto.ts

#### ProjectCreateDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `description` | `string` | yes |
| `startDate` | `string` | yes |
| `endDate` | `string` | yes |
| `budget` | `number` | yes |
| `clientName` | `string` | yes |

### src/app/pages/Parametrages/projects/dtos/project-response.dto.ts

#### ProjectResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `name` | `string` | yes |
| `description` | `string` | yes |
| `status` | `ProjectStatus` | no |
| `startDate` | `string` | yes |
| `endDate` | `string` | yes |
| `budget` | `number` | yes |
| `clientName` | `string` | yes |
| `active` | `boolean` | no |
| `teamId` | `number` | yes |
| `teamName` | `string` | yes |
| `departmentIds` | `number[]` | yes |
| `createdAt` | `string` | yes |
| `updatedAt` | `string` | yes |

### src/app/pages/Parametrages/projects/dtos/project-search-criteria.dto.ts

#### ProjectSearchCriteriaDTO

| Field | Type | Optional |
|---|---|---:|
| `keyword` | `string` | yes |
| `status` | `ProjectStatus` | yes |
| `startDateFrom` | `string` | yes |
| `endDateTo` | `string` | yes |
| `clientName` | `string` | yes |
| `teamId` | `number` | yes |

### src/app/pages/Parametrages/projects/dtos/project-status-update.dto.ts

#### ProjectStatusUpdateDTO

| Field | Type | Optional |
|---|---|---:|
| `status` | `ProjectStatus` | no |

### src/app/pages/Parametrages/projects/dtos/project-status.enum.ts

- Enum `ProjectStatus`: `DRAFT = 'DRAFT'`, `READY = 'READY'`, `RUNNING = 'RUNNING'`, `ON_HOLD = 'ON_HOLD'`, `ENDED = 'ENDED'`, `CANCELLED = 'CANCELLED'`.

### src/app/pages/Parametrages/projects/dtos/project-update.dto.ts

#### ProjectUpdateDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `description` | `string` | yes |
| `status` | `ProjectStatus` | yes |
| `startDate` | `string` | yes |
| `endDate` | `string` | yes |
| `budget` | `number` | yes |
| `clientName` | `string` | yes |

### src/app/pages/Parametrages/role-categories/dtos/role-category-create.dto.ts

#### RoleCategoryCreateDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | no |
| `description` | `string` | yes |
| `color` | `string` | yes |

### src/app/pages/Parametrages/role-categories/dtos/role-category-response.dto.ts

#### RoleCategoryResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `name` | `string` | no |
| `description` | `string` | yes |
| `color` | `string` | yes |
| `active` | `boolean` | yes |
| `createdAt` | `string` | yes |
| `updatedAt` | `string` | yes |

### src/app/pages/Parametrages/role-categories/dtos/role-category-search-criteria.dto.ts

#### RoleCategorySearchCriteriaDTO

| Field | Type | Optional |
|---|---|---:|
| `keyword` | `string` | yes |
| `active` | `boolean` | yes |

### src/app/pages/Parametrages/role-categories/dtos/role-category-update.dto.ts

#### RoleCategoryUpdateDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `description` | `string` | yes |
| `color` | `string` | yes |

### src/app/pages/Parametrages/teams/dtos/team-create.dto.ts

#### TeamCreateDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `description` | `string` | yes |

### src/app/pages/Parametrages/teams/dtos/team-member-create.dto.ts

#### TeamMemberCreateDTO

| Field | Type | Optional |
|---|---|---:|
| `userId` | `string` | no |
| `supervisorId` | `number` | yes |
| `projectRoleId` | `number` | no |

### src/app/pages/Parametrages/teams/dtos/team-member-response.dto.ts

#### TeamMemberResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `userId` | `string` | no |
| `supervisorId` | `number` | yes |
| `supervisorUserId` | `string` | yes |
| `projectRoleId` | `number` | yes |
| `projectRoleName` | `string` | yes |
| `hierarchyLevel` | `number` | yes |
| `roleCategoryName` | `string` | yes |
| `roleCategoryColor` | `string` | yes |
| `createdAt` | `string` | yes |
| `updatedAt` | `string` | yes |

### src/app/pages/Parametrages/teams/dtos/team-member-update.dto.ts

#### TeamMemberUpdateDTO

| Field | Type | Optional |
|---|---|---:|
| `supervisorId` | `number` | yes |
| `projectRoleId` | `number` | yes |

### src/app/pages/Parametrages/teams/dtos/team-response.dto.ts

#### TeamResponseDTO

| Field | Type | Optional |
|---|---|---:|
| `id` | `number` | no |
| `name` | `string` | yes |
| `description` | `string` | yes |
| `status` | `TeamStatus` | no |
| `projectId` | `number` | yes |
| `projectName` | `string` | yes |
| `members` | `TeamMemberResponseDTO[]` | no |
| `createdAt` | `string` | yes |
| `updatedAt` | `string` | yes |

### src/app/pages/Parametrages/teams/dtos/team-search-criteria.dto.ts

#### TeamSearchCriteriaDTO

| Field | Type | Optional |
|---|---|---:|
| `keyword` | `string` | yes |
| `status` | `TeamStatus` | yes |
| `projectId` | `number` | yes |

### src/app/pages/Parametrages/teams/dtos/team-status.enum.ts

- Type `TeamStatus`: `'FREE' \| 'ASSIGNED'`.

### src/app/pages/Parametrages/teams/dtos/team-update.dto.ts

#### TeamUpdateDTO

| Field | Type | Optional |
|---|---|---:|
| `name` | `string` | yes |
| `description` | `string` | yes |

## 9. Component and UI Layer Detail

This section lists the extracted Angular component/layout classes, their templates/imports, important state properties, methods, and template-level PrimeNG/control hints.

### src/app.component.ts

- Class: `AppComponent`.
- Selector: `app-root`.
- Standalone: `true`.
- Angular/PrimeNG imports: `RouterModule`.
### src/app/layout/component/app.breadcrumb.ts

- Class: `AppBreadcrumb`.
- Selector: `app-breadcrumb`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `RouterModule`.
- Constructor injections: `router: Router`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `items` | `BreadcrumbItem[]` | `[]` |
| `destroy$` | `implicit` | `new Subject<void>()` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | buildBreadcrumb |
| `ngOnDestroy` | `ngOnDestroy()` | `void` | ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); } |
| `buildBreadcrumb` | `buildBreadcrumb(url: string)` | `void` | addParametragesBreadcrumb, addAdministrationBreadcrumb, formatUnknownSegment |
| `addParametragesBreadcrumb` | `addParametragesBreadcrumb(items: BreadcrumbItem[], segments: string[], cleanUrl: string)` | `void` | formatUnknownSegment |
| `addAdministrationBreadcrumb` | `addAdministrationBreadcrumb(items: BreadcrumbItem[], segments: string[], cleanUrl: string)` | `void` | formatUnknownSegment |
| `formatUnknownSegment` | `formatUnknownSegment(value?: string)` | `string` | private formatUnknownSegment(value?: string): string { if (!value) return 'Page'; return value .replace(/-/g, ' ') .r... |

### src/app/layout/component/app.configurator.ts

- Class: `AppConfigurator`.
- Selector: `app-configurator`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `SelectButtonModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `router` | `implicit` | `inject(Router)` |
| `config` | `PrimeNG` | `inject(PrimeNG)` |
| `layoutService` | `LayoutService` | `inject(LayoutService)` |
| `platformId` | `implicit` | `inject(PLATFORM_ID)` |
| `primeng` | `implicit` | `inject(PrimeNG)` |
| `presets` | `implicit` | `Object.keys(presets)` |
| `showMenuModeButton` | `implicit` | `signal(!this.router.url.includes('auth'))` |
| `menuModeOptions` | `implicit` | `[ { label: 'Static', value: 'static' }, { label: 'Overlay', value: 'overlay' } ]` |
| `surfaces` | `SurfacesType[]` | `[ { name: 'slate', palette: { 0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f...` |
| `selectedPrimaryColor` | `implicit` | `computed(() => { return this.layoutService.layoutConfig().primary; })` |
| `selectedSurfaceColor` | `implicit` | `computed(() => this.layoutService.layoutConfig().surface)` |
| `selectedPreset` | `implicit` | `computed(() => this.layoutService.layoutConfig().preset)` |
| `menuMode` | `implicit` | `computed(() => this.layoutService.layoutConfig().menuMode)` |
| `primaryColors` | `implicit` | `computed<SurfacesType[]>(() => { const presetPalette = presets[this.layoutService.layou...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | onPresetChange |
| `getPresetExt` | `getPresetExt()` | `implicit` | primaryColors, selectedPrimaryColor |
| `updateColors` | `updateColors(event: any, type: string, color: any)` | `implicit` | applyTheme |
| `applyTheme` | `applyTheme(type: string, color: any)` | `implicit` | getPresetExt |
| `onPresetChange` | `onPresetChange(event: any)` | `implicit` | selectedSurfaceColor, getPresetExt |
| `onMenuModeChange` | `onMenuModeChange(event: string)` | `implicit` | onMenuModeChange(event: string) { this.layoutService.layoutConfig.update((prev) => ({ ...prev, menuMode: event })); } |

### src/app/layout/component/app.floatingconfigurator.ts

- Class: `AppFloatingConfigurator`.
- Selector: `app-floating-configurator`.
- Angular/PrimeNG imports: `CommonModule`, `ButtonModule`, `StyleClassModule`, `AppConfigurator`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `LayoutService` | `implicit` | `inject(LayoutService)` |
| `float` | `implicit` | `input<boolean>(true)` |
| `isDarkTheme` | `implicit` | `computed(() => this.LayoutService.layoutConfig().darkTheme)` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `toggleDarkMode` | `toggleDarkMode()` | `implicit` | toggleDarkMode() { this.LayoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme })); } |

### src/app/layout/component/app.footer.ts

- Class: `AppFooter`.
- Selector: `app-footer`.
- Standalone: `true`.
### src/app/layout/component/app.layout.ts

- Class: `AppLayout`.
- Selector: `app-layout`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `RouterModule`, `AppTopbar`, `AppSidebar`, `AppFooter`, `AppBreadcrumb`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `layoutService` | `implicit` | `inject(LayoutService)` |
| `containerClass` | `implicit` | `computed(() => { const config = this.layoutService.layoutConfig(); const state = this.l...` |

### src/app/layout/component/app.menu.ts

- Class: `AppMenu`.
- Selector: `app-menu`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `AppMenuitem`, `RouterModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `rbac` | `implicit` | `inject(RbacService)` |
| `model` | `MenuItem[]` | `[]` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.model = [ { label: 'Statistiques', items: [ { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerL... |

### src/app/layout/component/app.menuitem.ts

- Class: `AppMenuitem`.
- Selector: `[app-menuitem]`.
- Angular/PrimeNG imports: `CommonModule`, `RouterModule`, `RippleModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `layoutService` | `implicit` | `inject(LayoutService)` |
| `router` | `implicit` | `inject(Router)` |
| `item` | `implicit` | `input<any>(null)` |
| `root` | `implicit` | `input<boolean>(false)` |
| `parentPath` | `implicit` | `input<string | null>(null)` |
| `isVisible` | `implicit` | `computed(() => this.item()?.visible !== false)` |
| `hasChildren` | `implicit` | `computed(() => this.item()?.items && this.item()?.items.length > 0)` |
| `hasRouterLink` | `implicit` | `computed(() => !!this.item()?.routerLink)` |
| `fullPath` | `implicit` | `computed(() => { const itemPath = this.item()?.path; if (!itemPath) return this.parentP...` |
| `isActive` | `implicit` | `computed(() => { const activePath = this.layoutService.layoutState().activePath; if (th...` |
| `initialized` | `implicit` | `signal<boolean>(false)` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | item, updateActiveStateFromRoute |
| `ngAfterViewInit` | `ngAfterViewInit()` | `implicit` | ngAfterViewInit() { setTimeout(() => { this.initialized.set(true); }); } |
| `updateActiveStateFromRoute` | `updateActiveStateFromRoute()` | `implicit` | item, parentPath |
| `itemClick` | `itemClick(event: Event)` | `implicit` | item, hasChildren, isActive, parentPath, fullPath |

### src/app/layout/component/app.sidebar.ts

- Class: `AppSidebar`.
- Selector: `app-sidebar`.
- Standalone: `true`.
- Angular/PrimeNG imports: `AppMenu`, `RouterModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `layoutService` | `implicit` | `inject(LayoutService)` |
| `router` | `implicit` | `inject(Router)` |
| `el` | `implicit` | `inject(ElementRef)` |
| `outsideClickListener` | `((event: MouseEvent) => void) \| null` | `null` |
| `destroy$` | `implicit` | `new Subject<void>()` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | onRouteChange |
| `ngOnDestroy` | `ngOnDestroy()` | `implicit` | unbindOutsideClickListener |
| `onRouteChange` | `onRouteChange(path: string)` | `implicit` | private onRouteChange(path: string) { this.layoutService.layoutState.update((val) => ({ ...val, activePath: path, ove... |
| `bindOutsideClickListener` | `bindOutsideClickListener()` | `implicit` | isOutsideClicked |
| `unbindOutsideClickListener` | `unbindOutsideClickListener()` | `implicit` | private unbindOutsideClickListener() { if (this.outsideClickListener) { document.removeEventListener('click', this.ou... |
| `isOutsideClicked` | `isOutsideClicked(event: MouseEvent)` | `boolean` | private isOutsideClicked(event: MouseEvent): boolean { const topbarButtonEl = document.querySelector('.topbar-start >... |

### src/app/layout/component/app.topbar.ts

- Class: `AppTopbar`.
- Selector: `app-topbar`.
- Standalone: `true`.
- Angular/PrimeNG imports: `RouterModule`, `CommonModule`, `StyleClassModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `items` | `MenuItem[]` |  |
| `router` | `implicit` | `inject(Router)` |
| `layoutService` | `implicit` | `inject(LayoutService)` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `toggleDarkMode` | `toggleDarkMode()` | `implicit` | toggleDarkMode() { this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme })); } |
| `logout` | `logout()` | `implicit` | logout() { localStorage.removeItem('token'); localStorage.removeItem('authToken'); this.router.navigate(['/portal']); } |

### src/app/pages/administration/roles/role-details/role-details.ts

- Class: `RolesDetailsComponent`.
- Selector: `app-role-details`.
- Template: `./role-details.html`.
- Styles: `['./role-details.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`.
- Constructor injections: `route: ActivatedRoute`, `modulesService: ModulesService`, `permissionsService: PermissionsService`, `rolePermissionsService: RolePermissionsService`, `rolesService: RolesService`, `cd: ChangeDetectorRef`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `roleName` | `string` |  |
| `roleId` | `number` |  |
| `role` | `RoleResponseDTO` |  |
| `modules` | `ModuleResponseDTO[]` | `[]` |
| `permissions` | `PermissionResponseDTO[]` | `[]` |
| `rolePermissions` | `PermissionResponseDTO[]` | `[]` |
| `expandedModuleId` | `number \| null` | `null` |
| `loading` | `implicit` | `true` |
| `actions` | `implicit` | `[ PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAc...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadData |
| `loadData` | `loadData()` | `void` | loadData(): void { this.loading = true; // step 1 — load modules this.modulesService.getModules().subscribe({ next: (... |
| `toggleModule` | `toggleModule(moduleId: number)` | `void` | toggleModule(moduleId: number): void { this.expandedModuleId = this.expandedModuleId === moduleId ? null : moduleId; ... |
| `getPermission` | `getPermission(moduleId: number, action: PermissionAction)` | `PermissionResponseDTO \| undefined` | getPermission( moduleId: number, action: PermissionAction ): PermissionResponseDTO \| undefined { return this.permissi... |
| `hasRolePermission` | `hasRolePermission(permissionId: number)` | `boolean` | hasRolePermission(permissionId: number): boolean { return this.rolePermissions.some(p => p.id === permissionId); } |

Template bindings/events/directives detected: `ngIf`, `ngFor`, `click`.

Visible/action labels detected: `Role Details`, `Role Name :`, `Modules and Permissions`, `Chargement...`, `Create`, `Read`, `Update`, `Delete`.

### src/app/pages/administration/roles/roles-edit/roles-edit.ts

- Class: `RolesEditComponent`.
- Selector: `app-roles-edit`.
- Template: `./roles-edit.html`.
- Styles: `['./roles-edit.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ToastModule`, `ButtonModule`, `InputTextModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `rolesService: RolesService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `originalName` | `implicit` | `''` |
| `loading` | `implicit` | `true` |
| `saving` | `implicit` | `false` |
| `form` | `RoleRequestDTO` | `{ name: '', level: 0, description: '' }` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | ngOnInit(): void { const name = this.route.snapshot.paramMap.get('name'); if (!name) { this.router.navigate(['/admini... |
| `save` | `save(formRef: NgForm)` | `void` | save(formRef: NgForm): void { if (formRef.invalid) return; this.saving = true; this.rolesService.updateRole(this.orig... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['/administration/roles']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `ngSubmit`, `loading`, `onClick`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Modifier le Rôle`, `Informations du rôle`, `Nom du rôle *`, `Niveau (0 - 100) *`, `Description`, `Règles de modification`, `Le nom ne peut pas être renommé en`, `SUPER_ADMIN`, `ou`, `ADMIN`, `Sauvegarder`, `Retour`.

### src/app/pages/administration/roles/roles-form/roles-form.ts

- Class: `RolesFormComponent`.
- Selector: `app-roles-form`.
- Template: `./roles-form.html`.
- Styles: `['./roles-form.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`.
- Constructor injections: `router: Router`, `rolesService: RolesService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `saving` | `implicit` | `false` |
| `form` | `RoleRequestDTO` | `{ name: '', level: 0, description: '' }` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `save` | `save(formRef: NgForm)` | `void` | back |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['/administration/roles']); } |

Template PrimeNG elements: `p-button`.

Template bindings/events/directives detected: `ngSubmit`, `ngIf`, `loading`, `onClick`.

Visible/action labels detected: `Ajouter un Rôle`, `Informations du rôle`, `Nom du rôle *`, `Niveau (0 - 100) *`, `Description`, `Règles de création`, `Le nom ne peut pas être`, `SUPER_ADMIN`, `ou`, `ADMIN`, `Le nom doit être unique dans le système`, `Sauvegarder`, `Retour`.

### src/app/pages/administration/roles/roles-list/roles-list.ts

- Class: `RolesListComponent`.
- Selector: `app-roles-list`.
- Template: `./roles-list.html`.
- Styles: `['./roles-list.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `rolesService: RolesService`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`, `rbacService: RbacService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `Math` | `implicit` | `Math` |
| `typeFilter` | `implicit` | `''` |
| `roles` | `RoleResponseDTO[]` | `[]` |
| `searchCriteria` | `RoleSearchCriteriaDTO` | `{ name: '', isSystemRole: null }` |
| `loading` | `implicit` | `true` |
| `deleting` | `implicit` | `false` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `5` |
| `totalElements` | `implicit` | `0` |
| `totalPages` | `implicit` | `0` |
| `isLastPage` | `implicit` | `false` |
| `showConfirm` | `implicit` | `false` |
| `roleToDelete` | `RoleResponseDTO \| null` | `null` |
| `MODULE_NAME` | `implicit` | `'gestion des roles'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadRoles |
| `canCreate` | `canCreate()` | `boolean` | canCreate(): boolean { return this.rbacService.canCreate(this.MODULE_NAME); } |
| `canUpdate` | `canUpdate()` | `boolean` | canUpdate(): boolean { return this.rbacService.canUpdate(this.MODULE_NAME); } |
| `canDelete` | `canDelete()` | `boolean` | canDelete(): boolean { return this.rbacService.canDelete(this.MODULE_NAME); } |
| `loadRoles` | `loadRoles()` | `void` | loadRoles(): void { this.loading = true; this.cd.detectChanges(); this.rolesService.searchRoles(this.searchCriteria, ... |
| `onSearchChange` | `onSearchChange()` | `void` | loadRoles |
| `onTypeChange` | `onTypeChange(value: string)` | `void` | loadRoles |
| `previousPage` | `previousPage()` | `void` | loadRoles |
| `nextPage` | `nextPage()` | `void` | loadRoles |
| `goToPage` | `goToPage(page: number)` | `void` | loadRoles |
| `goToCreate` | `goToCreate()` | `void` | goToCreate(): void { this.router.navigate(['/administration/roles/new']); } |
| `goToEdit` | `goToEdit(name: string)` | `void` | goToEdit(name: string): void { this.router.navigate(['/administration/roles', name, 'edit']); } |
| `goToDetails` | `goToDetails(name: string)` | `void` | goToDetails(name: string): void { this.router.navigate(['/administration/roles', name, 'details']); } |
| `goToPermissions` | `goToPermissions(roleId: number)` | `void` | goToPermissions(roleId: number): void { this.router.navigate(['/administration/roles', roleId, 'permissions']); } |
| `deleteRole` | `deleteRole(role: RoleResponseDTO)` | `void` | deleteRole(role: RoleResponseDTO): void { if (role.isSystemRole) { this.messageService.add({ severity: 'warn', summar... |
| `cancelDelete` | `cancelDelete()` | `void` | cancelDelete(): void { this.roleToDelete = null; this.showConfirm = false; this.cd.detectChanges(); } |
| `confirmDelete` | `confirmDelete()` | `void` | loadRoles |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `click`, `loading`, `onClick`, `disabled`, `input`, `ngFor`.

Visible/action labels detected: `Confirmer la suppression`, `Cette action ne peut pas être annulée`, `Conditions de suppression`, `Supprimer`, `Annuler`, `Liste des rôles`, `Ajouter`, `Type`, `Tous`, `Système`, `Personnalisé`, `Nom`, `Niveau`, `Actions`, `Chargement...`, `Précédent`, `Suivant`.

### src/app/pages/administration/roles/roles-permissions-management/roles-permissions-management.ts

- Class: `RolesPermissionsManagementComponent`.
- Selector: `app-roles-permissions-management`.
- Template: `./roles-permissions-management.html`.
- Styles: `['./roles-permissions-management.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ToastModule`, `ButtonModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `modulesService: ModulesService`, `permissionsService: PermissionsService`, `rolePermissionsService: RolePermissionsService`, `rolesService: RolesService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `roleId` | `number` |  |
| `role` | `RoleResponseDTO` |  |
| `modules` | `ModuleResponseDTO[]` | `[]` |
| `filteredModules` | `ModuleResponseDTO[]` | `[]` |
| `permissions` | `PermissionResponseDTO[]` | `[]` |
| `selectedPermissions` | `Set<number>` | `new Set()` |
| `searchTerm` | `implicit` | `''` |
| `loading` | `implicit` | `true` |
| `saving` | `implicit` | `false` |
| `expandedModuleId` | `number \| null` | `null` |
| `actions` | `string[]` | `['CREATE', 'READ', 'UPDATE', 'DELETE']` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadData |
| `loadData` | `loadData()` | `void` | loadRoleInfo |
| `loadRoleInfo` | `loadRoleInfo()` | `void` | loadRolePermissions |
| `loadRolePermissions` | `loadRolePermissions()` | `void` | loadRolePermissions(): void { this.rolePermissionsService.getPermissionsByRole(this.roleId).subscribe({ next: (rp) =>... |
| `filterModules` | `filterModules()` | `void` | filterModules(): void { const term = this.searchTerm.toLowerCase().trim(); this.filteredModules = !term ? [...this.mo... |
| `getPermission` | `getPermission(moduleId: number, action: string)` | `PermissionResponseDTO \| undefined` | getPermission(moduleId: number, action: string): PermissionResponseDTO \| undefined { return this.permissions.find( p ... |
| `getPermissionsForModule` | `getPermissionsForModule(moduleId: number)` | `PermissionResponseDTO[]` | getPermissionsForModule(moduleId: number): PermissionResponseDTO[] { return this.permissions.filter(p => p.moduleId =... |
| `isChecked` | `isChecked(permissionId?: number)` | `boolean` | isChecked(permissionId?: number): boolean { return permissionId != null ? this.selectedPermissions.has(permissionId) ... |
| `togglePermission` | `togglePermission(permission?: PermissionResponseDTO)` | `void` | togglePermission(permission?: PermissionResponseDTO): void { if (!permission) return; const isCurrentlyChecked = this... |
| `toggleModule` | `toggleModule(moduleId: number)` | `void` | toggleModule(moduleId: number): void { this.expandedModuleId = this.expandedModuleId === moduleId ? null : moduleId; ... |
| `getCheckedCount` | `getCheckedCount(moduleId: number)` | `number` | getPermissionsForModule |
| `selectAllModule` | `selectAllModule(moduleId: number)` | `void` | getPermissionsForModule |
| `clearAllModule` | `clearAllModule(moduleId: number)` | `void` | getPermissionsForModule |
| `savePermissions` | `savePermissions()` | `void` | savePermissions(): void { if (!this.selectedPermissions.size) { this.messageService.add({ severity: 'warn', summary: ... |
| `cleanAllPermissions` | `cleanAllPermissions()` | `void` | cleanAllPermissions(): void { if (!confirm('Supprimer toutes les permissions de ce rôle ?')) return; this.rolePermiss... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['/administration/roles']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `input`, `loading`, `onClick`, `ngFor`, `click`.

Visible/action labels detected: `Gestion des Permissions`, `Chargement des données...`, `Permissions du rôle`, `Sauvegarder`, `Tout supprimer`, `Retour`, `Aucun module trouvé`, `Tout sélectionner`, `Tout désélectionner`, `N/A`.

### src/app/pages/administration/tracability/traceability/traceability.ts

- Class: `TraceLogListComponent`.
- Selector: `app-trace-log-list`.
- Template: `./traceability.html`.
- Styles: `['./traceability.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `TableModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `traceLogService: TraceLogService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `rows` | `TraceLogResponseDTO[]` | `[]` |
| `loading` | `implicit` | `false` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `10` |
| `totalElements` | `implicit` | `0` |
| `totalPages` | `implicit` | `0` |
| `filters` | `{
    username: string;
    serviceName: string;
    method: string;
    endpoint: string;
    ipAddress: string;
    statusCode: number \| null;
    from: string;
    to: string;
  }` | `{ username: '', serviceName: '', method: '', endpoint: '', ipAddress: '', statusCode: n...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadPage |
| `toLocalDateTimeString` | `toLocalDateTimeString(value: string)` | `string \| undefined` | private toLocalDateTimeString(value: string): string \| undefined { if (!value) return undefined; // datetime-local in... |
| `buildSearchDTO` | `buildSearchDTO(page: number)` | `TraceLogSearchDTO` | toLocalDateTimeString |
| `loadPage` | `loadPage(page: number)` | `void` | buildSearchDTO |
| `search` | `search()` | `void` | loadPage |
| `reset` | `reset()` | `void` | loadPage |
| `onPageChange` | `onPageChange(event: any)` | `void` | loadPage |
| `getStatusClass` | `getStatusClass(statusCode: number)` | `string` | getStatusClass(statusCode: number): string { if (!statusCode) return 'unknown-status'; if (statusCode >= 200 && statu... |
| `exportCsv` | `exportCsv()` | `void` | exportCsv(): void { if (!this.rows.length) { this.messageService.add({ severity: 'warn', summary: 'Attention', detail... |

Template PrimeNG elements: `p-toast`, `p-button`, `p-table`.

Template bindings/events/directives detected: `onClick`, `input`, `value`, `loading`, `onPage`.

Visible/action labels detected: `Filtre de recherche`, `Méthode`, `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `Rechercher`, `Réinitialiser`, `Liste traces`, `Utilisateur`, `Service`, `Chemin`, `Adresse IP`, `Statut`, `Résultat`.

### src/app/pages/administration/users/user-details/user-details.component.ts

- Class: `UserDetailsComponent`.
- Selector: `app-user-details`.
- Template: `./user-details.component.html`.
- Styles: `['./user-details.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `RouterModule`, `ButtonModule`, `TooltipModule`.
- Constructor injections: `route: ActivatedRoute`, `usersService: UsersService`, `cd: ChangeDetectorRef`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `user` | `UserResponseDTO` |  |
| `loading` | `implicit` | `true` |
| `photo` | `implicit` | `''` |
| `defaultMale` | `implicit` | `'assets/images/default-user-male.png'` |
| `defaultFemale` | `implicit` | `'assets/images/default-user-female.png'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | resolvePhoto |
| `resolvePhoto` | `resolvePhoto(u: UserResponseDTO)` | `string` | private resolvePhoto(u: UserResponseDTO): string { if (u.photoUrl && u.photoUrl.trim() !== '') return u.photoUrl; ret... |
| `onPhotoError` | `onPhotoError()` | `void` | onPhotoError(): void { this.photo = this.user?.sex === 'Female' ? this.defaultFemale : this.defaultMale; this.cd.dete... |
| `getLevelClass` | `getLevelClass(level: number | undefined)` | `string` | getLevelClass(level: number \| undefined): string { if (!level) return 'level-default'; if (level >= 80) return 'level... |

Template bindings/events/directives detected: `ngIf`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Utilisateur introuvable`, `Aucun utilisateur trouvé.`, `Informations Personnelles`, `Nom`, `Prénom`, `Username`, `Sexe`, `CIN`, `Date d'embauche`, `Informations Professionnelles`, `Profession`, `Rôle`, `Niveau`, `Statut`, `Email vérifié`, `Vérifié`.

### src/app/pages/administration/users/user-edit/user-edit.ts

- Class: `UserEditComponent`.
- Selector: `app-user-edit`.
- Template: `./user-edit.html`.
- Styles: `['./user-edit.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `usersService: UsersService`, `rolesService: RolesService`, `departmentService: DepartmentService`, `professionService: ProfessionService`, `cdr: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `fileInput` | `ElementRef<HTMLInputElement>` |  |
| `userId` | `string` |  |
| `loading` | `implicit` | `true` |
| `saving` | `implicit` | `false` |
| `uploading` | `implicit` | `false` |
| `rolesLoading` | `implicit` | `false` |
| `departmentsLoading` | `implicit` | `false` |
| `professionsLoading` | `implicit` | `false` |
| `today` | `implicit` | `new Date().toISOString().split('T')[0]` |
| `sexOptions` | `('Male' \| 'Female')[]` | `['Male', 'Female']` |
| `manageableRoles` | `RoleResponseDTO[]` | `[]` |
| `departments` | `DepartmentResponseDTO[]` | `[]` |
| `professions` | `ProfessionResponseDTO[]` | `[]` |
| `showDepartment` | `implicit` | `false` |
| `defaultMale` | `implicit` | `'assets/images/default-user-male.png'` |
| `defaultFemale` | `implicit` | `'assets/images/default-user-female.png'` |
| `photoPreview` | `implicit` | `'assets/images/default-user-male.png'` |
| `form` | `UserAdminUpdateDTO` | `{ firstName: '', lastName: '', email: '', phone: '', cin: '', photoUrl: '', sex: 'Male'...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadManageableRoles, loadDepartments, loadUser |
| `onSexChange` | `onSexChange()` | `void` | onSexChange(): void { if (!this.form.photoUrl?.trim()) { this.photoPreview = this.form.sex === 'Female' ? this.defaul... |
| `onPreviewError` | `onPreviewError()` | `void` | onPreviewError(): void { this.photoPreview = this.form.sex === 'Female' ? this.defaultFemale : this.defaultMale; this... |
| `triggerFilePicker` | `triggerFilePicker()` | `void` | triggerFilePicker(): void { this.fileInput.nativeElement.value = ''; this.fileInput.nativeElement.click(); } |
| `onFileSelected` | `onFileSelected(event: Event)` | `void` | showError |
| `removePhoto` | `removePhoto()` | `void` | removePhoto(): void { this.form.photoUrl = ''; this.photoPreview = this.form.sex === 'Female' ? this.defaultFemale : ... |
| `loadManageableRoles` | `loadManageableRoles()` | `void` | loadManageableRoles(): void { this.rolesLoading = true; this.rolesService.getManageableRoles().subscribe({ next: (rol... |
| `loadDepartments` | `loadDepartments()` | `void` | loadDepartments(): void { this.departmentsLoading = true; this.departmentService.getActiveDepartments().subscribe({ n... |
| `loadUser` | `loadUser()` | `void` | parseSex, loadProfessionsByDepartment |
| `onRoleChange` | `onRoleChange(roleId: number)` | `void` | onRoleChange(roleId: number): void { const selected = this.manageableRoles.find(r => r.id === roleId); if (selected &... |
| `onDepartmentChange` | `onDepartmentChange(departmentId: number)` | `void` | loadProfessionsByDepartment |
| `loadProfessionsByDepartment` | `loadProfessionsByDepartment(departmentId: number, selectedProfessionId?: number)` | `void` | showError |
| `save` | `save(formRef: NgForm)` | `void` | showError |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |
| `parseSex` | `parseSex(value?: string)` | `'Male' \| 'Female'` | private parseSex(value?: string): 'Male' \| 'Female' { return value === 'Female' ? 'Female' : 'Male'; } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `ngSubmit`, `click`, `disabled`, `ngFor`, `value`, `loading`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Modifier Utilisateur`, `Photo de profil`, `PNG, JPG ou WEBP · max 2 Mo`, `Informations utilisateur`, `Nom *`, `Nom requis`, `Prénom *`, `Prénom requis`, `Email *`, `Email invalide`, `Téléphone *`, `CIN *`, `Sexe *`, `Date d'embauche *`, `Date invalide`, `Statut *`.

### src/app/pages/administration/users/user-form/user-form.component.ts

- Class: `UserFormComponent`.
- Selector: `app-user-form`.
- Template: `./user-form.component.html`.
- Styles: `['./user-form.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `router: Router`, `usersService: UsersService`, `rolesService: RolesService`, `departmentService: DepartmentService`, `professionService: ProfessionService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `fileInput` | `ElementRef<HTMLInputElement>` |  |
| `sexOptions` | `('Male' \| 'Female')[]` | `['Male', 'Female']` |
| `manageableRoles` | `RoleResponseDTO[]` | `[]` |
| `departments` | `DepartmentResponseDTO[]` | `[]` |
| `professions` | `ProfessionResponseDTO[]` | `[]` |
| `rolesLoading` | `implicit` | `false` |
| `departmentsLoading` | `implicit` | `false` |
| `professionsLoading` | `implicit` | `false` |
| `saving` | `implicit` | `false` |
| `uploading` | `implicit` | `false` |
| `showDepartment` | `implicit` | `false` |
| `defaultMale` | `implicit` | `'assets/images/default-user-male.png'` |
| `defaultFemale` | `implicit` | `'assets/images/default-user-female.png'` |
| `photoPreview` | `implicit` | `'assets/images/default-user-male.png'` |
| `pendingFile` | `File \| null` | `null` |
| `form` | `UserCreateDTO` | `{ username: '', firstName: '', lastName: '', email: '', isActive: true, cin: '', phone:...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadManageableRoles, loadDepartments |
| `triggerFilePicker` | `triggerFilePicker()` | `void` | triggerFilePicker(): void { this.fileInput.nativeElement.value = ''; this.fileInput.nativeElement.click(); } |
| `onFileSelected` | `onFileSelected(event: Event)` | `void` | showError |
| `removePhoto` | `removePhoto()` | `void` | removePhoto(): void { this.pendingFile = null; this.form.photoUrl = ''; this.photoPreview = this.form.sex === 'Female... |
| `onSexChange` | `onSexChange()` | `void` | onSexChange(): void { if (!this.pendingFile && !this.form.photoUrl?.trim()) { this.photoPreview = this.form.sex === '... |
| `onPreviewError` | `onPreviewError()` | `void` | onPreviewError(): void { this.photoPreview = this.form.sex === 'Female' ? this.defaultFemale : this.defaultMale; this... |
| `loadManageableRoles` | `loadManageableRoles()` | `void` | loadManageableRoles(): void { this.rolesLoading = true; this.cd.detectChanges(); this.rolesService.getManageableRoles... |
| `loadDepartments` | `loadDepartments()` | `void` | loadDepartments(): void { this.departmentsLoading = true; this.cd.detectChanges(); this.departmentService.getActiveDe... |
| `onRoleChange` | `onRoleChange(roleId: number)` | `void` | onRoleChange(roleId: number): void { const selected = this.manageableRoles.find(r => r.id === roleId); if (selected &... |
| `onDepartmentChange` | `onDepartmentChange(departmentId: number)` | `void` | loadProfessionsByDepartment |
| `loadProfessionsByDepartment` | `loadProfessionsByDepartment(departmentId: number)` | `void` | showError |
| `save` | `save()` | `void` | showError |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `click`, `disabled`, `ngIf`, `ngFor`, `value`, `onClick`, `loading`.

Visible/action labels detected: `Ajouter Utilisateur`, `Photo de profil`, `PNG, JPG ou WEBP · max 2 Mo`, `Informations utilisateur`, `Username *`, `Nom *`, `Prénom *`, `Email *`, `CIN *`, `Téléphone *`, `Sexe *`, `Date d'embauche *`, `Statut *`, `Actif`, `Inactif`, `Rôle *`, `Département *`, `Profession *`.

### src/app/pages/administration/users/users-list/users-list.component.ts

- Class: `UsersListComponent`.
- Selector: `app-users-list`.
- Template: `./users-list.component.html`.
- Styles: `['./users-list.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `RouterModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `TooltipModule`.
- Providers: `MessageService`.
- Constructor injections: `usersService: UsersService`, `rolesService: RolesService`, `departmentService: DepartmentService`, `professionService: ProfessionService`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`, `rbacService: RbacService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `rows` | `UserResponseDTO[]` | `[]` |
| `loading` | `implicit` | `false` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `7` |
| `totalElements` | `implicit` | `0` |
| `totalPages` | `implicit` | `0` |
| `isSearchMode` | `implicit` | `false` |
| `lastCriteria` | `UserSearchCriteria` | `{}` |
| `showDeleteConfirm` | `implicit` | `false` |
| `userToDelete` | `UserResponseDTO \| null` | `null` |
| `deleting` | `implicit` | `false` |
| `defaultMale` | `implicit` | `'assets/images/default-user-male.png'` |
| `defaultFemale` | `implicit` | `'assets/images/default-user-female.png'` |
| `filters` | `UserSearchCriteria` | `{ firstName: '', lastName: '', isActive: undefined, emailVerified: undefined, professio...` |
| `professions` | `ProfessionResponseDTO[]` | `[]` |
| `roles` | `RoleResponseDTO[]` | `[]` |
| `departments` | `DepartmentResponseDTO[]` | `[]` |
| `loadingProfessions` | `implicit` | `false` |
| `loadingRoles` | `implicit` | `false` |
| `loadingDepartments` | `implicit` | `false` |
| `destroy$` | `implicit` | `new Subject<void>()` |
| `MODULE_NAME` | `implicit` | `'gestion des utilisateurs'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadDropdowns, loadAll |
| `ngOnDestroy` | `ngOnDestroy()` | `void` | ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); } |
| `canCreate` | `canCreate()` | `boolean` | canCreate(): boolean { return this.rbacService.canCreate(this.MODULE_NAME); } |
| `canUpdate` | `canUpdate()` | `boolean` | canUpdate(): boolean { return this.rbacService.canUpdate(this.MODULE_NAME); } |
| `canDelete` | `canDelete()` | `boolean` | canDelete(): boolean { return this.rbacService.canDelete(this.MODULE_NAME); } |
| `loadDropdowns` | `loadDropdowns()` | `void` | loadProfessions, loadRoles, loadDepartments |
| `loadProfessions` | `loadProfessions()` | `void` | private loadProfessions(): void { this.loadingProfessions = true; this.professionService.search( { active: true, uniq... |
| `loadRoles` | `loadRoles()` | `void` | private loadRoles(): void { this.loadingRoles = true; this.rolesService.getManageableRoles() .pipe(takeUntil(this.des... |
| `loadDepartments` | `loadDepartments()` | `void` | private loadDepartments(): void { this.loadingDepartments = true; this.departmentService.getActiveDepartments() .pipe... |
| `getAvatar` | `getAvatar(u: UserResponseDTO)` | `string` | getAvatar(u: UserResponseDTO): string { if (u.photoUrl && u.photoUrl.trim() !== '') return u.photoUrl; return u.sex =... |
| `onAvatarError` | `onAvatarError(event: Event, u: UserResponseDTO)` | `void` | onAvatarError(event: Event, u: UserResponseDTO): void { (event.target as HTMLImageElement).src = u.sex === 'Female' ?... |
| `loadAll` | `loadAll(page: number)` | `void` | loadAll(page: number = 0): void { this.loading = true; this.isSearchMode = false; this.cd.detectChanges(); this.users... |
| `search` | `search(page: number)` | `void` | loadAll |
| `onPageChange` | `onPageChange(newPage: number)` | `void` | search, loadAll |
| `reset` | `reset()` | `void` | loadAll |
| `add` | `add()` | `void` | add(): void { this.router.navigate(['/administration/users/new']); } |
| `details` | `details(u: UserResponseDTO)` | `void` | details(u: UserResponseDTO): void { this.router.navigate(['/administration/users', u.keycloakId, 'details']); } |
| `edit` | `edit(u: UserResponseDTO)` | `void` | edit(u: UserResponseDTO): void { this.router.navigate(['/administration/users', u.keycloakId, 'edit']); } |
| `delete` | `delete(u: UserResponseDTO)` | `void` | delete(u: UserResponseDTO): void { this.userToDelete = u; this.showDeleteConfirm = true; this.cd.detectChanges(); } |
| `cancelDelete` | `cancelDelete()` | `void` | cancelDelete(): void { this.userToDelete = null; this.showDeleteConfirm = false; this.cd.detectChanges(); } |
| `confirmDelete` | `confirmDelete()` | `void` | search, loadAll |
| `resetPassword` | `resetPassword(u: UserResponseDTO)` | `void` | resetPassword(u: UserResponseDTO): void { if (!u.emailVerified) { this.messageService.add({ severity: 'warn', summary... |
| `export` | `export()` | `void` | export(): void { const header = ['Prénom & Nom', 'Email', 'Email Vérifié', 'Statut', 'Profession', 'Département', 'Rô... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `click`, `loading`, `onClick`, `disabled`, `ngFor`.

Visible/action labels detected: `Confirmer la suppression`, `Cette action ne peut pas être annulée`, `Supprimer`, `Annuler`, `Filtres de recherche`, `Email vérifié`, `Vérifié`, `Non vérifié`, `Statut`, `Actif`, `Inactif`, `Département`, `Rôle`, `Rechercher`, `Réinitialiser`, `Liste des utilisateurs`, `Utilisateur`, `Email`.

### src/app/pages/auth/access.ts

- Class: `Access`.
- Selector: `app-access`.
- Standalone: `true`.
- Angular/PrimeNG imports: `ButtonModule`, `RouterModule`, `RippleModule`, `AppFloatingConfigurator`, `ButtonModule`.
### src/app/pages/auth/error.ts

- Class: `Error`.
- Selector: `app-error`.
- Standalone: `true`.
- Angular/PrimeNG imports: `ButtonModule`, `RippleModule`, `RouterModule`, `AppFloatingConfigurator`, `ButtonModule`.
### src/app/pages/auth/login.ts

- Class: `Login`.
- Selector: `app-login`.
- Standalone: `true`.
- Angular/PrimeNG imports: `ButtonModule`, `CheckboxModule`, `InputTextModule`, `PasswordModule`, `FormsModule`, `RouterModule`, `RippleModule`, `AppFloatingConfigurator`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `email` | `string` | `''` |
| `password` | `string` | `''` |
| `checked` | `boolean` | `false` |

### src/app/pages/crud/crud.ts

- Class: `Crud`.
- Selector: `app-crud`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `TableModule`, `FormsModule`, `ButtonModule`, `RippleModule`, `ToastModule`, `ToolbarModule`, `RatingModule`, `InputTextModule`, `TextareaModule`, `SelectModule`, `RadioButtonModule`, `InputNumberModule`, `DialogModule`, `TagModule`, `InputIconModule`, `IconFieldModule`, `ConfirmDialogModule`.
- Constructor injections: `productService: ProductService`, `messageService: MessageService`, `confirmationService: ConfirmationService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `productDialog` | `boolean` | `false` |
| `products` | `implicit` | `signal<Product[]>([])` |
| `product` | `Product` |  |
| `selectedProducts` | `Product[] \| null` |  |
| `submitted` | `boolean` | `false` |
| `statuses` | `any[]` |  |
| `dt` | `Table` |  |
| `exportColumns` | `ExportColumn[]` |  |
| `cols` | `Column[]` |  |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `exportCSV` | `exportCSV()` | `implicit` | exportCSV() { this.dt.exportCSV(); } |
| `ngOnInit` | `ngOnInit()` | `implicit` | loadDemoData |
| `loadDemoData` | `loadDemoData()` | `implicit` | loadDemoData() { this.productService.getProducts().then((data) => { this.products.set(data); }); this.statuses = [ { ... |
| `onGlobalFilter` | `onGlobalFilter(table: Table, event: Event)` | `implicit` | onGlobalFilter(table: Table, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); } |
| `openNew` | `openNew()` | `implicit` | openNew() { this.product = {}; this.submitted = false; this.productDialog = true; } |
| `editProduct` | `editProduct(product: Product)` | `implicit` | editProduct(product: Product) { this.product = { ...product }; this.productDialog = true; } |
| `deleteSelectedProducts` | `deleteSelectedProducts()` | `implicit` | products |
| `hideDialog` | `hideDialog()` | `implicit` | hideDialog() { this.productDialog = false; this.submitted = false; } |
| `deleteProduct` | `deleteProduct(product: Product)` | `implicit` | products |
| `findIndexById` | `findIndexById(id: string)` | `number` | products |
| `createId` | `createId()` | `string` | createId(): string { let id = ''; var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; for (... |
| `getSeverity` | `getSeverity(status: string)` | `implicit` | getSeverity(status: string) { switch (status) { case 'INSTOCK': return 'success'; case 'LOWSTOCK': return 'warn'; cas... |
| `saveProduct` | `saveProduct()` | `implicit` | products, findIndexById, createId |

### src/app/pages/dashboard/components/bestsellingwidget.ts

- Class: `BestSellingWidget`.
- Selector: `app-best-selling-widget`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ButtonModule`, `MenuModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `menu` | `implicit` | `null` |
| `items` | `implicit` | `[ { label: 'Add New', icon: 'pi pi-fw pi-plus' }, { label: 'Remove', icon: 'pi pi-fw pi...` |

### src/app/pages/dashboard/components/notificationswidget.ts

- Class: `NotificationsWidget`.
- Selector: `app-notifications-widget`.
- Standalone: `true`.
- Angular/PrimeNG imports: `ButtonModule`, `MenuModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `items` | `implicit` | `[ { label: 'Add New', icon: 'pi pi-fw pi-plus' }, { label: 'Remove', icon: 'pi pi-fw pi...` |

### src/app/pages/dashboard/components/recentsaleswidget.ts

- Class: `RecentSalesWidget`.
- Selector: `app-recent-sales-widget`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `TableModule`, `ButtonModule`, `RippleModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `products` | `implicit` | `signal<Product[]>([])` |
| `productService` | `implicit` | `inject(ProductService)` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.productService.getProductsSmall().then((data) => (this.products.set(data))); } |

### src/app/pages/dashboard/components/revenuestreamwidget.ts

- Class: `RevenueStreamWidget`.
- Selector: `app-revenue-stream-widget`.
- Standalone: `true`.
- Angular/PrimeNG imports: `ChartModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `layoutService` | `implicit` | `inject(LayoutService)` |
| `chartData` | `implicit` | `signal<any>(null)` |
| `chartOptions` | `implicit` | `signal<any>(null)` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `initChart` | `initChart()` | `implicit` | initChart() { const documentStyle = getComputedStyle(document.documentElement); const textColor = documentStyle.getPr... |

### src/app/pages/dashboard/components/statswidget.ts

- Class: `StatsWidget`.
- Selector: `app-stats-widget`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`.
### src/app/pages/dashboard/dashboard.ts

- Class: `Dashboard`.
- Selector: `app-dashboard`.
- Angular/PrimeNG imports: `StatsWidget`, `RecentSalesWidget`, `BestSellingWidget`, `RevenueStreamWidget`, `NotificationsWidget`.
### src/app/pages/documentation/documentation.ts

- Class: `Documentation`.
- Selector: `app-documentation`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`.
### src/app/pages/empty/empty.ts

- Class: `Empty`.
- Selector: `app-empty`.
- Standalone: `true`.
### src/app/pages/landing/components/featureswidget.ts

- Class: `FeaturesWidget`.
- Selector: `features-widget`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`.
### src/app/pages/landing/components/footerwidget.ts

- Class: `FooterWidget`.
- Selector: `footer-widget`.
- Angular/PrimeNG imports: `RouterModule`.
- Constructor injections: `router: Router`.
### src/app/pages/landing/components/herowidget.ts

- Class: `HeroWidget`.
- Selector: `hero-widget`.
- Angular/PrimeNG imports: `ButtonModule`, `RippleModule`.
### src/app/pages/landing/components/highlightswidget.ts

- Class: `HighlightsWidget`.
- Selector: `highlights-widget`.
### src/app/pages/landing/components/pricingwidget.ts

- Class: `PricingWidget`.
- Selector: `pricing-widget`.
- Angular/PrimeNG imports: `DividerModule`, `ButtonModule`, `RippleModule`.
### src/app/pages/landing/components/topbarwidget.component.ts

- Class: `TopbarWidget`.
- Selector: `topbar-widget`.
- Angular/PrimeNG imports: `RouterModule`, `StyleClassModule`, `ButtonModule`, `RippleModule`, `AppFloatingConfigurator`.
- Constructor injections: `router: Router`.
### src/app/pages/landing/landing.ts

- Class: `Landing`.
- Selector: `app-landing`.
- Standalone: `true`.
- Angular/PrimeNG imports: `RouterModule`, `TopbarWidget`, `HeroWidget`, `FeaturesWidget`, `HighlightsWidget`, `PricingWidget`, `FooterWidget`, `RippleModule`, `StyleClassModule`, `ButtonModule`, `DividerModule`.
### src/app/pages/notfound/notfound.ts

- Class: `Notfound`.
- Selector: `app-notfound`.
- Standalone: `true`.
- Angular/PrimeNG imports: `RouterModule`, `AppFloatingConfigurator`, `ButtonModule`.
### src/app/pages/Parametrages/departments/details/department-details.component.ts

- Class: `DepartmentDetailsComponent`.
- Selector: `app-department-details`.
- Template: `./department-details.component.html`.
- Styles: `['./department-details.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `departmentService: DepartmentService`, `cd: ChangeDetectorRef`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `dept` | `DepartmentResponseDTO` |  |
| `loading` | `implicit` | `true` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | ngOnInit(): void { this.route.paramMap.subscribe(params => { const id = params.get('id'); if (!id) { this.loading = f... |
| `onAvatarError` | `onAvatarError(event: Event, sex?: string)` | `void` | onAvatarError(event: Event, sex?: string): void { const img = event.target as HTMLImageElement; img.src = sex === 'Fe... |
| `edit` | `edit()` | `void` | edit(): void { this.router.navigate(['Parametrages/departments', this.dept?.id, 'edit']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `ngFor`, `onClick`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Département introuvable`, `Aucun département trouvé.`, `Informations Générales`, `Nom`, `Code`, `Type`, `Chef département`, `Description`, `Statut`, `Date de création`, `Dernière modification`, `Localisation & Contact`, `Localisation`, `Adresse Email`, `Numéro de Téléphone`, `Membres du département`.

### src/app/pages/Parametrages/departments/edit/edit.ts

- Class: `DepartmentEditComponent`.
- Selector: `app-department-edit`.
- Template: `./edit.html`.
- Styles: `['./edit.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `departmentService: DepartmentService`, `usersService: UsersService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `deptId` | `number` |  |
| `loading` | `implicit` | `true` |
| `saving` | `implicit` | `false` |
| `loadingChefs` | `implicit` | `false` |
| `chefDropdownOpen` | `implicit` | `false` |
| `chefSearch` | `implicit` | `''` |
| `chefUsers` | `UserResponseDTO[]` | `[]` |
| `selectedChef` | `ChefUser \| null` | `null` |
| `currentType` | `DepartmentType \| null` | `null` |
| `form` | `UpdateDepartmentDTO` | `{ name: '', description: '', location: '', phoneNumber: '', email: '', chefKeycloakId: ...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadDepartment, searchChefs |
| `closeDropdown` | `closeDropdown()` | `void` | @HostListener('document:click') closeDropdown(): void { this.chefDropdownOpen = false; } |
| `stopClose` | `stopClose(event: Event)` | `void` | stopClose(event: Event): void { event.stopPropagation(); } |
| `openChefDropdown` | `openChefDropdown(event: Event)` | `void` | openChefDropdown(event: Event): void { event.stopPropagation(); this.chefDropdownOpen = true; } |
| `loadDepartment` | `loadDepartment()` | `void` | showError |
| `searchChefs` | `searchChefs(openDropdown: boolean)` | `void` | searchChefs(openDropdown: boolean = true): void { this.loadingChefs = true; if (openDropdown) { this.chefDropdownOpen... |
| `selectChef` | `selectChef(user: UserResponseDTO, event?: Event)` | `void` | selectChef(user: UserResponseDTO, event?: Event): void { if (event) { event.stopPropagation(); } this.selectedChef = ... |
| `clearChef` | `clearChef(event?: Event)` | `void` | clearChef(event?: Event): void { if (event) event.stopPropagation(); this.selectedChef = null; this.form.chefKeycloak... |
| `clearChefAndOpen` | `clearChefAndOpen(event?: Event)` | `void` | searchChefs |
| `getUserInitials` | `getUserInitials(user: ChefUser)` | `string` | getUserInitials(user: ChefUser): string { const first = user.firstName?.charAt(0) \|\| ''; const last = user.lastName?.... |
| `save` | `save(formRef: NgForm)` | `void` | showError, back |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['Parametrages/departments']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `ngSubmit`, `click`, `input`, `ngFor`, `onClick`, `loading`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Modifier le Département`, `Informations du département`, `Nom *`, `Le nom est requis`, `Email *`, `Email invalide`, `Type`, `Non modifiable`, `Chef département`, `Sélectionner un chef département`, `Aucun chef`, `Département sans chef assigné`, `Téléphone`, `Localisation`, `Description`.

### src/app/pages/Parametrages/departments/form/department-form.component.ts

- Class: `DepartmentFormComponent`.
- Selector: `app-department-form`.
- Template: `./department-form.component.html`.
- Styles: `['./department-form.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `router: Router`, `departmentService: DepartmentService`, `usersService: UsersService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `saving` | `implicit` | `false` |
| `loadingChefs` | `implicit` | `false` |
| `chefDropdownOpen` | `implicit` | `false` |
| `chefSearch` | `implicit` | `''` |
| `chefUsers` | `UserResponseDTO[]` | `[]` |
| `selectedChef` | `UserResponseDTO \| null` | `null` |
| `form` | `CreateDepartmentRequestDTO` | `{ name: '', code: '', description: '', location: '', phoneNumber: '', email: '', type: ...` |
| `departmentTypes` | `{ label: string; value: DepartmentType }[]` | `[ { label: 'Opérationnel', value: 'OPERATIONAL' }, { label: 'Support', value: 'SUPPORT'...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | searchChefs |
| `closeDropdown` | `closeDropdown()` | `void` | @HostListener('document:click') closeDropdown(): void { this.chefDropdownOpen = false; } |
| `stopClose` | `stopClose(event: Event)` | `void` | stopClose(event: Event): void { event.stopPropagation(); } |
| `openChefDropdown` | `openChefDropdown(event: Event)` | `void` | openChefDropdown(event: Event): void { event.stopPropagation(); this.chefDropdownOpen = true; } |
| `searchChefs` | `searchChefs()` | `void` | searchChefs(): void { this.loadingChefs = true; this.chefDropdownOpen = true; this.cd.detectChanges(); this.usersServ... |
| `selectChef` | `selectChef(user: UserResponseDTO)` | `void` | selectChef(user: UserResponseDTO): void { this.selectedChef = user; this.form.chefKeycloakId = user.keycloakId; this.... |
| `clearChef` | `clearChef(event?: Event)` | `void` | searchChefs |
| `getUserInitials` | `getUserInitials(user: UserResponseDTO)` | `string` | getUserInitials(user: UserResponseDTO): string { const first = user.firstName?.charAt(0) \|\| ''; const last = user.las... |
| `validate` | `validate()` | `boolean` | showError |
| `save` | `save()` | `void` | validate, back, showError |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['Parametrages/departments']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngFor`, `value`, `click`, `ngIf`, `input`, `onClick`, `loading`.

Visible/action labels detected: `Ajouter un Département`, `Informations du département`, `Nom *`, `Code *`, `Type *`, `Sélectionner un type`, `Chef département`, `Sélectionner un chef département`, `Aucun chef`, `Département sans chef assigné`, `Email *`, `Téléphone`, `Localisation`, `Description`, `Règles de création`, `Le`, `nom`, `, le`.

### src/app/pages/Parametrages/departments/list/department-list.component.ts

- Class: `DepartmentListComponent`.
- Selector: `app-department-list`.
- Template: `./department-list.component.html`.
- Styles: `['./department-list.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `TableModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `TooltipModule`, `ConfirmDialogModule`.
- Providers: `MessageService`, `ConfirmationService`.
- Constructor injections: `departmentService: DepartmentService`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`, `confirmationService: ConfirmationService`, `rbacService: RbacService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `rows` | `DepartmentResponseDTO[]` | `[]` |
| `loading` | `implicit` | `false` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `5` |
| `totalPages` | `implicit` | `0` |
| `totalElements` | `implicit` | `0` |
| `filters` | `DepartmentSearchCriteria` | `{ name: '', code: '', localisation: '', isActive: null, type: null }` |
| `MODULE_NAME` | `implicit` | `'gestion des départments'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | search |
| `canCreate` | `canCreate()` | `boolean` | canCreate(): boolean { return this.rbacService.canCreate(this.MODULE_NAME); } |
| `canUpdate` | `canUpdate()` | `boolean` | canUpdate(): boolean { return this.rbacService.canUpdate(this.MODULE_NAME); } |
| `canDelete` | `canDelete()` | `boolean` | canDelete(): boolean { return this.rbacService.canDelete(this.MODULE_NAME); } |
| `search` | `search(page: number)` | `void` | search(page: number = 0): void { this.loading = true; this.currentPage = page; this.cd.detectChanges(); this.departme... |
| `reset` | `reset()` | `void` | search |
| `goToPage` | `goToPage(page: number)` | `void` | search |
| `toggleActive` | `toggleActive(d: DepartmentResponseDTO)` | `void` | search, extractErrorMessage |
| `extractErrorMessage` | `extractErrorMessage(err: any)` | `string` | private extractErrorMessage(err: any): string { if (typeof err?.error === 'string') { return err.error; } if (err?.er... |
| `add` | `add()` | `void` | add(): void { this.router.navigate(['Parametrages/departments/new']); } |
| `details` | `details(d: DepartmentResponseDTO)` | `void` | details(d: DepartmentResponseDTO): void { this.router.navigate(['Parametrages/departments', d.id, 'details']); } |
| `edit` | `edit(d: DepartmentResponseDTO)` | `void` | edit(d: DepartmentResponseDTO): void { this.router.navigate(['Parametrages/departments', d.id, 'edit']); } |
| `export` | `export()` | `void` | export(): void { const header = ['Nom', 'Code', 'Type', 'Localisation', 'Téléphone', 'Email', 'Statut']; const csvRow... |

Template PrimeNG elements: `p-toast`, `p-confirmDialog`, `p-button`.

Template bindings/events/directives detected: `onClick`, `ngIf`, `ngFor`, `disabled`, `click`.

Visible/action labels detected: `Filtres de recherche`, `Statut`, `Actif`, `Non Actif`, `Type`, `Opérationnel`, `Support`, `Rechercher`, `Réinitialiser`, `Liste des départements`, `Code`, `Nom`, `Actions`, `Chargement...`.

### src/app/pages/Parametrages/leave-balance/employee-leave-balance-details.component/employee-leave-balance-details.component.ts

- Class: `EmployeeLeaveBalanceDetailsComponent`.
- Selector: `app-employee-leave-balance-details`.
- Template: `./employee-leave-balance-details.component.html`.
- Styles: `['./employee-leave-balance-details.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `balanceService: EmployeeLeaveBalanceService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `id` | `number` |  |
| `loading` | `implicit` | `true` |
| `data` | `EmployeeLeaveBalanceResponseDTO \| null` | `null` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | back, load |
| `load` | `load()` | `void` | extractErrorMessage |
| `getUserFullName` | `getUserFullName(user?: UserResponseDTO | null)` | `string` | getUserFullName(user?: UserResponseDTO \| null): string { if (!user) return 'Employé non disponible'; const first = us... |
| `getInitials` | `getInitials(user?: UserResponseDTO | null)` | `string` | getInitials(user?: UserResponseDTO \| null): string { if (!user) return '?'; const first = user.firstName?.charAt(0) \|... |
| `getUsagePercent` | `getUsagePercent()` | `number` | getUsagePercent(): number { if (!this.data) return 0; const current = Number(this.data.currentBalance \|\| 0); const us... |
| `getRemainingClass` | `getRemainingClass()` | `string` | getRemainingClass(): string { if (!this.data) return 'success'; const remaining = Number(this.data.remainingBalance \|... |
| `getUnitLabel` | `getUnitLabel()` | `string` | getUnitLabel(): string { const unit = this.data?.leaveType?.unit; return unit === 'MONTH' ? 'Mois' : 'Jour'; } |
| `getModeLabel` | `getModeLabel()` | `string` | getModeLabel(): string { const mode = this.data?.leaveType?.incrementMode; switch (mode) { case 'MONTHLY': return 'Me... |
| `extractErrorMessage` | `extractErrorMessage(err: any)` | `string` | private extractErrorMessage(err: any): string { return err?.error?.message \|\| err?.error?.error \|\| err?.message \|\| 'E... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['/Parametrages/leave-balances']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `onClick`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Détails du solde de congé`, `Solde restant`, `Solde`, `Solde total`, `Solde utilisé`, `Taux d'utilisation`, `Type de congé`, `Code`, `Nom`, `Unité`, `Mode`, `Solde maximum`, `Justificatif`, `Informations système`, `Année`.

### src/app/pages/Parametrages/leave-balance/employee-leave-balance-edit.component/employee-leave-balance-edit.component.ts

- Class: `EmployeeLeaveBalanceEditComponent`.
- Selector: `app-employee-leave-balance-edit`.
- Template: `./employee-leave-balance-edit.component.html`.
- Styles: `['./employee-leave-balance-edit.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `balanceService: EmployeeLeaveBalanceService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `id` | `number` |  |
| `loading` | `implicit` | `true` |
| `saving` | `implicit` | `false` |
| `data` | `EmployeeLeaveBalanceResponseDTO \| null` | `null` |
| `form` | `implicit` | `{ currentBalance: 0 }` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | back, load |
| `load` | `load()` | `void` | showError, extractErrorMessage |
| `getUserFullName` | `getUserFullName(user?: UserResponseDTO | null)` | `string` | getUserFullName(user?: UserResponseDTO \| null): string { if (!user) return 'Employé non disponible'; const first = us... |
| `getInitials` | `getInitials(user?: UserResponseDTO | null)` | `string` | getInitials(user?: UserResponseDTO \| null): string { if (!user) return '?'; const first = user.firstName?.charAt(0) \|... |
| `getUnitLabel` | `getUnitLabel()` | `string` | getUnitLabel(): string { const unit = this.data?.leaveType?.unit; return unit === 'MONTH' ? 'Mois' : 'Jour'; } |
| `getCalculatedRemaining` | `getCalculatedRemaining()` | `number` | getCalculatedRemaining(): number { const current = Number(this.form.currentBalance \|\| 0); const used = Number(this.da... |
| `getRemainingClass` | `getRemainingClass()` | `string` | getCalculatedRemaining |
| `getMaxBalance` | `getMaxBalance()` | `number` | getMaxBalance(): number { return Number(this.data?.leaveType?.maxBalance \|\| 0); } |
| `validate` | `validate()` | `boolean` | showError, getMaxBalance |
| `save` | `save()` | `void` | validate, back, showError, extractErrorMessage |
| `showError` | `showError(detail: string)` | `false` | private showError(detail: string): false { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, li... |
| `extractErrorMessage` | `extractErrorMessage(err: any)` | `string` | private extractErrorMessage(err: any): string { return err?.error?.message \|\| err?.error?.error \|\| err?.message \|\| 'E... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['/Parametrages/leave-balances']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `disabled`, `onClick`, `loading`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Correction du solde de congé`, `Le statut se gère depuis la liste.`, `Informations non modifiables`, `Type de congé`, `Année`, `Unité`, `Solde utilisé`, `Solde maximum autorisé`, `Correction du solde`, `Solde total *`, `Nouveau solde restant`, `Attention`, `solde total - solde utilisé`, `Retour`, `Sauvegarder`.

### src/app/pages/Parametrages/leave-balance/employee-leave-balance-form.component/employee-leave-balance-form.component.ts

- Class: `EmployeeLeaveBalanceFormComponent`.
- Selector: `app-employee-leave-balance-form.component`.
- Template: `./employee-leave-balance-form.component.html`.
- Styles: `./employee-leave-balance-form.component.scss`.
### src/app/pages/Parametrages/leave-balance/employee-leave-balance-list.component/employee-leave-balance-list.component.ts

- Class: `EmployeeLeaveBalanceListComponent`.
- Selector: `app-employee-leave-balance-list`.
- Template: `./employee-leave-balance-list.component.html`.
- Styles: `['./employee-leave-balance-list.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `TooltipModule`, `SelectModule`.
- Providers: `MessageService`.
- Constructor injections: `balanceService: EmployeeLeaveBalanceService`, `leaveTypeService: LeaveTypeService`, `usersService: UsersService`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `rows` | `EmployeeLeaveBalanceResponseDTO[]` | `[]` |
| `loading` | `implicit` | `false` |
| `loadingEmployees` | `implicit` | `false` |
| `loadingLeaveTypes` | `implicit` | `false` |
| `employees` | `EmployeeOption[]` | `[]` |
| `leaveTypes` | `LeaveTypeOption[]` | `[]` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `5` |
| `totalElements` | `implicit` | `0` |
| `totalPages` | `implicit` | `0` |
| `filters` | `EmployeeLeaveBalanceSearchDTO` | `{ idEmployee: null, idLeaveType: null, year: new Date().getFullYear(), active: null }` |
| `years` | `number[]` | `[]` |
| `statusOptions` | `{ label: string; value: boolean \| null }[]` | `[ { label: 'Tous les statuts', value: null }, { label: 'Actif', value: true }, { label:...` |
| `employeeSearchTimeout` | `any` |  |
| `destroy$` | `implicit` | `new Subject<void>()` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | initYears, loadEmployees, loadLeaveTypes, search |
| `ngOnDestroy` | `ngOnDestroy()` | `void` | ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); clearTimeout(this.employeeSearchTimeout); } |
| `initYears` | `initYears()` | `void` | private initYears(): void { const current = new Date().getFullYear(); this.years = Array.from({ length: 7 }, (_, i) =... |
| `loadEmployees` | `loadEmployees(searchTerm: string)` | `void` | getUserFullName, showError |
| `onEmployeeFilter` | `onEmployeeFilter(event: any)` | `void` | loadEmployees |
| `loadLeaveTypes` | `loadLeaveTypes()` | `void` | showError |
| `search` | `search(page: number)` | `void` | showError |
| `reset` | `reset()` | `void` | loadEmployees, loadLeaveTypes, search |
| `onPageChange` | `onPageChange(page: number)` | `void` | search |
| `details` | `details(row: EmployeeLeaveBalanceResponseDTO)` | `void` | details(row: EmployeeLeaveBalanceResponseDTO): void { this.router.navigate(['/Parametrages/leave-balances', row.idBal... |
| `edit` | `edit(row: EmployeeLeaveBalanceResponseDTO)` | `void` | edit(row: EmployeeLeaveBalanceResponseDTO): void { this.router.navigate(['/Parametrages/leave-balances', row.idBalanc... |
| `getUserFullName` | `getUserFullName(user?: UserResponseDTO | null)` | `string` | getUserFullName(user?: UserResponseDTO \| null): string { if (!user) return 'Employé non disponible'; const first = us... |
| `getInitials` | `getInitials(user?: UserResponseDTO | null)` | `string` | getInitials(user?: UserResponseDTO \| null): string { if (!user) return '?'; const first = user.firstName?.charAt(0) \|... |
| `getRemainingClass` | `getRemainingClass(row: EmployeeLeaveBalanceResponseDTO)` | `string` | getRemainingClass(row: EmployeeLeaveBalanceResponseDTO): string { const remaining = Number(row.remainingBalance \|\| 0)... |
| `getUsagePercent` | `getUsagePercent(row: EmployeeLeaveBalanceResponseDTO)` | `number` | getUsagePercent(row: EmployeeLeaveBalanceResponseDTO): number { const current = Number(row.currentBalance \|\| 0); cons... |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |

Template PrimeNG elements: `p-toast`, `p-select`, `p-button`.

Template bindings/events/directives detected: `options`, `loading`, `ngIf`, `ngFor`, `onClick`, `click`, `disabled`.

Visible/action labels detected: `Filtres de recherche`, `Employé`, `Type de congé`, `Année`, `Toutes les années`, `Statut`, `Rechercher`, `Réinitialiser`, `Soldes de congé`, `Solde`, `Utilisé`, `Restant`, `Actions`.

### src/app/pages/Parametrages/leave-request-types/leave-type-detail/leave-type-detail.ts

- Class: `LeaveTypeDetailsComponent`.
- Selector: `app-leave-type-details`.
- Template: `./leave-type-detail.html`.
- Styles: `['./leave-type-detail.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `leaveTypeService: LeaveTypeService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `id` | `number` |  |
| `loading` | `implicit` | `true` |
| `data` | `LeaveTypeResponseDTO \| null` | `null` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | back, load |
| `load` | `load()` | `void` | extractErrorMessage |
| `getUnitLabel` | `getUnitLabel(unit: LeaveUnit)` | `string` | getUnitLabel(unit: LeaveUnit): string { return unit === 'MONTH' ? 'Mois' : 'Jour'; } |
| `getIncrementModeLabel` | `getIncrementModeLabel(mode: LeaveIncrementMode)` | `string` | getIncrementModeLabel(mode: LeaveIncrementMode): string { switch (mode) { case 'MONTHLY': return 'Mensuel'; case 'YEA... |
| `getMainBalanceLabel` | `getMainBalanceLabel()` | `string` | getMainBalanceLabel(): string { if (!this.data) return '-'; switch (this.data.incrementMode) { case 'MONTHLY': return... |
| `getEstimatedAnnualBalance` | `getEstimatedAnnualBalance()` | `number` | getEstimatedAnnualBalance(): number { if (!this.data \|\| this.data.incrementMode !== 'MONTHLY') return 0; return Numbe... |
| `getModeClass` | `getModeClass()` | `string` | getModeClass(): string { if (!this.data) return 'none'; return this.data.incrementMode.toLowerCase(); } |
| `extractErrorMessage` | `extractErrorMessage(err: any)` | `string` | private extractErrorMessage(err: any): string { return err?.error?.message \|\| err?.error?.error \|\| err?.message \|\| 'E... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['Parametrages/leave-request-types']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `onClick`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Détails du type de congé`, `Solde principal`, `Configuration du solde`, `Unité`, `Mode d’incrémentation`, `Solde maximum`, `Solde fixe`, `Incrément mensuel`, `Allocation annuelle`, `Estimation annuelle`, `Règles appliquées`, `Report limité`, `Justificatif requis`, `Validation requise`, `Informations système`, `Date de création`.

### src/app/pages/Parametrages/leave-request-types/leave-type-edit/leave-type-edit.ts

- Class: `LeaveTypeEditComponent`.
- Selector: `app-leave-type-edit`.
- Template: `./leave-type-edit.html`.
- Styles: `['./leave-type-edit.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `leaveTypeService: LeaveTypeService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `id` | `number` |  |
| `loading` | `implicit` | `true` |
| `saving` | `implicit` | `false` |
| `current` | `LeaveTypeResponseDTO` |  |
| `form` | `LeaveTypeRequestDTO` | `{ code: '', name: '', description: '', unit: 'DAY', incrementMode: 'NONE', defaultBalan...` |
| `units` | `{ label: string; value: LeaveUnit }[]` | `[ { label: 'Jour', value: 'DAY' }, { label: 'Mois', value: 'MONTH' } ]` |
| `modes` | `{ label: string; value: LeaveIncrementMode; hint: string }[]` | `[ { label: 'Aucun', value: 'NONE', hint: 'Aucun solde automatique. Exemple: congé sans ...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | back, load |
| `load` | `load()` | `void` | showError, extractErrorMessage |
| `onModeChange` | `onModeChange()` | `void` | onModeChange(): void { if (this.form.incrementMode === 'NONE') { this.form.defaultBalance = 0; this.form.monthlyIncre... |
| `validate` | `validate()` | `boolean` | showError |
| `save` | `save()` | `void` | validate, back, showError, extractErrorMessage |
| `showError` | `showError(detail: string)` | `false` | private showError(detail: string): false { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, li... |
| `extractErrorMessage` | `extractErrorMessage(err: any)` | `string` | private extractErrorMessage(err: any): string { return err?.error?.message \|\| err?.error?.error \|\| err?.message \|\| 'E... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['Parametrages/leave-request-types']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `ngFor`, `value`, `click`, `disabled`, `onClick`, `loading`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Modifier le type de congé`, `Informations générales`, `Code *`, `Nom *`, `Unité *`, `Description`, `Paramétrage du solde`, `Solde fixe *`, `Incrément mensuel *`, `Allocation annuelle *`, `Solde maximum *`, `Règles`, `Report limité`, `Justificatif requis`, `Validation requise`, `Retour`.

### src/app/pages/Parametrages/leave-request-types/leave-type-form/leave-type-form.ts

- Class: `LeaveTypeFormComponent`.
- Selector: `app-leave-type-form`.
- Template: `./leave-type-form.html`.
- Styles: `['./leave-type-form.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `router: Router`, `leaveTypeService: LeaveTypeService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `saving` | `implicit` | `false` |
| `form` | `LeaveTypeRequestDTO` | `{ code: '', name: '', description: '', unit: 'DAY', incrementMode: 'NONE', defaultBalan...` |
| `units` | `{ label: string; value: LeaveUnit }[]` | `[ { label: 'Jour', value: 'DAY' }, { label: 'Mois', value: 'MONTH' } ]` |
| `modes` | `{ label: string; value: LeaveIncrementMode; hint: string }[]` | `[ { label: 'Aucun', value: 'NONE', hint: 'Aucun solde automatique. Exemple: congé sans ...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `onModeChange` | `onModeChange()` | `void` | onModeChange(): void { if (this.form.incrementMode === 'NONE') { this.form.defaultBalance = 0; this.form.monthlyIncre... |
| `validate` | `validate()` | `boolean` | showError |
| `save` | `save()` | `void` | validate, back, showError, extractErrorMessage |
| `showError` | `showError(detail: string)` | `false` | private showError(detail: string): false { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, li... |
| `extractErrorMessage` | `extractErrorMessage(err: any)` | `string` | private extractErrorMessage(err: any): string { return err?.error?.message \|\| err?.error?.error \|\| err?.message \|\| 'E... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['Parametrages/leave-request-types']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngFor`, `value`, `click`, `ngIf`, `disabled`, `onClick`, `loading`.

Visible/action labels detected: `Ajouter un type de congé`, `Informations générales`, `Code *`, `Nom *`, `Unité *`, `Description`, `Paramétrage du solde`, `Solde fixe *`, `Incrément mensuel *`, `Allocation annuelle *`, `Solde maximum *`, `Règles`, `Report limité`, `Justificatif requis`, `Validation requise`, `Exemples rapides`, `Congé annuel`, `: mode mensuel, incrément 1.83, max 22.`.

### src/app/pages/Parametrages/leave-request-types/leave-type-list/leave-type-list.ts

- Class: `LeaveTypeListComponent`.
- Selector: `app-leave-type-list`.
- Template: `./leave-type-list.html`.
- Styles: `['./leave-type-list.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `TooltipModule`, `ConfirmDialogModule`.
- Providers: `MessageService`, `ConfirmationService`.
- Constructor injections: `leaveTypeService: LeaveTypeService`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`, `confirmationService: ConfirmationService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `rows` | `LeaveTypeResponseDTO[]` | `[]` |
| `loading` | `implicit` | `false` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `5` |
| `totalPages` | `implicit` | `0` |
| `totalElements` | `implicit` | `0` |
| `filters` | `LeaveTypeSearchDTO` | `{ keyword: '', unit: null, incrementMode: null, active: null }` |
| `unitOptions` | `{ label: string; value: LeaveUnit \| null }[]` | `[ { label: 'Unité', value: null }, { label: 'Jour', value: 'DAY' }, { label: 'Mois', va...` |
| `incrementModeOptions` | `{ label: string; value: LeaveIncrementMode \| null }[]` | `[ { label: 'Mode d’incrémentation', value: null }, { label: 'Aucun', value: 'NONE' }, {...` |
| `statusOptions` | `{ label: string; value: boolean \| null }[]` | `[ { label: 'Statut', value: null }, { label: 'Actif', value: true }, { label: 'Inactif'...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | search |
| `search` | `search(page: number)` | `void` | search(page: number = 0): void { this.loading = true; this.currentPage = page; this.cd.detectChanges(); this.leaveTyp... |
| `reset` | `reset()` | `void` | search |
| `goToPage` | `goToPage(page: number)` | `void` | search |
| `add` | `add()` | `void` | add(): void { this.router.navigate(['Parametrages/leave-request-types/new']); } |
| `details` | `details(row: LeaveTypeResponseDTO)` | `void` | details(row: LeaveTypeResponseDTO): void { this.router.navigate(['Parametrages/leave-request-types', row.idLeaveType,... |
| `edit` | `edit(row: LeaveTypeResponseDTO)` | `void` | edit(row: LeaveTypeResponseDTO): void { this.router.navigate(['Parametrages/leave-request-types', row.idLeaveType, 'e... |
| `toggleActive` | `toggleActive(row: LeaveTypeResponseDTO)` | `void` | handleToggleSuccess, handleToggleError |
| `handleToggleSuccess` | `handleToggleSuccess(row: LeaveTypeResponseDTO, deactivated: boolean)` | `void` | search |
| `handleToggleError` | `handleToggleError(err: any)` | `void` | extractErrorMessage |
| `getUnitLabel` | `getUnitLabel(unit: LeaveUnit)` | `string` | getUnitLabel(unit: LeaveUnit): string { return unit === 'MONTH' ? 'Mois' : 'Jour'; } |
| `getIncrementModeLabel` | `getIncrementModeLabel(mode: LeaveIncrementMode)` | `string` | getIncrementModeLabel(mode: LeaveIncrementMode): string { switch (mode) { case 'MONTHLY': return 'Mensuel'; case 'YEA... |
| `extractErrorMessage` | `extractErrorMessage(err: any)` | `string` | private extractErrorMessage(err: any): string { return err?.error?.message \|\| err?.error?.error \|\| err?.message \|\| 'E... |

Template PrimeNG elements: `p-toast`, `p-confirmDialog`, `p-button`.

Template bindings/events/directives detected: `ngFor`, `onClick`, `ngIf`, `disabled`, `click`.

Visible/action labels detected: `Filtres de recherche`, `Rechercher`, `Réinitialiser`, `Liste des types de congé`, `Code`, `Nom`, `Unité`, `Mode`, `Max`, `Statut`, `Actions`, `Chargement...`.

### src/app/pages/Parametrages/modules/modules-details/modules-details.ts

- Class: `ModulesDetailsComponent`.
- Selector: `app-modules-details`.
- Template: `./modules-details.html`.
- Styles: `['./modules-details.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `CardModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `modulesService: ModulesService`, `router: Router`, `messageService: MessageService`, `cd: ChangeDetectorRef`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `module` | `ModuleResponseDTO \| null` | `null` |
| `moduleId` | `number` |  |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadModule |
| `loadModule` | `loadModule()` | `void` | loadModule(): void { this.modulesService.getModules().subscribe({ next: (modules) => { const found = modules.find(m =... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['Parametrages/modules']); } |

Template PrimeNG elements: `p-toast`.

Template bindings/events/directives detected: `ngIf`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Détails du Module`, `ID`, `Nom`.

### src/app/pages/Parametrages/modules/modules-edit/modules-edit.ts

- Class: `ModulesEditComponent`.
- Selector: `app-modules-edit`.
- Template: `./modules-edit.html`.
- Styles: `['./modules-edit.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ToastModule`, `ButtonModule`, `InputTextModule`.
- Providers: `MessageService`.
- Constructor injections: `modulesService: ModulesService`, `route: ActivatedRoute`, `router: Router`, `messageService: MessageService`, `cd: ChangeDetectorRef`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `module` | `ModuleResponseDTO` | `{ id: 0, name: '' }` |
| `moduleId` | `number` |  |
| `loading` | `implicit` | `false` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadModule |
| `loadModule` | `loadModule()` | `void` | loadModule(): void { this.modulesService.getModules().subscribe({ next: (modules) => { const found = modules.find(m =... |
| `updateModule` | `updateModule()` | `void` | updateModule(): void { if (!this.module.name.trim()) return; this.loading = true; this.modulesService.updateModule(th... |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['Parametrages/modules']); } |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `onClick`, `loading`.

Visible/action labels detected: `Modifier Module`, `Informations du module`, `Nom du module *`, `Règles de modification`, `Le nom ne peut pas être vide`, `Sauvegarder`.

### src/app/pages/Parametrages/modules/modules-form/modules-form.ts

- Class: `ModulesFormComponent`.
- Selector: `app-modules-form`.
- Template: `./modules-form.html`.
- Styles: `['./modules-form.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `InputTextModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `modulesService: ModulesService`, `router: Router`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `module` | `ModuleRequestDTO` | `{ name: '' }` |
| `loading` | `implicit` | `false` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `createModule` | `createModule()` | `implicit` | createModule() { if (!this.module.name.trim()) { this.messageService.add({ severity: 'warn', summary: 'Validation', d... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `onClick`, `loading`.

Visible/action labels detected: `Ajouter Module`, `Informations du module`, `Nom du module *`, `Règles de création`, `Le nom ne peut pas être vide`, `Sauvegarder`.

### src/app/pages/Parametrages/modules/modules-list/modules-list.ts

- Class: `ModulesListComponent`.
- Selector: `app-modules-list`.
- Template: `./modules-list.html`.
- Styles: `['./modules-list.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ConfirmDialogModule`, `ToastModule`, `ButtonModule`.
- Providers: `ConfirmationService`, `MessageService`.
- Constructor injections: `modulesService: ModulesService`, `router: Router`, `confirmationService: ConfirmationService`, `messageService: MessageService`, `cd: ChangeDetectorRef`, `rbacService: RbacService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `MODULE_NAME` | `implicit` | `'gestion des des modules'` |
| `modules` | `ModuleResponseDTO[]` | `[]` |
| `filteredModules` | `ModuleResponseDTO[]` | `[]` |
| `searchTerm` | `string` | `''` |
| `loading` | `boolean` | `true` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadModules |
| `canCreate` | `canCreate()` | `boolean` | canCreate(): boolean { return this.rbacService.canCreate(this.MODULE_NAME); } |
| `canUpdate` | `canUpdate()` | `boolean` | canUpdate(): boolean { return this.rbacService.canUpdate(this.MODULE_NAME); } |
| `canDelete` | `canDelete()` | `boolean` | canDelete(): boolean { return this.rbacService.canDelete(this.MODULE_NAME); } |
| `loadModules` | `loadModules()` | `void` | loadModules(): void { this.loading = true; this.modulesService.getModules().subscribe({ next: (data) => { this.module... |
| `searchByName` | `searchByName()` | `void` | searchByName(): void { if (!this.searchTerm.trim()) { this.filteredModules = this.modules; } else { this.filteredModu... |
| `goToDetails` | `goToDetails(id: number)` | `void` | goToDetails(id: number): void { this.router.navigate(['Parametrages/modules', id, 'details']); } |
| `goToEdit` | `goToEdit(id: number)` | `void` | goToEdit(id: number): void { this.router.navigate(['Parametrages/modules', id, 'edit']); } |
| `deleteModule` | `deleteModule(id: number)` | `void` | deleteModule(id: number): void { const module = this.modules.find(m => m.id === id); if (!module) return; this.confir... |
| `goToCreate` | `goToCreate()` | `void` | goToCreate(): void { this.router.navigate(['Parametrages/modules/new']); } |

Template PrimeNG elements: `p-toast`, `p-confirmDialog`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `onClick`, `input`, `ngFor`, `click`.

Visible/action labels detected: `Liste des modules`, `Ajouter`, `ID`, `Nom`, `Actions`, `Chargement...`.

### src/app/pages/Parametrages/professions/professions-detail/professions-detail.ts

- Class: `ProfessionsDetailComponent`.
- Selector: `app-professions-detail`.
- Template: `./professions-detail.html`.
- Styles: `['./professions-detail.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `professionService: ProfessionService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `id` | `number` |  |
| `loading` | `implicit` | `false` |
| `profession` | `ProfessionResponseDTO \| null` | `null` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadProfession |
| `loadProfession` | `loadProfession()` | `void` | loadProfession(): void { this.loading = true; this.cd.detectChanges(); this.professionService.getById(this.id).subscr... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['/Parametrages/professions']); } |
| `edit` | `edit()` | `void` | edit(): void { if (!this.profession) return; this.router.navigate(['/Parametrages/professions', this.profession.idPro... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `onClick`, `disabled`, `ngIf`.

Visible/action labels detected: `Détails de la profession`, `Retour`, `Modifier`, `Identifiant`, `Code`, `Nom`, `Département`, `Nom département`, `Type département`, `Type profession`, `Utilisable utilisateur`, `Statut`, `Créé le`, `Dernière modification`, `Utilisation`, `Aucune profession trouvée.`.

### src/app/pages/Parametrages/professions/professions-edit/professions-edit.ts

- Class: `ProfessionsEditComponent`.
- Selector: `app-professions-edit`.
- Template: `./professions-edit.html`.
- Styles: `['./professions-edit.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `professionService: ProfessionService`, `departmentService: DepartmentService`, `route: ActivatedRoute`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `professionId` | `number` |  |
| `loading` | `implicit` | `false` |
| `saving` | `implicit` | `false` |
| `loadingDepartments` | `implicit` | `false` |
| `departments` | `any[]` | `[]` |
| `profession` | `ProfessionResponseDTO \| null` | `null` |
| `form` | `ProfessionUpdateDTO` | `{ name: '', code: '', idDepartment: undefined, uniqueByDepartment: false }` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadDepartments, loadProfession |
| `loadDepartments` | `loadDepartments()` | `void` | showError |
| `loadProfession` | `loadProfession()` | `void` | showError |
| `save` | `save()` | `void` | showError |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['/Parametrages/professions']); } |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `disabled`, `ngFor`, `onClick`, `loading`.

Visible/action labels detected: `Modifier une profession`, `Chargement...`, `Nom *`, `Code *`, `Département *`, `Informations`, `Le code doit rester unique`, `Annuler`, `Sauvegarder`.

### src/app/pages/Parametrages/professions/professions-form/professions-form.ts

- Class: `ProfessionsFormComponent`.
- Selector: `app-professions-form`.
- Template: `./professions-form.html`.
- Styles: `['./professions-form.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `professionService: ProfessionService`, `departmentService: DepartmentService`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `saving` | `implicit` | `false` |
| `loadingDepartments` | `implicit` | `false` |
| `departments` | `any[]` | `[]` |
| `form` | `ProfessionCreateDTO` | `{ name: '', code: '', idDepartment: 0, uniqueByDepartment: false }` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadDepartments |
| `loadDepartments` | `loadDepartments()` | `void` | showError |
| `save` | `save()` | `void` | showError |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['/Parametrages/professions']); } |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `disabled`, `ngFor`, `onClick`, `loading`.

Visible/action labels detected: `Ajouter une profession`, `Informations de la profession`, `Nom *`, `Code *`, `Département *`, `Règles de création`, `Annuler`, `Sauvegarder`.

### src/app/pages/Parametrages/professions/professions-list/professions-list.ts

- Class: `ProfessionsListComponent`.
- Selector: `app-professions-list`.
- Template: `./professions-list.html`.
- Styles: `['./professions-list.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `RouterModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `TooltipModule`.
- Providers: `MessageService`.
- Constructor injections: `professionService: ProfessionService`, `departmentService: DepartmentService`, `router: Router`, `cd: ChangeDetectorRef`, `zone: NgZone`, `messageService: MessageService`, `rbacService: RbacService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `rows` | `ProfessionResponseDTO[]` | `[]` |
| `departments` | `any[]` | `[]` |
| `loading` | `implicit` | `false` |
| `loadingDepartments` | `implicit` | `false` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `7` |
| `totalElements` | `implicit` | `0` |
| `totalPages` | `implicit` | `0` |
| `filters` | `ProfessionSearchCriteriaDTO` | `{ name: '', code: '', idDepartment: undefined, active: true, uniqueByDepartment: undefi...` |
| `showDeleteConfirm` | `implicit` | `false` |
| `professionToDelete` | `ProfessionResponseDTO \| null` | `null` |
| `deleting` | `implicit` | `false` |
| `destroy$` | `implicit` | `new Subject<void>()` |
| `MODULE_NAME` | `implicit` | `'gestion des professions'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadDepartments, search |
| `ngOnDestroy` | `ngOnDestroy()` | `void` | ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); } |
| `canCreate` | `canCreate()` | `boolean` | canCreate(): boolean { return this.rbacService.canCreate(this.MODULE_NAME); } |
| `canUpdate` | `canUpdate()` | `boolean` | canUpdate(): boolean { return this.rbacService.canUpdate(this.MODULE_NAME); } |
| `canDelete` | `canDelete()` | `boolean` | canDelete(): boolean { return this.rbacService.canDelete(this.MODULE_NAME); } |
| `refresh` | `refresh()` | `void` | private refresh(): void { this.cd.detectChanges(); } |
| `loadDepartments` | `loadDepartments()` | `void` | refresh |
| `search` | `search(page: number)` | `void` | refresh |
| `reset` | `reset()` | `void` | search |
| `onPageChange` | `onPageChange(newPage: number)` | `void` | search |
| `add` | `add()` | `void` | add(): void { this.router.navigate(['/Parametrages/professions/new']); } |
| `details` | `details(row: ProfessionResponseDTO)` | `void` | details(row: ProfessionResponseDTO): void { this.router.navigate(['/Parametrages/professions', row.idProfession, 'det... |
| `edit` | `edit(row: ProfessionResponseDTO)` | `void` | edit(row: ProfessionResponseDTO): void { this.router.navigate(['/Parametrages/professions', row.idProfession, 'edit']... |
| `delete` | `delete(row: ProfessionResponseDTO)` | `void` | refresh |
| `cancelDelete` | `cancelDelete()` | `void` | refresh |
| `confirmDelete` | `confirmDelete()` | `void` | refresh, search, cancelDelete |
| `export` | `export()` | `void` | export(): void { const header = ['Code', 'Nom', 'Département', 'Type', 'Statut']; const csvRows = this.rows.map(r => ... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `click`, `loading`, `onClick`, `disabled`, `ngFor`.

Visible/action labels detected: `Confirmer la désactivation`, `Attention`, `Désactivation`, `Historique conservé`, `Désactiver`, `Annuler`, `Filtres de recherche`, `Tous les statuts`, `Active`, `Inactive`, `Tous les types`, `Professions normales`, `Profession unique`, `Rechercher`, `Réinitialiser`, `Liste des professions`, `Code`, `Nom`.

### src/app/pages/Parametrages/project-roles/project-role-details/project-role-details.ts

- Class: `ProjectRoleDetailsComponent`.
- Selector: `app-project-role-details`.
- Template: `./project-role-details.html`.
- Styles: `['./project-role-details.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `projectRoleService: ProjectRoleService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `id` | `number` |  |
| `loading` | `implicit` | `false` |
| `role` | `ProjectRoleResponseDTO \| null` | `null` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadRole |
| `loadRole` | `loadRole()` | `void` | loadRole(): void { this.loading = true; this.cd.detectChanges(); this.projectRoleService.getById(this.id).subscribe({... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['/Parametrages/project-roles']); } |
| `edit` | `edit()` | `void` | edit(): void { if (!this.role) return; this.router.navigate(['/Parametrages/project-roles', this.role.id, 'edit']); } |
| `getHierarchyLabel` | `getHierarchyLabel(level?: number)` | `string` | getHierarchyLabel(level?: number): string { switch (level) { case 1: return 'Niveau 1 — Direction'; case 2: return 'N... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `onClick`, `disabled`, `ngIf`.

Visible/action labels detected: `Détails du rôle projet`, `Retour`, `Modifier`, `Identifiant`, `Type de rôle`, `Rôle unique`, `Rôle multiple`, `Niveau hiérarchique`, `Catégorie`, `Statut`, `ID Catégorie`, `Créé le`, `Dernière modification`, `Règle hiérarchique`, `Aucun rôle projet trouvé.`.

### src/app/pages/Parametrages/project-roles/project-role-edit/project-role-edit.ts

- Class: `ProjectRoleEditComponent`.
- Selector: `app-project-role-edit`.
- Template: `./project-role-edit.html`.
- Styles: `['./project-role-edit.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `projectRoleService: ProjectRoleService`, `roleCategoryService: RoleCategoryService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `id` | `number` |  |
| `loading` | `implicit` | `false` |
| `saving` | `implicit` | `false` |
| `loadingCategories` | `implicit` | `false` |
| `categories` | `RoleCategoryResponseDTO[]` | `[]` |
| `form` | `ProjectRoleUpdateDTO` | `{ name: '', description: '', uniqueRole: false, hierarchyLevel: 4, roleCategoryId: unde...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadCategories, loadRole |
| `loadCategories` | `loadCategories()` | `void` | showError |
| `loadRole` | `loadRole()` | `void` | showError |
| `save` | `save()` | `void` | showError |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['/Parametrages/project-roles']); } |
| `getHierarchyLabel` | `getHierarchyLabel(level?: number)` | `string` | getHierarchyLabel(level?: number): string { switch (level) { case 1: return 'Niveau 1 — Direction'; case 2: return 'N... |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `disabled`, `ngFor`, `onClick`, `loading`.

Visible/action labels detected: `Modifier un rôle projet`, `Informations du rôle`, `Nom *`, `Catégorie *`, `Type de rôle *`, `Rôle multiple`, `Rôle unique`, `Niveau hiérarchique *`, `Niveau 1 — Direction`, `Niveau 2 — Leadership`, `Niveau 3 — Analyse / Senior`, `Niveau 4 — Exécution`, `Niveau 5 — Support`, `Aperçu hiérarchique`, `Description`, `Modification du rôle projet`, `Le nom du rôle projet doit rester unique`, `La catégorie peut être changée`.

### src/app/pages/Parametrages/project-roles/project-role-form/project-role-form.ts

- Class: `ProjectRoleFormComponent`.
- Selector: `app-project-role-form`.
- Template: `./project-role-form.html`.
- Styles: `['./project-role-form.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `projectRoleService: ProjectRoleService`, `roleCategoryService: RoleCategoryService`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `saving` | `implicit` | `false` |
| `loadingCategories` | `implicit` | `false` |
| `categories` | `RoleCategoryResponseDTO[]` | `[]` |
| `form` | `ProjectRoleCreateDTO` | `{ name: '', description: '', uniqueRole: false, hierarchyLevel: 4, roleCategoryId: 0 }` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadCategories |
| `loadCategories` | `loadCategories()` | `void` | showError |
| `save` | `save()` | `void` | showError |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['/Parametrages/project-roles']); } |
| `getHierarchyLabel` | `getHierarchyLabel(level?: number)` | `string` | getHierarchyLabel(level?: number): string { switch (level) { case 1: return 'Niveau 1 — Direction'; case 2: return 'N... |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `disabled`, `ngFor`, `onClick`, `loading`.

Visible/action labels detected: `Ajouter un rôle projet`, `Informations du rôle`, `Nom *`, `Catégorie *`, `Type de rôle *`, `Rôle multiple`, `Rôle unique`, `Niveau hiérarchique *`, `Niveau 1 — Direction`, `Niveau 2 — Leadership`, `Niveau 3 — Analyse / Senior`, `Niveau 4 — Exécution`, `Niveau 5 — Support`, `Aperçu hiérarchique`, `Description`, `Règles de création`, `Le nom du rôle projet doit être unique`, `Annuler`.

### src/app/pages/Parametrages/project-roles/project-role-list/project-role-list.ts

- Class: `ProjectRoleListComponent`.
- Selector: `app-project-role-list`.
- Template: `./project-role-list.html`.
- Styles: `['./project-role-list.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `RouterModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `TooltipModule`.
- Providers: `MessageService`.
- Constructor injections: `projectRoleService: ProjectRoleService`, `roleCategoryService: RoleCategoryService`, `router: Router`, `cd: ChangeDetectorRef`, `zone: NgZone`, `messageService: MessageService`, `rbacService: RbacService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `rows` | `ProjectRoleResponseDTO[]` | `[]` |
| `categories` | `RoleCategoryResponseDTO[]` | `[]` |
| `loading` | `implicit` | `false` |
| `loadingCategories` | `implicit` | `false` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `7` |
| `totalElements` | `implicit` | `0` |
| `totalPages` | `implicit` | `0` |
| `isSearchMode` | `implicit` | `false` |
| `filters` | `ProjectRoleSearchCriteriaDTO` | `{ keyword: '', uniqueRole: undefined, active: true, roleCategoryId: undefined, hierarch...` |
| `showDeleteConfirm` | `implicit` | `false` |
| `roleToDelete` | `ProjectRoleResponseDTO \| null` | `null` |
| `deleting` | `implicit` | `false` |
| `destroy$` | `implicit` | `new Subject<void>()` |
| `MODULE_NAME` | `implicit` | `'gestion les roles des projets'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadCategories, loadAll |
| `ngOnDestroy` | `ngOnDestroy()` | `void` | ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); } |
| `canCreate` | `canCreate()` | `boolean` | canCreate(): boolean { return this.rbacService.canCreate(this.MODULE_NAME); } |
| `canUpdate` | `canUpdate()` | `boolean` | canUpdate(): boolean { return this.rbacService.canUpdate(this.MODULE_NAME); } |
| `canDelete` | `canDelete()` | `boolean` | canDelete(): boolean { return this.rbacService.canDelete(this.MODULE_NAME); } |
| `refresh` | `refresh()` | `void` | private refresh(): void { this.cd.detectChanges(); } |
| `loadCategories` | `loadCategories()` | `void` | refresh |
| `loadAll` | `loadAll(page: number)` | `void` | refresh |
| `search` | `search(page: number)` | `void` | refresh |
| `reset` | `reset()` | `void` | loadAll |
| `onPageChange` | `onPageChange(newPage: number)` | `void` | search, loadAll |
| `add` | `add()` | `void` | add(): void { this.router.navigate(['/Parametrages/project-roles/new']); } |
| `details` | `details(role: ProjectRoleResponseDTO)` | `void` | details(role: ProjectRoleResponseDTO): void { this.router.navigate(['/Parametrages/project-roles', role.id, 'details'... |
| `edit` | `edit(role: ProjectRoleResponseDTO)` | `void` | edit(role: ProjectRoleResponseDTO): void { this.router.navigate(['/Parametrages/project-roles', role.id, 'edit']); } |
| `delete` | `delete(role: ProjectRoleResponseDTO)` | `void` | refresh |
| `cancelDelete` | `cancelDelete()` | `void` | refresh |
| `confirmDelete` | `confirmDelete()` | `void` | refresh, search, loadAll |
| `getHierarchyLabel` | `getHierarchyLabel(level?: number)` | `string` | getHierarchyLabel(level?: number): string { switch (level) { case 1: return 'Niveau 1 — Direction'; case 2: return 'N... |
| `export` | `export()` | `void` | getHierarchyLabel |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `click`, `loading`, `onClick`, `disabled`, `ngFor`.

Visible/action labels detected: `Confirmer la désactivation`, `Conditions de désactivation`, `Désactivation refusée`, `READY`, `RUNNING`, `ON_HOLD`, `Désactivation historique`, `ENDED`, `CANCELLED`, `Conservation historique`, `Désactiver`, `Annuler`, `Filtres de recherche`, `Type de rôle`, `Rôle unique`, `Rôle multiple`, `Niveau hiérarchique`, `Niveau 1 — Direction`.

### src/app/pages/Parametrages/projects/project-details/project-details.component.ts

- Class: `ProjectDetailsComponent`.
- Selector: `app-project-details`.
- Template: `./project-details.component.html`.
- Styles: `['./project-details.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `projectService: ProjectService`, `teamService: TeamService`, `departmentService: DepartmentService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `project` | `ProjectResponseDTO` |  |
| `team` | `TeamResponseDTO` |  |
| `departments` | `DepartmentResponseDTO[]` | `[]` |
| `loading` | `implicit` | `true` |
| `loadingTeam` | `implicit` | `false` |
| `loadingDepartments` | `implicit` | `false` |
| `ProjectStatus` | `implicit` | `ProjectStatus` |
| `timeline` | `TimelineStep[]` | `[ { status: ProjectStatus.DRAFT, label: 'Brouillon', icon: 'pi pi-pencil', description:...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadProject |
| `loadProject` | `loadProject(id: number)` | `void` | loadTeamIfExists, loadDepartmentsIfExists, showError |
| `loadTeamIfExists` | `loadTeamIfExists()` | `void` | loadTeamIfExists(): void { if (!this.project?.teamId) return; this.loadingTeam = true; this.cd.detectChanges(); this.... |
| `loadDepartmentsIfExists` | `loadDepartmentsIfExists()` | `void` | loadDepartmentsIfExists(): void { if (!this.project?.departmentIds \|\| this.project.departmentIds.length === 0) { this... |
| `edit` | `edit()` | `void` | edit(): void { if (!this.project) return; this.router.navigate(['/Parametrages/projects', this.project.id, 'edit']); } |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['/Parametrages/projects']); } |
| `canEdit` | `canEdit()` | `boolean` | canEdit(): boolean { if (!this.project) return false; return this.project.status !== ProjectStatus.ENDED && this.proj... |
| `hasTeam` | `hasTeam()` | `boolean` | hasTeam(): boolean { return !!this.project?.teamId \|\| !!this.project?.teamName; } |
| `formatStatus` | `formatStatus(status?: ProjectStatus)` | `string` | formatStatus(status?: ProjectStatus): string { switch (status) { case ProjectStatus.DRAFT: return 'Brouillon'; case P... |
| `statusClass` | `statusClass(status?: ProjectStatus)` | `string` | statusClass(status?: ProjectStatus): string { switch (status) { case ProjectStatus.DRAFT: return 'badge-gray'; case P... |
| `timelineClass` | `timelineClass(step: TimelineStep)` | `string` | isStepPassed |
| `isStepPassed` | `isStepPassed(status: ProjectStatus)` | `boolean` | isStepPassed(status: ProjectStatus): boolean { if (!this.project) return false; const order = [ ProjectStatus.DRAFT, ... |
| `formatDate` | `formatDate(date?: string)` | `string` | formatDate(date?: string): string { if (!date) return '—'; const parsed = new Date(date); if (Number.isNaN(parsed.get... |
| `formatDateTime` | `formatDateTime(date?: string)` | `string` | formatDateTime(date?: string): string { if (!date) return '—'; const parsed = new Date(date); if (Number.isNaN(parsed... |
| `formatBudget` | `formatBudget(budget?: number)` | `string` | formatBudget(budget?: number): string { if (budget === null \|\| budget === undefined) return '—'; return new Intl.Numb... |
| `getDepartmentFallbackIds` | `getDepartmentFallbackIds()` | `number[]` | getDepartmentFallbackIds(): number[] { if (!this.project?.departmentIds) return []; const loadedIds = this.department... |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `ngFor`, `onClick`, `disabled`.

Visible/action labels detected: `Chargement...`, `Chargement des données...`, `Projet introuvable`, `Aucun projet trouvé.`, `Informations Générales`, `Nom`, `Client`, `Statut`, `Budget`, `Date début`, `Date fin`, `Description`, `Date de création`, `Dernière modification`, `Équipe Affectée`, `Chargement de l'équipe...`, `Aucune équipe affectée à ce projet`, `Nom de l'équipe`.

### src/app/pages/Parametrages/projects/project-edit/project-edit.component.ts

- Class: `ProjectEditComponent`.
- Selector: `app-project-edit`.
- Template: `./project-edit.component.html`.
- Styles: `['./project-edit.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `SelectModule`, `MultiSelectModule`.
- Providers: `MessageService`.
- Constructor injections: `projectService: ProjectService`, `teamService: TeamService`, `departmentService: DepartmentService`, `route: ActivatedRoute`, `router: Router`, `cd: ChangeDetectorRef`, `zone: NgZone`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `projectId` | `number` |  |
| `loadingProject` | `implicit` | `false` |
| `saving` | `implicit` | `false` |
| `loadingTeams` | `implicit` | `false` |
| `loadingDepartments` | `implicit` | `false` |
| `project` | `ProjectResponseDTO \| null` | `null` |
| `teams` | `TeamResponseDTO[]` | `[]` |
| `teamOptions` | `TeamSelectOption[]` | `[]` |
| `departments` | `DepartmentResponseDTO[]` | `[]` |
| `selectedTeamId` | `number \| null` | `null` |
| `originalTeamId` | `number \| null` | `null` |
| `selectedDepartmentIds` | `number[]` | `[]` |
| `originalDepartmentIds` | `number[]` | `[]` |
| `teamSearchTimeout` | `any` |  |
| `form` | `ProjectUpdateDTO` | `{ name: '', description: '', status: undefined, startDate: undefined, endDate: undefine...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | showError, cancel, loadDepartments, loadProject |
| `applyView` | `applyView()` | `void` | private applyView(): void { setTimeout(() => { try { this.cd.detectChanges(); } catch {} }, 0); } |
| `runView` | `runView(callback: () => void)` | `void` | applyView |
| `buildTeamOptions` | `buildTeamOptions()` | `void` | private buildTeamOptions(): void { const options: TeamSelectOption[] = [ { id: null, name: 'Aucune équipe / affecter ... |
| `loadProject` | `loadProject()` | `void` | applyView, runView, loadFreeTeams, showError |
| `loadFreeTeams` | `loadFreeTeams(searchTerm: string)` | `void` | applyView, runView, buildTeamOptions, showError |
| `onTeamFilter` | `onTeamFilter(event: any)` | `void` | loadFreeTeams |
| `loadDepartments` | `loadDepartments()` | `void` | applyView, runView, showError |
| `isStructuralEditionAllowed` | `isStructuralEditionAllowed()` | `boolean` | isStructuralEditionAllowed(): boolean { if (!this.project?.status) return false; return this.project.status === Proje... |
| `save` | `save()` | `void` | showError, applyView, isStructuralEditionAllowed, runView |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['/Parametrages/projects']); } |
| `showError` | `showError(detail: string)` | `void` | applyView |

Template PrimeNG elements: `p-toast`, `p-select`, `p-multiSelect`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `options`, `disabled`, `loading`, `onClick`.

Visible/action labels detected: `Modifier un projet`, `Chargement du projet...`, `Informations du projet`, `Nom *`, `Client`, `Budget`, `Date début`, `Date fin`, `Équipe affectée`, `Départements opérationnels`, `Description`, `Règles de modification`, `Vous pouvez choisir`, `Aucune équipe`, `pour remettre le projet en préparation`, `DRAFT`, `Annuler`, `Sauvegarder`.

### src/app/pages/Parametrages/projects/project-form/project-form.component.ts

- Class: `ProjectFormComponent`.
- Selector: `app-project-form`.
- Template: `./project-form.component.html`.
- Styles: `['./project-form.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `SelectModule`, `MultiSelectModule`.
- Providers: `MessageService`.
- Constructor injections: `projectService: ProjectService`, `teamService: TeamService`, `departmentService: DepartmentService`, `router: Router`, `cd: ChangeDetectorRef`, `zone: NgZone`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `saving` | `implicit` | `false` |
| `loadingTeams` | `implicit` | `false` |
| `loadingDepartments` | `implicit` | `false` |
| `teams` | `TeamResponseDTO[]` | `[]` |
| `teamOptions` | `TeamSelectOption[]` | `[]` |
| `departments` | `DepartmentResponseDTO[]` | `[]` |
| `selectedTeamId` | `number \| null` | `null` |
| `selectedDepartmentIds` | `number[]` | `[]` |
| `teamSearchTimeout` | `any` |  |
| `form` | `ProjectCreateDTO` | `{ name: '', description: '', startDate: undefined, endDate: undefined, budget: undefine...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadFreeTeams, loadDepartments |
| `applyView` | `applyView()` | `void` | private applyView(): void { setTimeout(() => { try { this.cd.detectChanges(); } catch {} }, 0); } |
| `runView` | `runView(callback: () => void)` | `void` | applyView |
| `buildTeamOptions` | `buildTeamOptions()` | `void` | private buildTeamOptions(): void { this.teamOptions = [ { id: null, name: 'Aucune équipe / affecter plus tard', membe... |
| `loadFreeTeams` | `loadFreeTeams(searchTerm: string)` | `void` | applyView, runView, buildTeamOptions, showError |
| `onTeamFilter` | `onTeamFilter(event: any)` | `void` | loadFreeTeams |
| `loadDepartments` | `loadDepartments()` | `void` | applyView, runView, showError |
| `save` | `save()` | `void` | showError, applyView, runView |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['/Parametrages/projects']); } |
| `showError` | `showError(detail: string)` | `void` | applyView |

Template PrimeNG elements: `p-toast`, `p-select`, `p-multiSelect`, `p-button`.

Template bindings/events/directives detected: `options`, `loading`, `ngIf`, `disabled`, `onClick`.

Visible/action labels detected: `Ajouter un projet`, `Informations du projet`, `Nom *`, `Client`, `Budget`, `Date début`, `Date fin`, `Équipe libre optionnelle`, `Départements opérationnels`, `Description`, `Règles de création`, `Le projet est créé en statut`, `DRAFT`, `automatiquement`, `Vous pouvez choisir`, `Aucune équipe`, `pour affecter l’équipe plus tard`, `Le projet devient`.

### src/app/pages/Parametrages/projects/project-list/project-list.component.ts

- Class: `ProjectListComponent`.
- Selector: `app-project-list`.
- Template: `./project-list.component.html`.
- Styles: `['./project-list.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `RouterModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `TooltipModule`, `SelectModule`.
- Providers: `MessageService`.
- Constructor injections: `projectService: ProjectService`, `teamService: TeamService`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`, `rbacService: RbacService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `MODULE_NAME` | `implicit` | `'gestion des projets'` |
| `ProjectStatus` | `implicit` | `ProjectStatus` |
| `rows` | `ProjectResponseDTO[]` | `[]` |
| `loading` | `implicit` | `false` |
| `loadingAssignedTeams` | `implicit` | `false` |
| `assignedTeams` | `TeamResponseDTO[]` | `[]` |
| `teamOptions` | `TeamFilterOption[]` | `[]` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `7` |
| `totalElements` | `implicit` | `0` |
| `totalPages` | `implicit` | `0` |
| `isSearchMode` | `implicit` | `false` |
| `statuses` | `ProjectStatus[]` | `[ ProjectStatus.DRAFT, ProjectStatus.READY, ProjectStatus.RUNNING, ProjectStatus.ON_HOL...` |
| `filters` | `ProjectSearchCriteriaDTO` | `{ keyword: '', status: undefined, startDateFrom: undefined, endDateTo: undefined, clien...` |
| `showConfirm` | `implicit` | `false` |
| `confirmActionType` | `ConfirmActionType \| null` | `null` |
| `projectToConfirm` | `ProjectResponseDTO \| null` | `null` |
| `confirming` | `implicit` | `false` |
| `changingStatusId` | `number` |  |
| `teamSearchTimeout` | `any` |  |
| `destroy$` | `implicit` | `new Subject<void>()` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadAssignedTeams, loadAll |
| `ngOnDestroy` | `ngOnDestroy()` | `void` | ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); clearTimeout(this.teamSearchTimeout); } |
| `canCreateProject` | `canCreateProject()` | `boolean` | canCreateProject(): boolean { return this.rbacService.canCreate(this.MODULE_NAME); } |
| `canUpdateProject` | `canUpdateProject()` | `boolean` | canUpdateProject(): boolean { return this.rbacService.canUpdate(this.MODULE_NAME); } |
| `canDeleteProject` | `canDeleteProject()` | `boolean` | canDeleteProject(): boolean { return this.rbacService.canDelete(this.MODULE_NAME); } |
| `buildTeamOptions` | `buildTeamOptions()` | `void` | private buildTeamOptions(): void { this.teamOptions = [ { id: null, name: 'Toutes les équipes', membersCount: 0, allT... |
| `loadAssignedTeams` | `loadAssignedTeams(searchTerm: string)` | `void` | buildTeamOptions, showError |
| `onTeamFilter` | `onTeamFilter(event: any)` | `void` | loadAssignedTeams |
| `loadAll` | `loadAll(page: number)` | `void` | showError |
| `search` | `search(page: number)` | `void` | showError, loadAll |
| `reset` | `reset()` | `void` | loadAssignedTeams, loadAll |
| `onPageChange` | `onPageChange(newPage: number)` | `void` | search, loadAll |
| `add` | `add()` | `void` | add(): void { this.router.navigate(['/Parametrages/projects/new']); } |
| `details` | `details(project: ProjectResponseDTO)` | `void` | details(project: ProjectResponseDTO): void { this.router.navigate(['/Parametrages/projects', project.id, 'details']); } |
| `edit` | `edit(project: ProjectResponseDTO)` | `void` | edit(project: ProjectResponseDTO): void { this.router.navigate(['/Parametrages/projects', project.id, 'edit']); } |
| `openDeleteConfirm` | `openDeleteConfirm(project: ProjectResponseDTO)` | `void` | openConfirm |
| `openCancelConfirm` | `openCancelConfirm(project: ProjectResponseDTO)` | `void` | openConfirm |
| `openEndConfirm` | `openEndConfirm(project: ProjectResponseDTO)` | `void` | openConfirm |
| `openConfirm` | `openConfirm(project: ProjectResponseDTO, type: ConfirmActionType)` | `void` | private openConfirm(project: ProjectResponseDTO, type: ConfirmActionType): void { this.projectToConfirm = project; th... |
| `cancelConfirm` | `cancelConfirm()` | `void` | cancelConfirm(): void { this.projectToConfirm = null; this.confirmActionType = null; this.showConfirm = false; this.c... |
| `confirmAction` | `confirmAction()` | `void` | confirmDelete, confirmStatusChange |
| `confirmDelete` | `confirmDelete()` | `void` | cancelConfirm, search, loadAll, showError |
| `confirmStatusChange` | `confirmStatusChange(status: ProjectStatus)` | `void` | cancelConfirm, search, loadAll, showError |
| `changeStatusDirect` | `changeStatusDirect(project: ProjectResponseDTO, status: ProjectStatus)` | `void` | search, loadAll, showError |
| `export` | `export()` | `void` | cleanCsv, formatStatus |
| `cleanCsv` | `cleanCsv(value: string)` | `string` | cleanCsv(value: string): string { return `"${value.replace(/"/g, '""')}"`; } |
| `formatStatus` | `formatStatus(status?: ProjectStatus)` | `string` | formatStatus(status?: ProjectStatus): string { switch (status) { case ProjectStatus.DRAFT: return 'Brouillon'; case P... |
| `statusClass` | `statusClass(status?: ProjectStatus)` | `string` | statusClass(status?: ProjectStatus): string { switch (status) { case ProjectStatus.DRAFT: return 'badge-gray'; case P... |
| `getConfirmTitle` | `getConfirmTitle()` | `string` | getConfirmTitle(): string { switch (this.confirmActionType) { case 'DELETE': return 'Confirmer la suppression'; case ... |
| `getConfirmButtonLabel` | `getConfirmButtonLabel()` | `string` | getConfirmButtonLabel(): string { switch (this.confirmActionType) { case 'DELETE': return 'Supprimer'; case 'CANCEL':... |
| `getConfirmButtonIcon` | `getConfirmButtonIcon()` | `string` | getConfirmButtonIcon(): string { switch (this.confirmActionType) { case 'DELETE': return 'pi pi-trash'; case 'CANCEL'... |
| `hasTeam` | `hasTeam(project: ProjectResponseDTO)` | `boolean` | hasTeam(project: ProjectResponseDTO): boolean { return !!project.teamId \|\| !!project.teamName; } |
| `canEdit` | `canEdit(project: ProjectResponseDTO)` | `boolean` | canUpdateProject |
| `canDelete` | `canDelete(project: ProjectResponseDTO)` | `boolean` | canDeleteProject |
| `canStart` | `canStart(project: ProjectResponseDTO)` | `boolean` | canUpdateProject |
| `canPause` | `canPause(project: ProjectResponseDTO)` | `boolean` | canUpdateProject |
| `canResume` | `canResume(project: ProjectResponseDTO)` | `boolean` | canUpdateProject |
| `canEnd` | `canEnd(project: ProjectResponseDTO)` | `boolean` | canUpdateProject |
| `canCancel` | `canCancel(project: ProjectResponseDTO)` | `boolean` | canUpdateProject |
| `isChanging` | `isChanging(project: ProjectResponseDTO)` | `boolean` | isChanging(project: ProjectResponseDTO): boolean { return this.changingStatusId === project.id; } |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |

Template PrimeNG elements: `p-toast`, `p-button`, `p-select`.

Template bindings/events/directives detected: `ngIf`, `click`, `loading`, `onClick`, `disabled`, `options`, `ngFor`.

Visible/action labels detected: `Attention — cette action est importante`, `Le projet sera archivé avec soft delete`, `Attention — cette action est définitive`, `Le projet passera au statut CANCELLED`, `Le projet passera au statut ENDED`, `Retour`, `Filtres de recherche`, `Mot-clé`, `Client`, `Équipe affectée`, `Statut`, `Tous les statuts`, `Date début min`, `Date fin max`, `Rechercher`, `Réinitialiser`, `Liste des projets`.

### src/app/pages/Parametrages/role-categories/role-category-details/role-category-details.ts

- Class: `RoleCategoryDetailComponent`.
- Selector: `app-role-category-detail`.
- Template: `./role-category-details.html`.
- Styles: `['./role-category-details.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `roleCategoryService: RoleCategoryService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `id` | `number` |  |
| `loading` | `implicit` | `false` |
| `category` | `RoleCategoryResponseDTO \| null` | `null` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadCategory |
| `loadCategory` | `loadCategory()` | `void` | loadCategory(): void { this.loading = true; this.cd.detectChanges(); this.roleCategoryService.getById(this.id).subscr... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['/Parametrages/role-categories']); } |
| `edit` | `edit()` | `void` | edit(): void { if (!this.category) return; this.router.navigate(['/Parametrages/role-categories', this.category.id, '... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `onClick`, `disabled`, `ngIf`.

Visible/action labels detected: `Détails de la catégorie`, `Retour`, `Modifier`, `Identifiant`, `Couleur`, `Créé le`, `Dernière modification`, `Aucune catégorie trouvée.`.

### src/app/pages/Parametrages/role-categories/role-category-edit/role-category-edit.ts

- Class: `RoleCategoryEditComponent`.
- Selector: `app-role-category-edit`.
- Template: `./role-category-edit.html`.
- Styles: `['./role-category-edit.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `roleCategoryService: RoleCategoryService`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `id` | `number` |  |
| `loading` | `implicit` | `false` |
| `saving` | `implicit` | `false` |
| `form` | `RoleCategoryUpdateDTO` | `{ name: '', description: '', color: '#1f3b6d' }` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadCategory |
| `loadCategory` | `loadCategory()` | `void` | showError |
| `save` | `save()` | `void` | showError |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['/Parametrages/role-categories']); } |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `disabled`, `onClick`, `loading`.

Visible/action labels detected: `Modifier une catégorie de rôle`, `Informations de la catégorie`, `Nom *`, `Couleur`, `Aperçu`, `Description`, `Modification de la catégorie`, `Le nom de la catégorie est obligatoire`, `Annuler`, `Sauvegarder`.

### src/app/pages/Parametrages/role-categories/role-category-form/role-category-form.ts

- Class: `RoleCategoryFormComponent`.
- Selector: `app-role-category-form`.
- Template: `./role-category-form.html`.
- Styles: `['./role-category-form.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `roleCategoryService: RoleCategoryService`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `saving` | `implicit` | `false` |
| `form` | `RoleCategoryCreateDTO` | `{ name: '', description: '', color: '#1f3b6d' }` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `save` | `save()` | `void` | showError |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['/Parametrages/role-categories']); } |
| `showError` | `showError(detail: string)` | `void` | private showError(detail: string): void { this.messageService.add({ severity: 'error', summary: 'Erreur', detail, lif... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `disabled`, `onClick`, `loading`.

Visible/action labels detected: `Ajouter une catégorie de rôle`, `Informations de la catégorie`, `Nom *`, `Couleur`, `Aperçu`, `Description`, `Règles de création`, `Le nom de la catégorie est obligatoire`, `Annuler`, `Sauvegarder`.

### src/app/pages/Parametrages/role-categories/role-category-list/role-category-list.ts

- Class: `RoleCategoryListComponent`.
- Selector: `app-role-category-list`.
- Template: `./role-category-list.html`.
- Styles: `['./role-category-list.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `RouterModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `TooltipModule`.
- Providers: `MessageService`.
- Constructor injections: `roleCategoryService: RoleCategoryService`, `router: Router`, `cd: ChangeDetectorRef`, `messageService: MessageService`, `rbacService: RbacService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `rows` | `RoleCategoryResponseDTO[]` | `[]` |
| `loading` | `implicit` | `false` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `7` |
| `totalElements` | `implicit` | `0` |
| `totalPages` | `implicit` | `0` |
| `isSearchMode` | `implicit` | `false` |
| `filters` | `RoleCategorySearchCriteriaDTO` | `{ keyword: '', active: true }` |
| `showDeleteConfirm` | `implicit` | `false` |
| `categoryToDelete` | `RoleCategoryResponseDTO \| null` | `null` |
| `deleting` | `implicit` | `false` |
| `destroy$` | `implicit` | `new Subject<void>()` |
| `MODULE_NAME` | `implicit` | `'gestion les Catégories des roles'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadAll |
| `ngOnDestroy` | `ngOnDestroy()` | `void` | ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); } |
| `canCreate` | `canCreate()` | `boolean` | canCreate(): boolean { return this.rbacService.canCreate(this.MODULE_NAME); } |
| `canUpdate` | `canUpdate()` | `boolean` | canUpdate(): boolean { return this.rbacService.canUpdate(this.MODULE_NAME); } |
| `canDelete` | `canDelete()` | `boolean` | canDelete(): boolean { return this.rbacService.canDelete(this.MODULE_NAME); } |
| `loadAll` | `loadAll(page: number)` | `void` | loadAll(page: number = 0): void { this.loading = true; this.isSearchMode = false; this.cd.detectChanges(); this.roleC... |
| `search` | `search(page: number)` | `void` | search(page: number = 0): void { const criteria: RoleCategorySearchCriteriaDTO = { active: true }; if (this.filters.k... |
| `reset` | `reset()` | `void` | loadAll |
| `onPageChange` | `onPageChange(newPage: number)` | `void` | search, loadAll |
| `add` | `add()` | `void` | add(): void { this.router.navigate(['/Parametrages/role-categories/new']); } |
| `details` | `details(category: RoleCategoryResponseDTO)` | `void` | details(category: RoleCategoryResponseDTO): void { this.router.navigate(['/Parametrages/role-categories', category.id... |
| `edit` | `edit(category: RoleCategoryResponseDTO)` | `void` | edit(category: RoleCategoryResponseDTO): void { this.router.navigate(['/Parametrages/role-categories', category.id, '... |
| `delete` | `delete(category: RoleCategoryResponseDTO)` | `void` | delete(category: RoleCategoryResponseDTO): void { this.categoryToDelete = category; this.showDeleteConfirm = true; th... |
| `cancelDelete` | `cancelDelete()` | `void` | cancelDelete(): void { this.categoryToDelete = null; this.showDeleteConfirm = false; this.deleting = false; this.cd.d... |
| `confirmDelete` | `confirmDelete()` | `void` | search, loadAll |
| `export` | `export()` | `void` | export(): void { const header = ['Nom', 'Couleur', 'Statut']; const csvRows = this.rows.map(c => [ c.name \|\| '—', c.c... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `ngIf`, `click`, `loading`, `onClick`, `disabled`, `ngFor`.

Visible/action labels detected: `Confirmer la désactivation`, `Attention — désactivation`, `Désactiver`, `Annuler`, `Filtres de recherche`, `Rechercher`, `Réinitialiser`, `Nom`, `Couleur`, `Statut`, `Actions`, `Aucune catégorie trouvée.`.

### src/app/pages/Parametrages/teams/team-detail/team-detail.ts

- Class: `TeamDetailsComponent`.
- Selector: `app-team-details`.
- Template: `./team-detail.html`.
- Styles: `['./team-detail.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ButtonModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `teamService: TeamService`, `usersService: UsersService`, `cd: ChangeDetectorRef`, `zone: NgZone`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `teamId` | `number` |  |
| `loading` | `implicit` | `false` |
| `loadingMembers` | `implicit` | `false` |
| `team` | `TeamResponseDTO \| null` | `null` |
| `members` | `MemberRow[]` | `[]` |
| `pagedMembers` | `MemberRow[]` | `[]` |
| `memberPage` | `implicit` | `0` |
| `memberPageSize` | `implicit` | `7` |
| `memberTotalPages` | `implicit` | `0` |
| `defaultMale` | `implicit` | `'assets/images/default-user-male.png'` |
| `defaultFemale` | `implicit` | `'assets/images/default-user-female.png'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadTeam |
| `applyView` | `applyView()` | `void` | private applyView(): void { setTimeout(() => { try { this.cd.detectChanges(); } catch {} }, 0); } |
| `runView` | `runView(callback: () => void)` | `void` | applyView |
| `loadTeam` | `loadTeam()` | `void` | applyView, runView, loadMembers, showError |
| `loadMembers` | `loadMembers()` | `void` | refreshPagination, applyView, runView, fullName, getAvatar |
| `refreshPagination` | `refreshPagination()` | `void` | applyView |
| `onMemberPageChange` | `onMemberPageChange(page: number)` | `void` | refreshPagination |
| `fullName` | `fullName(user: UserResponseDTO)` | `string` | fullName(user: UserResponseDTO): string { return `${user.firstName \|\| ''} ${user.lastName \|\| ''}`.trim() \|\| user.user... |
| `getAvatar` | `getAvatar(user: UserResponseDTO)` | `string` | getAvatar(user: UserResponseDTO): string { if (user.photoUrl && user.photoUrl.trim() !== '') { return user.photoUrl; ... |
| `onAvatarError` | `onAvatarError(event: Event)` | `void` | onAvatarError(event: Event): void { (event.target as HTMLImageElement).src = this.defaultMale; } |
| `formatStatus` | `formatStatus(status?: string)` | `string` | formatStatus(status?: string): string { switch (status) { case 'FREE': return 'Libre'; case 'ASSIGNED': return 'Affec... |
| `statusClass` | `statusClass(status?: string)` | `string` | statusClass(status?: string): string { switch (status) { case 'FREE': return 'badge-green'; case 'ASSIGNED': return '... |
| `getHierarchyLabel` | `getHierarchyLabel(level?: number)` | `string` | getHierarchyLabel(level?: number): string { switch (level) { case 1: return 'Niv. 1 Direction'; case 2: return 'Niv. ... |
| `back` | `back()` | `void` | back(): void { this.router.navigate(['/Parametrages/teams']); } |
| `edit` | `edit()` | `void` | edit(): void { if (!this.team) return; this.router.navigate(['/Parametrages/teams', this.team.projectId \|\| 0, this.te... |
| `showError` | `showError(detail: string)` | `void` | applyView |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `onClick`, `disabled`, `ngIf`, `ngFor`, `click`.

Visible/action labels detected: `Détails de l'équipe`, `Retour`, `Modifier`, `Chargement de l'équipe...`, `Identifiant`, `Projet`, `Aucun projet`, `Nombre de membres`, `Créée le`, `Dernière modification`, `Utilisateur`, `Email`, `Rôle projet`, `Niveau`, `Catégorie`, `Aucune équipe trouvée.`.

### src/app/pages/Parametrages/teams/team-edit/team-edit.ts

- Class: `TeamEditComponent`.
- Selector: `app-team-edit`.
- Template: `./team-edit.html`.
- Styles: `['./team-edit.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `route: ActivatedRoute`, `router: Router`, `teamService: TeamService`, `projectService: ProjectService`, `projectRoleService: ProjectRoleService`, `departmentService: DepartmentService`, `usersService: UsersService`, `cd: ChangeDetectorRef`, `zone: NgZone`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `teamId` | `number` |  |
| `loadingTeam` | `implicit` | `false` |
| `saving` | `implicit` | `false` |
| `loadingProjects` | `implicit` | `false` |
| `loadingRoles` | `implicit` | `false` |
| `loadingUsers` | `implicit` | `false` |
| `loadingDepartments` | `implicit` | `false` |
| `team` | `TeamResponseDTO \| null` | `null` |
| `projects` | `ProjectResponseDTO[]` | `[]` |
| `roles` | `ProjectRoleResponseDTO[]` | `[]` |
| `users` | `UserResponseDTO[]` | `[]` |
| `departments` | `DepartmentResponseDTO[]` | `[]` |
| `operationalDepartmentIds` | `number[]` | `[]` |
| `priorityUserIds` | `string[]` | `[]` |
| `originalProjectId` | `number` |  |
| `selectedProjectId` | `number` |  |
| `userPage` | `implicit` | `0` |
| `userPageSize` | `implicit` | `7` |
| `userTotalElements` | `implicit` | `0` |
| `userTotalPages` | `implicit` | `0` |
| `userFilters` | `implicit` | `{ firstName: '', lastName: '', departmentId: undefined as number | undefined }` |
| `selectedUsers` | `implicit` | `new Map<string, UserResponseDTO>()` |
| `selectedRoles` | `implicit` | `new Map<string, number>()` |
| `existingMemberIds` | `implicit` | `new Map<string, number>()` |
| `removedMemberIds` | `implicit` | `new Set<number>()` |
| `form` | `TeamUpdateDTO` | `{ name: '', description: '' }` |
| `defaultMale` | `implicit` | `'assets/images/default-user-male.png'` |
| `defaultFemale` | `implicit` | `'assets/images/default-user-female.png'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadTeam, loadProjects, loadRoles, loadDepartmentsThenUsers |
| `applyView` | `applyView()` | `void` | private applyView(): void { setTimeout(() => { try { this.cd.detectChanges(); } catch {} }, 0); } |
| `runView` | `runView(callback: () => void)` | `void` | applyView |
| `loadTeam` | `loadTeam()` | `void` | applyView, runView, loadSelectedUsers, searchUsers, showError |
| `loadSelectedUsers` | `loadSelectedUsers(userIds: string[])` | `void` | runView, showError |
| `loadProjects` | `loadProjects()` | `void` | applyView, runView, showError |
| `loadRoles` | `loadRoles()` | `void` | applyView, runView, showError |
| `loadDepartmentsThenUsers` | `loadDepartmentsThenUsers()` | `void` | applyView, runView, searchUsers, showError |
| `buildUserCriteria` | `buildUserCriteria()` | `UserSearchCriteria` | buildUserCriteria(): UserSearchCriteria { const criteria: UserSearchCriteria = { isActive: true, departmentIds: this.... |
| `searchUsers` | `searchUsers(page: number)` | `void` | applyView, buildUserCriteria, runView, showError |
| `resetUserFilters` | `resetUserFilters()` | `void` | searchUsers |
| `onUserPageChange` | `onUserPageChange(page: number)` | `void` | searchUsers |
| `toggleUser` | `toggleUser(user: UserResponseDTO, checked: boolean)` | `void` | searchUsers |
| `isSelected` | `isSelected(user: UserResponseDTO)` | `boolean` | isSelected(user: UserResponseDTO): boolean { return this.selectedUsers.has(user.keycloakId); } |
| `onRoleChange` | `onRoleChange(user: UserResponseDTO, roleId: number)` | `void` | isSelected, applyView, isUniqueRoleAlreadyUsed, showError |
| `isRoleDisabledForUser` | `isRoleDisabledForUser(role: ProjectRoleResponseDTO, user: UserResponseDTO)` | `boolean` | isSelected, isUniqueRoleAlreadyUsed |
| `isUniqueRoleAlreadyUsed` | `isUniqueRoleAlreadyUsed(roleId: number, currentUserKeycloakId?: string)` | `boolean` | isUniqueRoleAlreadyUsed(roleId: number, currentUserKeycloakId?: string): boolean { const role = this.roles.find(r => ... |
| `hasDuplicateUniqueRoles` | `hasDuplicateUniqueRoles()` | `boolean` | hasDuplicateUniqueRoles(): boolean { const usedUniqueRoles = new Set<number>(); for (const roleId of this.selectedRol... |
| `save` | `save()` | `void` | showError, fullName, hasDuplicateUniqueRoles, applyView, runView |
| `getSelectedCount` | `getSelectedCount()` | `number` | getSelectedCount(): number { return this.selectedUsers.size; } |
| `getAvatar` | `getAvatar(user: UserResponseDTO)` | `string` | getAvatar(user: UserResponseDTO): string { if (user.photoUrl && user.photoUrl.trim() !== '') { return user.photoUrl; ... |
| `onAvatarError` | `onAvatarError(event: Event)` | `void` | onAvatarError(event: Event): void { (event.target as HTMLImageElement).src = this.defaultMale; } |
| `fullName` | `fullName(user: UserResponseDTO)` | `string` | fullName(user: UserResponseDTO): string { return `${user.firstName \|\| ''} ${user.lastName \|\| ''}`.trim() \|\| user.user... |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['/Parametrages/teams']); } |
| `showError` | `showError(detail: string)` | `void` | applyView |
| `getSelectedRole` | `getSelectedRole(user: UserResponseDTO)` | `ProjectRoleResponseDTO \| undefined` | getSelectedRole(user: UserResponseDTO): ProjectRoleResponseDTO \| undefined { const roleId = this.selectedRoles.get(us... |
| `getHierarchyLabel` | `getHierarchyLabel(level?: number)` | `string` | getHierarchyLabel(level?: number): string { switch (level) { case 1: return 'Niv. 1 Direction'; case 2: return 'Niv. ... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `disabled`, `ngFor`, `onClick`, `ngIf`, `ngModel`, `click`, `loading`.

Visible/action labels detected: `Modifier une équipe`, `Informations de l'équipe`, `Nom *`, `Projet optionnel`, `Description`, `Gestion des membres`, `Rechercher`, `Réinitialiser`, `Sélect.`, `Utilisateur`, `Profession`, `Département`, `Statut`, `Rôle projet`, `Règles de modification`, `Annuler`, `Sauvegarder`.

### src/app/pages/Parametrages/teams/team-form/team-form.ts

- Class: `TeamFormComponent`.
- Selector: `app-team-form`.
- Template: `./team-form.html`.
- Styles: `['./team-form.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `InputTextModule`, `ToastModule`.
- Providers: `MessageService`.
- Constructor injections: `teamService: TeamService`, `projectService: ProjectService`, `projectRoleService: ProjectRoleService`, `departmentService: DepartmentService`, `usersService: UsersService`, `router: Router`, `cd: ChangeDetectorRef`, `zone: NgZone`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `saving` | `implicit` | `false` |
| `loadingProjects` | `implicit` | `false` |
| `loadingRoles` | `implicit` | `false` |
| `loadingUsers` | `implicit` | `false` |
| `loadingDepartments` | `implicit` | `false` |
| `projects` | `ProjectResponseDTO[]` | `[]` |
| `roles` | `ProjectRoleResponseDTO[]` | `[]` |
| `users` | `UserResponseDTO[]` | `[]` |
| `departments` | `DepartmentResponseDTO[]` | `[]` |
| `operationalDepartmentIds` | `number[]` | `[]` |
| `selectedProjectId` | `number` |  |
| `userPage` | `implicit` | `0` |
| `userPageSize` | `implicit` | `7` |
| `userTotalElements` | `implicit` | `0` |
| `userTotalPages` | `implicit` | `0` |
| `isUserSearchMode` | `implicit` | `true` |
| `userFilters` | `implicit` | `{ firstName: '', lastName: '', departmentId: undefined as number | undefined }` |
| `selectedUsers` | `implicit` | `new Map<string, UserResponseDTO>()` |
| `selectedRoles` | `implicit` | `new Map<string, number>()` |
| `form` | `TeamCreateDTO` | `{ name: '', description: '' }` |
| `defaultMale` | `implicit` | `'assets/images/default-user-male.png'` |
| `defaultFemale` | `implicit` | `'assets/images/default-user-female.png'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadProjects, loadRoles, loadDepartmentsThenUsers |
| `applyView` | `applyView()` | `void` | private applyView(): void { setTimeout(() => { try { this.cd.detectChanges(); } catch {} }, 0); } |
| `runView` | `runView(callback: () => void)` | `void` | applyView |
| `loadProjects` | `loadProjects()` | `void` | applyView, runView, showError |
| `loadRoles` | `loadRoles()` | `void` | applyView, runView, showError |
| `loadDepartmentsThenUsers` | `loadDepartmentsThenUsers()` | `void` | applyView, runView, searchUsers, showError |
| `buildUserCriteria` | `buildUserCriteria()` | `UserSearchCriteria` | buildUserCriteria(): UserSearchCriteria { const criteria: UserSearchCriteria = { isActive: true, departmentIds: this.... |
| `searchUsers` | `searchUsers(page: number)` | `void` | applyView, buildUserCriteria, runView, showError |
| `resetUserFilters` | `resetUserFilters()` | `void` | searchUsers |
| `onUserPageChange` | `onUserPageChange(page: number)` | `void` | searchUsers |
| `toggleUser` | `toggleUser(user: UserResponseDTO, checked: boolean)` | `void` | applyView |
| `isSelected` | `isSelected(user: UserResponseDTO)` | `boolean` | isSelected(user: UserResponseDTO): boolean { return this.selectedUsers.has(user.keycloakId); } |
| `onRoleChange` | `onRoleChange(user: UserResponseDTO, roleId: number)` | `void` | isSelected, applyView, isUniqueRoleAlreadyUsed, showError |
| `isRoleDisabledForUser` | `isRoleDisabledForUser(role: ProjectRoleResponseDTO, user: UserResponseDTO)` | `boolean` | isSelected, isUniqueRoleAlreadyUsed |
| `isUniqueRoleAlreadyUsed` | `isUniqueRoleAlreadyUsed(roleId: number, currentUserKeycloakId?: string)` | `boolean` | isUniqueRoleAlreadyUsed(roleId: number, currentUserKeycloakId?: string): boolean { const role = this.roles.find(r => ... |
| `hasDuplicateUniqueRoles` | `hasDuplicateUniqueRoles()` | `boolean` | hasDuplicateUniqueRoles(): boolean { const usedUniqueRoles = new Set<number>(); for (const roleId of this.selectedRol... |
| `getSelectedCount` | `getSelectedCount()` | `number` | getSelectedCount(): number { return this.selectedUsers.size; } |
| `getAvatar` | `getAvatar(user: UserResponseDTO)` | `string` | getAvatar(user: UserResponseDTO): string { if (user.photoUrl && user.photoUrl.trim() !== '') { return user.photoUrl; ... |
| `onAvatarError` | `onAvatarError(event: Event)` | `void` | onAvatarError(event: Event): void { (event.target as HTMLImageElement).src = this.defaultMale; } |
| `fullName` | `fullName(user: UserResponseDTO)` | `string` | fullName(user: UserResponseDTO): string { return `${user.firstName \|\| ''} ${user.lastName \|\| ''}`.trim() \|\| user.user... |
| `save` | `save()` | `void` | showError, fullName, hasDuplicateUniqueRoles, applyView, runView |
| `cancel` | `cancel()` | `void` | cancel(): void { this.router.navigate(['/Parametrages/teams']); } |
| `showError` | `showError(detail: string)` | `void` | applyView |
| `getSelectedRole` | `getSelectedRole(user: UserResponseDTO)` | `ProjectRoleResponseDTO \| undefined` | getSelectedRole(user: UserResponseDTO): ProjectRoleResponseDTO \| undefined { const roleId = this.selectedRoles.get(us... |
| `getHierarchyLabel` | `getHierarchyLabel(level?: number)` | `string` | getHierarchyLabel(level?: number): string { switch (level) { case 1: return 'Niv. 1 Direction'; case 2: return 'Niv. ... |

Template PrimeNG elements: `p-toast`, `p-button`.

Template bindings/events/directives detected: `disabled`, `ngFor`, `onClick`, `ngIf`, `ngModel`, `click`, `loading`.

Visible/action labels detected: `Ajouter une équipe`, `Informations de l'équipe`, `Nom *`, `Projet optionnel`, `Description`, `Sélection des membres`, `Rechercher`, `Réinitialiser`, `Sélect.`, `Utilisateur`, `Profession`, `Département`, `Statut`, `Rôle projet`, `Actif`, `Règles de création`, `Un rôle marqué`, `unique`.

### src/app/pages/Parametrages/teams/team-hierarchie/team-hierarchie.ts

- Class: `TeamHierarchyComponent`.
- Selector: `app-team-hierarchy`.
- Template: `./team-hierarchie.html`.
- Styles: `['./team-hierarchie.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ButtonModule`, `ToastModule`, `SelectModule`, `OrganizationChartModule`.
- Providers: `MessageService`.
- Constructor injections: `teamService: TeamService`, `usersService: UsersService`, `cd: ChangeDetectorRef`, `zone: NgZone`, `messageService: MessageService`, `rbacService: RbacService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `loadingTeams` | `implicit` | `false` |
| `loadingTeam` | `implicit` | `false` |
| `loadingMembers` | `implicit` | `false` |
| `saving` | `implicit` | `false` |
| `allTeams` | `TeamResponseDTO[]` | `[]` |
| `teamOptions` | `TeamOption[]` | `[]` |
| `selectedTeamId` | `number` |  |
| `team` | `TeamResponseDTO \| null` | `null` |
| `members` | `HierarchyMemberRow[]` | `[]` |
| `chartNodes` | `TreeNode[]` | `[]` |
| `hierarchyMap` | `implicit` | `new Map<number, number | null>()` |
| `validSupervisorsMap` | `implicit` | `new Map<number, HierarchyMemberRow[]>()` |
| `loadingSupervisors` | `implicit` | `new Set<number>()` |
| `defaultMale` | `implicit` | `'assets/images/default-user-male.png'` |
| `defaultFemale` | `implicit` | `'assets/images/default-user-female.png'` |
| `MODULE_NAME` | `implicit` | `'gestion des équipes'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadAllTeams |
| `canManageHierarchy` | `canManageHierarchy()` | `boolean` | canManageHierarchy(): boolean { return this.rbacService.canUpdate(this.MODULE_NAME); } |
| `applyView` | `applyView()` | `void` | private applyView(): void { setTimeout(() => { try { this.cd.detectChanges(); } catch {} }, 0); } |
| `runView` | `runView(callback: () => void)` | `void` | applyView |
| `reload` | `reload()` | `void` | loadAllTeams, loadTeam |
| `loadAllTeams` | `loadAllTeams()` | `void` | applyView, runView, formatStatus, showError |
| `onTeamSelected` | `onTeamSelected(teamId?: number)` | `void` | applyView, loadTeam |
| `loadTeam` | `loadTeam(teamId: number)` | `void` | applyView, runView, loadMembers, showError |
| `loadMembers` | `loadMembers()` | `void` | applyView, runView, buildMembers, loadValidSupervisorsForAll, buildChart |
| `buildMembers` | `buildMembers(users: UserResponseDTO[])` | `void` | fullName, getAvatar, sortMembers |
| `sortMembers` | `sortMembers()` | `void` | private sortMembers(): void { this.members = [...this.members].sort((a, b) => { const levelA = a.hierarchyLevel ?? 99... |
| `loadValidSupervisorsForAll` | `loadValidSupervisorsForAll()` | `void` | applyView, runView, mapSupervisorRows, showError |
| `mapSupervisorRows` | `mapSupervisorRows(validSupervisors: TeamMemberResponseDTO[])` | `HierarchyMemberRow[]` | private mapSupervisorRows(validSupervisors: TeamMemberResponseDTO[]): HierarchyMemberRow[] { return validSupervisors ... |
| `onSupervisorChange` | `onSupervisorChange(memberId: number, supervisorId: number | null)` | `void` | buildChart, applyView |
| `getValidSupervisorsFor` | `getValidSupervisorsFor(memberId: number)` | `HierarchyMemberRow[]` | getValidSupervisorsFor(memberId: number): HierarchyMemberRow[] { return this.validSupervisorsMap.get(memberId) \|\| []; } |
| `isSupervisorLoading` | `isSupervisorLoading(memberId: number)` | `boolean` | isSupervisorLoading(memberId: number): boolean { return this.loadingSupervisors.has(memberId); } |
| `buildChart` | `buildChart()` | `void` | buildNode |
| `buildNode` | `buildNode(member: HierarchyMemberRow, visited: Set<number>)` | `TreeNode` | private buildNode(member: HierarchyMemberRow, visited: Set<number>): TreeNode { if (visited.has(member.id)) { return ... |
| `isHierarchyLocallyValid` | `isHierarchyLocallyValid()` | `boolean` | getLeaderCount |
| `getLeaderCount` | `getLeaderCount()` | `number` | getLeaderCount(): number { return this.members.filter(member => this.hierarchyMap.get(member.id) == null).length; } |
| `getLeaderName` | `getLeaderName()` | `string` | getLeaderName(): string { const leader = this.members.find(member => this.hierarchyMap.get(member.id) == null); retur... |
| `save` | `save()` | `void` | isHierarchyLocallyValid, showError, applyView, runView, loadTeam |
| `fullName` | `fullName(user: UserResponseDTO)` | `string` | fullName(user: UserResponseDTO): string { return `${user.firstName \|\| ''} ${user.lastName \|\| ''}`.trim() \|\| user.user... |
| `getAvatar` | `getAvatar(user: UserResponseDTO)` | `string` | getAvatar(user: UserResponseDTO): string { if (user.photoUrl && user.photoUrl.trim() !== '') { return user.photoUrl; ... |
| `onAvatarError` | `onAvatarError(event: Event)` | `void` | onAvatarError(event: Event): void { (event.target as HTMLImageElement).src = this.defaultMale; } |
| `getHierarchyLabel` | `getHierarchyLabel(level?: number)` | `string` | getHierarchyLabel(level?: number): string { switch (level) { case 1: return 'Niv. 1 Direction'; case 2: return 'Niv. ... |
| `formatStatus` | `formatStatus(status?: string)` | `string` | formatStatus(status?: string): string { switch (status) { case 'FREE': return 'Libre'; case 'ASSIGNED': return 'Affec... |
| `showError` | `showError(detail: string)` | `void` | applyView |

Template PrimeNG elements: `p-toast`, `p-button`, `p-select`, `p-organizationChart`.

Template bindings/events/directives detected: `disabled`, `onClick`, `ngIf`, `loading`, `options`, `onChange`, `ngFor`, `ngModel`, `value`.

Visible/action labels detected: `Hiérarchie des équipes`, `Recharger`, `Sauvegarder`, `Équipe *`, `Chargement de l'équipe...`, `Projet :`, `Règles appliquées automatiquement`, `Membre`, `Rôle projet`, `Niveau`, `Catégorie`, `Superviseur direct`, `Leader actuel`, `Nombre de leaders`, `Validation locale`, `Organigramme`, `Aucune équipe trouvée.`.

### src/app/pages/Parametrages/teams/team-list/team-list.ts

- Class: `TeamListComponent`.
- Selector: `app-team-list`.
- Template: `./team-list.html`.
- Styles: `['./team-list.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `RouterModule`, `ButtonModule`, `InputTextModule`, `ToastModule`, `TooltipModule`, `SelectModule`.
- Providers: `MessageService`.
- Constructor injections: `teamService: TeamService`, `projectService: ProjectService`, `router: Router`, `cd: ChangeDetectorRef`, `zone: NgZone`, `messageService: MessageService`, `rbacService: RbacService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `rows` | `TeamResponseDTO[]` | `[]` |
| `loading` | `implicit` | `false` |
| `projects` | `ProjectResponseDTO[]` | `[]` |
| `projectOptions` | `ProjectFilterOption[]` | `[]` |
| `loadingProjects` | `implicit` | `false` |
| `currentPage` | `implicit` | `0` |
| `pageSize` | `implicit` | `7` |
| `totalElements` | `implicit` | `0` |
| `totalPages` | `implicit` | `0` |
| `isSearchMode` | `implicit` | `false` |
| `statuses` | `TeamStatus[]` | `['FREE', 'ASSIGNED']` |
| `filters` | `TeamSearchCriteriaDTO` | `{ keyword: '', status: undefined, projectId: undefined }` |
| `showDeleteConfirm` | `implicit` | `false` |
| `teamToDelete` | `TeamResponseDTO \| null` | `null` |
| `deleting` | `implicit` | `false` |
| `projectSearchTimeout` | `any` |  |
| `destroy$` | `implicit` | `new Subject<void>()` |
| `MODULE_NAME` | `implicit` | `'gestion des équipes'` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `void` | loadProjects, loadAll |
| `ngOnDestroy` | `ngOnDestroy()` | `void` | ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); clearTimeout(this.projectSearchTimeout); } |
| `canCreate` | `canCreate()` | `boolean` | canCreate(): boolean { return this.rbacService.canCreate(this.MODULE_NAME); } |
| `canUpdate` | `canUpdate()` | `boolean` | canUpdate(): boolean { return this.rbacService.canUpdate(this.MODULE_NAME); } |
| `canDelete` | `canDelete()` | `boolean` | canDelete(): boolean { return this.rbacService.canDelete(this.MODULE_NAME); } |
| `applyView` | `applyView()` | `void` | private applyView(): void { setTimeout(() => { try { this.cd.detectChanges(); } catch {} }, 0); } |
| `runView` | `runView(callback: () => void)` | `void` | applyView |
| `buildProjectOptions` | `buildProjectOptions()` | `void` | private buildProjectOptions(): void { this.projectOptions = [ { id: null, name: 'Tous les projets', allProjects: true... |
| `loadProjects` | `loadProjects(searchTerm: string)` | `void` | applyView, runView, buildProjectOptions, showError |
| `onProjectFilter` | `onProjectFilter(event: any)` | `void` | loadProjects |
| `loadAll` | `loadAll(page: number)` | `void` | applyView, runView, showError |
| `search` | `search(page: number)` | `void` | loadAll, applyView, runView, showError |
| `reset` | `reset()` | `void` | loadProjects, loadAll |
| `onPageChange` | `onPageChange(newPage: number)` | `void` | search, loadAll |
| `add` | `add()` | `void` | add(): void { this.router.navigate(['/Parametrages/teams/new']); } |
| `details` | `details(team: TeamResponseDTO)` | `void` | details(team: TeamResponseDTO): void { this.router.navigate(['/Parametrages/teams', team.projectId \|\| 0, team.id, 'de... |
| `edit` | `edit(team: TeamResponseDTO)` | `void` | edit(team: TeamResponseDTO): void { this.router.navigate(['/Parametrages/teams', team.projectId \|\| 0, team.id, 'edit'... |
| `delete` | `delete(team: TeamResponseDTO)` | `void` | applyView |
| `cancelDelete` | `cancelDelete()` | `void` | applyView |
| `confirmDelete` | `confirmDelete()` | `void` | applyView, runView, search, loadAll |
| `export` | `export()` | `void` | cleanCsv, formatStatus |
| `cleanCsv` | `cleanCsv(value: string)` | `string` | cleanCsv(value: string): string { return `"${value.replace(/"/g, '""')}"`; } |
| `formatStatus` | `formatStatus(status?: TeamStatus)` | `string` | formatStatus(status?: TeamStatus): string { switch (status) { case 'FREE': return 'Libre'; case 'ASSIGNED': return 'A... |
| `statusClass` | `statusClass(status?: TeamStatus)` | `string` | statusClass(status?: TeamStatus): string { switch (status) { case 'FREE': return 'badge-green'; case 'ASSIGNED': retu... |
| `formatProjectStatus` | `formatProjectStatus(status?: string)` | `string` | formatProjectStatus(status?: string): string { switch (status) { case 'DRAFT': return 'Brouillon'; case 'READY': retu... |
| `showError` | `showError(detail: string)` | `void` | applyView |

Template PrimeNG elements: `p-toast`, `p-button`, `p-select`.

Template bindings/events/directives detected: `ngIf`, `click`, `loading`, `onClick`, `disabled`, `ngFor`, `options`.

Visible/action labels detected: `Confirmer la suppression`, `L’équipe sera supprimée définitivement`, `Supprimer`, `Annuler`, `Filtres de recherche`, `Statut`, `Rechercher`, `Réinitialiser`, `Liste des équipes`, `Équipe`, `Projet`, `Membres`, `Actions`.

### src/app/pages/portal/portal.component.ts

- Class: `PortalComponent`.
- Selector: `app-portal`.
- Template: `./portal.component.html`.
- Styles: `['./portal.component.scss']`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `RouterModule`.
- Constructor injections: `router: Router`.
Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `logout` | `logout()` | `implicit` | logout() { keycloak.logout({ redirectUri: 'http://localhost:4200' }); } |

Template bindings/events/directives detected: `click`.

Visible/action labels detected: `Bienvenue dans ST2I`, `Espace Employé`, `Profile`, `Accéder à l’application`, `Espace Administratif`, `Administration`, `Se Déconnecter`.

### src/app/pages/uikit/buttondemo.ts

- Class: `ButtonDemo`.
- Selector: `app-button-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `ButtonModule`, `ButtonGroupModule`, `SplitButtonModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `items` | `MenuItem[]` | `[]` |
| `loading` | `implicit` | `[false, false, false, false]` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.items = [{ label: 'Update', icon: 'pi pi-refresh' }, { label: 'Delete', icon: 'pi pi-times' }, { la... |
| `load` | `load(index: number)` | `implicit` | load(index: number) { this.loading[index] = true; setTimeout(() => (this.loading[index] = false), 1000); } |

### src/app/pages/uikit/chartdemo.ts

- Class: `ChartDemo`.
- Selector: `app-chart-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `ChartModule`, `FluidModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `layoutService` | `implicit` | `inject(LayoutService)` |
| `lineData` | `implicit` | `signal<any>(null)` |
| `barData` | `implicit` | `signal<any>(null)` |
| `pieData` | `implicit` | `signal<any>(null)` |
| `polarData` | `implicit` | `signal<any>(null)` |
| `radarData` | `implicit` | `signal<any>(null)` |
| `lineOptions` | `implicit` | `signal<any>(null)` |
| `barOptions` | `implicit` | `signal<any>(null)` |
| `pieOptions` | `implicit` | `signal<any>(null)` |
| `polarOptions` | `implicit` | `signal<any>(null)` |
| `radarOptions` | `implicit` | `signal<any>(null)` |
| `chartEffect` | `implicit` | `effect(() => { this.layoutService.layoutConfig().darkTheme; setTimeout(() => this.initC...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `initCharts` | `initCharts()` | `implicit` | initCharts() { const documentStyle = getComputedStyle(document.documentElement); const textColor = documentStyle.getP... |

### src/app/pages/uikit/filedemo.ts

- Class: `FileDemo`.
- Selector: `app-file-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FileUploadModule`, `ToastModule`, `ButtonModule`.
- Constructor injections: `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `uploadedFiles` | `any[]` | `[]` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `onUpload` | `onUpload(event: any)` | `implicit` | onUpload(event: any) { for (const file of event.files) { this.uploadedFiles.push(file); } this.messageService.add({ s... |
| `onBasicUpload` | `onBasicUpload()` | `implicit` | onBasicUpload() { this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic M... |

### src/app/pages/uikit/formlayoutdemo.ts

- Class: `FormLayoutDemo`.
- Selector: `app-formlayout-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `InputTextModule`, `FluidModule`, `ButtonModule`, `SelectModule`, `FormsModule`, `TextareaModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `dropdownItems` | `implicit` | `[ { name: 'Option 1', code: 'Option 1' }, { name: 'Option 2', code: 'Option 2' }, { nam...` |
| `dropdownItem` | `implicit` | `null` |

### src/app/pages/uikit/inputdemo.ts

- Class: `InputDemo`.
- Selector: `app-input-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `InputTextModule`, `ButtonModule`, `CheckboxModule`, `RadioButtonModule`, `SelectButtonModule`, `InputGroupModule`, `FluidModule`, `IconFieldModule`, `InputIconModule`, `FloatLabelModule`, `AutoCompleteModule`, `InputNumberModule`, `SliderModule`, `RatingModule`, `ColorPickerModule`, `KnobModule`, `SelectModule`, `DatePickerModule`, `ToggleButtonModule`, `ToggleSwitchModule`, `TreeSelectModule`, `MultiSelectModule`, `ListboxModule`, `InputGroupAddonModule`, `TextareaModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `floatValue` | `any` | `null` |
| `autoValue` | `any[] \| undefined` |  |
| `autoFilteredValue` | `any[]` | `[]` |
| `selectedAutoValue` | `any` | `null` |
| `calendarValue` | `any` | `null` |
| `inputNumberValue` | `any` | `null` |
| `sliderValue` | `number` | `50` |
| `ratingValue` | `any` | `null` |
| `colorValue` | `string` | `'#1976D2'` |
| `radioValue` | `any` | `null` |
| `checkboxValue` | `any[]` | `[]` |
| `switchValue` | `boolean` | `false` |
| `listboxValues` | `any[]` | `[ { name: 'New York', code: 'NY' }, { name: 'Rome', code: 'RM' }, { name: 'London', cod...` |
| `listboxValue` | `any` | `null` |
| `dropdownValues` | `implicit` | `[ { name: 'New York', code: 'NY' }, { name: 'Rome', code: 'RM' }, { name: 'London', cod...` |
| `dropdownValue` | `any` | `null` |
| `multiselectCountries` | `Country[]` | `[ { name: 'Australia', code: 'AU' }, { name: 'Brazil', code: 'BR' }, { name: 'China', c...` |
| `multiselectSelectedCountries` | `Country[]` |  |
| `toggleValue` | `boolean` | `false` |
| `selectButtonValue` | `any` | `null` |
| `selectButtonValues` | `any` | `[{ name: 'Option 1' }, { name: 'Option 2' }, { name: 'Option 3' }]` |
| `knobValue` | `number` | `50` |
| `inputGroupValue` | `boolean` | `false` |
| `treeSelectNodes` | `TreeNode[]` |  |
| `selectedNode` | `any` | `null` |
| `countryService` | `implicit` | `inject(CountryService)` |
| `nodeService` | `implicit` | `inject(NodeService)` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.countryService.getCountries().then((countries) => { this.autoValue = countries; }); this.nodeServic... |
| `filterCountry` | `filterCountry(event: AutoCompleteCompleteEvent)` | `implicit` | filterCountry(event: AutoCompleteCompleteEvent) { const filtered: any[] = []; const query = event.query; for (let i =... |

### src/app/pages/uikit/listdemo.ts

- Class: `ListDemo`.
- Selector: `app-list-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `DataViewModule`, `FormsModule`, `SelectButtonModule`, `PickListModule`, `OrderListModule`, `TagModule`, `ButtonModule`.
- Constructor injections: `productService: ProductService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `layout` | `'list' \| 'grid'` | `'list'` |
| `options` | `implicit` | `['list', 'grid']` |
| `products` | `Product[]` | `[]` |
| `sourceCities` | `any[]` | `[]` |
| `targetCities` | `any[]` | `[]` |
| `orderCities` | `any[]` | `[]` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.productService.getProductsSmall().then((data) => (this.products = data.slice(0, 6))); this.sourceCi... |
| `getSeverity` | `getSeverity(product: Product)` | `implicit` | getSeverity(product: Product) { switch (product.inventoryStatus) { case 'INSTOCK': return 'success'; case 'LOWSTOCK':... |

### src/app/pages/uikit/mediademo.ts

- Class: `MediaDemo`.
- Selector: `app-media-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `CarouselModule`, `ButtonModule`, `GalleriaModule`, `ImageModule`, `TagModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `productService` | `implicit` | `inject(ProductService)` |
| `photoService` | `implicit` | `inject(PhotoService)` |
| `products` | `implicit` | `signal<Product[]>([])` |
| `images` | `implicit` | `signal<any[]>([])` |
| `galleriaResponsiveOptions` | `any[]` | `[ { breakpoint: '1024px', numVisible: 5 }, { breakpoint: '960px', numVisible: 4 }, { br...` |
| `carouselResponsiveOptions` | `any[]` | `[ { breakpoint: '1024px', numVisible: 3, numScroll: 3 }, { breakpoint: '768px', numVisi...` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.productService.getProductsSmall().then((products) => this.products.set(products)); this.photoServic... |
| `getSeverity` | `getSeverity(status: string)` | `implicit` | getSeverity(status: string) { switch (status) { case 'INSTOCK': return 'success'; case 'LOWSTOCK': return 'warn'; cas... |

### src/app/pages/uikit/menudemo.ts

- Class: `MenuDemo`.
- Selector: `app-menu-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `BreadcrumbModule`, `TieredMenuModule`, `IconFieldModule`, `InputIconModule`, `MenuModule`, `ButtonModule`, `ContextMenuModule`, `MegaMenuModule`, `PanelMenuModule`, `TabsModule`, `MenubarModule`, `InputTextModule`, `TabsModule`, `StepperModule`, `TabsModule`, `IconField`, `InputIcon`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `nestedMenuItems` | `implicit` | `[ { label: 'Customers', icon: 'pi pi-fw pi-table', items: [ { label: 'New', icon: 'pi p...` |
| `breadcrumbHome` | `implicit` | `{ icon: 'pi pi-home', to: '/' }` |
| `breadcrumbItems` | `implicit` | `[{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Accessories' }, { label: 'Back...` |
| `tieredMenuItems` | `implicit` | `[ { label: 'Customers', icon: 'pi pi-fw pi-table', items: [ { label: 'New', icon: 'pi p...` |
| `overlayMenuItems` | `implicit` | `[ { label: 'Save', icon: 'pi pi-save' }, { label: 'Update', icon: 'pi pi-refresh' }, { ...` |
| `menuItems` | `implicit` | `[ { label: 'Customers', items: [ { label: 'New', icon: 'pi pi-fw pi-plus' }, { label: '...` |
| `contextMenuItems` | `implicit` | `[ { label: 'Save', icon: 'pi pi-save' }, { label: 'Update', icon: 'pi pi-refresh' }, { ...` |
| `megaMenuItems` | `implicit` | `[ { label: 'Fashion', icon: 'pi pi-fw pi-tag', items: [ [ { label: 'Woman', items: [{ l...` |
| `panelMenuItems` | `implicit` | `[ { label: 'Customers', icon: 'pi pi-fw pi-table', items: [ { label: 'New', icon: 'pi p...` |

### src/app/pages/uikit/messagesdemo.ts

- Class: `MessagesDemo`.
- Selector: `app-messages-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ToastModule`, `ButtonModule`, `InputTextModule`, `MessageModule`, `FormsModule`.
- Constructor injections: `service: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `msgs` | `ToastMessageOptions[] \| null` | `[]` |
| `username` | `string \| undefined` |  |
| `email` | `string \| undefined` |  |
| `pt` | `any` | `{ contentWrapper: 'flex items-center' }` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `showInfoViaToast` | `showInfoViaToast()` | `implicit` | showInfoViaToast() { this.service.add({ severity: 'info', summary: 'Info Message', detail: 'PrimeNG rocks' }); } |
| `showWarnViaToast` | `showWarnViaToast()` | `implicit` | showWarnViaToast() { this.service.add({ severity: 'warn', summary: 'Warn Message', detail: 'There are unsaved changes... |
| `showErrorViaToast` | `showErrorViaToast()` | `implicit` | showErrorViaToast() { this.service.add({ severity: 'error', summary: 'Error Message', detail: 'Validation failed' }); } |
| `showSuccessViaToast` | `showSuccessViaToast()` | `implicit` | showSuccessViaToast() { this.service.add({ severity: 'success', summary: 'Success Message', detail: 'Message sent' }); } |

### src/app/pages/uikit/miscdemo.ts

- Class: `MiscDemo`.
- Selector: `app-misc-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `ProgressBarModule`, `BadgeModule`, `AvatarModule`, `ScrollPanelModule`, `TagModule`, `ChipModule`, `ButtonModule`, `SkeletonModule`, `AvatarGroupModule`, `ScrollTopModule`, `OverlayBadgeModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `value` | `implicit` | `0` |
| `interval` | `any` |  |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.interval = setInterval(() => { this.value = this.value + Math.floor(Math.random() * 10) + 1; if (th... |
| `ngOnDestroy` | `ngOnDestroy()` | `implicit` | ngOnDestroy() { clearInterval(this.interval); } |

### src/app/pages/uikit/overlaydemo.ts

- Class: `OverlayDemo`.
- Selector: `app-overlay-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `ToastModule`, `DialogModule`, `ButtonModule`, `DrawerModule`, `PopoverModule`, `ConfirmPopupModule`, `InputTextModule`, `FormsModule`, `TooltipModule`, `TableModule`, `ToastModule`.
- Constructor injections: `productService: ProductService`, `confirmationService: ConfirmationService`, `messageService: MessageService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `display` | `boolean` | `false` |
| `products` | `Product[]` | `[]` |
| `visibleLeft` | `boolean` | `false` |
| `visibleRight` | `boolean` | `false` |
| `visibleTop` | `boolean` | `false` |
| `visibleBottom` | `boolean` | `false` |
| `visibleFull` | `boolean` | `false` |
| `displayConfirmation` | `boolean` | `false` |
| `selectedProduct` | `Product` |  |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.productService.getProductsSmall().then((products) => (this.products = products)); } |
| `confirm` | `confirm(event: Event)` | `implicit` | confirm(event: Event) { this.confirmationService.confirm({ key: 'confirm2', target: event.target \|\| new EventTarget()... |
| `open` | `open()` | `implicit` | open() { this.display = true; } |
| `close` | `close()` | `implicit` | close() { this.display = false; } |
| `toggleDataTable` | `toggleDataTable(op: Popover, event: any)` | `implicit` | toggleDataTable(op: Popover, event: any) { op.toggle(event); } |
| `onProductSelect` | `onProductSelect(op: Popover, event: any)` | `implicit` | onProductSelect(op: Popover, event: any) { op.hide(); this.messageService.add({ severity: 'info', summary: 'Product S... |
| `openConfirmation` | `openConfirmation()` | `implicit` | openConfirmation() { this.displayConfirmation = true; } |
| `closeConfirmation` | `closeConfirmation()` | `implicit` | closeConfirmation() { this.displayConfirmation = false; } |

### src/app/pages/uikit/panelsdemo.ts

- Class: `PanelsDemo`.
- Selector: `app-panels-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `ToolbarModule`, `ButtonModule`, `RippleModule`, `SplitButtonModule`, `AccordionModule`, `FieldsetModule`, `MenuModule`, `InputTextModule`, `DividerModule`, `SplitterModule`, `PanelModule`, `TabsModule`, `IconFieldModule`, `InputIconModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `items` | `MenuItem[]` | `[ { label: 'Save', icon: 'pi pi-check' }, { label: 'Update', icon: 'pi pi-upload' }, { ...` |

### src/app/pages/uikit/tabledemo.ts

- Class: `TableDemo`.
- Selector: `app-table-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `TableModule`, `MultiSelectModule`, `SelectModule`, `InputIconModule`, `TagModule`, `InputTextModule`, `SliderModule`, `ProgressBarModule`, `ToggleButtonModule`, `ToastModule`, `CommonModule`, `FormsModule`, `ButtonModule`, `RatingModule`, `RippleModule`, `IconFieldModule`.
- Constructor injections: `customerService: CustomerService`, `productService: ProductService`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `customers1` | `Customer[]` | `[]` |
| `customers2` | `Customer[]` | `[]` |
| `customers3` | `Customer[]` | `[]` |
| `selectedCustomers1` | `Customer[]` | `[]` |
| `selectedCustomer` | `Customer` | `{}` |
| `representatives` | `Representative[]` | `[]` |
| `statuses` | `any[]` | `[]` |
| `products` | `Product[]` | `[]` |
| `rowGroupMetadata` | `any` |  |
| `expandedRows` | `expandedRows` | `{}` |
| `activityValues` | `number[]` | `[0, 100]` |
| `isExpanded` | `boolean` | `false` |
| `balanceFrozen` | `boolean` | `false` |
| `loading` | `boolean` | `true` |
| `filter` | `ElementRef` |  |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.customerService.getCustomersLarge().then((customers) => { this.customers1 = customers; this.loading... |
| `onSort` | `onSort()` | `implicit` | updateRowGroupMetaData |
| `updateRowGroupMetaData` | `updateRowGroupMetaData()` | `implicit` | updateRowGroupMetaData() { this.rowGroupMetadata = {}; if (this.customers3) { for (let i = 0; i < this.customers3.len... |
| `expandAll` | `expandAll()` | `implicit` | collapseAll |
| `collapseAll` | `collapseAll()` | `implicit` | collapseAll() { this.expandedRows = {}; this.isExpanded = false; } |
| `formatCurrency` | `formatCurrency(value: number)` | `implicit` | formatCurrency(value: number) { return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); } |
| `onGlobalFilter` | `onGlobalFilter(table: Table, event: Event)` | `implicit` | onGlobalFilter(table: Table, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); } |
| `clear` | `clear(table: Table)` | `implicit` | clear(table: Table) { table.clear(); this.filter.nativeElement.value = ''; } |
| `getSeverity` | `getSeverity(status: string)` | `implicit` | getSeverity(status: string) { switch (status) { case 'qualified': case 'instock': case 'INSTOCK': case 'DELIVERED': c... |
| `calculateCustomerTotal` | `calculateCustomerTotal(name: string)` | `implicit` | calculateCustomerTotal(name: string) { let total = 0; if (this.customers2) { for (let customer of this.customers2) { ... |

### src/app/pages/uikit/timelinedemo.ts

- Class: `TimelineDemo`.
- Selector: `app-timeline-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `TimelineModule`, `ButtonModule`, `CardModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `events1` | `any[]` | `[]` |
| `events2` | `any[]` | `[]` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.events1 = [ { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C... |

### src/app/pages/uikit/treedemo.ts

- Class: `TreeDemo`.
- Selector: `app-tree-demo`.
- Standalone: `true`.
- Angular/PrimeNG imports: `CommonModule`, `FormsModule`, `TreeModule`, `TreeTableModule`.

Properties/state:

| Property | Type | Initializer / Meaning |
|---|---|---|
| `treeValue` | `implicit` | `signal<TreeNode[]>([])` |
| `treeTableValue` | `implicit` | `signal<TreeNode[]>([])` |
| `selectedTreeValue` | `TreeNode[]` | `[]` |
| `selectedTreeTableValue` | `implicit` | `{}` |
| `cols` | `any[]` | `[]` |
| `nodeService` | `implicit` | `inject(NodeService)` |

Methods/logic:

| Method | Signature | Return | Calls / Purpose |
|---|---|---|---|
| `ngOnInit` | `ngOnInit()` | `implicit` | ngOnInit() { this.nodeService.getFiles().then((files) => this.treeValue.set(files)); this.nodeService.getTreeTableNod... |

## 10. Layout, Theme, and Navigation Shell

- `src/app/layout/component/app.layout.ts` defines the main authenticated shell around routed children.
- `app.sidebar`, `app.menu`, and `app.menuitem` provide side navigation and menu item rendering.
- `app.topbar` provides top navigation and user/theme controls.
- `app.breadcrumb` reads route metadata and renders navigation context.
- `app.configurator` and `app.floatingconfigurator` expose layout/theme configuration.
- `layout.service.ts` stores layout config/state using Angular signals and exposes menu overlay/dark-theme behavior.
- SCSS is organized under `src/assets/layout` with core, menu, topbar, footer, responsive, typography, utilities, mixins, and light/dark variables.

## 11. API Endpoint Summary

| File | Class | Method | Verb | Target / URL expression | Response Type |
|---|---|---|---|---|---|
| `src/app/core/services/rbac.service.ts` | `RbacService` | `loadCurrentUserPermissions` | GET | `\`${this.apiUrl}/me\`).pipe(` | `CurrentUserPermissions` |
| `src/app/pages/administration/roles/services/permissions.service.ts` | `PermissionsService` | `createPermission` | POST | `` | `PermissionResponseDTO` |
| `src/app/pages/administration/roles/services/permissions.service.ts` | `PermissionsService` | `updatePermission` | PUT | `` | `PermissionResponseDTO` |
| `src/app/pages/administration/roles/services/permissions.service.ts` | `PermissionsService` | `deletePermission` | DELETE | `\`${this.apiUrl}/${id}\`)` | `void` |
| `src/app/pages/administration/roles/services/permissions.service.ts` | `PermissionsService` | `getAllPermissions` | GET | `this.apiUrl)` | `PermissionResponseDTO[]` |
| `src/app/pages/administration/roles/services/permissions.service.ts` | `PermissionsService` | `getPermissionsByModule` | GET | `\`${this.apiUrl}/module/${moduleId}\`)` | `PermissionResponseDTO[]` |
| `src/app/pages/administration/roles/services/role-permissions.service.ts` | `RolePermissionsService` | `assignPermissions` | POST | `this.apiUrl, dto)` | `RolePermissionResponseDTO` |
| `src/app/pages/administration/roles/services/role-permissions.service.ts` | `RolePermissionsService` | `getPermissionsByRole` | GET | `\`${this.apiUrl}/${roleMetadataId}\`)` | `RolePermissionResponseDTO` |
| `src/app/pages/administration/roles/services/role-permissions.service.ts` | `RolePermissionsService` | `deleteAll` | DELETE | `\`${this.apiUrl}/${roleMetadataId}\`)` | `void` |
| `src/app/pages/administration/roles/services/role-permissions.service.ts` | `RolePermissionsService` | `removePermission` | DELETE | `\`${this.apiUrl}/${roleMetadataId}/${permissionId}\`)` | `void` |
| `src/app/pages/administration/roles/services/roles.service.ts` | `RolesService` | `createRole` | POST | `this.apiUrl, payload)` | `RoleResponseDTO` |
| `src/app/pages/administration/roles/services/roles.service.ts` | `RolesService` | `updateRole` | PUT | `\`${this.apiUrl}/${name}\`, payload)` | `RoleResponseDTO` |
| `src/app/pages/administration/roles/services/roles.service.ts` | `RolesService` | `deleteRole` | DELETE | `\`${this.apiUrl}/${name}\`)` | `void` |
| `src/app/pages/administration/roles/services/roles.service.ts` | `RolesService` | `getRoles` | GET | `this.apiUrl)` | `RoleResponseDTO[]` |
| `src/app/pages/administration/roles/services/roles.service.ts` | `RolesService` | `searchRoles` | GET | `\`${this.apiUrl}/search\`, { params })` | `RolePageDTO` |
| `src/app/pages/administration/roles/services/roles.service.ts` | `RolesService` | `getRoleByName` | GET | `\`${this.apiUrl}/${name}\`)` | `RoleResponseDTO` |
| `src/app/pages/administration/roles/services/roles.service.ts` | `RolesService` | `getManageableRoles` | GET | `\`${this.apiUrl}/manageable\`)` | `RoleResponseDTO[]` |
| `src/app/pages/administration/tracability/service/trace-log.service.ts` | `TraceLogService` | `search` | POST | `\`${this.baseUrl}/search\`, searchDTO)` | `TraceLogPageResponseDTO` |
| `src/app/pages/administration/tracability/service/trace-log.service.ts` | `TraceLogService` | `archive` | POST | `\`${this.baseUrl}/archive\`, {})` | `void` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `createUser` | POST | `` | `UserResponseDTO` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `updateUserAsAdmin` | PUT | `` | `UserResponseDTO` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `updateUserProfile` | PUT | `` | `UserResponseDTO` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `changePassword` | POST | `` | `void` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `resetUserPassword` | POST | `` | `void` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `forgotPassword` | POST | `` | `void` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `deleteUser` | DELETE | `` | `void` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `assignRole` | POST | `` | `UserResponseDTO` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `getUserById` | GET | `` | `UserResponseDTO` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `getByKeycloakId` | GET | `` | `UserResponseDTO` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `getByMapperId` | GET | `` | `UserResponseDTO` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `getUsersByDepartment` | GET | `` | `UserResponseDTO[]` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `uploadAvatar` | POST | `` | `{ photoUrl: string }` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `getUsersByIds` | POST | `` | `UserResponseDTO[]` |
| `src/app/pages/administration/users/services/users.service.ts` | `UsersService` | `getProfessions` | GET | `` | `string[]` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `createDepartment` | POST | `this.BASE_URL, dto)` | `DepartmentResponseDTO` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `getById` | GET | `\`${this.BASE_URL}/${id}\`)` | `DepartmentResponseDTO` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `getByCode` | GET | `\`${this.BASE_URL}/code/${code}\`)` | `DepartmentResponseDTO` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `getAll` | GET | `this.BASE_URL)` | `DepartmentResponseDTO[]` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `updateDepartment` | PUT | `\`${this.BASE_URL}/${id}\`, dto)` | `DepartmentResponseDTO` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `activateDepartment` | PATCH | `\`${this.BASE_URL}/${id}/activate\`, {})` | `void` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `deactivateDepartment` | PATCH | `\`${this.BASE_URL}/${id}/deactivate\`, {})` | `void` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `getActiveDepartments` | GET | `\`${this.BASE_URL}/active\`)` | `DepartmentResponseDTO[]` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `getActiveOperationalDepartments` | GET | `\`${this.BASE_URL}/operational/active\`)` | `DepartmentResponseDTO[]` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `getUsersByDepartment` | GET | `` | `UserMapperResponseDTO[]` |
| `src/app/pages/Parametrages/departments/services/department.service.ts` | `DepartmentService` | `getOperationalDepartments` | GET | `\`${this.BASE_URL}/operational\`)` | `DepartmentResponseDTO[]` |
| `src/app/pages/Parametrages/leave-balance/services/employee-leave-balance.service.ts` | `EmployeeLeaveBalanceService` | `getById` | GET | `` | `EmployeeLeaveBalanceResponseDTO` |
| `src/app/pages/Parametrages/leave-balance/services/employee-leave-balance.service.ts` | `EmployeeLeaveBalanceService` | `create` | POST | `` | `EmployeeLeaveBalanceResponseDTO` |
| `src/app/pages/Parametrages/leave-balance/services/employee-leave-balance.service.ts` | `EmployeeLeaveBalanceService` | `update` | PUT | `` | `EmployeeLeaveBalanceResponseDTO` |
| `src/app/pages/Parametrages/leave-balance/services/employee-leave-balance.service.ts` | `EmployeeLeaveBalanceService` | `deactivate` | PATCH | `` | `void` |
| `src/app/pages/Parametrages/leave-balance/services/employee-leave-balance.service.ts` | `EmployeeLeaveBalanceService` | `reactivate` | PATCH | `` | `EmployeeLeaveBalanceResponseDTO` |
| `src/app/pages/Parametrages/leave-request-types/services/leave-type.service.ts` | `LeaveTypeService` | `create` | POST | `this.baseUrl, payload)` | `LeaveTypeResponseDTO` |
| `src/app/pages/Parametrages/leave-request-types/services/leave-type.service.ts` | `LeaveTypeService` | `update` | PUT | `\`${this.baseUrl}/${id}\`, payload)` | `LeaveTypeResponseDTO` |
| `src/app/pages/Parametrages/leave-request-types/services/leave-type.service.ts` | `LeaveTypeService` | `getById` | GET | `\`${this.baseUrl}/${id}\`)` | `LeaveTypeResponseDTO` |
| `src/app/pages/Parametrages/leave-request-types/services/leave-type.service.ts` | `LeaveTypeService` | `deactivate` | PATCH | `\`${this.baseUrl}/${id}/deactivate\`, {})` | `void` |
| `src/app/pages/Parametrages/leave-request-types/services/leave-type.service.ts` | `LeaveTypeService` | `reactivate` | PATCH | `\`${this.baseUrl}/${id}/reactivate\`, {})` | `LeaveTypeResponseDTO` |
| `src/app/pages/Parametrages/modules/services/modules.service.ts` | `ModulesService` | `getModules` | GET | `this.apiUrl)` | `ModuleResponseDTO[]` |
| `src/app/pages/Parametrages/modules/services/modules.service.ts` | `ModulesService` | `getModuleByName` | GET | `\`${this.apiUrl}/name/${name}\`)` | `ModuleResponseDTO` |
| `src/app/pages/Parametrages/modules/services/modules.service.ts` | `ModulesService` | `createModule` | POST | `` | `ModuleResponseDTO` |
| `src/app/pages/Parametrages/modules/services/modules.service.ts` | `ModulesService` | `updateModule` | PUT | `` | `ModuleResponseDTO` |
| `src/app/pages/Parametrages/modules/services/modules.service.ts` | `ModulesService` | `deleteModule` | DELETE | `\`${this.apiUrl}/${id}\`)` | `void` |
| `src/app/pages/Parametrages/professions/services/profession.service.ts` | `ProfessionService` | `create` | POST | `` | `ProfessionResponseDTO` |
| `src/app/pages/Parametrages/professions/services/profession.service.ts` | `ProfessionService` | `update` | PUT | `` | `ProfessionResponseDTO` |
| `src/app/pages/Parametrages/professions/services/profession.service.ts` | `ProfessionService` | `getById` | GET | `` | `ProfessionResponseDTO` |
| `src/app/pages/Parametrages/professions/services/profession.service.ts` | `ProfessionService` | `activate` | PATCH | `` | `void` |
| `src/app/pages/Parametrages/professions/services/profession.service.ts` | `ProfessionService` | `deactivate` | PATCH | `` | `void` |
| `src/app/pages/Parametrages/professions/services/profession.service.ts` | `ProfessionService` | `search` | POST | `` | `any` |
| `src/app/pages/Parametrages/professions/services/profession.service.ts` | `ProfessionService` | `getActiveByDepartment` | GET | `` | `ProfessionResponseDTO[]` |
| `src/app/pages/Parametrages/professions/services/profession.service.ts` | `ProfessionService` | `getSelectableByDepartment` | GET | `` | `ProfessionResponseDTO[]` |
| `src/app/pages/Parametrages/project-roles/services/project-role.service.ts` | `ProjectRoleService` | `create` | POST | `this.apiUrl, payload)` | `ProjectRoleResponseDTO` |
| `src/app/pages/Parametrages/project-roles/services/project-role.service.ts` | `ProjectRoleService` | `update` | PUT | `\`${this.apiUrl}/${id}\`, payload)` | `ProjectRoleResponseDTO` |
| `src/app/pages/Parametrages/project-roles/services/project-role.service.ts` | `ProjectRoleService` | `getById` | GET | `\`${this.apiUrl}/${id}\`)` | `ProjectRoleResponseDTO` |
| `src/app/pages/Parametrages/project-roles/services/project-role.service.ts` | `ProjectRoleService` | `delete` | DELETE | `\`${this.apiUrl}/${id}\`)` | `void` |
| `src/app/pages/Parametrages/projects/services/project.service.ts` | `ProjectService` | `create` | POST | `this.apiUrl, payload)` | `ProjectResponseDTO` |
| `src/app/pages/Parametrages/projects/services/project.service.ts` | `ProjectService` | `update` | PUT | `\`${this.apiUrl}/${id}\`, payload)` | `ProjectResponseDTO` |
| `src/app/pages/Parametrages/projects/services/project.service.ts` | `ProjectService` | `getById` | GET | `\`${this.apiUrl}/${id}\`)` | `ProjectResponseDTO` |
| `src/app/pages/Parametrages/projects/services/project.service.ts` | `ProjectService` | `delete` | DELETE | `\`${this.apiUrl}/${id}\`)` | `void` |
| `src/app/pages/Parametrages/projects/services/project.service.ts` | `ProjectService` | `assignTeam` | POST | `` | `ProjectResponseDTO` |
| `src/app/pages/Parametrages/projects/services/project.service.ts` | `ProjectService` | `removeTeam` | DELETE | `` | `ProjectResponseDTO` |
| `src/app/pages/Parametrages/projects/services/project.service.ts` | `ProjectService` | `assignDepartment` | POST | `` | `ProjectResponseDTO` |
| `src/app/pages/Parametrages/projects/services/project.service.ts` | `ProjectService` | `removeDepartment` | DELETE | `` | `ProjectResponseDTO` |
| `src/app/pages/Parametrages/projects/services/project.service.ts` | `ProjectService` | `changeStatus` | PATCH | `` | `ProjectResponseDTO` |
| `src/app/pages/Parametrages/role-categories/services/role-category.service.ts` | `RoleCategoryService` | `create` | POST | `this.apiUrl, payload)` | `RoleCategoryResponseDTO` |
| `src/app/pages/Parametrages/role-categories/services/role-category.service.ts` | `RoleCategoryService` | `update` | PUT | `\`${this.apiUrl}/${id}\`, payload)` | `RoleCategoryResponseDTO` |
| `src/app/pages/Parametrages/role-categories/services/role-category.service.ts` | `RoleCategoryService` | `getById` | GET | `\`${this.apiUrl}/${id}\`)` | `RoleCategoryResponseDTO` |
| `src/app/pages/Parametrages/role-categories/services/role-category.service.ts` | `RoleCategoryService` | `delete` | DELETE | `\`${this.apiUrl}/${id}\`)` | `void` |
| `src/app/pages/Parametrages/teams/service/team.service.ts` | `TeamService` | `create` | POST | `this.apiUrl, payload)` | `TeamResponseDTO` |
| `src/app/pages/Parametrages/teams/service/team.service.ts` | `TeamService` | `update` | PUT | `\`${this.apiUrl}/${id}\`, payload)` | `TeamResponseDTO` |
| `src/app/pages/Parametrages/teams/service/team.service.ts` | `TeamService` | `getById` | GET | `\`${this.apiUrl}/${id}\`)` | `TeamResponseDTO` |
| `src/app/pages/Parametrages/teams/service/team.service.ts` | `TeamService` | `delete` | DELETE | `\`${this.apiUrl}/${id}\`)` | `void` |
| `src/app/pages/Parametrages/teams/service/team.service.ts` | `TeamService` | `addMember` | POST | `\`${this.apiUrl}/${teamId}/members\`, payload)` | `TeamResponseDTO` |
| `src/app/pages/Parametrages/teams/service/team.service.ts` | `TeamService` | `updateMember` | PUT | `` | `TeamResponseDTO` |
| `src/app/pages/Parametrages/teams/service/team.service.ts` | `TeamService` | `removeMember` | DELETE | `\`${this.apiUrl}/${teamId}/members/${memberId}\`)` | `TeamResponseDTO` |
| `src/app/pages/Parametrages/teams/service/team.service.ts` | `TeamService` | `saveHierarchy` | PUT | `` | `TeamResponseDTO` |
| `src/app/pages/Parametrages/teams/service/team.service.ts` | `TeamService` | `getValidSupervisors` | GET | `` | `TeamMemberResponseDTO[]` |
| `src/app/pages/service/customer.service.ts` | `CustomerService` | `getCustomers` | GET | `'https://www.primefaces.org/data/customers', { params: params }).toPromise()` | `any` |

## 12. Data Flow Patterns

- List pages usually keep `rows`, `loading`, `currentPage`, `pageSize`, `totalRecords`, `filters`, and `isSearchMode` state. They load all records by default, switch to backend search when filters are present, and reload the correct page after delete.
- Form pages usually maintain a `form` object, validate required fields before calling a service, show PrimeNG toasts for success/error, and navigate back to the list after a small success delay.
- Details pages read route parameters, call `getById`/`get...`, show loading and empty states, and provide navigation to edit/back.
- Search DTOs are sent to `/search` endpoints with page/size query params. Empty search criteria generally fall back to non-filtered list loading.
- Upload/avatar logic uses `FormData` and posts to user-specific upload endpoints.
- CSV export appears in list pages by creating a Blob, object URL, hidden `<a>`, setting a domain-specific filename, and triggering download.
- Deactivation/reactivation flows use PATCH endpoints in departments, professions, leave types, and leave balances.
- Project/team relationships are explicit service operations: assigning/removing teams, assigning/removing departments, adding/updating/removing team members, and updating hierarchy.

## 13. Validation and UX Patterns

- PrimeNG Toast/MessageService is used for user feedback across many forms/list actions.
- PrimeNG ConfirmDialog/Dialog-style state appears around delete/archive confirmations.
- Forms use Angular `FormsModule` / `NgForm` patterns rather than a full reactive form architecture in the inspected feature files.
- Templates commonly use loading indicators, empty states, card-like PrimeNG UI panels, dropdown filters, paginated tables, and action buttons for details/edit/delete.
- French UI labels and route breadcrumbs dominate the business features, matching the project context.

## 14. File Inventory by Domain

### Administration - Roles and Permissions

- `src/app/pages/administration/roles/models/permissions-models/permission-action.enum.ts`
- `src/app/pages/administration/roles/models/permissions-models/permission-request.dto.ts`
- `src/app/pages/administration/roles/models/permissions-models/permission-response.dto.ts`
- `src/app/pages/administration/roles/models/role-models/role-page.dto.ts`
- `src/app/pages/administration/roles/models/role-models/role-request.dto.ts`
- `src/app/pages/administration/roles/models/role-models/role-response.dto.ts`
- `src/app/pages/administration/roles/models/role-models/role-search-criteria.dto.ts`
- `src/app/pages/administration/roles/models/role-premission/role-permission-request.dto.ts`
- `src/app/pages/administration/roles/models/role-premission/role-permission-response.dto.ts`
- `src/app/pages/administration/roles/role-details/role-details.html`
- `src/app/pages/administration/roles/role-details/role-details.scss`
- `src/app/pages/administration/roles/role-details/role-details.ts`
- `src/app/pages/administration/roles/roles-edit/roles-edit.html`
- `src/app/pages/administration/roles/roles-edit/roles-edit.scss`
- `src/app/pages/administration/roles/roles-edit/roles-edit.ts`
- `src/app/pages/administration/roles/roles-form/roles-form.html`
- `src/app/pages/administration/roles/roles-form/roles-form.scss`
- `src/app/pages/administration/roles/roles-form/roles-form.ts`
- `src/app/pages/administration/roles/roles-list/roles-list.html`
- `src/app/pages/administration/roles/roles-list/roles-list.scss`
- `src/app/pages/administration/roles/roles-list/roles-list.ts`
- `src/app/pages/administration/roles/roles-permissions-management/roles-permissions-management.html`
- `src/app/pages/administration/roles/roles-permissions-management/roles-permissions-management.scss`
- `src/app/pages/administration/roles/roles-permissions-management/roles-permissions-management.ts`
- `src/app/pages/administration/roles/services/permissions.service.ts`
- `src/app/pages/administration/roles/services/role-permissions.service.ts`
- `src/app/pages/administration/roles/services/roles.service.ts`

### Administration - Traceability

- `src/app/pages/administration/tracability/models/trace-log-page-response.dto.ts`
- `src/app/pages/administration/tracability/models/trace-log-response.dto.ts`
- `src/app/pages/administration/tracability/models/trace-log-search.dto.ts`
- `src/app/pages/administration/tracability/service/trace-log.service.ts`
- `src/app/pages/administration/tracability/traceability/traceability.html`
- `src/app/pages/administration/tracability/traceability/traceability.scss`
- `src/app/pages/administration/tracability/traceability/traceability.ts`

### Administration - Users

- `src/app/pages/administration/users/models/UserSearchCriteria.dto.ts`
- `src/app/pages/administration/users/models/page-response.dto.ts`
- `src/app/pages/administration/users/models/user-admin-update.dto.ts`
- `src/app/pages/administration/users/models/user-create.dto.ts`
- `src/app/pages/administration/users/models/user-password-change.dto.ts`
- `src/app/pages/administration/users/models/user-profile-update.dto.ts`
- `src/app/pages/administration/users/models/user-response.dto.ts`
- `src/app/pages/administration/users/services/users.service.ts`
- `src/app/pages/administration/users/user-details/user-details.component.html`
- `src/app/pages/administration/users/user-details/user-details.component.scss`
- `src/app/pages/administration/users/user-details/user-details.component.ts`
- `src/app/pages/administration/users/user-edit/user-edit.html`
- `src/app/pages/administration/users/user-edit/user-edit.scss`
- `src/app/pages/administration/users/user-edit/user-edit.ts`
- `src/app/pages/administration/users/user-form/user-form.component.html`
- `src/app/pages/administration/users/user-form/user-form.component.scss`
- `src/app/pages/administration/users/user-form/user-form.component.ts`
- `src/app/pages/administration/users/users-list/users-list.component.html`
- `src/app/pages/administration/users/users-list/users-list.component.scss`
- `src/app/pages/administration/users/users-list/users-list.component.ts`

### Core - Security and RBAC

- `src/app/core/guards/rbac.guard.ts`
- `src/app/core/keycloak-init.factory.ts`
- `src/app/core/keycloak.interceptor.ts`
- `src/app/core/models/rbac.model.ts`
- `src/app/core/services/rbac.service.ts`

### Dashboard

- `src/app/pages/dashboard/components/bestsellingwidget.ts`
- `src/app/pages/dashboard/components/notificationswidget.ts`
- `src/app/pages/dashboard/components/recentsaleswidget.ts`
- `src/app/pages/dashboard/components/revenuestreamwidget.ts`
- `src/app/pages/dashboard/components/statswidget.ts`
- `src/app/pages/dashboard/dashboard.ts`

### Landing

- `src/app/pages/landing/components/featureswidget.ts`
- `src/app/pages/landing/components/footerwidget.ts`
- `src/app/pages/landing/components/herowidget.ts`
- `src/app/pages/landing/components/highlightswidget.ts`
- `src/app/pages/landing/components/pricingwidget.ts`
- `src/app/pages/landing/components/topbarwidget.component.ts`
- `src/app/pages/landing/landing.ts`

### Layout Shell

- `src/app/layout/component/app.breadcrumb.ts`
- `src/app/layout/component/app.configurator.ts`
- `src/app/layout/component/app.floatingconfigurator.ts`
- `src/app/layout/component/app.footer.ts`
- `src/app/layout/component/app.layout.ts`
- `src/app/layout/component/app.menu.ts`
- `src/app/layout/component/app.menuitem.ts`
- `src/app/layout/component/app.sidebar.ts`
- `src/app/layout/component/app.topbar.ts`
- `src/app/layout/service/layout.service.ts`
- `src/assets/layout/_core.scss`
- `src/assets/layout/_footer.scss`
- `src/assets/layout/_main.scss`
- `src/assets/layout/_menu.scss`
- `src/assets/layout/_mixins.scss`
- `src/assets/layout/_preloading.scss`
- `src/assets/layout/_responsive.scss`
- `src/assets/layout/_topbar.scss`
- `src/assets/layout/_typography.scss`
- `src/assets/layout/_utils.scss`
- `src/assets/layout/layout.scss`
- `src/assets/layout/variables/_common.scss`
- `src/assets/layout/variables/_dark.scss`
- `src/assets/layout/variables/_light.scss`

### Other

- `src/app.component.ts`
- `src/app.config.ts`
- `src/app.routes.ts`
- `src/app/pages/auth/access.ts`
- `src/app/pages/auth/auth.routes.ts`
- `src/app/pages/auth/error.ts`
- `src/app/pages/auth/login.ts`
- `src/app/pages/crud/crud.ts`
- `src/app/pages/documentation/documentation.ts`
- `src/app/pages/empty/empty.ts`
- `src/app/pages/notfound/notfound.ts`
- `src/app/pages/pages.routes.ts`
- `src/app/pages/service/country.service.ts`
- `src/app/pages/service/customer.service.ts`
- `src/app/pages/service/icon.service.ts`
- `src/app/pages/service/node.service.ts`
- `src/app/pages/service/photo.service.ts`
- `src/app/pages/service/product.service.ts`
- `src/assets/demo/code.scss`
- `src/assets/demo/demo.scss`
- `src/assets/demo/flags/flags.css`
- `src/assets/styles.scss`
- `src/assets/tailwind.css`
- `src/index.html`
- `src/main.ts`

### Parametrages - Departments

- `src/app/pages/Parametrages/departments/details/department-details.component.html`
- `src/app/pages/Parametrages/departments/details/department-details.component.scss`
- `src/app/pages/Parametrages/departments/details/department-details.component.ts`
- `src/app/pages/Parametrages/departments/dtos/create-department-request.dto.ts`
- `src/app/pages/Parametrages/departments/dtos/department-response.dto.ts`
- `src/app/pages/Parametrages/departments/dtos/department-search-criteria.dto.ts`
- `src/app/pages/Parametrages/departments/dtos/department-type.ts`
- `src/app/pages/Parametrages/departments/dtos/page-response.dto.ts`
- `src/app/pages/Parametrages/departments/dtos/update-department.dto.ts`
- `src/app/pages/Parametrages/departments/dtos/user-mapper-response.dto.ts`
- `src/app/pages/Parametrages/departments/edit/edit.html`
- `src/app/pages/Parametrages/departments/edit/edit.scss`
- `src/app/pages/Parametrages/departments/edit/edit.ts`
- `src/app/pages/Parametrages/departments/form/department-form.component.html`
- `src/app/pages/Parametrages/departments/form/department-form.component.scss`
- `src/app/pages/Parametrages/departments/form/department-form.component.ts`
- `src/app/pages/Parametrages/departments/list/department-list.component.html`
- `src/app/pages/Parametrages/departments/list/department-list.component.scss`
- `src/app/pages/Parametrages/departments/list/department-list.component.ts`
- `src/app/pages/Parametrages/departments/services/department.service.ts`

### Parametrages - Leave Balances

- `src/app/pages/Parametrages/leave-balance/dtos/employee-leave-balance-request.dto.ts`
- `src/app/pages/Parametrages/leave-balance/dtos/employee-leave-balance-response.dto.ts`
- `src/app/pages/Parametrages/leave-balance/dtos/employee-leave-balance-search.dto.ts`
- `src/app/pages/Parametrages/leave-balance/dtos/page-response.dto.ts`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-details.component/employee-leave-balance-details.component.html`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-details.component/employee-leave-balance-details.component.scss`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-details.component/employee-leave-balance-details.component.ts`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-edit.component/employee-leave-balance-edit.component.html`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-edit.component/employee-leave-balance-edit.component.scss`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-edit.component/employee-leave-balance-edit.component.ts`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-form.component/employee-leave-balance-form.component.html`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-form.component/employee-leave-balance-form.component.scss`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-form.component/employee-leave-balance-form.component.ts`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-list.component/employee-leave-balance-list.component.html`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-list.component/employee-leave-balance-list.component.scss`
- `src/app/pages/Parametrages/leave-balance/employee-leave-balance-list.component/employee-leave-balance-list.component.ts`
- `src/app/pages/Parametrages/leave-balance/services/employee-leave-balance.service.ts`

### Parametrages - Leave Request Types

- `src/app/pages/Parametrages/leave-request-types/dtos/leave-increment-mode.ts`
- `src/app/pages/Parametrages/leave-request-types/dtos/leave-type-request.dto.ts`
- `src/app/pages/Parametrages/leave-request-types/dtos/leave-type-response.dto.ts`
- `src/app/pages/Parametrages/leave-request-types/dtos/leave-type-search.dto.ts`
- `src/app/pages/Parametrages/leave-request-types/dtos/leave-unit.ts`
- `src/app/pages/Parametrages/leave-request-types/dtos/page-response.dto.ts`
- `src/app/pages/Parametrages/leave-request-types/leave-type-detail/leave-type-detail.html`
- `src/app/pages/Parametrages/leave-request-types/leave-type-detail/leave-type-detail.scss`
- `src/app/pages/Parametrages/leave-request-types/leave-type-detail/leave-type-detail.ts`
- `src/app/pages/Parametrages/leave-request-types/leave-type-edit/leave-type-edit.html`
- `src/app/pages/Parametrages/leave-request-types/leave-type-edit/leave-type-edit.scss`
- `src/app/pages/Parametrages/leave-request-types/leave-type-edit/leave-type-edit.ts`
- `src/app/pages/Parametrages/leave-request-types/leave-type-form/leave-type-form.html`
- `src/app/pages/Parametrages/leave-request-types/leave-type-form/leave-type-form.scss`
- `src/app/pages/Parametrages/leave-request-types/leave-type-form/leave-type-form.ts`
- `src/app/pages/Parametrages/leave-request-types/leave-type-list/leave-type-list.html`
- `src/app/pages/Parametrages/leave-request-types/leave-type-list/leave-type-list.scss`
- `src/app/pages/Parametrages/leave-request-types/leave-type-list/leave-type-list.ts`
- `src/app/pages/Parametrages/leave-request-types/services/leave-type.service.ts`

### Parametrages - Modules

- `src/app/pages/Parametrages/modules/models/ModuleRequestDTO.ts`
- `src/app/pages/Parametrages/modules/models/ModuleResponseDTO.ts`
- `src/app/pages/Parametrages/modules/modules-details/modules-details.html`
- `src/app/pages/Parametrages/modules/modules-details/modules-details.scss`
- `src/app/pages/Parametrages/modules/modules-details/modules-details.ts`
- `src/app/pages/Parametrages/modules/modules-edit/modules-edit.html`
- `src/app/pages/Parametrages/modules/modules-edit/modules-edit.scss`
- `src/app/pages/Parametrages/modules/modules-edit/modules-edit.ts`
- `src/app/pages/Parametrages/modules/modules-form/modules-form.html`
- `src/app/pages/Parametrages/modules/modules-form/modules-form.scss`
- `src/app/pages/Parametrages/modules/modules-form/modules-form.spec.ts`
- `src/app/pages/Parametrages/modules/modules-form/modules-form.ts`
- `src/app/pages/Parametrages/modules/modules-list/modules-list.html`
- `src/app/pages/Parametrages/modules/modules-list/modules-list.scss`
- `src/app/pages/Parametrages/modules/modules-list/modules-list.spec.ts`
- `src/app/pages/Parametrages/modules/modules-list/modules-list.ts`
- `src/app/pages/Parametrages/modules/services/modules.service.ts`

### Parametrages - Professions

- `src/app/pages/Parametrages/professions/dtos/profession-create.dto.ts`
- `src/app/pages/Parametrages/professions/dtos/profession-response.dto.ts`
- `src/app/pages/Parametrages/professions/dtos/profession-search-criteria.dto.ts`
- `src/app/pages/Parametrages/professions/dtos/profession-update.dto.ts`
- `src/app/pages/Parametrages/professions/professions-detail/professions-detail.html`
- `src/app/pages/Parametrages/professions/professions-detail/professions-detail.scss`
- `src/app/pages/Parametrages/professions/professions-detail/professions-detail.ts`
- `src/app/pages/Parametrages/professions/professions-edit/professions-edit.html`
- `src/app/pages/Parametrages/professions/professions-edit/professions-edit.scss`
- `src/app/pages/Parametrages/professions/professions-edit/professions-edit.ts`
- `src/app/pages/Parametrages/professions/professions-form/professions-form.html`
- `src/app/pages/Parametrages/professions/professions-form/professions-form.scss`
- `src/app/pages/Parametrages/professions/professions-form/professions-form.ts`
- `src/app/pages/Parametrages/professions/professions-list/professions-list.html`
- `src/app/pages/Parametrages/professions/professions-list/professions-list.scss`
- `src/app/pages/Parametrages/professions/professions-list/professions-list.ts`
- `src/app/pages/Parametrages/professions/services/profession.service.ts`

### Parametrages - Project Roles

- `src/app/pages/Parametrages/project-roles/dtos/project-role-create.dto.ts`
- `src/app/pages/Parametrages/project-roles/dtos/project-role-response.dto.ts`
- `src/app/pages/Parametrages/project-roles/dtos/project-role-search-criteria.dto.ts`
- `src/app/pages/Parametrages/project-roles/dtos/project-role-update.dto.ts`
- `src/app/pages/Parametrages/project-roles/project-role-details/project-role-details.html`
- `src/app/pages/Parametrages/project-roles/project-role-details/project-role-details.scss`
- `src/app/pages/Parametrages/project-roles/project-role-details/project-role-details.ts`
- `src/app/pages/Parametrages/project-roles/project-role-edit/project-role-edit.html`
- `src/app/pages/Parametrages/project-roles/project-role-edit/project-role-edit.scss`
- `src/app/pages/Parametrages/project-roles/project-role-edit/project-role-edit.ts`
- `src/app/pages/Parametrages/project-roles/project-role-form/project-role-form.html`
- `src/app/pages/Parametrages/project-roles/project-role-form/project-role-form.scss`
- `src/app/pages/Parametrages/project-roles/project-role-form/project-role-form.ts`
- `src/app/pages/Parametrages/project-roles/project-role-list/project-role-list.html`
- `src/app/pages/Parametrages/project-roles/project-role-list/project-role-list.scss`
- `src/app/pages/Parametrages/project-roles/project-role-list/project-role-list.ts`
- `src/app/pages/Parametrages/project-roles/services/project-role.service.ts`

### Parametrages - Projects

- `src/app/pages/Parametrages/projects/dtos/page-response.dto.ts`
- `src/app/pages/Parametrages/projects/dtos/project-create.dto.ts`
- `src/app/pages/Parametrages/projects/dtos/project-response.dto.ts`
- `src/app/pages/Parametrages/projects/dtos/project-search-criteria.dto.ts`
- `src/app/pages/Parametrages/projects/dtos/project-status-update.dto.ts`
- `src/app/pages/Parametrages/projects/dtos/project-status.enum.ts`
- `src/app/pages/Parametrages/projects/dtos/project-update.dto.ts`
- `src/app/pages/Parametrages/projects/project-details/project-details.component.html`
- `src/app/pages/Parametrages/projects/project-details/project-details.component.scss`
- `src/app/pages/Parametrages/projects/project-details/project-details.component.ts`
- `src/app/pages/Parametrages/projects/project-edit/project-edit.component.html`
- `src/app/pages/Parametrages/projects/project-edit/project-edit.component.scss`
- `src/app/pages/Parametrages/projects/project-edit/project-edit.component.ts`
- `src/app/pages/Parametrages/projects/project-form/project-form.component.html`
- `src/app/pages/Parametrages/projects/project-form/project-form.component.scss`
- `src/app/pages/Parametrages/projects/project-form/project-form.component.ts`
- `src/app/pages/Parametrages/projects/project-list/project-list.component.html`
- `src/app/pages/Parametrages/projects/project-list/project-list.component.scss`
- `src/app/pages/Parametrages/projects/project-list/project-list.component.ts`
- `src/app/pages/Parametrages/projects/services/project.service.ts`

### Parametrages - Role Categories

- `src/app/pages/Parametrages/role-categories/dtos/role-category-create.dto.ts`
- `src/app/pages/Parametrages/role-categories/dtos/role-category-response.dto.ts`
- `src/app/pages/Parametrages/role-categories/dtos/role-category-search-criteria.dto.ts`
- `src/app/pages/Parametrages/role-categories/dtos/role-category-update.dto.ts`
- `src/app/pages/Parametrages/role-categories/role-category-details/role-category-details.html`
- `src/app/pages/Parametrages/role-categories/role-category-details/role-category-details.scss`
- `src/app/pages/Parametrages/role-categories/role-category-details/role-category-details.ts`
- `src/app/pages/Parametrages/role-categories/role-category-edit/role-category-edit.html`
- `src/app/pages/Parametrages/role-categories/role-category-edit/role-category-edit.scss`
- `src/app/pages/Parametrages/role-categories/role-category-edit/role-category-edit.ts`
- `src/app/pages/Parametrages/role-categories/role-category-form/role-category-form.html`
- `src/app/pages/Parametrages/role-categories/role-category-form/role-category-form.scss`
- `src/app/pages/Parametrages/role-categories/role-category-form/role-category-form.ts`
- `src/app/pages/Parametrages/role-categories/role-category-list/role-category-list.html`
- `src/app/pages/Parametrages/role-categories/role-category-list/role-category-list.scss`
- `src/app/pages/Parametrages/role-categories/role-category-list/role-category-list.ts`
- `src/app/pages/Parametrages/role-categories/services/role-category.service.ts`

### Parametrages - Teams

- `src/app/pages/Parametrages/teams/dtos/team-create.dto.ts`
- `src/app/pages/Parametrages/teams/dtos/team-member-create.dto.ts`
- `src/app/pages/Parametrages/teams/dtos/team-member-response.dto.ts`
- `src/app/pages/Parametrages/teams/dtos/team-member-update.dto.ts`
- `src/app/pages/Parametrages/teams/dtos/team-response.dto.ts`
- `src/app/pages/Parametrages/teams/dtos/team-search-criteria.dto.ts`
- `src/app/pages/Parametrages/teams/dtos/team-status.enum.ts`
- `src/app/pages/Parametrages/teams/dtos/team-update.dto.ts`
- `src/app/pages/Parametrages/teams/service/team.service.ts`
- `src/app/pages/Parametrages/teams/team-detail/team-detail.html`
- `src/app/pages/Parametrages/teams/team-detail/team-detail.scss`
- `src/app/pages/Parametrages/teams/team-detail/team-detail.ts`
- `src/app/pages/Parametrages/teams/team-edit/team-edit.html`
- `src/app/pages/Parametrages/teams/team-edit/team-edit.scss`
- `src/app/pages/Parametrages/teams/team-edit/team-edit.ts`
- `src/app/pages/Parametrages/teams/team-form/team-form.html`
- `src/app/pages/Parametrages/teams/team-form/team-form.scss`
- `src/app/pages/Parametrages/teams/team-form/team-form.ts`
- `src/app/pages/Parametrages/teams/team-hierarchie/team-hierarchie.html`
- `src/app/pages/Parametrages/teams/team-hierarchie/team-hierarchie.scss`
- `src/app/pages/Parametrages/teams/team-hierarchie/team-hierarchie.ts`
- `src/app/pages/Parametrages/teams/team-list/team-list.html`
- `src/app/pages/Parametrages/teams/team-list/team-list.scss`
- `src/app/pages/Parametrages/teams/team-list/team-list.ts`

### Portal

- `src/app/pages/portal/portal.component.html`
- `src/app/pages/portal/portal.component.scss`
- `src/app/pages/portal/portal.component.ts`

### PrimeNG UIKit/Demo

- `src/app/pages/uikit/buttondemo.ts`
- `src/app/pages/uikit/chartdemo.ts`
- `src/app/pages/uikit/filedemo.ts`
- `src/app/pages/uikit/formlayoutdemo.ts`
- `src/app/pages/uikit/inputdemo.ts`
- `src/app/pages/uikit/listdemo.ts`
- `src/app/pages/uikit/mediademo.ts`
- `src/app/pages/uikit/menudemo.ts`
- `src/app/pages/uikit/messagesdemo.ts`
- `src/app/pages/uikit/miscdemo.ts`
- `src/app/pages/uikit/overlaydemo.ts`
- `src/app/pages/uikit/panelsdemo.ts`
- `src/app/pages/uikit/tabledemo.ts`
- `src/app/pages/uikit/timelinedemo.ts`
- `src/app/pages/uikit/treedemo.ts`
- `src/app/pages/uikit/uikit.routes.ts`

## 15. Important Notes and Risks

- Several service base URLs are hardcoded to localhost. For deployment, these should ideally come from Angular environment configuration.
- `rbacGuard` allows routes with missing RBAC metadata; this is intentional in the current code but means a route is public after Keycloak login unless metadata is present.
- Some route `module` names contain typos/accents/spaces such as `gestion des départments` and `gestion des des modules`; these strings must exactly match backend RBAC permission keys.
- The app initializer uses `login-required`, so even `/portal` and `/landing` may still require login unless Keycloak initialization strategy is adjusted. The redirect storage logic treats `/portal` specially, but Keycloak still runs globally.
- The project contains Sakai demo/UI kit files and public demo assets; these are separate from the ST2I business modules.

## 16. Quick Developer Map

- Start here for routes: `src/app.routes.ts`.
- Start here for app providers: `src/app.config.ts`.
- Start here for login/token: `src/app/core/keycloak-init.factory.ts` and `src/app/core/keycloak.interceptor.ts`.
- Start here for permissions: `src/app/core/services/rbac.service.ts` and `src/app/core/guards/rbac.guard.ts`.
- Start here for UI shell: `src/app/layout/component/app.layout.ts` and `src/app/layout/service/layout.service.ts`.
- Business modules live mainly under `src/app/pages/administration` and `src/app/pages/Parametrages`.
- DTOs are colocated with each feature under `dtos` or `models`.
- Services are colocated with each feature under `services` or `service`.

