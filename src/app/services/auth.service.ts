import {inject, Injectable, signal} from '@angular/core';
import {HttpBackend, HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, finalize, map, Observable, of, shareReplay, switchMap, tap, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {errorMessage} from '../utils/http-error';

@Injectable({providedIn: 'root'})
export class AuthService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly baseUrl = `${environment.apiUrl}/api/v1/user`;
  private readonly options = {withCredentials: true};
  private initialization$?: Observable<string | null>;
  private refresh$?: Observable<void>;
  readonly currentUserSig = signal<string | null | undefined>(undefined);
  readonly initializationError = signal('');

  initialize(): Observable<string | null> {
    if (this.currentUserSig() !== undefined) return of(this.currentUserSig() ?? null);
    if (!this.initialization$) {
      this.initializationError.set('');
      this.initialization$ = this.http.get<{username: string}>(`${this.baseUrl}/me`, this.options).pipe(
        catchError((error: HttpErrorResponse) => error.status === 401
          ? this.refreshSession().pipe(switchMap(() => this.http.get<{username: string}>(`${this.baseUrl}/me`, this.options)))
          : throwError(() => error)),
        map(user => this.currentUserSig() === undefined ? user.username : this.currentUserSig() ?? null),
        tap(username => this.currentUserSig.set(username)),
        catchError((error: HttpErrorResponse) => {
          if (this.currentUserSig() !== undefined) return of(this.currentUserSig() ?? null);
          if (error.status === 401 || error.status === 403) this.currentUserSig.set(null);
          else this.initializationError.set(errorMessage(error));
          return of(null);
        }),
        finalize(() => this.initialization$ = undefined),
        shareReplay({bufferSize: 1, refCount: false})
      );
    }
    return this.initialization$;
  }

  refreshSession(): Observable<void> {
    if (!this.refresh$) {
      this.refresh$ = this.http.post<void>(`${this.baseUrl}/refresh`, {}, this.options).pipe(
        finalize(() => this.refresh$ = undefined),
        shareReplay({bufferSize: 1, refCount: false})
      );
    }
    return this.refresh$;
  }

  login(user: {username: string; password: string}): Observable<{username: string}> {
    return this.http.post<{username: string}>(`${this.baseUrl}/login`, user, this.options).pipe(
      tap(result => {
        this.currentUserSig.set(result.username);
        this.initializationError.set('');
      })
    );
  }

  register(user: {username: string; email: string; password: string}): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/register`, user, this.options);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}, this.options).pipe(
      tap(() => this.currentUserSig.set(null))
    );
  }

  sessionExpired(): void {
    this.currentUserSig.set(null);
  }
}
