import {Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {environment} from '../../../../environments/environment';
import {errorMessage} from '../../../utils/http-error';
import {finalize} from 'rxjs';

@Component({selector: 'app-header', imports: [RouterLink], templateUrl: './header.html', styleUrl: './header.css'})
export class Header {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly busy = signal(false);
  readonly error = signal('');
  menuOpen = false;
  version = environment.version;

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }

  logout(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.authService.logout().pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => { this.menuOpen = false; void this.router.navigate(['/']); },
      error: error => this.error.set(`Logout failed. ${errorMessage(error)}`)
    });
  }
}
