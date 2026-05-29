import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { InvestmentNetwork, UserPocket, Webinar, Resource } from '../models/pocket.model';
import { Observable } from 'rxjs';

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

  getDashboard(): Observable<any> {
    return this.http.get<any>(this.url('/dashboard/user'));
  }

  getAdminDashboard(): Observable<any> {
    return this.http.get<any>(this.url('/dashboard/admin'));
  }
}
