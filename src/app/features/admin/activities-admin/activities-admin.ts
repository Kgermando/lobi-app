import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';
import { Activity } from '../../../core/models/activity.model';

@Component({
  selector: 'app-activities-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './activities-admin.html',
  styleUrl: './activities-admin.scss'
})
export class ActivitiesAdminComponent implements OnInit {
  userSvc = inject(UserService);
  fb = inject(FormBuilder);

  loading = signal(true);
  uploading = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  activities = signal<Activity[]>([]);
  errorMsg = signal('');

  coverFile: File | null = null;
  galleryFiles: File[] = [];
  participantLogos: (File | null)[] = [];

  form = this.fb.group({
    title: ['', Validators.required],
    resume: ['', Validators.required],
    description: ['', Validators.required],
    participants: this.fb.array([]),
  });

  get participants(): FormArray {
    return this.form.get('participants') as FormArray;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.userSvc.getActivities().subscribe({
      next: (res) => {
        this.activities.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset();
    this.participants.clear();
    this.coverFile = null;
    this.galleryFiles = [];
    this.participantLogos = [];
    this.errorMsg.set('');
    this.showForm.set(true);
  }

  openEdit(a: Activity) {
    this.editingId.set(a.id);
    this.form.patchValue({
      title: a.title,
      resume: a.resume,
      description: a.description,
    });
    this.participants.clear();
    this.participantLogos = [];
    (a.participants ?? []).forEach((p) => {
      this.participants.push(this.fb.group({ title: [p.title, Validators.required] }));
      this.participantLogos.push(null);
    });
    this.coverFile = null;
    this.galleryFiles = [];
    this.errorMsg.set('');
    this.showForm.set(true);
  }

  addParticipant() {
    this.participants.push(this.fb.group({ title: ['', Validators.required] }));
    this.participantLogos.push(null);
  }

  removeParticipant(i: number) {
    this.participants.removeAt(i);
    this.participantLogos.splice(i, 1);
  }

  onCoverChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.coverFile = input.files?.[0] ?? null;
  }

  onGalleryChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.galleryFiles = input.files ? Array.from(input.files) : [];
  }

  onParticipantLogo(i: number, e: Event) {
    const input = e.target as HTMLInputElement;
    this.participantLogos[i] = input.files?.[0] ?? null;
  }

  submit() {
    if (this.form.invalid) return;
    const isEdit = !!this.editingId();
    if (!isEdit && !this.coverFile) {
      this.errorMsg.set("L'image de couverture est requise");
      return;
    }

    const parts = this.participants.value as { title: string }[];
    if (!isEdit && parts.some((_, i) => !this.participantLogos[i])) {
      this.errorMsg.set('Chaque participant doit avoir un logo');
      return;
    }

    this.uploading.set(true);
    this.errorMsg.set('');
    const fd = new FormData();
    fd.append('title', this.form.value.title!);
    fd.append('resume', this.form.value.resume!);
    fd.append('description', this.form.value.description!);
    if (this.coverFile) fd.append('image', this.coverFile);
    this.galleryFiles.forEach((f) => fd.append('images', f));

    const hasAllLogos = parts.every((_, i) => !!this.participantLogos[i]);
    if (parts.length > 0 && (!isEdit || hasAllLogos)) {
      fd.append('participants', JSON.stringify(parts.map((p) => ({ title: p.title }))));
      parts.forEach((_, i) => {
        const logo = this.participantLogos[i];
        if (logo) fd.append(`participant_logo_${i}`, logo);
      });
    }

    const req = isEdit
      ? this.userSvc.updateActivity(this.editingId()!, fd)
      : this.userSvc.createActivity(fd);

    req.subscribe({
      next: () => {
        this.uploading.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: (err) => {
        this.uploading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Erreur lors de l\'enregistrement');
      },
    });
  }

  delete(id: string) {
    if (!confirm('Supprimer cette activité ?')) return;
    this.userSvc.deleteActivity(id).subscribe({ next: () => this.load() });
  }
}
