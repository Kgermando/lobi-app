import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PocketService } from '../../core/services/pocket.service';
import { InvestmentNetwork, UserPocket } from '../../core/models/pocket.model';

@Component({
  selector: 'app-pockets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './pockets.html',
  styleUrl: './pockets.scss'
})
export class PocketsComponent implements OnInit {
  svc = inject(PocketService);
  fb  = inject(FormBuilder);

  networks    = signal<InvestmentNetwork[]>([]);
  myPockets   = signal<UserPocket[]>([]);
  loading     = signal(true);
  investing   = signal(false);
  errorMsg    = signal('');
  successMsg  = signal('');
  selectedNet = signal<InvestmentNetwork | null>(null);
  activeTab   = signal<'networks' | 'mypockets'>('networks');

  investForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1000)]]
  });

  ngOnInit() {
    this.svc.getNetworks().subscribe(res => {
      this.networks.set(res.data);
      this.loading.set(false);
    });
    this.svc.getMyPockets().subscribe(res => this.myPockets.set(res.data));
  }

  openInvest(net: InvestmentNetwork) {
    this.selectedNet.set(net);
    this.errorMsg.set('');
    this.successMsg.set('');
    this.investForm.reset();
    this.investForm.patchValue({ amount: net.min_amount ?? null });
  }

  closeModal() { this.selectedNet.set(null); }

  submitInvest() {
    if (this.investForm.invalid) { this.investForm.markAllAsTouched(); return; }
    this.investing.set(true);
    this.errorMsg.set('');

    this.svc.invest(
      this.selectedNet()!.id,
      this.investForm.value.amount!
    ).subscribe({
      next: () => {
        this.successMsg.set('Investissement effectué avec succès !');
        this.investing.set(false);
        this.svc.getMyPockets().subscribe(res => this.myPockets.set(res.data));
        setTimeout(() => this.closeModal(), 1800);
      },
      error: err => {
        this.errorMsg.set(err.error?.message || 'Erreur lors de l\'investissement.');
        this.investing.set(false);
      }
    });
  }

  pocketTypeLabel(t: string) {
    return { secure: 'Épargne Sécurisée', local_projects: 'Projets Locaux', entrepreneurship: 'Entrepreneuriat' }[t] ?? t;
  }

  networkTypeClass(t: string) {
    return { secure: 'badge-primary', local_projects: 'badge-secondary', entrepreneurship: 'badge-green' }[t] ?? 'badge-secondary';
  }

  formatAmount(n: number, curr = 'CDF') {
    return new Intl.NumberFormat('fr-CD').format(n) + ' ' + curr;
  }

  profitRate(pocket: UserPocket): number {
    if (!pocket.amount_invested) return 0;
    return ((pocket.interest_earned ?? 0) / pocket.amount_invested) * 100;
  }
}
