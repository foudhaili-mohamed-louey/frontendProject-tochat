import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { keycloak } from '../../core/keycloak-init.factory';
@Component({
  selector: 'app-portal',
  standalone: true,
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class PortalComponent {
  constructor(private router: Router) {}

 logout() {
  keycloak.logout({
    redirectUri: 'http://localhost:4200'
  });
}}