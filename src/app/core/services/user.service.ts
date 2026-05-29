import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get token() { return this.auth.getToken(); }
  private url(path: string) { return `${environment.apiUrl}${path}?token=${this.token}`; }

  getUsers(page = 1, limit = 15, search = '') {
    const params = new HttpParams()
      .set('token', this.token!)
      .set('page', page)
      .set('limit', limit)
      .set('search', search);
    return this.http.get<any>(`${environment.apiUrl}/users`, { params });
  }

  getUser(uuid: string) {
    return this.http.get<any>(this.url(`/users/${uuid}`));
  }

  toggleStatus(uuid: string) {
    return this.http.patch<any>(this.url(`/users/${uuid}/toggle`), {});
  }

  getKYCList(status?: string) {
    const q = status ? `&status=${status}` : '';
    return this.http.get<any>(`${this.url('/kyc')}${q}`);
  }

  approveKYC(id: number, note = '') {
    const fd = new FormData();
    fd.append('note', note);
    return this.http.patch<any>(this.url(`/kyc/${id}/approve`), fd);
  }

  rejectKYC(id: number, note: string) {
    const fd = new FormData();
    fd.append('note', note);
    return this.http.patch<any>(this.url(`/kyc/${id}/reject`), fd);
  }

  getAllTransactions(page = 1, limit = 20) {
    const params = new HttpParams()
      .set('token', this.token!)
      .set('page', page)
      .set('limit', limit);
    return this.http.get<any>(`${environment.apiUrl}/transactions/admin`, { params });
  }

  getAdminNetworks() {
    return this.http.get<any>(`${environment.apiUrl}/pockets/networks`);
  }

  createNetwork(fd: FormData) {
    return this.http.post<any>(this.url('/pockets/networks'), fd);
  }

  updateNetwork(id: number, fd: FormData) {
    return this.http.put<any>(this.url(`/pockets/networks/${id}`), fd);
  }

  createWebinar(fd: FormData) {
    return this.http.post<any>(this.url('/community/webinars'), fd);
  }

  createResource(fd: FormData) {
    return this.http.post<any>(this.url('/community/resources'), fd);
  }

  updateProfile(data: any) {
    return this.http.put<any>(this.url('/users/me/profile'), data);
  }

  uploadProfilePhoto(file: File) {
    const fd = new FormData();
    fd.append('photo', file);
    return this.http.post<any>(this.url('/users/me/photo'), fd);
  }

  deleteProfilePhoto() {
    return this.http.delete<any>(this.url('/users/me/photo'));
  }
}
