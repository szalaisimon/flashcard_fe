import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {RouterLink} from '@angular/router';
import {finalize} from 'rxjs';
import {errorMessage} from '../../../utils/http-error';
import {nonBlank} from '../../../utils/validators';

@Component({selector: 'app-register', imports: [ReactiveFormsModule, RouterLink], templateUrl: './register.component.html', styleUrl: './register.component.css'})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly registered = signal(false);
  readonly registerForm = this.fb.nonNullable.group({
    username: ['', [nonBlank, Validators.minLength(3), Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    email: ['', [nonBlank, Validators.email, Validators.maxLength(254)]]
  });

  onSubmit(): void {
    if (this.busy()) return;
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    this.busy.set(true);
    this.error.set('');
    const value = this.registerForm.getRawValue();
    this.authService.register({...value, username: value.username.trim(), email: value.email.trim()})
      .pipe(finalize(() => this.busy.set(false))).subscribe({
        next: () => { this.registered.set(true); this.registerForm.reset(); },
        error: error => this.error.set(errorMessage(error))
      });
  }

  isInvalid(name: string): boolean {
    const control = this.registerForm.get(name);
    return !!control?.invalid && (control.touched || control.dirty);
  }
}
