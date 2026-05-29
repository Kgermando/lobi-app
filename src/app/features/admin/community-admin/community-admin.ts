import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';
import { PocketService } from '../../../core/services/pocket.service';

@Component({
  selector: 'app-community-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './community-admin.html',
  styleUrl: './community-admin.scss'
})
export class CommunityAdminComponent implements OnInit {
  userSvc   = inject(UserService);
  pocketSvc = inject(PocketService);
  fb        = inject(FormBuilder);

  loading   = signal(true);
  webinars  = signal<any[]>([]);
  resources = signal<any[]>([]);
  activeTab = signal<'webinars' | 'resources'>('webinars');
  showWebinarForm  = signal(false);
  showResourceForm = signal(false);
  uploading = signal(false);

  webinarForm = this.fb.group({
    title:            ['', Validators.required],
    description:      [''],
    speaker:          ['', Validators.required],
    scheduled_at:     ['', Validators.required],
    duration:         [60],
    tags:             [''],
    register_url:     [''],
    event_type:       ['webinar'],
    location:         [''],
    max_spots:        [0],
    available_spots:  [0],
  });

  resourceForm = this.fb.group({
    title:       ['', Validators.required],
    description: [''],
    category:    ['finance', Validators.required],
    content_url: ['', Validators.required],
    read_time:   [5],
  });

  ngOnInit() { this.loadWebinars(); this.loadResources(); }

  now() { return new Date().toISOString(); }

  loadWebinars() {
    this.pocketSvc.getWebinars(1).subscribe({
      next: (res: any) => { this.webinars.set(res.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadResources() {
    this.pocketSvc.getResources().subscribe({
      next: (res: any) => this.resources.set(res.data ?? [])
    });
  }

  submitWebinar() {
    if (this.webinarForm.invalid) return;
    this.uploading.set(true);
    const fd = new FormData();
    Object.entries(this.webinarForm.value).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
    this.userSvc.createWebinar(fd).subscribe({
      next: () => { this.uploading.set(false); this.showWebinarForm.set(false); this.webinarForm.reset(); this.loadWebinars(); },
      error: () => this.uploading.set(false)
    });
  }

  submitResource() {
    if (this.resourceForm.invalid) return;
    this.uploading.set(true);
    const fd = new FormData();
    Object.entries(this.resourceForm.value).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
    this.userSvc.createResource(fd).subscribe({
      next: () => { this.uploading.set(false); this.showResourceForm.set(false); this.resourceForm.reset(); this.loadResources(); },
      error: () => this.uploading.set(false)
    });
  }
}
