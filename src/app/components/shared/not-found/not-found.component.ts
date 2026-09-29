import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `<section class="state-panel"><h1>Page not found</h1><p>This page does not exist.</p><a routerLink="/">Back to home</a></section>`
})
export class NotFoundComponent {}
