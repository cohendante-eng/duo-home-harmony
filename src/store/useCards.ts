import { useState, useCallback } from 'react';
import { DuoCard, CardState } from '@/types/card';

const MOCK_CARDS: DuoCard[] = [
  {
    id: '1',
    type: 'transport',
    subject: 'Pick up dry cleaning',
    context: 'Main St Cleaners → Home',
    time: 'Today, 5:30 PM',
    state: 'requested',
    owner: 'A',
    fields: { 'person/item': 'Dry cleaning', from: 'Main St Cleaners', to: 'Home' },
    createdAt: Date.now() - 3600000,
  },
  {
    id: '2',
    type: 'acquire',
    subject: 'Groceries for dinner',
    context: 'Whole Foods · 6 items',
    time: 'Today, 4:00 PM',
    state: 'accepted',
    owner: 'B',
    fields: { item: 'Groceries', 'store/source': 'Whole Foods', quantity: '6 items' },
    createdAt: Date.now() - 7200000,
  },
  {
    id: '3',
    type: 'pay',
    subject: 'Electricity bill',
    context: '$142.00 · ConEd',
    time: 'Mar 12',
    state: 'requested',
    owner: 'A',
    fields: { what: 'Electricity', amount: '$142.00', to: 'ConEd' },
    createdAt: Date.now() - 86400000,
  },
  {
    id: '4',
    type: 'appointment',
    subject: 'Vet appointment',
    context: 'Dr. Park · Downtown Vet',
    time: 'Thu, 10:00 AM',
    state: 'accepted',
    owner: 'B',
    fields: { who: 'Luna', where: 'Downtown Vet' },
    createdAt: Date.now() - 172800000,
  },
  {
    id: '5',
    type: 'maintenance',
    subject: 'Fix kitchen faucet',
    context: 'Leaking since Tuesday',
    time: 'This week',
    state: 'blocked',
    owner: 'A',
    fields: { what: 'Kitchen faucet', location: 'Kitchen', urgency: 'Medium' },
    createdAt: Date.now() - 259200000,
  },
];

const STATE_PRIORITY: Record<CardState, number> = {
  requested: 0,
  blocked: 1,
  accepted: 2,
  delayed: 3,
  skipped: 4,
  done: 5,
};

export function useCards() {
  const [cards, setCards] = useState<DuoCard[]>(MOCK_CARDS);

  const sortedCards = [...cards]
    .filter((c) => c.state !== 'done' && c.state !== 'skipped')
    .sort((a, b) => STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state] || b.createdAt - a.createdAt);

  const addCard = useCallback((card: DuoCard) => {
    setCards((prev) => [card, ...prev]);
  }, []);

  const updateState = useCallback((id: string, state: CardState) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, state } : c)));
  }, []);

  return { cards: sortedCards, addCard, updateState };
}
