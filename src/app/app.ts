import {Component, computed, inject, signal} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {Header} from './components/shared/header/header';
import {Navbar} from './components/shared/navbar/navbar';
import {filter} from 'rxjs';
import {AuthService} from './services/auth.service';
import {FooterComponent} from './components/shared/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Navbar, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('flashcard-client');
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly routeUrl = signal(this.router.url);
  readonly showNavbar = computed(() => !!this.auth.currentUserSig()
    && !['/login', '/register'].includes(this.routeUrl().split('?')[0]));

  constructor() {
    this.auth.initialize().subscribe();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => this.routeUrl.set(event.urlAfterRedirects));
  }

  retryAuthentication(): void {
    this.auth.initialize().subscribe();
  }
}
