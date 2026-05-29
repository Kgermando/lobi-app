import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HomeActivity, HomeNetwork, HomeWebinar } from '../models/home.model';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getNetworks() {
    return this.http.get<{ data: HomeNetwork[] }>(`${this.api}/pockets/networks`);
  }

  getEvents() {
    return this.http.get<{ data: HomeWebinar[] }>(`${this.api}/homepage/events`);
  }

  getActivities() {
    return this.http.get<{ data: HomeActivity[] }>(`${this.api}/homepage/activities`);
  }
}
