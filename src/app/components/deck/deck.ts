import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {Deck} from '../../model/deck';
import {DeckService} from '../../services/deck';
import {Router, RouterLink} from '@angular/router';
import {DeckAttemptService} from '../../services/deck-attempt.service';
import {PaginationComponent} from '../shared/pagination/pagination.component';
import {ModalComponent} from '../shared/modal/modal.component';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {finalize, Observable, Subscription} from 'rxjs';
import {errorMessage} from '../../utils/http-error';
import {nonBlank} from '../../utils/validators';

@Component({selector: 'app-deck', imports: [PaginationComponent, ReactiveFormsModule, ModalComponent, RouterLink], templateUrl: 'deck.html', styleUrl: 'deck.css'})
export class DeckListComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly deckService = inject(DeckService);
  private readonly attemptService = inject(DeckAttemptService);
  private readonly router = inject(Router);
  private fetchSubscription?: Subscription;
  readonly decks = signal<Deck[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly actionError = signal('');
  readonly busy = signal(false);
  readonly modal = signal<'create' | 'rename' | 'delete' | 'abort' | null>(null);
  readonly selectedDeck = signal<Deck | null>(null);
  totalItems = 0;
  totalPages = 0;
  currentPage = 0;
  limit = 8;
  readonly createDeckForm = this.fb.nonNullable.group({name: ['', [nonBlank, Validators.maxLength(100)]]});

  ngOnInit(): void { this.fetchDecks(0); }
  ngOnDestroy(): void { this.fetchSubscription?.unsubscribe(); }

  fetchDecks(page: number): void {
    this.fetchSubscription?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.fetchSubscription = this.deckService.getAllDecks(page, this.limit).subscribe({
      next: response => {
        const lastPage = Math.max(response.totalPages - 1, 0);
        if (page > lastPage) { this.fetchDecks(lastPage); return; }
        this.decks.set(response.data);
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
        this.loading.set(false);
      },
      error: error => { this.error.set(errorMessage(error)); this.loading.set(false); }
    });
  }

  onPageChange(page: number): void { this.fetchDecks(page); }
  onLimitChange(limit: number): void { this.limit = limit; this.fetchDecks(0); }

  openModal(action: 'create' | 'rename' | 'delete' | 'abort', deck: Deck | null = null): void {
    if (this.busy()) return;
    this.selectedDeck.set(deck);
    this.createDeckForm.reset({name: action === 'rename' ? deck!.name : ''});
    this.actionError.set('');
    this.modal.set(action);
  }

  closeModal(): void { if (!this.busy()) this.modal.set(null); }

  submitModal(): void {
    if (this.busy()) return;
    const action = this.modal();
    const deck = this.selectedDeck();
    if (action === 'create' || action === 'rename') {
      this.createDeckForm.markAllAsTouched();
      if (this.createDeckForm.invalid) return;
    }
    const name = this.createDeckForm.getRawValue().name.trim();
    const request: Observable<unknown> | null = action === 'create' ? this.deckService.createDeck({name})
      : action === 'rename' && deck ? this.deckService.renameDeck(deck.id, name)
      : action === 'delete' && deck ? this.deckService.deleteDeck(deck.id)
      : action === 'abort' && deck?.activeAttemptId ? this.attemptService.abortDeckAttempt(deck.activeAttemptId)
      : null;
    if (!request) return;
    this.busy.set(true);
    this.actionError.set('');
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => { this.modal.set(null); this.fetchDecks(action === 'create' ? 0 : this.currentPage); },
      error: error => this.actionError.set(errorMessage(error))
    });
  }

  startAttempt(deck: Deck): void {
    if (this.busy()) return;
    if (deck.activeAttemptId) { void this.router.navigate(['/deckattempt', deck.activeAttemptId]); return; }
    this.busy.set(true);
    this.actionError.set('');
    this.attemptService.createDeckAttempt({deckId: deck.id}).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: attempt => void this.router.navigate(['/deckattempt', attempt.id]),
      error: error => { this.actionError.set(errorMessage(error)); if (error.status === 409 || error.status === 404) this.fetchDecks(this.currentPage); }
    });
  }
}
