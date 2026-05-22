import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

type BreadcrumbItem = {
  label: string;
  url?: string;
  icon?: string;
};

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="breadcrumb-wrapper" *ngIf="items.length > 0">
      <div class="breadcrumb-card">

        <nav class="breadcrumb-nav">
          <ng-container *ngFor="let item of items; let last = last">
            <a
              *ngIf="!last && item.url"
              class="breadcrumb-link"
              [routerLink]="item.url">

              <i *ngIf="item.icon" [class]="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>

            <span
              *ngIf="last || !item.url"
              class="breadcrumb-current">

              <i *ngIf="item.icon" [class]="item.icon"></i>
              <span>{{ item.label }}</span>
            </span>

            <i
              *ngIf="!last"
              class="pi pi-chevron-right breadcrumb-separator">
            </i>
          </ng-container>
        </nav>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .breadcrumb-wrapper {
      padding: 0 1.5rem 1rem 1.5rem;
    }

    .breadcrumb-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 0.9rem 1.1rem;
      min-height: 46px;
      display: flex;
      align-items: center;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.55rem;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .breadcrumb-link,
    .breadcrumb-current {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      text-decoration: none;
      white-space: nowrap;
    }

    .breadcrumb-link {
      color: #64748b;
      cursor: pointer;
      transition: 0.15s ease;
    }

    .breadcrumb-link:hover {
      color: #1d4ed8;
    }

    .breadcrumb-current {
      color: #1f3b6d;
      font-weight: 800;
    }

    .breadcrumb-separator {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    @media (max-width: 768px) {
      .breadcrumb-wrapper {
        padding: 0 1rem 0.75rem 1rem;
      }

      .breadcrumb-card {
        padding: 0.75rem 0.85rem;
      }

      .breadcrumb-nav {
        font-size: 0.8rem;
      }
    }
  `]
})
export class AppBreadcrumb implements OnInit, OnDestroy {

  items: BreadcrumbItem[] = [];

  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.buildBreadcrumb(this.router.url);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.buildBreadcrumb(event.urlAfterRedirects || event.url);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildBreadcrumb(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];

    if (cleanUrl === '/' || cleanUrl === '') {
      this.items = [
        { label: 'Dashboard', url: '/', icon: 'pi pi-home' }
      ];
      return;
    }

    const segments = cleanUrl.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: 'Accueil', url: '/', icon: 'pi pi-home' }
    ];

    if (segments[0] === 'Parametrages') {
      items.push({
        label: 'Paramétrages',
        url: undefined,
        icon: 'pi pi-cog'
      });

      this.addParametragesBreadcrumb(items, segments, cleanUrl);
    } else if (segments[0] === 'administration') {
      items.push({
        label: 'Administration',
        url: undefined,
        icon: 'pi pi-shield'
      });

      this.addAdministrationBreadcrumb(items, segments, cleanUrl);
    } else {
      items.push({
        label: this.formatUnknownSegment(segments[0]),
        url: cleanUrl
      });
    }

    this.items = items;
  }

  private addParametragesBreadcrumb(
    items: BreadcrumbItem[],
    segments: string[],
    cleanUrl: string
  ): void {
    const module = segments[1];
    const action = segments[segments.length - 1];

    switch (module) {
      case 'departments':
        items.push({ label: 'Gestion des départements', url: '/Parametrages/departments', icon: 'pi pi-building' });
        break;

      case 'projects':
        items.push({ label: 'Gestion des projets', url: '/Parametrages/projects', icon: 'pi pi-briefcase' });
        break;

      case 'teams':
        items.push({ label: 'Gestion des équipes', url: '/Parametrages/teams', icon: 'pi pi-users' });
        break;

      case 'modules':
        items.push({ label: 'Gestion des modules', url: '/Parametrages/modules', icon: 'pi pi-table' });
        break;

      case 'project-roles':
        items.push({ label: 'Rôles projet', url: '/Parametrages/project-roles', icon: 'pi pi-id-card' });
        break;

      case 'role-categories':
        items.push({ label: 'Catégories des rôles', url: '/Parametrages/role-categories', icon: 'pi pi-tags' });
        break;

      default:
        items.push({ label: this.formatUnknownSegment(module), url: cleanUrl });
        return;
    }

    if (module === 'teams' && action === 'hierarchie') {
      items.push({ label: 'Hiérarchie des équipes' });
      return;
    }

    if (action === 'new') {
      items.push({ label: 'Ajouter' });
      return;
    }

    if (action === 'edit') {
      items.push({ label: 'Modifier' });
      return;
    }

    if (action === 'details') {
      items.push({ label: 'Détails' });
      return;
    }
  }

  private addAdministrationBreadcrumb(
    items: BreadcrumbItem[],
    segments: string[],
    cleanUrl: string
  ): void {
    const module = segments[1];
    const action = segments[segments.length - 1];

    switch (module) {
      case 'users':
        items.push({ label: 'Gestion des utilisateurs', url: '/administration/users', icon: 'pi pi-users' });
        break;

      case 'roles':
        items.push({ label: 'Gestion des rôles', url: '/administration/roles', icon: 'pi pi-lock' });
        break;

      case 'tracability':
        items.push({ label: 'Traçabilité', url: '/administration/tracability', icon: 'pi pi-history' });
        return;

      default:
        items.push({ label: this.formatUnknownSegment(module), url: cleanUrl });
        return;
    }

    if (action === 'new') {
      items.push({ label: 'Ajouter' });
      return;
    }

    if (action === 'edit') {
      items.push({ label: 'Modifier' });
      return;
    }

    if (action === 'details') {
      items.push({ label: 'Détails' });
      return;
    }

    if (action === 'permissions') {
      items.push({ label: 'Permissions' });
      return;
    }
  }

  private formatUnknownSegment(value?: string): string {
    if (!value) return 'Page';

    return value
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}