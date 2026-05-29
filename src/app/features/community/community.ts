import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PocketService } from '../../core/services/pocket.service';
import { Webinar, Resource } from '../../core/models/pocket.model';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './community.html',
  styleUrl: './community.scss'
})
export class CommunityComponent implements OnInit {
  svc = inject(PocketService);

  webinars   = signal<Webinar[]>([]);
  resources  = signal<Resource[]>([]);
  loading    = signal(true);
  activeTab  = signal<'webinars' | 'resources'>('webinars');
  resCategory = signal('');

  categories = ['', 'finance', 'entrepreneurship', 'investment', 'legal', 'technology'];
  catLabels: { [key: string]: string | undefined } = {
    '': 'Tout', finance: 'Finance', entrepreneurship: 'Entrepreneuriat',
    investment: 'Investissement', legal: 'Juridique', technology: 'Technologie'
  };

  ngOnInit() {
    this.loadWebinars();
    this.loadResources();
  }

  loadWebinars() {
    this.svc.getWebinars(1).subscribe(res => {
      this.webinars.set(res.data);
      this.loading.set(false);
    });
  }

  loadResources() {
    this.svc.getResources(this.resCategory()).subscribe(res => this.resources.set(res.data));
  }

  filterResources(cat: string) {
    this.resCategory.set(cat);
    this.loadResources();
  }

  isLive(w: Webinar): boolean {
    return !!w.is_live;
  }

  isPast(w: Webinar): boolean {
    return !w.is_live && new Date(w.scheduled_at) < new Date();
  }

  isPending(w: Webinar): boolean {
    return !w.is_live && new Date(w.scheduled_at) >= new Date();
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-CD', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    });
  }
}
