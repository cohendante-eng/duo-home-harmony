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

  const markReminderSent =
    useCards(
      (s) => s.markReminderSent
    );

  const showToast =
    useCards(
      (s) => s.showToast
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

    const firstCard =
      eligibleCards[0];

    const key =
      `reminder:${firstCard.id}`;

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

    showToast(
      getReminderMessage(
        firstCard
      )
    );

    markReminderSent(
      firstCard.id
    );

    markSupabaseReminderSent({
      cardId: firstCard.id,
    }).catch((error) => {
      console.error(
        'Could not mark Supabase reminder as sent',
        error
      );

      processingRef.current.delete(
        key
      );
    });
  }, [
    activeCards,
    currentUser,
    showToast,
    markReminderSent,
  ]);
}