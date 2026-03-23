import { useState, useCallback } from 'react';
import { DuoCard, CardState } from '../types/card';

const MOCK_CARDS: DuoCard[] = [
  {
    id: '1',
    type: 'transport',
    state: 'requested',
    ownerId: 'user-a',
    creatorId: 'user-b',
    dueAt: '2026-03-24T17:30:00',
    payload: {
      item: 'Dry cleaning',
      from: 'Main St Cleaners',
      to: 'Home',
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    type: 'acquire',
    state: 'accepted',
    ownerId: 'user-b',
    creatorId: 'user-a',
    dueAt: '2026-03-24T16:00:00',
    payload: {
      item: 'Groceries',
      source: 'Whole Foods',
      quantity: '6 items',
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    type: 'pay',
    state: 'requested',
    ownerId: 'user-a',
    creatorId: 'user-b',
    dueAt: '2026-03-12T12:00:00',
    payload: {
      what: 'Electricity',
      amount: '$142.00',
      to: 'ConEd',
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4',
    type: 'appointment',
    state: 'accepted',
    ownerId: 'user-b',
    creatorId: 'user-a',
    dueAt: '2026-03-27T10:00:00',
    payload: {
      with: 'Dr. Park',
      person: 'Luna',
      location: 'Downtown Vet',
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '5',
    type: 'maintenance',
    state: 'blocked',
    ownerId: 'user-a',
    creatorId: 'user-b',
    dueAt: '2026-03-28T12:00:00',
    payload: {
      what: 'Kitchen faucet',
      detail: 'Leaking since Tuesday',
      location: 'Kitchen',
      urgency: 'Medium',
    },
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
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
    .sort(
      (a, b) =>
        STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state] ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const addCard = useCallback((card: DuoCard) => {
    setCards((prev) => [card, ...prev]);
  }, []);

  const updateState = useCallback((id: string, state: CardState) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, state } : c)));
  }, []);

  return { cards: sortedCards, addCard, updateState };
}
