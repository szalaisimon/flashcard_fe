import {Deck} from './deck';
import {AttemptStatus} from './deck-attempt';

export interface DeckAttemptScore {
  deckAttemptId: number;
  deckDto: Deck;
  score: number;
  maxScore: number;
  incorrectCount: number;
  unansweredCount: number;
  attemptedAt: string;
  endedAt: string | null;
  status: AttemptStatus;
}
