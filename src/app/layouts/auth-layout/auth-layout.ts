import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, RouterLinkWithHref],
  template: `
    <div class="auth-shell">
      <div class="auth-brand">
        <div class="auth-brand-inner">
          <a routerLink="/"><img src="/images/logo.png" alt="Lobi" class="auth-brand-logo"/></a> 
          <h1 class="auth-brand-name">LOBI</h1>
          <p class="auth-brand-tag">Assurons l'avenir</p>
          <p class="auth-brand-desc">La plateforme d'épargne et d'investissement dédiée à la jeunesse africaine.</p>
          <div class="auth-features">
            <div class="auth-feature"><mat-icon>lock</mat-icon><span>Épargne sécurisée</span></div>
            <div class="auth-feature"><mat-icon>trending_up</mat-icon><span>Investissements locaux</span></div>
            <div class="auth-feature"><mat-icon>group</mat-icon><span>Réseau de jeunes entrepreneurs</span></div>
            <div class="auth-feature"><mat-icon>smartphone</mat-icon><span>Mobile Money intégré</span></div>
          </div>
        </div>
        <div class="auth-brand-pattern"></div>
      </div>
      <div class="auth-content">
        <div class="auth-mobile-logo">
          <a routerLink="/"><img src="/images/lobi.png" alt="Lobi"/></a>
          <!-- <span>LOBI</span> -->
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .auth-shell {
      display: flex;
      min-height: 100vh;
    }
    .auth-brand {
      width: 45%;
      background: var(--bg-gradient-hero, linear-gradient(160deg, #1A4D8F 0%, #133A6E 50%, #0D2E5A 100%));
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }
    .auth-brand-inner {
      position: relative;
      z-index: 2;
      color: white;
      max-width: 380px;
    }
    .auth-brand-logo {
      height: 72px;
      width: 72px;
      border-radius: 16px;
      margin-bottom: 1.5rem;
      box-shadow: 0 8px 32px rgba(0,0,0,.3);
    }
    .auth-brand-name {
      font-family: 'Poppins', sans-serif;
      font-size: 2.75rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: .08em;
      margin-bottom: .25rem;
    }
    .auth-brand-tag {
      font-style: italic;
      color: rgba(255,255,255,.7);
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
    .auth-brand-desc {
      font-size: 1rem;
      color: rgba(255,255,255,.85);
      line-height: 1.65;
      margin-bottom: 2rem;
    }
    .auth-features {
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .auth-feature {
      display: flex;
      align-items: center;
      gap: .75rem;
      font-size: .9375rem;
      color: rgba(255,255,255,.9);
      span:first-child { font-size: 1.25rem; }
    }
    .auth-brand-pattern {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 20% 80%, rgba(43,168,164,.25) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(92,181,53,.15) 0%, transparent 40%),
        radial-gradient(circle at 60% 60%, rgba(245,149,107,.1) 0%, transparent 40%);
    }
    .auth-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: var(--bg);
      overflow-y: auto;
    }
    .auth-mobile-logo {
      display: none;
    }
    @media (max-width: 900px) {
      .auth-brand { display: none; }
      .auth-content {
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        padding: 1.5rem 1rem;
      }
      .auth-mobile-logo {
        display: flex;
        align-items: center;
        gap: .625rem;
        margin-bottom: 1.25rem;
      }
      .auth-mobile-logo img {
        height: 64px;
        width: 64px;
        border-radius: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,.15);
      }
      .auth-mobile-logo span {
        font-family: 'Poppins', sans-serif;
        font-size: 1.5rem;
        font-weight: 800;
        color: #1A4D8F;
        letter-spacing: .08em;
      }
    }
  `]
})
export class AuthLayoutComponent { }
