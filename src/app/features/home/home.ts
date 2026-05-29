import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { HomeService } from '../../core/services/home.service';
import { HomeActivity, HomeNetwork, HomeWebinar } from '../../core/models/home.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, NavbarComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private observers: IntersectionObserver[] = [];
  private homeSvc = new HomeService(null as any);  // injected below

  loading = signal(true);
  networks  = signal<HomeNetwork[]>([]);
  events    = signal<HomeWebinar[]>([]);
  activities = signal<HomeActivity[]>([]);

  // Static — testimonials & steps don't come from an API
  testimonials = [
    {
      name: 'Amani Bakali', role: 'Développeur, 24 ans', initials: 'AB',
      text: 'Avec Lobi, j\'ai commencé avec seulement 10 000 CDF. Aujourd\'hui, mon portefeuille a plus que triplé. Simple, transparent, vraiment fait pour nous.',
      rating: 5, color: 'primary', gain: '+220%'
    },
    {
      name: 'Fatoumata Diaw', role: 'Étudiante en finance, 22 ans', initials: 'FD',
      text: 'Je cherchais une façon sécurisée d\'investir mes économies. Lobi m\'a offert les outils et la communauté pour le faire intelligemment.',
      rating: 5, color: 'secondary', gain: '+130%'
    },
    {
      name: 'Kevin Mulamba', role: 'Entrepreneur, 28 ans', initials: 'KM',
      text: 'Le Forum Lobi a changé ma vision de l\'investissement. Un réseau incroyable s\'est formé autour de cette plateforme.',
      rating: 5, color: 'green', gain: '+340%'
    }
  ];

  steps = [
    { step: '01', title: 'Créez votre compte', description: 'Inscrivez-vous en 2 minutes, complétez votre KYC et activez votre wallet sécurisé.', icon: 'person_add', color: 'primary' },
    { step: '02', title: 'Choisissez un réseau', description: 'Parcourez nos réseaux d\'investissement soigneusement sélectionnés selon votre profil de risque.', icon: 'search', color: 'secondary' },
    { step: '03', title: 'Investissez & gagnez', description: 'Investissez, suivez vos retours en temps réel depuis votre dashboard et réinvestissez vos gains.', icon: 'trending_up', color: 'green' }
  ];

  metrics = [
    { label: 'Investisseurs actifs', value: 2500, display: '2 500+', icon: 'people', color: 'primary', suffix: '+' },
    { label: 'Fonds levés', value: 850, display: '850M CDF', icon: 'account_balance', color: 'teal', suffix: 'M' },
    { label: 'Réseaux d\'investissement', value: 12, display: '12', icon: 'hub', color: 'green', suffix: '' },
    { label: 'Rendement moyen / mois', value: 18, display: '18%', icon: 'trending_up', color: 'gold', suffix: '%' },
  ];

  constructor(private svc: HomeService) {
    this.homeSvc = svc;
  }

  ngOnInit() {
    forkJoin({
      networks:   this.svc.getNetworks(),
      events:     this.svc.getEvents(),
      activities: this.svc.getActivities(),
    }).subscribe({
      next: (res) => {
        this.networks.set(res.networks.data ?? []);
        this.events.set(res.events.data ?? []);
        this.activities.set(res.activities.data ?? []);
        this.loading.set(false);
        // Start animations after data lands
        setTimeout(() => {
          this.initScrollAnimations();
          this.initCounters();
        }, 80);
      },
      error: () => {
        this.loading.set(false);
        setTimeout(() => { this.initScrollAnimations(); this.initCounters(); }, 80);
      }
    });
  }

  ngOnDestroy() {
    this.observers.forEach(o => o.disconnect());
  }

  // ── helpers ───────────────────────────────────────────────────

  networkColor(type: string): string {
    const map: Record<string, string> = {
      secure: 'primary',
      local_projects: 'green',
      entrepreneurship: 'coral'
    };
    return map[type] ?? 'primary';
  }

  networkIcon(type: string): string {
    const map: Record<string, string> = {
      secure: 'lock',
      local_projects: 'eco',
      entrepreneurship: 'rocket_launch'
    };
    return map[type] ?? 'savings';
  }

  networkCategory(type: string): string {
    const map: Record<string, string> = {
      secure: 'Épargne sécurisée',
      local_projects: 'Projets locaux',
      entrepreneurship: 'Entrepreneuriat'
    };
    return map[type] ?? type;
  }

  eventIcon(type: string): string {
    const map: Record<string, string> = {
      forum: 'groups',
      atelier: 'school',
      summit: 'emoji_events',
      webinar: 'videocam'
    };
    return map[(type || '').toLowerCase()] ?? 'event';
  }

  eventColor(type: string): string {
    const map: Record<string, string> = {
      forum: 'primary',
      atelier: 'secondary',
      summit: 'gold',
      webinar: 'green'
    };
    return map[(type || '').toLowerCase()] ?? 'primary';
  }

  activityIcon(type: string): string {
    const map: Record<string, string> = {
      investment: 'trending_up',
      deposit: 'arrow_downward',
      interest: 'savings',
      withdrawal: 'arrow_upward'
    };
    return map[type] ?? 'swap_horiz';
  }

  activityColor(type: string): string {
    const map: Record<string, string> = {
      investment: 'invest',
      deposit: 'deposit',
      interest: 'return',
      withdrawal: 'withdraw'
    };
    return map[type] ?? 'invest';
  }

  getProgressPercent(network: HomeNetwork): number {
    if (!network.target_amount || network.target_amount === 0) return 0;
    return Math.min(100, Math.round((network.total_funds / network.target_amount) * 100));
  }

  formatCDF(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M CDF';
    if (value >= 1_000)     return Math.round(value / 1_000) + 'K CDF';
    return value.toLocaleString('fr-FR') + ' CDF';
  }

  relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'à l\'instant';
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${Math.floor(hours / 24)}j`;
  }

  // ── animations ────────────────────────────────────────────────

  private initScrollAnimations() {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    this.observers.push(obs);
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }

  private initCounters() {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el    = entry.target as HTMLElement;
          const end   = parseFloat(el.dataset['count'] ?? '0');
          const sfx   = el.dataset['suffix'] ?? '';
          const step  = end / (1800 / 16);
          let cur = 0;
          const t = setInterval(() => {
            cur = Math.min(cur + step, end);
            el.textContent = Math.floor(cur).toLocaleString('fr-FR') + sfx;
            if (cur >= end) clearInterval(t);
          }, 16);
          obs.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    this.observers.push(obs);
    document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
  }
}
