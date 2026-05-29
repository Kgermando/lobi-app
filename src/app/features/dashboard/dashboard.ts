import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PocketService } from '../../core/services/pocket.service';
import { WalletService } from '../../core/services/wallet.service';
import { AuthService } from '../../core/services/auth.service';
import { Transaction } from '../../core/models/transaction.model';

interface DashboardData {
  wallet: any;
  total_invested: number;
  active_pockets: number;
  recent_transactions: Transaction[];
  unread_notifications: number;
  goal_progress: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  pocketSvc  = inject(PocketService);
  walletSvc  = inject(WalletService);
  auth       = inject(AuthService);

  loading = signal(true);
  data    = signal<DashboardData | null>(null);

  get user() { return this.auth.currentUser(); }

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  });

  ngOnInit() {
    this.pocketSvc.getDashboard().subscribe({
      next: (res: any) => {
        this.data.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatAmount(amount: number, currency = 'CDF'): string {
    return new Intl.NumberFormat('fr-CD', { minimumFractionDigits: 0 }).format(amount) + ' ' + currency;
  }

  txTypeLabel(type: string): string {
    const map: Record<string, string> = {
      deposit: 'Dépôt', withdrawal: 'Retrait', transfer: 'Virement',
      interest: 'Intérêts', investment: 'Investissement'
    };
    return map[type] ?? type;
  }

  txTypeClass(type: string): string {
    const map: Record<string, string> = {
      deposit: 'badge-secondary', interest: 'badge-green',
      investment: 'badge-primary', withdrawal: 'badge-coral', transfer: 'badge-gold'
    };
    return map[type] ?? 'badge-secondary';
  }

  txSign(type: string): string {
    return ['deposit', 'interest'].includes(type) ? '+' : '-';
  }

  txSignClass(type: string): string {
    return ['deposit', 'interest'].includes(type) ? 'amount-positive' : 'amount-negative';
  }
}
