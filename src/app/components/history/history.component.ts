import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {DatePipe, NgClass} from '@angular/common';
import {RouterLink} from '@angular/router';
import {Subscription} from 'rxjs';
import {DeckAttemptService} from '../../services/deck-attempt.service';
import {DeckAttemptScore} from '../../model/deck-attempt-score';
import {attemptStatusLabel} from '../../model/deck-attempt';
import {PaginationComponent} from '../shared/pagination/pagination.component';
import {errorMessage} from '../../utils/http-error';

@Component({
  selector: 'app-history',
  imports: [PaginationComponent, DatePipe, NgClass, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit, OnDestroy {
  private readonly deckAttemptService = inject(DeckAttemptService);
  private fetchSubscription?: Subscription;
  readonly history = signal<DeckAttemptScore[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly statusLabel = attemptStatusLabel;
  totalItems = 0;
  totalPages = 0;
  currentPage = 0;
  limit = 4;

  ngOnInit(): void { this.fetchHistory(0); }
  ngOnDestroy(): void { this.fetchSubscription?.unsubscribe(); }

  fetchHistory(page: number): void {
    this.fetchSubscription?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.fetchSubscription = this.deckAttemptService.getDeckAttemptScores(page, this.limit).subscribe({
      next: response => {
        const lastPage = Math.max(response.totalPages - 1, 0);
        if (page > lastPage) { this.fetchHistory(lastPage); return; }
        this.history.set(response.data);
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
        this.loading.set(false);
      },
      error: error => { this.error.set(errorMessage(error)); this.loading.set(false); }
    });
  }

  onPageChange(page: number): void { this.fetchHistory(page); }
  onLimitChange(limit: number): void { this.limit = limit; this.fetchHistory(0); }

  getRowClass(attempt: DeckAttemptScore): string {
    if (attempt.status !== 'COMPLETED') return '';
    const percent = attempt.maxScore ? attempt.score / attempt.maxScore * 100 : 0;
    return percent < 50 ? 'low-score' : percent < 90 ? 'medium-score' : 'high-score';
  }
}
