import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { PocketService } from '../../core/services/pocket.service';
import { AuthService } from '../../core/services/auth.service';
import { Formation } from '../../core/models/formation.model';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './formation-detail.html',
  styleUrl: './formation-detail.scss'
})
export class FormationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(PocketService);
  private auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  loading = signal(true);
  error = signal('');
  formation = signal<Formation | null>(null);
  following = signal(false);
  followBusy = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Formation introuvable');
      this.loading.set(false);
      return;
    }
    this.svc.getFormation(id).subscribe({
      next: (res) => {
        this.formation.set(res.data);
        const mentorId = res.data.mentor_id || res.data.mentor?.id;
        if (mentorId) {
          const followed = (this.auth.currentUser()?.mentors ?? []).some((m) => m.id === mentorId);
          this.following.set(followed);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Formation introuvable');
        this.loading.set(false);
      },
    });
  }

  toggleFollow() {
    const f = this.formation();
    const mentorId = f?.mentor_id || f?.mentor?.id;
    if (!mentorId || this.followBusy()) return;
    this.followBusy.set(true);
    const req = this.following()
      ? this.svc.unfollowMentor(mentorId)
      : this.svc.followMentor(mentorId);
    req.subscribe({
      next: () => {
        this.following.update((v) => !v);
        this.auth.fetchMe().subscribe();
        this.followBusy.set(false);
      },
      error: () => this.followBusy.set(false),
    });
  }

  youtubeEmbedUrl(url: string): SafeResourceUrl | null {
    const id = this.extractYoutubeId(url);
    if (!id) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
    );
  }

  extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m?.[1]) return m[1];
    }
    return null;
  }
}
