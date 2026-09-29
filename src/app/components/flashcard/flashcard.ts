import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {Deck} from '../../model/deck';
import {Flashcard as Card} from '../../model/flashcard';
import {DeckService} from '../../services/deck';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {CardCreate} from './card-create/card-create';
import {DeckAttemptService} from '../../services/deck-attempt.service';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ModalComponent} from '../shared/modal/modal.component';
import {finalize, Observable, Subscription} from 'rxjs';
import {nonBlank} from '../../utils/validators';
import {errorMessage} from '../../utils/http-error';

@Component({selector: 'app-flashcard', imports: [CardCreate, RouterLink, ReactiveFormsModule, ModalComponent], templateUrl: './flashcard.html', styleUrls: ['./flashcard.css']})
export class Flashcard implements OnInit, OnDestroy {
  private readonly deckService = inject(DeckService);
  private readonly attemptService = inject(DeckAttemptService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private routeSubscription?: Subscription;
  private fetchSubscription?: Subscription;
  private deckId = 0;
  readonly deck = signal<Deck | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly actionError = signal('');
  readonly busy = signal(false);
  readonly formVisible = signal(false);
  readonly editingCard = signal<Card | null>(null);
  readonly deletingCard = signal<Card | null>(null);
  readonly modal = signal<'rename' | 'deleteDeck' | 'deleteCard' | 'abort' | null>(null);
  readonly renameForm = this.fb.nonNullable.group({name: ['', [nonBlank, Validators.maxLength(100)]]});

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.deckId = Number(params.get('id'));
      this.deck.set(null);
      this.formVisible.set(false);
      this.editingCard.set(null);
      this.modal.set(null);
      this.loadDeck();
    });
  }
  ngOnDestroy(): void { this.routeSubscription?.unsubscribe(); this.fetchSubscription?.unsubscribe(); }

  loadDeck(): void {
    this.fetchSubscription?.unsubscribe();
    this.loading.set(false);
    if (!Number.isSafeInteger(this.deckId) || this.deckId < 1) { this.error.set('This deck is not available.'); return; }
    this.loading.set(true);
    this.error.set('');
    this.fetchSubscription = this.deckService.getDeck(this.deckId).subscribe({
      next: deck => { this.deck.set(deck); this.loading.set(false); },
      error: error => { this.error.set(errorMessage(error)); this.loading.set(false); }
    });
  }

  editCard(card: Card): void { this.formVisible.set(false); this.editingCard.set(card); }
  createCard(): void { this.editingCard.set(null); this.formVisible.set(true); }
  onCardSaved(): void { this.editingCard.set(null); this.formVisible.set(false); this.loadDeck(); }

  openModal(action: 'rename' | 'deleteDeck' | 'deleteCard' | 'abort', card: Card | null = null): void {
    if (this.busy()) return;
    this.renameForm.reset({name: this.deck()?.name ?? ''});
    this.deletingCard.set(card);
    this.actionError.set('');
    this.modal.set(action);
  }
  closeModal(): void { if (!this.busy()) this.modal.set(null); }

  submitModal(): void {
    if (this.busy()) return;
    const deck = this.deck();
    if (!deck) return;
    const action = this.modal();
    if (action === 'rename') {
      this.renameForm.markAllAsTouched();
      if (this.renameForm.invalid) return;
    }
    const card = this.deletingCard();
    const request: Observable<unknown> | null = action === 'rename' ? this.deckService.renameDeck(deck.id, this.renameForm.getRawValue().name.trim())
      : action === 'deleteDeck' ? this.deckService.deleteDeck(deck.id)
      : action === 'deleteCard' && card ? this.deckService.deleteFlashCard(deck.id, card.id)
      : action === 'abort' && deck.activeAttemptId ? this.attemptService.abortDeckAttempt(deck.activeAttemptId)
      : null;
    if (!request) return;
    this.busy.set(true);
    this.actionError.set('');
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => {
        this.modal.set(null);
        if (action === 'deleteDeck') void this.router.navigate(['/deck']);
        else this.loadDeck();
      },
      error: error => this.actionError.set(errorMessage(error))
    });
  }

  startAttempt(): void {
    const deck = this.deck();
    if (!deck || this.busy()) return;
    if (deck.activeAttemptId) { void this.router.navigate(['/deckattempt', deck.activeAttemptId]); return; }
    this.busy.set(true);
    this.actionError.set('');
    this.attemptService.createDeckAttempt({deckId: deck.id}).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: attempt => void this.router.navigate(['/deckattempt', attempt.id]),
      error: error => { this.actionError.set(errorMessage(error)); if (error.status === 409 || error.status === 404) this.loadDeck(); }
    });
  }
}
