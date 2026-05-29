import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Wallet, DepositInput, RecurringPayment } from '../models/wallet.model';
import { Transaction, Pagination } from '../models/transaction.model';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get token() { return this.auth.getToken(); }
  private url(path: string) { return `${environment.apiUrl}${path}?token=${this.token}`; }

  getWallet(): Observable<{ data: Wallet; progress: string }> {
    return this.http.get<any>(this.url('/wallet'));
  }

  deposit(data: DepositInput) {
    return this.http.post<any>(this.url('/wallet/deposit'), data);
  }

  withdraw(data: DepositInput) {
    return this.http.post<any>(this.url('/wallet/withdraw'), data);
  }

  setGoal(goal: number, name: string) {
    return this.http.put<any>(this.url('/wallet/goal'), { saving_goal: goal, saving_goal_name: name });
  }

  getRecurring(): Observable<{ data: RecurringPayment[] }> {
    return this.http.get<any>(this.url('/wallet/recurring'));
  }

  createRecurring(data: Partial<RecurringPayment>) {
    return this.http.post<any>(this.url('/wallet/recurring'), data);
  }

  deleteRecurring(id: number) {
    return this.http.delete<any>(this.url(`/wallet/recurring/${id}`));
  }

  getMyTransactions(page = 1, limit = 20, type?: string): Observable<{ data: Transaction[]; pagination: Pagination }> {
    let params = new HttpParams().set('token', this.token!).set('page', page).set('limit', limit);
    if (type) params = params.set('type', type);
    return this.http.get<any>(`${environment.apiUrl}/transactions`, { params });
  }
}
