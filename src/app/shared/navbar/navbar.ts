import { Component, inject, signal, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  auth   = inject(AuthService);
  notif  = inject(NotificationService);
  router = inject(Router);

  @Input() showHamburger = true;
  @Output() menuToggled = new EventEmitter<void>();

  menuOpen    = signal(false);
  notifOpen   = signal(false);
  profileOpen = signal(false);
  notifications = signal<any[]>([]);

  get user() { return this.auth.currentUser(); }
  get initials(): string {
    const name = this.user?.fullname ?? this.user?.email ?? '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  get navDisplayName(): string {
    const fullname = this.user?.fullname;
    if (fullname) return fullname.split(' ')[0];
    return this.user?.email ?? '';
  }

  ngOnInit() {
    if (this.auth.getToken()) {
      this.notif.getAll().subscribe(res => this.notifications.set(res.data.slice(0, 6)));
    }
  }

  toggleNotif() {
    this.notifOpen.update(v => !v);
    this.profileOpen.set(false);
  }

  toggleProfile() {
    this.profileOpen.update(v => !v);
    this.notifOpen.set(false);
  }

  toggleMenu() { this.menuOpen.update(v => !v); this.menuToggled.emit(); }

  markAllRead() {
    this.notif.markAllRead().subscribe(() =>
      this.notifications.update(list => list.map(n => ({ ...n, is_read: true })))
    );
  }

  logout() { this.auth.logout(); }

  @HostListener('document:click', ['$event'])
  onOutsideClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.navbar-dropdown')) {
      this.notifOpen.set(false);
      this.profileOpen.set(false);
    }
  }
}
