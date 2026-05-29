import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, RegisterStep1, RegisterStep2 } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'lobi_token';
  private readonly USER_KEY  = 'lobi_user';
  private readonly STEP_KEY  = 'lobi_onboarding_step';
  private readonly UUID_KEY  = 'lobi_user_uuid';

  currentUser = signal<User | null>(this.loadUser());
  isLoggedIn  = computed(() => !!this.currentUser());
  isAdmin     = computed(() => ['admin', 'superadmin'].includes(this.currentUser()?.role ?? ''));

  constructor(private http: HttpClient, private router: Router) {}

  /* ── Registration steps ───────────────────────────── */
  registerStep1(data: RegisterStep1) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register/step1`, data).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.UUID_KEY,  res.user_uuid);
        localStorage.setItem(this.STEP_KEY,  String(res.onboarding_step));
      })
    );
  }

  registerStep2(data: RegisterStep2) {
    return this.http.post<any>(`${environment.apiUrl}/auth/register/step2`, data).pipe(
      tap(res => localStorage.setItem(this.STEP_KEY, String(res.onboarding_step)))
    );
  }

  registerStep5(userUUID: string, riskProfile: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/register/step5`, { user_uuid: userUUID, risk_profile: riskProfile }).pipe(
      tap(res => localStorage.setItem(this.STEP_KEY, String(res.onboarding_step)))
    );
  }

  /* ── Login / Logout ───────────────────────────────── */
  login(identifier: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { identifier, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.UUID_KEY,  res.user_uuid);
        localStorage.setItem(this.STEP_KEY,  String(res.onboarding_step));
        this.fetchMe().subscribe();
      }),
      catchError(err => throwError(() => err))
    );
  }

  fetchMe() {
    return this.http.get<{ data: User }>(`${environment.apiUrl}/auth/me?token=${this.getToken()}`).pipe(
      tap(res => {
        this.currentUser.set(res.data);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.STEP_KEY);
    localStorage.removeItem(this.UUID_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  /* ── App initializer ─────────────────────────────── */
  initialize() {
    if (!this.getToken()) return of(null);
    return this.fetchMe().pipe(
      catchError(() => {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.STEP_KEY);
        localStorage.removeItem(this.UUID_KEY);
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  /* ── Helpers ──────────────────────────────────────── */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getPendingUUID(): string | null {
    return localStorage.getItem(this.UUID_KEY);
  }

  getOnboardingStep(): number {
    return parseInt(localStorage.getItem(this.STEP_KEY) ?? '0', 10);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
