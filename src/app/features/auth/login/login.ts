import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  fb      = inject(FormBuilder);
  auth    = inject(AuthService);
  router  = inject(Router);

  loading  = signal(false);
  errorMsg = signal('');
  showPwd  = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => {
        if (!this.auth.canAccessApp()) {
          this.router.navigate(['/onboarding']);
        } else if (this.auth.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: err => {
        this.errorMsg.set(err.error?.message || 'Email ou mot de passe incorrect.');
        this.loading.set(false);
      }
    });
  }

  get emailCtrl() { return this.form.get('email')!; }
  get pwdCtrl()   { return this.form.get('password')!; }
}
