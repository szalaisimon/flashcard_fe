import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DeckAttempt} from '../model/deck-attempt';
import {CardAttempt} from '../model/card-attempt';
import {DeckAttemptScore} from '../model/deck-attempt-score';
import {PaginatedResponse} from '../model/paginated-response';
import {FullDeckAttempt} from '../model/full-deck-attempt';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeckAttemptService {

  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/deckattempt`;

  getDeckAttempt(id: number) {
    return this.httpClient.get<DeckAttempt>(`${this.baseUrl}/${id}`);
  }

  getFullDeckAttempt(id: number) {
    return this.httpClient.get<FullDeckAttempt>(`${this.baseUrl}/${id}/full`);
  }

  createDeckAttempt(deckAttempt: {deckId: number}): Observable<DeckAttempt> {
    return this.httpClient.post<DeckAttempt>(this.baseUrl, deckAttempt);
  }

  createCardAttempt(cardAttempt: Pick<CardAttempt, 'flashCardId' | 'correct'>, id: number): Observable<CardAttempt> {
    return this.httpClient.post<CardAttempt>(`${this.baseUrl}/${id}/cardattempt`, cardAttempt);
  }

  abortDeckAttempt(id: number): Observable<FullDeckAttempt> {
    return this.httpClient.post<FullDeckAttempt>(`${this.baseUrl}/${id}/abort`, {});
  }

  getDeckAttemptScore(id: number): Observable<DeckAttemptScore> {
    return this.httpClient.get<DeckAttemptScore>(`${this.baseUrl}/${id}/score`);
  }

  getDeckAttemptScores(page: number = 0, size: number = 5): Observable<PaginatedResponse<DeckAttemptScore>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));

    return this.httpClient.get<PaginatedResponse<DeckAttemptScore>>(`${this.baseUrl}/history`, {params});
  }
}
