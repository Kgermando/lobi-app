import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

interface KycFiles { document: File | null; back: File | null; selfie: File | null; }

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss'
})
export class OnboardingComponent {
  auth    = inject(AuthService);
  router  = inject(Router);
  fb      = inject(FormBuilder);
  http    = inject(HttpClient);

  step     = signal(1);
  loading  = signal(false);
  errorMsg = signal('');
  showPwd  = signal(false);
  kycStep3Preview = signal<{document?: string, back?: string, selfie?: string}>({});

  kycFiles: KycFiles = { document: null, back: null, selfie: null };

  // Steps: 1=Email+Password, 2=Personal info, 3=KYC upload, 4=KYC pending, 5=Risk profile
  totalSteps = 5;
  progress = computed(() => (this.step() / this.totalSteps) * 100);

  stepLabels = ['Compte', 'Profil', 'Identité', 'Vérification', 'Profil investisseur'];

  // Step 1
  step1Form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8),
                    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)]]
  });

  // Step 2
  step2Form = this.fb.group({
    fullname:      ['', [Validators.required, Validators.minLength(3)]],
    telephone:     ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)]],
    date_naissance:['', Validators.required],
    tranche_age:   ['18-24'],
    ville:         ['', Validators.required],
    pays:          ['RD Congo']
  });

  trancheAges  = ['18-24', '25-30', '31-35', '36-40', '40+'];
  documentTypes = [
    { value: 'national_id',  label: 'Carte Nationale d\'Identité' },
    { value: 'passport',     label: 'Passeport' },
    { value: 'driver_license', label: 'Permis de conduire' },
  ];
  selectedDocType = signal('national_id');

  // Step 3 validation
  step3Valid = computed(() => !!this.kycStep3Preview().document);

  // Step 5
  riskProfiles = [
    { value: 'secure',         label: 'Prudent',        icon: 'security',       desc: 'Je préfère la sécurité. Épargne garantie à 4.5%.',         color: 'var(--primary)' },
    { value: 'balanced',       label: 'Équilibré',      icon: 'balance',         desc: 'Bon équilibre entre sécurité et rendement. ~9%.',          color: 'var(--secondary)' },
    { value: 'growth',         label: 'Croissance',      icon: 'rocket_launch',  desc: 'Je veux maximiser mes gains. Rendement potentiel 15%+.',    color: 'var(--green)' },
  ];
  selectedRisk = signal('secure');

  // ──────────────────────────────────────────────────────────────────────────
  // Step navigation
  // ──────────────────────────────────────────────────────────────────────────

  ngOnInit() {
    // If user is already partially onboarded, jump to their step
    const savedStep = this.auth.getOnboardingStep();
    if (savedStep && savedStep > 1) {
      this.step.set(Math.min(savedStep, this.totalSteps));
    }
  }

  next() { this.step.update(s => Math.min(s + 1, this.totalSteps)); }
  back() { this.step.update(s => Math.max(s - 1, 1)); }

  // ──────────────────────────────────────────────────────────────────────────
  // Step 1 – Email + Password
  // ──────────────────────────────────────────────────────────────────────────

  submitStep1() {
    if (this.step1Form.invalid) { this.step1Form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    const { email, password } = this.step1Form.value;

    this.auth.registerStep1({ email: email!, password: password!, password_confirm: password! }).subscribe({
      next: () => { this.loading.set(false); this.step.set(2); },
      error: err => {
        this.errorMsg.set(err.error?.message || 'Erreur lors de la création du compte.');
        this.loading.set(false);
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Step 2 – Personal info
  // ──────────────────────────────────────────────────────────────────────────

  submitStep2() {
    if (this.step2Form.invalid) { this.step2Form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const payload = { ...this.step2Form.value, user_uuid: this.auth.getPendingUUID() };

    this.auth.registerStep2(payload as any).subscribe({
      next: () => { this.loading.set(false); this.step.set(3); },
      error: err => {
        this.errorMsg.set(err.error?.message || 'Erreur lors de la mise à jour du profil.');
        this.loading.set(false);
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Step 3 – KYC upload
  // ──────────────────────────────────────────────────────────────────────────

  onFileChange(event: Event, field: 'document' | 'back' | 'selfie') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.kycFiles[field] = file;

    // Preview
    const reader = new FileReader();
    reader.onload = e => {
      this.kycStep3Preview.update(p => ({ ...p, [field]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  submitStep3() {
    if (!this.kycFiles.document) { this.errorMsg.set('Le document d\'identité est requis.'); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const fd = new FormData();
    fd.append('document_type', this.selectedDocType());
    fd.append('document', this.kycFiles.document);
    if (this.kycFiles.back)   fd.append('back',   this.kycFiles.back);
    if (this.kycFiles.selfie) fd.append('selfie', this.kycFiles.selfie);

    const token = this.auth.getToken();
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

    this.http.post(`${this.getApiUrl()}/kyc/submit`, fd, { headers }).subscribe({
      next: () => { this.loading.set(false); this.step.set(4); },
      error: err => {
        this.errorMsg.set(err.error?.message || 'Erreur lors du téléchargement des documents.');
        this.loading.set(false);
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Step 5 – Risk profile
  // ──────────────────────────────────────────────────────────────────────────

  submitStep5() {
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.registerStep5(this.auth.getPendingUUID() ?? '', this.selectedRisk()).subscribe({
      next: () => {
        this.auth.fetchMe().subscribe({
          next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
          error: () => { this.loading.set(false); this.router.navigate(['/dashboard']); }
        });
      },
      error: err => {
        this.errorMsg.set(err.error?.message || 'Erreur lors de la sauvegarde du profil.');
        this.loading.set(false);
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  private getApiUrl(): string {
    return (window as any).__env?.apiUrl ?? 'http://localhost:8000/api';
  }

  get s1email()   { return this.step1Form.get('email')!; }
  get s1pwd()     { return this.step1Form.get('password')!; }
  get s2name()    { return this.step2Form.get('fullname')!; }
  get s2phone()   { return this.step2Form.get('telephone')!; }
  get s2dob()     { return this.step2Form.get('date_naissance')!; }
  get s2ville()   { return this.step2Form.get('ville')!; }
}
