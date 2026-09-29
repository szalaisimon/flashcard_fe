import {Routes} from '@angular/router';
import {DeckListComponent} from './components/deck/deck';
import {Flashcard} from './components/flashcard/flashcard';
import {LoginComponent} from './components/auth/login/login.component';
import {RegisterComponent} from './components/auth/register/register.component';
import {HomeComponent} from './components/home/home.component';
import {AuthGuard} from './guards/auth-guard';
import {DeckAttemptComponent} from './components/deck-attempt/deck-attempt.component';
import {HistoryComponent} from './components/history/history.component';
import {DeckAttemptHistoryComponent} from './components/history/deck-attempt-history/deck-attempt-history.component';

import {NotFoundComponent} from './components/shared/not-found/not-found.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'deck', component: DeckListComponent, canActivate: [AuthGuard]},
  {path: 'deck/:id', component: Flashcard, canActivate: [AuthGuard]},
  {path: 'deckattempt/:id', component: DeckAttemptComponent, canActivate: [AuthGuard]},
  {path: 'history', component: HistoryComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'history/:id', component: DeckAttemptHistoryComponent, canActivate: [AuthGuard]},
  {path: '**', component: NotFoundComponent}
];
