import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './investments.html',
  styleUrl: './investments.scss'
})
export class InvestmentsComponent implements OnInit {
  svc      = inject(UserService);
  loading  = signal(true);
  networks = signal<any[]>([]);
  txs      = signal<any[]>([]);
  txTotal  = signal(0);
  page     = signal(1);
  limit    = 20;

  ngOnInit() {
    this.loadNetworks();
    this.loadTransactions();
  }

  loadNetworks() {
    this.svc.getAdminNetworks().subscribe({
      next: (res: any) => { this.networks.set(res.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadTransactions() {
    this.svc.getAllTransactions(this.page(), this.limit).subscribe({
      next: (res: any) => {
        this.txs.set(res.data ?? []);
        this.txTotal.set(res.pagination?.total_records ?? 0);
      }
    });
  }

  formatAmount(n: number) {
    return new Intl.NumberFormat('fr-CD').format(n ?? 0) + ' CDF';
  }

  statusClass(s: string) {
    return { completed: 'badge-green', pending: 'badge-gold', failed: 'badge-coral' }[s] ?? 'badge-secondary';
  }

  get totalPages() { return Math.ceil(this.txTotal() / this.limit); }
  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.loadTransactions(); } }
  nextPage() { if (this.page() < this.totalPages) { this.page.update(p => p + 1); this.loadTransactions(); } }
}
