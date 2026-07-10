import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { Parcours, ROLE_LABELS } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterModule],
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
  parcours       = signal<Parcours[]>([]);
  showParcoursForm = signal(false);
  editingParcoursId = signal<string | null>(null);
  parcoursBusy   = signal(false);
  parcoursError  = signal('');

  get user() { return this.auth.currentUser(); }
  get roleLabel() { return ROLE_LABELS[this.user?.role ?? ''] ?? 'Apprenant'; }

  form = this.fb.group({
    fullname:       ['', [Validators.required, Validators.minLength(3)]],
    telephone:      ['', Validators.required],
    ville:          ['', Validators.required],
    pays:           [''],
    date_naissance: [''],
    tranche_age:    [''],
  });

  parcoursForm = this.fb.group({
    diplome:        ['', Validators.required],
    etablissement:  ['', Validators.required],
    filiere:        [''],
    niveau:         [''],
    annee_debut:    [null as number | null],
    annee_fin:      [null as number | null],
    mention:        [''],
    pays:           ['RD Congo'],
    en_cours:       [false],
  });

  trancheAges = ['18-24', '25-30', '31-35', '36-40', '40+'];
  diplomes = ['Baccalauréat', 'Licence', 'Master', 'Doctorat', 'BTS', 'DUT', 'Certificat', 'Autre'];
  mentions = ['', 'Passable', 'Assez Bien', 'Bien', 'Très Bien', 'Excellent'];

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
    this.loadParcours();
  }

  loadParcours() {
    this.userSvc.getMyParcours().subscribe({
      next: (res) => this.parcours.set(res.data ?? []),
      error: () => this.parcours.set([]),
    });
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

  openCreateParcours() {
    this.editingParcoursId.set(null);
    this.parcoursForm.reset({ pays: 'RD Congo', en_cours: false, mention: '' });
    this.parcoursError.set('');
    this.showParcoursForm.set(true);
  }

  openEditParcours(p: Parcours) {
    this.editingParcoursId.set(p.id);
    this.parcoursForm.patchValue({
      diplome: p.diplome,
      etablissement: p.etablissement,
      filiere: p.filiere ?? '',
      niveau: p.niveau ?? '',
      annee_debut: p.annee_debut ?? null,
      annee_fin: p.annee_fin ?? null,
      mention: p.mention ?? '',
      pays: p.pays ?? 'RD Congo',
      en_cours: p.en_cours,
    });
    this.parcoursError.set('');
    this.showParcoursForm.set(true);
  }

  submitParcours() {
    if (this.parcoursForm.invalid) return;
    this.parcoursBusy.set(true);
    this.parcoursError.set('');
    const raw = this.parcoursForm.value;
    const payload = {
      diplome: raw.diplome,
      etablissement: raw.etablissement,
      filiere: raw.filiere,
      niveau: raw.niveau,
      annee_debut: Number(raw.annee_debut) || 0,
      annee_fin: Number(raw.annee_fin) || 0,
      mention: raw.mention,
      pays: raw.pays,
      en_cours: !!raw.en_cours,
    };
    const editId = this.editingParcoursId();
    const req = editId
      ? this.userSvc.updateParcours(editId, payload)
      : this.userSvc.createParcours(payload);

    req.subscribe({
      next: () => {
        this.parcoursBusy.set(false);
        this.showParcoursForm.set(false);
        this.loadParcours();
        this.auth.fetchMe().subscribe();
      },
      error: (err) => {
        this.parcoursBusy.set(false);
        this.parcoursError.set(err?.error?.message ?? 'Erreur');
      },
    });
  }

  deleteParcours(id: string) {
    if (!confirm('Supprimer ce parcours ?')) return;
    this.userSvc.deleteParcours(id).subscribe({ next: () => this.loadParcours() });
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
