import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Notification } from '../models/pocket.model';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  unreadCount = signal(0);

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get token() { return this.auth.getToken(); }
  private url(path: string) { return `${environment.apiUrl}${path}?token=${this.token}`; }

  getAll() {
    return this.http.get<{ data: Notification[]; unread: number }>(this.url('/notifications')).pipe(
      tap(res => this.unreadCount.set(res.unread))
    );
  }

  markRead(id: number) {
    return this.http.patch<any>(this.url(`/notifications/${id}/read`), {}).pipe(
      tap(() => this.unreadCount.update(n => Math.max(0, n - 1)))
    );
  }

  markAllRead() {
    return this.http.patch<any>(this.url('/notifications/read-all'), {}).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }
}
