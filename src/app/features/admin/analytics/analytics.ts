import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PocketService } from '../../../core/services/pocket.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class AnalyticsComponent implements OnInit {
  svc     = inject(PocketService);
  loading = signal(true);
  data    = signal<any>(null);

  ngOnInit() {
    this.svc.getAdminDashboard().subscribe({
      next: (res: any) => { this.data.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  formatAmount(n: number) {
    return new Intl.NumberFormat('fr-CD').format(n ?? 0) + ' CDF';
  }
}
