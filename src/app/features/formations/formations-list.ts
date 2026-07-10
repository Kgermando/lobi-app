import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PocketService } from '../../core/services/pocket.service';
import { AuthService } from '../../core/services/auth.service';
import { Formation, Mentor, Motivation } from '../../core/models/formation.model';

@Component({
  selector: 'app-formations-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './formations-list.html',
  styleUrl: './formations-list.scss'
})
export class FormationsListComponent implements OnInit {
  svc = inject(PocketService);
  auth = inject(AuthService);

  loading = signal(true);
  formations = signal<Formation[]>([]);
  suggested = signal<Formation[]>([]);
  mentors = signal<Mentor[]>([]);
  motivations = signal<Motivation[]>([]);
  category = signal('');
  activeTab = signal<'suggested' | 'all' | 'mentors' | 'citations'>('suggested');
  followBusy = signal<string | null>(null);

  categories = [
    { value: '', label: 'Toutes' },
    { value: 'finance', label: 'Finance' },
    { value: 'investissement', label: 'Investissement' },
    { value: 'entrepreneuriat', label: 'Entrepreneuriat' },
    { value: 'epargne', label: 'Épargne' },
    { value: 'juridique', label: 'Juridique' },
    { value: 'technologie', label: 'Technologie' },
  ];

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.svc.getFormations().subscribe({
      next: (res) => {
        this.applyCategoryFilter(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.formations.set([]);
        this.loading.set(false);
      },
    });
    this.svc.getSuggestedFormations().subscribe({
      next: (res) => this.suggested.set(res.data ?? []),
      error: () => this.suggested.set([]),
    });
    this.svc.getMentors().subscribe({
      next: (res) => this.mentors.set((res.data as Mentor[]) ?? []),
      error: () => this.mentors.set([]),
    });
    this.loadMotivations();
  }

  loadMotivations() {
    this.svc.getMotivationFeed().subscribe({
      next: (res) => this.motivations.set(res.data ?? []),
      error: () => this.motivations.set([]),
    });
  }

  applyCategoryFilter(list: Formation[]) {
    const cat = this.category();
    this.formations.set(cat ? list.filter((f) => f.category === cat) : list);
  }

  filter(cat: string) {
    this.category.set(cat);
    this.svc.getFormations().subscribe({
      next: (res) => this.applyCategoryFilter(res.data ?? []),
    });
  }

  toggleFollow(m: Mentor) {
    if (this.followBusy()) return;
    this.followBusy.set(m.id);
    const req = m.followed
      ? this.svc.unfollowMentor(m.id)
      : this.svc.followMentor(m.id);

    req.subscribe({
      next: () => {
        this.mentors.update((list) =>
          list.map((x) => (x.id === m.id ? { ...x, followed: !m.followed } : x))
        );
        this.svc.getSuggestedFormations().subscribe({
          next: (res) => this.suggested.set(res.data ?? []),
        });
        this.loadMotivations();
        this.auth.fetchMe().subscribe();
        this.followBusy.set(null);
      },
      error: () => this.followBusy.set(null),
    });
  }
}
