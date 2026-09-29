import {FullCardAttempt} from './full-card-attempt';
import {Deck} from './deck';
import {AttemptStatus} from './deck-attempt';

export interface FullDeckAttempt {
  deckAttemptId: number;
  deck: Deck;
  attemptedAt: string;
  endedAt: string | null;
  status: AttemptStatus;
  score: number;
  maxScore: number;
  incorrectCount: number;
  unansweredCount: number;
  fullCardAttemptDtos: FullCardAttempt[];
}
