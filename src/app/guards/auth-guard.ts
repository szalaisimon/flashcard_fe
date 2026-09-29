import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {AuthService} from '../services/auth.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.auth.initialize().pipe(map(username => username ? true
      : this.router.createUrlTree(['/login'], {queryParams: {returnUrl: state.url}})));
  }
}
