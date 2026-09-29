export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED';

export const attemptStatusLabel: Record<AttemptStatus, string> = {
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  ABORTED: 'Aborted'
};

export interface DeckAttempt {
  id: number;
  deckId: number;
  attemptedAt: string;
  endedAt: string | null;
  status: AttemptStatus;
}
