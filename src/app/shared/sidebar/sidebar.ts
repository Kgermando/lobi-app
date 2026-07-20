import { Component, inject, Input, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  @Input() open = false;

  auth   = inject(AuthService);
  router = inject(Router);

  currentRoute = signal('');

  userNav: NavItem[] = [
    { label: 'Tableau de bord', icon: 'home',                   route: '/dashboard' },
    { label: 'Mon épargne',     icon: 'savings',                route: '/wallet' },
    { label: 'Mes projets',     icon: 'rocket_launch',          route: '/pockets' },
    { label: 'Formations',      icon: 'play_circle',            route: '/formations' },
    { label: 'Communauté',      icon: 'groups',                 route: '/community' },
  ];

  adminNav: NavItem[] = [
    { label: 'Vue d\'ensemble',  icon: 'dashboard',           route: '/admin' },
    { label: 'Adhérents',        icon: 'people',              route: '/admin/members' },
    { label: 'Vérification KYC', icon: 'verified_user',       route: '/admin/kyc' },
    { label: 'Investissements',  icon: 'trending_up',         route: '/admin/investments' },
    { label: 'Analytics',        icon: 'analytics',           route: '/admin/analytics' },
    { label: 'Communauté',       icon: 'school',              route: '/admin/community' },
    { label: 'Activités',        icon: 'event',               route: '/admin/activities' },
    { label: 'Formations',       icon: 'play_circle',         route: '/admin/formations' },
    { label: 'Témoignages',      icon: 'format_quote',        route: '/admin/testimonials' },
  ];

  get navItems() {
    return this.auth.isAdmin() ? this.adminNav : this.userNav;
  }

  get user() { return this.auth.currentUser(); }

  get userInitial(): string {
    const u = this.auth.currentUser();
    return (u?.fullname ?? u?.email ?? '?')[0].toUpperCase();
  }

  ngOnInit() {
    this.currentRoute.set(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentRoute.set(e.urlAfterRedirects ?? e.url);
    });
  }

  isActive(route: string): boolean {
    return this.currentRoute().startsWith(route);
  }

  logout() { this.auth.logout(); }
}
