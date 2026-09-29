import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {catchError, finalize, Subscription, switchMap, throwError} from 'rxjs';
import {DeckAttemptService} from '../../services/deck-attempt.service';
import {FullDeckAttempt} from '../../model/full-deck-attempt';
import {attemptStatusLabel} from '../../model/deck-attempt';
import {ModalComponent} from '../shared/modal/modal.component';
import {errorMessage} from '../../utils/http-error';

@Component({
  selector: 'app-deck-attempt',
  imports: [DatePipe, RouterLink, ModalComponent],
  templateUrl: './deck-attempt.component.html',
  styleUrl: './deck-attempt.component.css'
})
export class DeckAttemptComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly deckAttemptService = inject(DeckAttemptService);
  private routeSubscription?: Subscription;
  private fetchSubscription?: Subscription;
  private operationSubscription?: Subscription;
  private attemptId = 0;
  readonly attempt = signal<FullDeckAttempt | null>(null);
  readonly currentFlashcard = computed(() => this.attempt()?.fullCardAttemptDtos.find(card => card.correct === null) ?? null);
  readonly isFlipped = signal(false);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly reloadRequired = signal(false);
  readonly showAbortDialog = signal(false);
  readonly statusLabel = attemptStatusLabel;

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.operationSubscription?.unsubscribe();
      this.attemptId = Number(params.get('id'));
      this.attempt.set(null);
      this.isFlipped.set(false);
      this.showAbortDialog.set(false);
      this.notice.set('');
      this.loadAttempt();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.fetchSubscription?.unsubscribe();
    this.operationSubscription?.unsubscribe();
  }

  loadAttempt(): void {
    if (this.busy()) return;
    this.fetchSubscription?.unsubscribe();
    this.loading.set(false);
    this.error.set('');
    if (!Number.isSafeInteger(this.attemptId) || this.attemptId < 1) {
      this.error.set('This practice is not available.');
      return;
    }
    this.loading.set(true);
    this.fetchSubscription = this.deckAttemptService.getFullDeckAttempt(this.attemptId)
      .pipe(finalize(() => this.loading.set(false))).subscribe({
        next: attempt => this.applyAttempt(attempt),
        error: error => this.error.set(errorMessage(error))
      });
  }

  flipCard(): void {
    if (!this.busy() && !this.loading() && !this.reloadRequired()) this.isFlipped.update(value => !value);
  }

  rateCard(correct: boolean): void {
    const card = this.currentFlashcard();
    if (!card || !this.isFlipped() || this.busy() || this.loading() || this.reloadRequired()
      || this.attempt()?.status !== 'IN_PROGRESS') return;
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    this.operationSubscription = this.deckAttemptService.createCardAttempt({flashCardId: card.flashCardId, correct}, this.attemptId).pipe(
      switchMap(() => {
        this.reloadRequired.set(true);
        return this.deckAttemptService.getFullDeckAttempt(this.attemptId);
      }),
      catchError(error => {
        if (error.status !== 409) return throwError(() => error);
        this.reloadRequired.set(true);
        this.notice.set('This practice changed in another tab. Its saved ratings cannot be changed.');
        return this.deckAttemptService.getFullDeckAttempt(this.attemptId);
      }),
      finalize(() => this.busy.set(false))
    ).subscribe({
      next: attempt => this.applyAttempt(attempt),
      error: error => this.error.set(this.reloadRequired()
        ? `Progress could not be reloaded. Reload progress before continuing. ${errorMessage(error)}`
        : `The rating could not be confirmed. Try the rating again or reload progress. ${errorMessage(error)}`)
    });
  }

  openAbortDialog(): void {
    if (this.busy() || this.loading() || this.reloadRequired()) return;
    this.error.set('');
    this.showAbortDialog.set(true);
  }

  closeAbortDialog(): void { if (!this.busy()) this.showAbortDialog.set(false); }

  abortAttempt(): void {
    if (this.busy() || this.attempt()?.status !== 'IN_PROGRESS') return;
    this.busy.set(true);
    this.error.set('');
    this.operationSubscription = this.deckAttemptService.abortDeckAttempt(this.attemptId).pipe(
      catchError(error => {
        if (error.status !== 409) return throwError(() => error);
        this.reloadRequired.set(true);
        this.notice.set('This practice changed in another tab. Its saved ratings cannot be changed.');
        return this.deckAttemptService.getFullDeckAttempt(this.attemptId);
      }),
      finalize(() => this.busy.set(false))
    ).subscribe({
      next: attempt => { this.applyAttempt(attempt); this.showAbortDialog.set(false); },
      error: error => this.error.set(errorMessage(error))
    });
  }

  private applyAttempt(attempt: FullDeckAttempt): void {
    this.attempt.set({...attempt, fullCardAttemptDtos: [...attempt.fullCardAttemptDtos].sort((a, b) => a.position - b.position)});
    this.isFlipped.set(false);
    this.reloadRequired.set(false);
  }
}
