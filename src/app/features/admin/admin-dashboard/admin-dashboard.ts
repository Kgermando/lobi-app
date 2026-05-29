import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PocketService } from '../../../core/services/pocket.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  svc     = inject(PocketService);
  loading = signal(true);
  data    = signal<any>(null);

  ngOnInit() {
    this.svc.getAdminDashboard().subscribe({
      next: res => { this.data.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  formatAmount(n: number) {
    return new Intl.NumberFormat('fr-CD').format(n ?? 0) + ' CDF';
  }
}
