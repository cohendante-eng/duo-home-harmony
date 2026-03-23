export type CardType =
  | 'transport'
  | 'acquire'
  | 'pay'
  | 'appointment'
  | 'maintenance'
  | 'coordination';

export type CardState =
  | 'requested'
  | 'accepted'
  | 'done'
  | 'blocked'
  | 'delayed'
  | 'skipped';

export interface DuoCard {
  id: string;
  type: CardType;
  state: CardState;

  ownerId: string;
  creatorId: string;

  dueAt?: string | null;

  payload: Record<string, string>;

  createdAt: string;
  updatedAt: string;
}