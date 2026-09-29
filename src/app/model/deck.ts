import {Flashcard} from './flashcard';

export interface Deck {
  id: number;
  name: string;
  cards: Flashcard[];
  numberOfCards: number;
  attempts: number;
  activeAttemptId: number | null;
}
