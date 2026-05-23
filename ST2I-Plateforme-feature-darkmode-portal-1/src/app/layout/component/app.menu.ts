import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { RbacService } from '@/app/core/services/rbac.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    private rbac = inject(RbacService);

    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Statistiques',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                ]
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                path: '/pages',
                items: [
                    {
                        label: 'Administration',
                        icon: 'pi pi-fw pi-cog',
                        path: '/administration',
                        items: [
                            {
                                label: 'Gestion des utilisateurs',
                                icon: 'pi pi-users',
                                routerLink: ['/administration/users'],
                                visible: this.rbac.canRead('gestion des utilisateurs')
                            },
                            {
                                label: 'Gestions des rôles',
                                icon: 'pi pi-shield',
                                routerLink: ['/administration/roles'],
                                visible: this.rbac.canRead('gestion des roles')
                            },
                            {
                                label: 'Traçabilité',
                                icon: 'pi pi-list',
                                routerLink: ['/administration/tracability'],
                                visible: this.rbac.canRead('traçabilité')
                            }
                        ]
                    },
                    {
                        label: 'Paramétrages',
                        icon: 'pi pi-fw pi-cog',
                        path: '/Paramétrages',
                        items: [
                            {
                                label: 'Gestion des départements',
                                icon: 'pi pi-fw pi-building',
                                routerLink: ['/Parametrages/departments'],
                                visible: this.rbac.canRead('gestion des départments')
                            },
                            {
                                label: 'Gestion des projets',
                                icon: 'pi pi-briefcase',
                                routerLink: ['/Parametrages/projects'],
                                visible: this.rbac.canRead('gestion des projets')
                            },
                            {
                                label: 'Gestion des Modules',
                                icon: 'pi pi-fw pi-building',
                                routerLink: ['/Parametrages/modules'],
                                visible: this.rbac.canRead('gestion des des modules')
                            },
                            {
                                label: 'Rôles Projet',
                                icon: 'pi pi-id-card',
                                routerLink: ['/Parametrages/project-roles'],
                                visible: this.rbac.canRead('gestion les roles des projets')
                            },
                            {
                                label: 'Catégories de rôles',
                                icon: 'pi pi-tags',
                                routerLink: ['/Parametrages/role-categories'],
                                visible: this.rbac.canRead('gestion les Catégories des roles')
                            },
                            {
                                label: 'Gestion des équipes',
                                icon: 'pi pi-users',
                                routerLink: ['/Parametrages/teams'],
                                visible: this.rbac.canRead('gestion des projets')
                            },
                            {
                                label: 'Hiérarchie des équipes',
                                icon: 'pi pi-sitemap',
                                routerLink: ['/Parametrages/teams/hierarchie'],
                                visible: this.rbac.canRead('gestion des projets')
                            }
                        ]
                    }
                ]
            }
        ];
    }
}