import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-kyc-review',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './kyc-review.html',
  styleUrl: './kyc-review.scss'
})
export class KycReviewComponent implements OnInit {
  svc       = inject(UserService);
  loading   = signal(true);
  kycs      = signal<any[]>([]);
  filter    = signal('pending');
  selected  = signal<any>(null);
  note      = signal('');
  submitting = signal(false);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getKYCList(this.filter()).subscribe({
      next: (res: any) => { this.kycs.set(res.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setFilter(f: string) { this.filter.set(f); this.load(); }

  openDetail(kyc: any) { this.selected.set(kyc); this.note.set(''); }
  closeDetail() { this.selected.set(null); }

  approve() {
    if (!this.selected()) return;
    this.submitting.set(true);
    this.svc.approveKYC(this.selected().id, this.note()).subscribe({
      next: () => { this.submitting.set(false); this.closeDetail(); this.load(); },
      error: () => this.submitting.set(false)
    });
  }

  reject() {
    if (!this.selected() || !this.note()) return;
    this.submitting.set(true);
    this.svc.rejectKYC(this.selected().id, this.note()).subscribe({
      next: () => { this.submitting.set(false); this.closeDetail(); this.load(); },
      error: () => this.submitting.set(false)
    });
  }

  statusClass(s: string) {
    return { approved: 'badge-green', rejected: 'badge-coral', pending: 'badge-gold' }[s] ?? 'badge-secondary';
  }
}
