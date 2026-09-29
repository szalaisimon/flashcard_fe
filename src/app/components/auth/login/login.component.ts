import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {finalize} from 'rxjs';
import {errorMessage} from '../../../utils/http-error';
import {nonBlank} from '../../../utils/validators';

@Component({selector: 'app-login', imports: [ReactiveFormsModule, RouterLink], templateUrl: './login.component.html', styleUrl: './login.component.css'})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly expired = this.route.snapshot.queryParamMap.has('expired');
  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [nonBlank, Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.maxLength(72)]]
  });

  onSubmit(): void {
    if (this.busy()) return;
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;
    this.busy.set(true);
    this.error.set('');
    const value = this.loginForm.getRawValue();
    this.authService.login({...value, username: value.username.trim()}).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
          && !/^\/(login|register)([/?#]|$)/.test(returnUrl) ? returnUrl : '/deck');
      },
      error: error => this.error.set(error.status === 401 ? 'Incorrect username or password.' : errorMessage(error))
    });
  }

  isInvalid(name: string): boolean {
    const control = this.loginForm.get(name);
    return !!control?.invalid && (control.touched || control.dirty);
  }
}
