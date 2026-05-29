import { Component, OnInit, OnDestroy, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [],
  templateUrl: './install-prompt.html',
  styleUrl: './install-prompt.scss'
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  visible = signal(false);
  showIosHint = signal(false);
  canNativeInstall = signal(false);

  private deferredPrompt: any = null;
  private readonly STORAGE_KEY = 'lobi_install_dismissed';
  private timer: any = null;
  private promptHandler = (e: any) => {
    e.preventDefault();
    this.deferredPrompt = e;
    this.canNativeInstall.set(true);
  };

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (localStorage.getItem(this.STORAGE_KEY)) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (('standalone' in window.navigator) && (window.navigator as any)['standalone']) return;

    // Capture native install prompt if browser supports it
    window.addEventListener('beforeinstallprompt', this.promptHandler);

    // iOS Safari detection
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) this.showIosHint.set(true);

    // Show after short delay regardless of beforeinstallprompt
    this.timer = setTimeout(() => this.visible.set(true), 1500);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('beforeinstallprompt', this.promptHandler);
    }
    clearTimeout(this.timer);
  }

  async install() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') this.dismiss();
      this.deferredPrompt = null;
    }
  }

  dismiss() {
    this.visible.set(false);
    localStorage.setItem(this.STORAGE_KEY, '1');
  }
}
