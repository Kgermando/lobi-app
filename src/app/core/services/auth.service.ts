import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, RegisterStep1, RegisterStep2 } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'lobi_token';
  private readonly USER_KEY  = 'lobi_user';
  private readonly STEP_KEY  = 'lobi_onboarding_step';
  private readonly UUID_KEY  = 'lobi_user_uuid';

  currentUser          = signal<User | null>(this.loadUser());
  onboardingStep       = signal<number>(parseInt(localStorage.getItem('lobi_onboarding_step') ?? '0', 10));
  isLoggedIn           = computed(() => !!this.currentUser());
  isOnboardingComplete = computed(() => this.onboardingStep() >= 5);
  canAccessApp         = computed(() => this.onboardingStep() >= 3);
  isAdmin              = computed(() => ['admin', 'superadmin'].includes(this.currentUser()?.role ?? ''));

  constructor(private http: HttpClient, private router: Router) {}

  saveOnboardingStep(step: number) {
    localStorage.setItem(this.STEP_KEY, String(step));
    this.onboardingStep.set(step);
  }

  /* ── Registration steps ───────────────────────────── */
  registerStep1(data: RegisterStep1) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register/step1`, data).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.UUID_KEY,  res.user_uuid);
        this.saveOnboardingStep(res.onboarding_step ?? 1);
      })
    );
  }

  registerStep2(data: RegisterStep2) {
    return this.http.post<any>(`${environment.apiUrl}/auth/register/step2`, data).pipe(
      tap(res => this.saveOnboardingStep(res.onboarding_step ?? 2))
    );
  }

  registerStep5(userUUID: string, riskProfile: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/register/step5`, { user_uuid: userUUID, risk_profile: riskProfile }).pipe(
      tap(res => this.saveOnboardingStep(res.onboarding_step ?? 5))
    );
  }

  /* ── Login / Logout ───────────────────────────────── */
  login(identifier: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { identifier, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.UUID_KEY,  res.user_uuid);
        this.saveOnboardingStep(res.onboarding_step ?? 0);
      }),
      switchMap(() => this.fetchMe()),
      catchError(err => throwError(() => err))
    );
  }

  fetchMe() {
    return this.http.get<{ data: User }>(`${environment.apiUrl}/auth/me?token=${this.getToken()}`).pipe(
      tap(res => {
        this.currentUser.set(res.data);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        if (res.data.onboarding_step !== undefined) {
          this.saveOnboardingStep(res.data.onboarding_step);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.STEP_KEY);
    localStorage.removeItem(this.UUID_KEY);
    this.currentUser.set(null);
    this.onboardingStep.set(0);
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
        this.onboardingStep.set(0);
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
    return this.onboardingStep();
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
