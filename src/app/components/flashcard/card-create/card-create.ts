import {Component, inject, input, OnInit, output, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {DeckService} from '../../../services/deck';
import {Flashcard} from '../../../model/flashcard';
import {finalize, Observable} from 'rxjs';
import {nonBlank} from '../../../utils/validators';
import {errorMessage} from '../../../utils/http-error';

@Component({selector: 'app-card-create', imports: [ReactiveFormsModule], templateUrl: './card-create.html', styleUrl: './card-create.css'})
export class CardCreate implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly deckService = inject(DeckService);
  readonly busy = signal(false);
  readonly error = signal('');
  deckId = input.required<number>();
  card = input<Flashcard | null>(null);
  visibleChange = output<boolean>();
  created = output<void>();
  readonly createNewForm = this.fb.nonNullable.group({
    question: ['', [nonBlank, Validators.maxLength(1000)]],
    answer: ['', [nonBlank, Validators.maxLength(1000)]]
  });

  ngOnInit(): void {
    const card = this.card();
    if (card) this.createNewForm.reset({question: card.question, answer: card.answer});
  }

  onSubmit(): void {
    if (this.busy()) return;
    this.createNewForm.markAllAsTouched();
    if (this.createNewForm.invalid) return;
    this.busy.set(true);
    this.error.set('');
    const value = this.createNewForm.getRawValue();
    const card = this.card();
    const request: Observable<unknown> | null = card ? this.deckService.updateFlashCard(this.deckId(), card.id, value)
      : this.deckService.createFlashCard(this.deckId(), value);
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => { this.created.emit(); this.visibleChange.emit(false); },
      error: error => this.error.set(errorMessage(error))
    });
  }

  onCancel(): void { if (!this.busy()) this.visibleChange.emit(false); }

  isInvalid(name: string): boolean {
    const control = this.createNewForm.get(name);
    return !!control?.invalid && (control.touched || control.dirty);
  }
}
