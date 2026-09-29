import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Deck} from '../model/deck';
import {Flashcard} from '../model/flashcard';
import {PaginatedResponse} from '../model/paginated-response';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/deck`;

  getAllDecks(page: number = 0, size: number = 5): Observable<PaginatedResponse<Deck>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));

    return this.httpClient.get<PaginatedResponse<Deck>>(this.baseUrl, {params});
  }

  createDeck(Deck: {name: string}): Observable<Deck> {
    return this.httpClient.post<Deck>(this.baseUrl, Deck);
  }

  renameDeck(id: number, name: string): Observable<Deck> {
    return this.httpClient.put<Deck>(`${this.baseUrl}/${id}`, {name});
  }

  deleteDeck(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateFlashCard(deckId: number, id: number, card: Pick<Flashcard, 'question' | 'answer'>): Observable<Flashcard> {
    return this.httpClient.put<Flashcard>(`${this.baseUrl}/${deckId}/flashcard/${id}`, card);
  }

  getDeck(deckId: number): Observable<Deck> {
    return this.httpClient.get<Deck>(this.baseUrl + `/${deckId}`);
  }

  createFlashCard(deckId: number, flashCard: Pick<Flashcard, 'question' | 'answer'>) {
    return this.httpClient.post<void>(`${this.baseUrl}/${deckId}/flashcard`, flashCard);
  }

  deleteFlashCard(deckId: number, flashCardId: number) {
    return this.httpClient.delete<void>(`${this.baseUrl}/${deckId}/flashcard/${flashCardId}`);
  }

}
