import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';
import { Testimonial } from '../../../core/models/home.model';

@Component({
  selector: 'app-testimonials-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './testimonials-admin.html',
  styleUrl: './testimonials-admin.scss'
})
export class TestimonialsAdminComponent implements OnInit {
  svc = inject(UserService);
  fb  = inject(FormBuilder);

  loading  = signal(true);
  saving   = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  items    = signal<Testimonial[]>([]);
  errorMsg = signal('');

  colors = [
    { value: 'primary', label: 'Bleu' },
    { value: 'secondary', label: 'Teal' },
    { value: 'green', label: 'Vert' },
    { value: 'gold', label: 'Or' },
    { value: 'coral', label: 'Corail' },
  ];

  form = this.fb.group({
    name:      ['', Validators.required],
    role:      ['', Validators.required],
    initials:  [''],
    text:      ['', Validators.required],
    rating:    [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    color:     ['primary', Validators.required],
    gain:      [''],
    sort_order:[0],
    active:    [true],
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getTestimonialsAdmin().subscribe({
      next: (res) => {
        this.items.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({
      name: '', role: '', initials: '', text: '',
      rating: 5, color: 'primary', gain: '', sort_order: 0, active: true,
    });
    this.errorMsg.set('');
    this.showForm.set(true);
  }

  openEdit(t: Testimonial) {
    this.editingId.set(t.id);
    this.form.patchValue({
      name: t.name,
      role: t.role,
      initials: t.initials,
      text: t.text,
      rating: t.rating,
      color: t.color || 'primary',
      gain: t.gain,
      sort_order: t.sort_order,
      active: t.active,
    });
    this.errorMsg.set('');
    this.showForm.set(true);
  }

  cancel() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set('');
    const payload = this.form.getRawValue();
    const id = this.editingId();
    const req = id
      ? this.svc.updateTestimonial(id, payload)
      : this.svc.createTestimonial(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Erreur');
      },
    });
  }

  delete(id: string) {
    if (!confirm('Supprimer ce témoignage ?')) return;
    this.svc.deleteTestimonial(id).subscribe({ next: () => this.load() });
  }
}
