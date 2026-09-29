import {Component, signal} from '@angular/core';
import {NavbarElement} from '../../../model/shared/navbarElement';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  readonly navbarElements = signal<NavbarElement[]>([
    {title: 'Home', route: '/'},
    {title: 'Decks', route: '/deck'},
    {title: 'History', route: '/history'},
  ]);

  constructor(private readonly router: Router) {
  }

  isActive(route: string | undefined): boolean {
    return this.router.url === route;
  }
}
