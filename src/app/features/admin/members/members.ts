import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './members.html',
  styleUrl: './members.scss'
})
export class MembersComponent implements OnInit {
  svc     = inject(UserService);
  loading = signal(true);
  users   = signal<any[]>([]);
  total   = signal(0);
  page    = signal(1);
  limit   = 15;
  search  = signal('');

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getUsers(this.page(), this.limit, this.search()).subscribe({
      next: (res: any) => {
        this.users.set(res.data ?? []);
        this.total.set(res.pagination?.total_records ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(e: Event) {
    this.search.set((e.target as HTMLInputElement).value);
    this.page.set(1);
    this.load();
  }

  toggleStatus(uuid: string) {
    this.svc.toggleStatus(uuid).subscribe(() => this.load());
  }

  roles = [
    { value: 'apprenant', label: 'Apprenant' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'admin', label: 'Admin' },
    { value: 'partenaire', label: 'Partenaire' },
  ];

  changeRole(uuid: string, e: Event) {
    const role = (e.target as HTMLSelectElement).value;
    this.svc.updateUserRole(uuid, role).subscribe(() => this.load());
  }

  get totalPages() { return Math.ceil(this.total() / this.limit); }
  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  nextPage() { if (this.page() < this.totalPages) { this.page.update(p => p + 1); this.load(); } }

  roleClass(role: string) {
    return {
      superadmin: 'badge-gold',
      admin: 'badge-primary',
      mentor: 'badge-green',
      partenaire: 'badge-gold',
      apprenant: 'badge-secondary',
      user: 'badge-secondary',
    }[role] ?? 'badge-secondary';
  }

  roleLabel(role: string) {
    return {
      apprenant: 'Apprenant', mentor: 'Mentor', admin: 'Admin',
      partenaire: 'Partenaire', superadmin: 'Admin', user: 'Apprenant',
    }[role] ?? role;
  }
}
