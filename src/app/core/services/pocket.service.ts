import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { InvestmentNetwork, UserPocket, Webinar, Resource } from '../models/pocket.model';
import { Formation, Mentor, Motivation } from '../models/formation.model';

@Injectable({ providedIn: 'root' })
export class PocketService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get token() { return this.auth.getToken(); }
  private url(path: string) { return `${environment.apiUrl}${path}?token=${this.token}`; }

  getNetworks(): Observable<{ data: InvestmentNetwork[] }> {
    return this.http.get<any>(`${environment.apiUrl}/pockets/networks`);
  }

  getMyPockets(): Observable<{ data: UserPocket[] }> {
    return this.http.get<any>(this.url('/pockets/mine'));
  }

  invest(networkId: number, amount: number) {
    return this.http.post<any>(this.url('/pockets/invest'), { network_id: networkId, amount });
  }

  getWebinars(page = 1): Observable<{ data: Webinar[] }> {
    return this.http.get<any>(`${environment.apiUrl}/community/webinars?page=${page}`);
  }

  getResources(category?: string): Observable<{ data: Resource[] }> {
    const cat = category ? `&category=${category}` : '';
    return this.http.get<any>(`${environment.apiUrl}/community/resources?${cat}`);
  }

  getFormations(): Observable<{ data: Formation[] }> {
    return this.http.get<{ data: Formation[] }>(this.url('/formations'));
  }

  getSuggestedFormations(): Observable<{ data: Formation[]; message?: string }> {
    return this.http.get<{ data: Formation[]; message?: string }>(this.url('/formations/suggested'));
  }

  getFormation(id: string): Observable<{ data: Formation }> {
    return this.http.get<{ data: Formation }>(this.url(`/formations/${id}`));
  }

  getMentors(): Observable<{ data: Mentor[] }> {
    return this.http.get<{ data: Mentor[] }>(this.url('/mentors'));
  }

  getMyMentors(): Observable<{ data: Mentor[] }> {
    return this.http.get<{ data: Mentor[] }>(this.url('/mentors/mine'));
  }

  followMentor(id: string) {
    return this.http.post<any>(this.url(`/mentors/${id}/follow`), {});
  }

  unfollowMentor(id: string) {
    return this.http.delete<any>(this.url(`/mentors/${id}/follow`));
  }

  getMotivationFeed(): Observable<{ data: Motivation[] }> {
    return this.http.get<{ data: Motivation[] }>(this.url('/motivations/feed'));
  }

  getDashboard(): Observable<UserDashboardData> {
    return this.http.get<any>(this.url('/dashboard/user')).pipe(
      map(res => ({
        wallet: res.wallet,
        total_invested: res.total_invested ?? 0,
        active_pockets: Array.isArray(res.pockets) ? res.pockets.length : 0,
        recent_transactions: res.recent_tx ?? [],
        unread_notifications: res.unread_notifs ?? 0,
        goal_progress: res.goal_progress ?? 0,
      }))
    );
  }

  getAdminDashboard(): Observable<AdminDashboardData> {
    return this.http.get<any>(this.url('/dashboard/admin')).pipe(
      map(res => ({
        stats: res.stats ?? {},
        monthly_deposits: res.monthly_deposits ?? [],
        networks: res.networks ?? [],
        age_groups: res.age_groups ?? [],
      }))
    );
  }
}

export interface UserDashboardData {
  wallet: any;
  total_invested: number;
  active_pockets: number;
  recent_transactions: any[];
  unread_notifications: number;
  goal_progress: number;
}

export interface AdminDashboardData {
  stats: {
    total_users?: number;
    new_users_month?: number;
    pending_kyc?: number;
    approved_kyc?: number;
    total_deposits?: number;
    total_withdrawals?: number;
    total_investments?: number;
    net_balance?: number;
  };
  monthly_deposits: any[];
  networks: any[];
  age_groups: any[];
}
