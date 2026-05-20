import { create } from 'zustand';

import { persist } from 'zustand/middleware';

import {
  DuoCard,
  UserId,
  TransportPayload,
  PayPayload,
} from '../types/card';

type ToastState = {
  visible: boolean;

  message: string;

  undoAction?: () => void;
};

type CardStore = {
  currentUser: UserId;

  activeCards: DuoCard[];
  historyCards: DuoCard[];

  toast: ToastState;

  showToast: (
    message: string,
    undoAction?: () => void
  ) => void;

  hideToast: () => void;

  createCard: (
    card: Omit<DuoCard, 'id' | 'state'>
  ) => void;

  acceptCard: (id: string) => void;

  completeCard: (id: string) => void;

  cancelCard: (id: string) => void;

  delayCard: (
    id: string,
    ms?: number
  ) => void;

  blockCard: (id: string) => void;

  stopCard: (id: string) => void;

  takeCard: (id: string) => void;

  markReminderSent: (
    id: string
  ) => void;

  expireOverdueRequestedCards: () => void;
};

const ONE_DAY =
  1000 * 60 * 60 * 24;

export const useCards =
  create<CardStore>()(
    persist(
      (set, get) => ({
        currentUser: 'me',

        activeCards: [],

        historyCards: [],

        toast: {
          visible: false,

          message: '',
        },

        showToast: (
          message,
          undoAction
        ) => {
          set({
            toast: {
              visible: true,

              message,

              undoAction,
            },
          });

          setTimeout(() => {
            get().hideToast();
          }, 4000);
        },

        hideToast: () =>
          set({
            toast: {
              visible: false,

              message: '',
            },
          }),

        createCard: (card) =>
          set((state) => {
            const id =
              Date.now().toString();

            if (
              card.type ===
              'transport'
            ) {
              return {
                activeCards: [
                  {
                    id,

                    type: 'transport',

                    state:
                      'requested',

                    ownerId:
                      card.ownerId,

                    creatorId:
                      card.creatorId,

                    dueAt:
                      card.dueAt,

                    reminderSentAt:
                      undefined,

                    blockCount: 0,

                    payload:
                      card.payload as TransportPayload,
                  },

                  ...state.activeCards,
                ],
              };
            }

            if (
              card.type ===
              'pay'
            ) {
              return {
                activeCards: [
                  {
                    id,

                    type: 'pay',

                    state:
                      'requested',

                    ownerId:
                      card.ownerId,

                    creatorId:
                      card.creatorId,

                    dueAt:
                      card.dueAt,

                    reminderSentAt:
                      undefined,

                    blockCount: 0,

                    payload:
                      card.payload as PayPayload,
                  },

                  ...state.activeCards,
                ],
              };
            }

            return {
              activeCards: [
                {
                  id,

                  ...card,

                  state:
                    'requested',

                  reminderSentAt:
                    undefined,

                  blockCount: 0,
                } as DuoCard,

                ...state.activeCards,
              ],
            };
          }),

        acceptCard: (id) =>
          set((state) => ({
            activeCards:
              state.activeCards.map(
                (c) =>
                  c.id === id
                    ? {
                        ...c,

                        state:
                          'accepted',

                        blockCount: 0,

                        modifier:
                          null,

                        modifierFor:
                          undefined,
                      }
                    : c
              ),
          })),

        completeCard: (id) =>
          set((state) => {
            const card =
              state.activeCards.find(
                (c) => c.id === id
              );

            if (!card) return state;

            return {
              activeCards:
                state.activeCards.filter(
                  (c) => c.id !== id
                ),

              historyCards: [
                {
                  ...card,

                  state: 'done',
                },

                ...state.historyCards,
              ],
            };
          }),

        cancelCard: (id) =>
          set((state) => {
            const card =
              state.activeCards.find(
                (c) => c.id === id
              );

            if (!card) return state;

            return {
              activeCards:
                state.activeCards.filter(
                  (c) => c.id !== id
                ),

              historyCards: [
                {
                  ...card,

                  state:
                    'cancelled',
                },

                ...state.historyCards,
              ],
            };
          }),

        delayCard: (id, ms) => {
          const currentCard =
            get().activeCards.find(
              (c) => c.id === id
            );

          if (!currentCard) {
            return;
          }

          const previousDueAt =
            currentCard.dueAt;

          const previousReminderSentAt =
            currentCard.reminderSentAt;

          const baseTime =
            typeof currentCard.dueAt ===
            'number'
              ? currentCard.dueAt
              : Date.now();

          const nextDueAt =
            typeof ms === 'number'
              ? baseTime + ms
              : baseTime;

          set((state) => ({
            activeCards:
              state.activeCards.map(
                (c) =>
                  c.id === id
                    ? {
                        ...c,

                        state:
                          'delayed',

                        dueAt:
                          nextDueAt,

                        reminderSentAt:
                          undefined,

                        modifier:
                          'updated',

                        modifierFor:
                          c.creatorId,
                      }
                    : c
              ),
          }));

          let label =
            'Rescheduled';

          if (
            ms ===
            1000 * 60 * 30
          ) {
            label =
              'Rescheduled +30m';
          }

          if (
            ms ===
            1000 * 60 * 60
          ) {
            label =
              'Rescheduled +1h';
          }

          if (
            ms ===
            1000 *
              60 *
              60 *
              3
          ) {
            label =
              'Rescheduled +3h';
          }

          get().showToast(
            label,

            () => {
              set((state) => ({
                activeCards:
                  state.activeCards.map(
                    (c) =>
                      c.id === id
                        ? {
                            ...c,

                            dueAt:
                              previousDueAt,

                            reminderSentAt:
                              previousReminderSentAt,

                            state:
                              'accepted',
                          }
                        : c
                  ),
              }));

              get().hideToast();
            }
          );
        },

        blockCard: (id) =>
          set((state) => ({
            activeCards:
              state.activeCards.map(
                (c) => {
                  if (c.id !== id) {
                    return c;
                  }

                  const currentCount =
                    typeof c.blockCount ===
                    'number'
                      ? c.blockCount
                      : 0;

                  const nextCount =
                    currentCount + 1;

                  const newOwner: UserId =
                    c.ownerId === 'me'
                      ? 'partner'
                      : 'me';

                  return {
                    ...c,

                    ownerId:
                      newOwner,

                    state:
                      'requested',

                    dueAt:
                      undefined,

                    reminderSentAt:
                      undefined,

                    blockCount:
                      nextCount,

                    modifier:
                      nextCount >= 2
                        ? 'updated'
                        : 'returned',

                    modifierFor:
                      newOwner,
                  };
                }
              ),
          })),

        stopCard: (id) =>
          set((state) => {
            const card =
              state.activeCards.find(
                (c) => c.id === id
              );

            if (!card) return state;

            return {
              activeCards:
                state.activeCards.filter(
                  (c) => c.id !== id
                ),

              historyCards: [
                {
                  ...card,

                  state:
                    'stopped',
                } as DuoCard,

                ...state.historyCards,
              ],
            };
          }),

        takeCard: (id) =>
          set((state) => ({
            activeCards:
              state.activeCards.map(
                (c) => {
                  if (c.id !== id) {
                    return c;
                  }

                  return {
                    ...c,

                    ownerId:
                      state.currentUser,

                    state:
                      'accepted',

                    blockCount: 0,

                    reminderSentAt:
                      undefined,

                    modifier:
                      null,

                    modifierFor:
                      undefined,
                  };
                }
              ),
          })),

        markReminderSent: (id) =>
          set((state) => ({
            activeCards:
              state.activeCards.map(
                (c) =>
                  c.id === id
                    ? {
                        ...c,

                        reminderSentAt:
                          Date.now(),
                      }
                    : c
              ),
          })),

        expireOverdueRequestedCards: () =>
          set((state) => {
            const now =
              Date.now();

            const expiredCards =
              state.activeCards.filter(
                (card) =>
                  card.state ===
                    'requested' &&
                  typeof card.dueAt ===
                    'number' &&
                  card.dueAt + ONE_DAY <
                    now
              );

            if (
              expiredCards.length ===
              0
            ) {
              return state;
            }

            const expiredIds =
              new Set(
                expiredCards.map(
                  (card) => card.id
                )
              );

            return {
              activeCards:
                state.activeCards.filter(
                  (card) =>
                    !expiredIds.has(
                      card.id
                    )
                ),

              historyCards: [
                ...expiredCards.map(
                  (card) =>
                    ({
                      ...card,

                      state:
                        'expired',
                    } as DuoCard)
                ),

                ...state.historyCards,
              ],
            };
          }),
      }),

      {
        name: 'duo-cards-storage',

        partialize: (state) => ({
          activeCards:
            state.activeCards,

          historyCards:
            state.historyCards,
        }),
      }
    )
  );