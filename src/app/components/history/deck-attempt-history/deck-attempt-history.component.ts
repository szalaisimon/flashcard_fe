import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {finalize, Subscription} from 'rxjs';
import {DeckAttemptService} from '../../../services/deck-attempt.service';
import {FullDeckAttempt} from '../../../model/full-deck-attempt';
import {attemptStatusLabel} from '../../../model/deck-attempt';
import {errorMessage} from '../../../utils/http-error';

@Component({
  selector: 'app-deck-attempt-history',
  imports: [DatePipe, RouterLink],
  templateUrl: './deck-attempt-history.component.html',
  styleUrl: './deck-attempt-history.component.css'
})
export class DeckAttemptHistoryComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly deckAttemptService = inject(DeckAttemptService);
  private routeSubscription?: Subscription;
  private fetchSubscription?: Subscription;
  private attemptId = 0;
  readonly fullDeckAttempt = signal<FullDeckAttempt | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly statusLabel = attemptStatusLabel;

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.attemptId = Number(params.get('id'));
      this.fullDeckAttempt.set(null);
      this.loadHistory();
    });
  }
  ngOnDestroy(): void { this.routeSubscription?.unsubscribe(); this.fetchSubscription?.unsubscribe(); }

  loadHistory(): void {
    this.fetchSubscription?.unsubscribe();
    this.loading.set(false);
    this.error.set('');
    if (!Number.isSafeInteger(this.attemptId) || this.attemptId < 1) { this.error.set('This practice is not available.'); return; }
    this.loading.set(true);
    this.fetchSubscription = this.deckAttemptService.getFullDeckAttempt(this.attemptId)
      .pipe(finalize(() => this.loading.set(false))).subscribe({
        next: attempt => this.fullDeckAttempt.set({...attempt, fullCardAttemptDtos: [...attempt.fullCardAttemptDtos].sort((a, b) => a.position - b.position)}),
        error: error => this.error.set(errorMessage(error))
      });
  }
}
