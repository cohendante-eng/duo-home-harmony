import {
  useEffect,
  useRef,
} from 'react';

import {
  useCards,
} from '../store/useCards';

import {
  getAcceptedReminderEligibleCards,
} from '../lib/duoViews';

import {
  getCardTitle,
} from '../lib/cards';

import {
  expireSupabaseCard,
  markSupabaseReminderSent,
} from '../lib/supabaseCards';

import {
  showBrowserNotification,
} from '../lib/browserNotifications';

const ONE_DAY =
  1000 * 60 * 60 * 24;

function getReminderMessage(card: any) {
  const title =
    getCardTitle(card);

  if (!title) {
    return 'Upcoming responsibility';
  }

  return `Upcoming: ${title}`;
}

function sendReminderForCard({
  card,
  processingRef,
}: {
  card: any;

  processingRef: React.MutableRefObject<
    Set<string>
  >;
}) {
  const key =
    `reminder:${card.id}`;

  if (
    processingRef.current.has(key)
  ) {
    return;
  }

  processingRef.current.add(key);

  const reminderMessage =
    getReminderMessage(card);

  const state =
    useCards.getState();

  state.showToast(
    reminderMessage,
    undefined,
    card.id
  );

  showBrowserNotification({
    title: 'Duo',

    body: reminderMessage,

    cardId: card.id,
  });

  state.markReminderSent(card.id);

  markSupabaseReminderSent({
    cardId: card.id,
  }).catch((error) => {
    console.error(
      'Could not mark Supabase reminder as sent',
      error
    );

    processingRef.current.delete(
      key
    );
  });
}

function checkReminderCards(
  processingRef: React.MutableRefObject<
    Set<string>
  >
) {
  const state =
    useCards.getState();

  const eligibleCards =
    getAcceptedReminderEligibleCards(
      state.activeCards,
      state.currentUser
    );

  if (
    eligibleCards.length === 0
  ) {
    return;
  }

  sendReminderForCard({
    card: eligibleCards[0],

    processingRef,
  });
}

export function useDuoLifecycle() {
  const processingRef =
    useRef<Set<string>>(
      new Set()
    );

  const activeCards =
    useCards((s) => s.activeCards);

  const currentUser =
    useCards((s) => s.currentUser);

  const expireOverdueRequestedCards =
    useCards(
      (s) =>
        s.expireOverdueRequestedCards
    );

  useEffect(() => {
    const now =
      Date.now();

    const expiredCards =
      activeCards.filter(
        (card) =>
          card.state ===
            'requested' &&
          typeof card.dueAt ===
            'number' &&
          card.dueAt + ONE_DAY <
            now
      );

    if (
      expiredCards.length === 0
    ) {
      return;
    }

    expiredCards.forEach(
      (card) => {
        const key =
          `expire:${card.id}`;

        if (
          processingRef.current.has(
            key
          )
        ) {
          return;
        }

        processingRef.current.add(
          key
        );

        expireSupabaseCard({
          cardId: card.id,
        })
          .then(() => {
            expireOverdueRequestedCards();
          })
          .catch((error) => {
            console.error(
              'Could not expire Supabase card',
              error
            );

            processingRef.current.delete(
              key
            );
          });
      }
    );
  }, [
    activeCards,
    expireOverdueRequestedCards,
  ]);

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        const now =
          Date.now();

        const expiredCards =
          useCards
            .getState()
            .activeCards.filter(
              (card) =>
                card.state ===
                  'requested' &&
                typeof card.dueAt ===
                  'number' &&
                card.dueAt + ONE_DAY <
                  now
            );

        expiredCards.forEach(
          (card) => {
            const key =
              `expire:${card.id}`;

            if (
              processingRef.current.has(
                key
              )
            ) {
              return;
            }

            processingRef.current.add(
              key
            );

            expireSupabaseCard({
              cardId: card.id,
            })
              .then(() => {
                useCards
                  .getState()
                  .expireOverdueRequestedCards();
              })
              .catch((error) => {
                console.error(
                  'Could not expire Supabase card during lifecycle interval',
                  error
                );

                processingRef.current.delete(
                  key
                );
              });
          }
        );

        checkReminderCards(
          processingRef
        );
      }, 1000 * 60);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  useEffect(() => {
    const eligibleCards =
      getAcceptedReminderEligibleCards(
        activeCards,
        currentUser
      );

    if (
      eligibleCards.length === 0
    ) {
      return;
    }

    sendReminderForCard({
      card: eligibleCards[0],

      processingRef,
    });
  }, [
    activeCards,
    currentUser,
  ]);
}