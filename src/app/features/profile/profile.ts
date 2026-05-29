import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  auth    = inject(AuthService);
  userSvc = inject(UserService);
  fb      = inject(FormBuilder);

  loading        = signal(false);
  uploadingPhoto = signal(false);
  successMsg     = signal('');
  errorMsg       = signal('');

  get user() { return this.auth.currentUser(); }

  form = this.fb.group({
    fullname:       ['', [Validators.required, Validators.minLength(3)]],
    telephone:      ['', Validators.required],
    ville:          ['', Validators.required],
    pays:           [''],
    date_naissance: [''],
    tranche_age:    [''],
  });

  trancheAges = ['18-24', '25-30', '31-35', '36-40', '40+'];

  ngOnInit() {
    if (this.user) {
      this.form.patchValue({
        fullname:       this.user.fullname ?? '',
        telephone:      this.user.telephone ?? '',
        ville:          this.user.ville ?? '',
        pays:           this.user.pays ?? '',
        date_naissance: this.user.date_naissance ?? '',
        tranche_age:    this.user.tranche_age ?? '18-24',
      });
    }
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.userSvc.updateProfile(this.form.value as any).subscribe({
      next: () => {
        this.successMsg.set('Profil mis à jour avec succès.');
        this.loading.set(false);
        this.auth.fetchMe().subscribe();
      },
      error: err => { this.errorMsg.set(err.error?.message || 'Erreur.'); this.loading.set(false); }
    });
  }

  onPhotoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingPhoto.set(true);
    this.userSvc.uploadProfilePhoto(file).subscribe({
      next: () => { this.uploadingPhoto.set(false); this.auth.fetchMe().subscribe(); },
      error: () => this.uploadingPhoto.set(false)
    });
  }

  get initials(): string {
    const name = this.user?.fullname ?? this.user?.email ?? '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  get kycStatusLabel(): string {
    const labels: { [k: string]: string } = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté' };
    return labels[this.user?.kyc?.status ?? ''] ?? 'Non soumis';
  }

  get kycStatusClass(): string {
    const classes: { [k: string]: string } = { pending: 'badge-gold', approved: 'badge-green', rejected: 'badge-coral' };
    return classes[this.user?.kyc?.status ?? ''] ?? 'badge-secondary';
  }
}
