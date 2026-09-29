export interface FullCardAttempt {
  cardAttemptId: number;
  flashCardId: number;
  correct: boolean | null;
  question: string;
  answer: string;
  position: number;
}
