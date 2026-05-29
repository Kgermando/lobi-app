import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, RouterModule, CommonModule],
  template: `
    <div class="admin-shell">
      <!-- Admin sidebar -->
      <aside class="admin-aside" [class.open]="sidebarOpen()">
        <div class="admin-brand">
          <img src="/images/logo.png" alt="Lobi" class="sidebar-logo"/>
          <div>
            <span class="sidebar-app-name">LOBI</span>
            <span class="sidebar-tagline">Administration</span>
          </div>
        </div>
        <app-sidebar [open]="true"></app-sidebar>
      </aside>

      <!-- Admin content area -->
      <div class="admin-content">
        <!-- Top bar -->
        <header class="admin-topbar">
          <button class="btn-icon" (click)="toggleSidebar()" *ngIf="isMobile()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <nav class="admin-breadcrumb">
            <a routerLink="/admin">Dashboard Admin</a>
          </nav>
        </header>

        <main class="admin-main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
    }
    .admin-aside {
      width: var(--sidebar-w);
      background: var(--primary);
      flex-shrink: 0;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      overflow-y: auto;
      z-index: 100;
      transition: transform .3s;
    }
    .admin-brand {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,.12);
    }
    .admin-content {
      flex: 1;
      margin-left: var(--sidebar-w);
      display: flex;
      flex-direction: column;
    }
    .admin-topbar {
      height: var(--navbar-h);
      background: var(--white);
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      gap: 1rem;
      position: sticky;
      top: 0;
      z-index: 90;
    }
    .admin-breadcrumb {
      font-size: .9rem;
      a { color: var(--text-muted); text-decoration: none; }
    }
    .admin-main {
      flex: 1;
      background: var(--bg);
      overflow-x: hidden;
    }
    .btn-icon {
      background: transparent;
      border: none;
      padding: .5rem;
      border-radius: var(--radius);
      cursor: pointer;
      color: var(--text-muted);
    }
    .sidebar-logo { height: 36px; width: 36px; border-radius: 8px; }
    .sidebar-app-name { font-family: 'Poppins', sans-serif; font-size: 1.1rem; font-weight: 800; color: #fff; display: block; }
    .sidebar-tagline { font-size: .7rem; color: rgba(255,255,255,.5); display: block; font-style: italic; }

    @media (max-width: 768px) {
      .admin-aside { transform: translateX(-100%); &.open { transform: translateX(0); } }
      .admin-content { margin-left: 0; }
    }
  `]
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);
  isMobile    = signal(window.innerWidth <= 768);

  toggleSidebar() { this.sidebarOpen.update(v => !v); }
}
