import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';
import { Formation, Mentor, Motivation } from '../../../core/models/formation.model';

@Component({
  selector: 'app-formations-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './formations-admin.html',
  styleUrl: './formations-admin.scss'
})
export class FormationsAdminComponent implements OnInit {
  userSvc = inject(UserService);
  fb = inject(FormBuilder);

  loading = signal(true);
  uploading = signal(false);
  showForm = signal(false);
  showMentorForm = signal(false);
  showCitationForm = signal(false);
  editingId = signal<string | null>(null);
  editingMentorId = signal<string | null>(null);
  editingMotivationId = signal<string | null>(null);
  citationMentorId = signal<string | null>(null);
  activeTab = signal<'formations' | 'mentors' | 'citations'>('formations');
  formations = signal<Formation[]>([]);
  mentors = signal<Mentor[]>([]);
  motivations = signal<Motivation[]>([]);
  errorMsg = signal('');
  mentorError = signal('');
  citationError = signal('');
  coverFile: File | null = null;
  mentorImage: File | null = null;

  categories = [
    'finance', 'investissement', 'entrepreneuriat', 'epargne', 'juridique', 'technologie'
  ];

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    video_url: ['', Validators.required],
    status: ['public', Validators.required],
    category: ['finance', Validators.required],
    mentor_id: ['', Validators.required],
  });

  mentorForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  citationForm = this.fb.group({
    mentor_id: ['', Validators.required],
    citation: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit() {
    this.load();
    this.loadMentors();
  }

  load() {
    this.loading.set(true);
    this.userSvc.getFormationsAdmin().subscribe({
      next: (res) => {
        this.formations.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadMentors() {
    this.userSvc.getMentors().subscribe({
      next: (res) => this.mentors.set(res.data ?? []),
      error: () => this.mentors.set([]),
    });
  }

  setTab(tab: 'formations' | 'mentors' | 'citations') {
    this.activeTab.set(tab);
    if (tab === 'citations') this.loadAllCitations();
  }

  loadAllCitations() {
    const list = this.mentors();
    if (!list.length) {
      this.motivations.set([]);
      return;
    }
    const results: Motivation[] = [];
    let done = 0;
    list.forEach((m) => {
      this.userSvc.getMentorMotivations(m.id).subscribe({
        next: (res) => {
          results.push(...(res.data ?? []));
          done++;
          if (done === list.length) {
            results.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
            this.motivations.set(results);
          }
        },
        error: () => {
          done++;
          if (done === list.length) this.motivations.set(results);
        },
      });
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ status: 'public', category: 'finance', mentor_id: '' });
    this.coverFile = null;
    this.errorMsg.set('');
    this.showForm.set(true);
  }

  openEdit(f: Formation) {
    this.editingId.set(f.id);
    this.form.patchValue({
      title: f.title,
      description: f.description,
      video_url: f.video_url,
      status: f.status,
      category: f.category || 'finance',
      mentor_id: f.mentor_id || f.mentor?.id || '',
    });
    this.coverFile = null;
    this.errorMsg.set('');
    this.showForm.set(true);
  }

  onCoverChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.coverFile = input.files?.[0] ?? null;
  }

  submit() {
    if (this.form.invalid) return;
    const isEdit = !!this.editingId();
    if (!isEdit && !this.coverFile) {
      this.errorMsg.set("L'image de couverture est requise");
      return;
    }

    this.uploading.set(true);
    this.errorMsg.set('');
    const fd = new FormData();
    fd.append('title', this.form.value.title!);
    fd.append('description', this.form.value.description!);
    fd.append('video_url', this.form.value.video_url!);
    fd.append('status', this.form.value.status!);
    fd.append('category', this.form.value.category!);
    fd.append('mentor_id', this.form.value.mentor_id!);
    if (this.coverFile) fd.append('image', this.coverFile);

    const req = isEdit
      ? this.userSvc.updateFormation(this.editingId()!, fd)
      : this.userSvc.createFormation(fd);

    req.subscribe({
      next: () => {
        this.uploading.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: (err) => {
        this.uploading.set(false);
        this.errorMsg.set(err?.error?.message ?? "Erreur lors de l'enregistrement");
      },
    });
  }

  delete(id: string) {
    if (!confirm('Supprimer cette formation ?')) return;
    this.userSvc.deleteFormation(id).subscribe({ next: () => this.load() });
  }

  // ── Mentors ──
  openCreateMentor() {
    this.editingMentorId.set(null);
    this.mentorForm.reset();
    this.mentorImage = null;
    this.mentorError.set('');
    this.showMentorForm.set(true);
  }

  openEditMentor(m: Mentor) {
    this.editingMentorId.set(m.id);
    this.mentorForm.patchValue({ name: m.name, description: m.description });
    this.mentorImage = null;
    this.mentorError.set('');
    this.showMentorForm.set(true);
  }

  onMentorImage(e: Event) {
    const input = e.target as HTMLInputElement;
    this.mentorImage = input.files?.[0] ?? null;
  }

  submitMentor() {
    if (this.mentorForm.invalid) return;
    const isEdit = !!this.editingMentorId();
    if (!isEdit && !this.mentorImage) {
      this.mentorError.set("L'image du mentor est requise");
      return;
    }

    this.uploading.set(true);
    this.mentorError.set('');
    const fd = new FormData();
    fd.append('name', this.mentorForm.value.name!);
    fd.append('description', this.mentorForm.value.description!);
    if (this.mentorImage) fd.append('image', this.mentorImage);

    const req = isEdit
      ? this.userSvc.updateMentor(this.editingMentorId()!, fd)
      : this.userSvc.createMentor(fd);

    req.subscribe({
      next: () => {
        this.uploading.set(false);
        this.showMentorForm.set(false);
        this.loadMentors();
      },
      error: (err) => {
        this.uploading.set(false);
        this.mentorError.set(err?.error?.message ?? "Erreur lors de l'enregistrement");
      },
    });
  }

  deleteMentor(id: string) {
    if (!confirm('Supprimer ce mentor ?')) return;
    this.userSvc.deleteMentor(id).subscribe({
      next: () => this.loadMentors(),
      error: (err) => alert(err?.error?.message ?? 'Erreur'),
    });
  }

  // ── Citations ──
  openCreateCitation(mentorId?: string) {
    this.editingMotivationId.set(null);
    this.citationMentorId.set(mentorId ?? null);
    this.citationForm.reset({ mentor_id: mentorId ?? '', citation: '' });
    this.citationError.set('');
    this.showCitationForm.set(true);
    this.activeTab.set('citations');
  }

  openEditCitation(m: Motivation) {
    this.editingMotivationId.set(m.id);
    this.citationMentorId.set(m.mentor_id);
    this.citationForm.patchValue({ mentor_id: m.mentor_id, citation: m.citation });
    this.citationError.set('');
    this.showCitationForm.set(true);
  }

  submitCitation() {
    if (this.citationForm.invalid) return;
    const mentorId = this.citationForm.value.mentor_id!;
    const citation = this.citationForm.value.citation!.trim();
    this.uploading.set(true);
    this.citationError.set('');

    const editId = this.editingMotivationId();
    const req = editId
      ? this.userSvc.updateMotivation(mentorId, editId, citation)
      : this.userSvc.createMotivation(mentorId, citation);

    req.subscribe({
      next: () => {
        this.uploading.set(false);
        this.showCitationForm.set(false);
        this.loadAllCitations();
      },
      error: (err) => {
        this.uploading.set(false);
        this.citationError.set(err?.error?.message ?? "Erreur lors de l'enregistrement");
      },
    });
  }

  deleteCitation(m: Motivation) {
    if (!confirm('Supprimer cette citation ?')) return;
    this.userSvc.deleteMotivation(m.mentor_id, m.id).subscribe({
      next: () => this.loadAllCitations(),
    });
  }
}

