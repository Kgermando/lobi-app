import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { HomeService } from '../../core/services/home.service';
import { HomeActivity, HomeNetwork, HomeWebinar, Testimonial } from '../../core/models/home.model';
import { Activity } from '../../core/models/activity.model';

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
  cmsActivities = signal<Activity[]>([]);
  testimonials = signal<Testimonial[]>([]);
  selectedActivity = signal<Activity | null>(null);

  steps = [
    { step: '01', title: 'Rejoignez le programme', description: 'Créez votre compte adhérent, complétez votre profil étudiant et activez votre épargne stratégique.', icon: 'person_add', color: 'primary' },
    { step: '02', title: 'Épargnez consciencieusement', description: 'Constituez votre capital via Mobile Money et accédez au fonds de garantie pour vos projets.', icon: 'savings', color: 'secondary' },
    { step: '03', title: 'Lancez votre entreprise', description: 'Bénéficiez de formations, du mentorat et d\'orientations vers des investissements rentables.', icon: 'rocket_launch', color: 'green' }
  ];

  programIntro = {
    title: 'C\'est quoi le programme LOBI ?',
    paragraphs: [
      'Le programme LOBI est une initiative panafricaine née en République Démocratique du Congo, visant à briser le cycle du chômage post-universitaire et à contribuer au développement économique en transformant les étudiant(e)s de demandeurs d\'emploi en créateurs de richesse.',
      'LOBI instaure un système d\'épargne stratégique et consciencieuse. Ce levier de développement vise l\'autonomie financière des jeunes via la création d\'entreprises stables, avec un accompagnement technique, pratique et dédié pour la réussite entrepreneuriale.'
    ]
  };

  problematics = [
    'Les parents congolais investissent massivement dans les études de leurs enfants en espérant des emplois stables — devenus très difficiles à obtenir.',
    'La Banque Africaine de Développement estime que plus de 56 % des Congolais sont en sous-emploi.',
    'Faute d\'opportunités, une grande majorité de jeunes diplômés se retrouvent au chômage.',
    'Nous avons le devoir de créer un autre chemin pour les générations futures.'
  ];

  advantages = [
    { icon: 'work_off', title: 'Réduction du chômage', desc: 'Transformer les diplômés en entrepreneurs actifs et employeurs.', color: 'primary' },
    { icon: 'groups', title: 'Création d\'emplois', desc: 'Chaque projet lancé génère des opportunités pour la communauté.', color: 'green' },
    { icon: 'account_balance', title: 'Fonds de garantie', desc: 'Accès crédit, bourses d\'études et voyages d\'études via l\'épargne collective.', color: 'gold' },
    { icon: 'school', title: 'Formations professionnelles', desc: 'Accès à des formations adaptées et orientées résultats.', color: 'teal' },
    { icon: 'trending_up', title: 'Investissements rentables', desc: 'Orientation vers des placements et projets à fort impact.', color: 'coral' },
    { icon: 'hub', title: 'Réseautage & mentorat', desc: 'Communauté active, webinars et accompagnement personnalisé.', color: 'secondary' }
  ];

  metrics = [
    { label: 'Adhérents actifs', value: 2500, display: '2 500+', icon: 'people', color: 'primary', suffix: '+' },
    { label: 'Épargne mobilisée', value: 850, display: '850M CDF', icon: 'savings', color: 'teal', suffix: 'M' },
    { label: 'Projets accompagnés', value: 12, display: '12', icon: 'rocket_launch', color: 'green', suffix: '' },
    { label: 'Taux de mentorat', value: 100, display: '100%', icon: 'supervisor_account', color: 'gold', suffix: '%' },
  ];

  constructor(private svc: HomeService) {
    this.homeSvc = svc;
  }

  ngOnInit() {
    forkJoin({
      networks:      this.svc.getNetworks(),
      events:        this.svc.getEvents(),
      activities:    this.svc.getActivities(),
      testimonials:  this.svc.getTestimonials(),
    }).subscribe({
      next: (res) => {
        this.networks.set(res.networks.data ?? []);
        this.events.set(res.events.data ?? []);
        this.activities.set(res.activities.data ?? []);
        this.testimonials.set(res.testimonials.data ?? []);
        this.loading.set(false);
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

    this.svc.getCmsActivities().subscribe({
      next: (res) => this.cmsActivities.set(res.data ?? []),
      error: () => this.cmsActivities.set([]),
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

  openCmsActivity(a: Activity) {
    this.selectedActivity.set(a);
  }

  closeCmsActivity() {
    this.selectedActivity.set(null);
  }

  starArray(rating: number): number[] {
    const n = Math.min(5, Math.max(1, rating || 5));
    return Array.from({ length: n }, (_, i) => i + 1);
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
