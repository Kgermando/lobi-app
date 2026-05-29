import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';

export const routes: Routes = [
  // ── Homepage (public) ────────────────────────────────────────────────────
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
  },

  // ── Auth (guest only) ────────────────────────────────────────────────────
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: 'login',    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/onboarding/onboarding').then(m => m.OnboardingComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // ── Onboarding (authenticated but incomplete KYC) ───────────────────────
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/onboarding/onboarding').then(m => m.OnboardingComponent)
  },

  // ── Main App (authenticated) ────────────────────────────────────────────
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',  loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'wallet',     loadComponent: () => import('./features/wallet/wallet').then(m => m.WalletComponent) },
      { path: 'pockets',    loadComponent: () => import('./features/pockets/pockets').then(m => m.PocketsComponent) },
      { path: 'community',  loadComponent: () => import('./features/community/community').then(m => m.CommunityComponent) },
      { path: 'profile',    loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── Admin Panel (admin role only) ───────────────────────────────────────
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '',           loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'members',    loadComponent: () => import('./features/admin/members/members').then(m => m.MembersComponent) },
      { path: 'kyc',        loadComponent: () => import('./features/admin/kyc/kyc-review').then(m => m.KycReviewComponent) },
      { path: 'investments',loadComponent: () => import('./features/admin/investments/investments').then(m => m.InvestmentsComponent) },
      { path: 'analytics',  loadComponent: () => import('./features/admin/analytics/analytics').then(m => m.AnalyticsComponent) },
      { path: 'community',  loadComponent: () => import('./features/admin/community-admin/community-admin').then(m => m.CommunityAdminComponent) },
    ]
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '/' }
];
