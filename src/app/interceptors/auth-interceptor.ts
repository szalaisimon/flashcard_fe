import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, switchMap, throwError} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {environment} from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(`${environment.apiUrl}/api/`)) return next(request);
  const auth = inject(AuthService);
  const router = inject(Router);
  const authenticatedRequest = request.clone({withCredentials: true});
  const expire = () => {
    auth.sessionExpired();
    if (!router.url.startsWith('/login')) {
      void router.navigate(['/login'], {queryParams: {returnUrl: router.url, expired: 'true'}});
    }
  };
  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error);
      return auth.refreshSession().pipe(
        catchError((refreshError: HttpErrorResponse) => {
          if (refreshError.status === 401 || refreshError.status === 403) expire();
          return throwError(() => refreshError);
        }),
        switchMap(() => next(authenticatedRequest).pipe(
          catchError((retryError: HttpErrorResponse) => {
            if (retryError.status === 401) expire();
            return throwError(() => retryError);
          })
        ))
      );
    })
  );
};
