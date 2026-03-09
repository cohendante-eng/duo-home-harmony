export type CardType = 'transport' | 'acquire' | 'pay' | 'appointment' | 'maintenance' | 'coordination';

export type CardState = 'requested' | 'accepted' | 'done' | 'blocked' | 'delayed' | 'skipped';

export interface DuoCard {
  id: string;
  type: CardType;
  subject: string;
  context: string;
  time: string;
  state: CardState;
  owner: 'A' | 'B';
  fields: Record<string, string>;
  createdAt: number;
}

export const CARD_TYPE_META: Record<CardType, { label: string; icon: string }> = {
  transport: { label: 'Transport', icon: 'Car' },
  acquire: { label: 'Acquire', icon: 'ShoppingBag' },
  pay: { label: 'Pay', icon: 'CreditCard' },
  appointment: { label: 'Appointment', icon: 'Calendar' },
  maintenance: { label: 'Maintenance', icon: 'Wrench' },
  coordination: { label: 'Coordination', icon: 'ArrowLeftRight' },
};

export const CARD_TYPE_FIELDS: Record<CardType, string[]> = {
  transport: ['owner', 'person/item', 'from', 'to', 'time'],
  acquire: ['owner', 'item', 'store/source', 'quantity', 'time'],
  pay: ['owner', 'what', 'amount', 'to', 'time'],
  appointment: ['owner', 'who', 'where', 'time', 'duration'],
  maintenance: ['owner', 'what', 'location', 'urgency', 'time'],
  coordination: ['owner', 'topic', 'options', 'deadline', 'time'],
};
