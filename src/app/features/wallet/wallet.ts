import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { WalletService } from '../../core/services/wallet.service';
import { Wallet, RecurringPayment } from '../../core/models/wallet.model';
import { Transaction } from '../../core/models/transaction.model';

type ModalType = 'deposit' | 'withdraw' | 'goal' | 'recurring' | null;

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss'
})
export class WalletComponent implements OnInit {
  svc = inject(WalletService);
  fb  = inject(FormBuilder);

  wallet      = signal<Wallet | null>(null);
  transactions = signal<Transaction[]>([]);
  recurring   = signal<RecurringPayment[]>([]);
  totalCount  = signal(0);
  page        = signal(1);
  perPage     = 10;

  activeModal = signal<ModalType>(null);
  loading     = signal(false);
  pageLoading = signal(true);
  errorMsg    = signal('');
  successMsg  = signal('');

  activeTab   = signal<'transactions' | 'recurring'>('transactions');
  txFilter    = signal('');

  payMethods = [
    { value: 'orange_money',  label: 'Orange Money' },
    { value: 'airtel_money',  label: 'Airtel Money' },
    { value: 'mpesa',         label: 'M-Pesa' },
    { value: 'visa',          label: 'Carte Visa' },
    { value: 'mastercard',    label: 'Mastercard' },
  ];

  frequencies = ['monthly', 'weekly', 'biweekly'];
  freqLabels: Record<string, string> = { monthly: 'Mensuel', weekly: 'Hebdomadaire', biweekly: 'Bimensuel' };

  depositForm = this.fb.group({
    amount:         [null, [Validators.required, Validators.min(100)]],
    pay_method:     ['orange_money', Validators.required],
    phone_or_card:  ['', Validators.required],
    description:    ['']
  });

  withdrawForm = this.fb.group({
    amount:        [null, [Validators.required, Validators.min(100)]],
    pay_method:    ['orange_money', Validators.required],
    phone_or_card: ['', Validators.required],
    description:   ['']
  });

  goalForm = this.fb.group({
    saving_goal:      [null, [Validators.required, Validators.min(1000)]],
    saving_goal_name: ['', Validators.required]
  });

  recurringForm = this.fb.group({
    amount:        [null, [Validators.required, Validators.min(100)]],
    frequency:     ['monthly', Validators.required],
    pay_method:    ['orange_money', Validators.required],
    phone_or_card: ['', Validators.required]
  });

  ngOnInit() {
    this.loadWallet();
    this.loadTransactions();
    this.loadRecurring();
  }

  loadWallet() {
    this.svc.getWallet().subscribe(res => {
      this.wallet.set(res.data);
      this.pageLoading.set(false);
    });
  }

  loadTransactions() {
    this.svc.getMyTransactions(this.page(), this.perPage, this.txFilter()).subscribe(res => {
      this.transactions.set(res.data);
      this.totalCount.set(res.pagination.total_records ?? 0);
    });
  }

  loadRecurring() {
    this.svc.getRecurring().subscribe(res => this.recurring.set(res.data));
  }

  filterTx(type: string) {
    this.txFilter.set(type);
    this.page.set(1);
    this.loadTransactions();
  }

  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.loadTransactions(); } }
  nextPage() { if (this.page() * this.perPage < this.totalCount()) { this.page.update(p => p + 1); this.loadTransactions(); } }

  openModal(type: ModalType) {
    this.errorMsg.set('');
    this.successMsg.set('');
    this.activeModal.set(type);
    if (type === 'goal' && this.wallet()) {
      this.goalForm.patchValue({
        saving_goal: this.wallet()!.saving_goal as any,
        saving_goal_name: this.wallet()!.saving_goal_name
      });
    }
  }
  closeModal() { this.activeModal.set(null); }

  submitDeposit() {
    if (this.depositForm.invalid) { this.depositForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.svc.deposit(this.depositForm.value as any).subscribe({
      next: () => {
        this.successMsg.set('Dépôt effectué avec succès !');
        this.loading.set(false);
        this.loadWallet(); this.loadTransactions();
        setTimeout(() => this.closeModal(), 1800);
      },
      error: err => { this.errorMsg.set(err.error?.message || 'Erreur lors du dépôt.'); this.loading.set(false); }
    });
  }

  submitWithdraw() {
    if (this.withdrawForm.invalid) { this.withdrawForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.svc.withdraw(this.withdrawForm.value as any).subscribe({
      next: () => {
        this.successMsg.set('Retrait effectué avec succès !');
        this.loading.set(false);
        this.loadWallet(); this.loadTransactions();
        setTimeout(() => this.closeModal(), 1800);
      },
      error: err => { this.errorMsg.set(err.error?.message || 'Solde insuffisant ou erreur.'); this.loading.set(false); }
    });
  }

  submitGoal() {
    if (this.goalForm.invalid) { this.goalForm.markAllAsTouched(); return; }
    this.loading.set(true);
    const v = this.goalForm.value;
    this.svc.setGoal(v.saving_goal as any, v.saving_goal_name as any).subscribe({
      next: () => { this.loadWallet(); this.closeModal(); this.loading.set(false); },
      error: err => { this.errorMsg.set(err.error?.message || 'Erreur.'); this.loading.set(false); }
    });
  }

  submitRecurring() {
    if (this.recurringForm.invalid) { this.recurringForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.svc.createRecurring(this.recurringForm.value as any).subscribe({
      next: () => { this.loadRecurring(); this.closeModal(); this.loading.set(false); },
      error: err => { this.errorMsg.set(err.error?.message || 'Erreur.'); this.loading.set(false); }
    });
  }

  deleteRecurring(id: number) {
    if (!confirm('Supprimer ce paiement automatique ?')) return;
    this.svc.deleteRecurring(id).subscribe(() => this.loadRecurring());
  }

  formatAmount(n: number, curr = 'CDF') {
    return new Intl.NumberFormat('fr-CD').format(n) + ' ' + curr;
  }

  txTypeLabel(t: string) {
    return { deposit:'Dépôt', withdrawal:'Retrait', transfer:'Virement', interest:'Intérêts', investment:'Investissement' }[t] ?? t;
  }
  txSign(t: string) { return ['deposit','interest'].includes(t) ? '+' : '-'; }
  txSignClass(t: string) { return ['deposit','interest'].includes(t) ? 'amount-positive' : 'amount-negative'; }
  statusClass(s: string) { return { completed:'badge-green', pending:'badge-gold', failed:'badge-coral' }[s] ?? 'badge-secondary'; }
  statusLabel(s: string) { return { completed:'Complété', pending:'En attente', failed:'Échoué' }[s] ?? s; }

  get totalPages() { return Math.ceil(this.totalCount() / this.perPage); }
}
