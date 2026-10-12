import {
  useEffect,
  useRef,
} from 'react';

import {
  useCards,
} from '../store/useCards';

import {
  expireSupabaseCard,
} from '../lib/supabaseCards';

const ONE_DAY =
  1000 * 60 * 60 * 24;

export function useDuoLifecycle() {
  const processingRef =
    useRef<Set<string>>(
      new Set()
    );

  const activeCards =
    useCards((s) => s.activeCards);

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
      }, 1000 * 60);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);
}
