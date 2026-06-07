import {
    useEffect,
  } from 'react';
  
  import {
    useAuth,
  } from './useAuth';
  
  import {
    usePartner,
  } from '../store/usePartner';
  
  import {
    useCards,
  } from '../store/useCards';
  
  import {
    supabase,
  } from '../lib/supabase';
  
  import {
    convertSupabaseCardsToDuoCards,
    getSupabaseCards,
  } from '../lib/supabaseCards';
  
  function splitCards(cards: ReturnType<
    typeof convertSupabaseCardsToDuoCards
  >) {
    const activeCards =
      cards.filter(
        (card) =>
          card.state === 'requested' ||
          card.state === 'accepted' ||
          card.state === 'delayed'
      );
  
    const historyCards =
      cards.filter(
        (card) =>
          card.state === 'done' ||
          card.state === 'cancelled' ||
          card.state === 'stopped' ||
          card.state === 'expired'
      );
  
    return {
      activeCards,
  
      historyCards,
    };
  }
  
  export function useSupabaseCardsRealtime() {
    const {
      user,
    } = useAuth();
  
    const partner =
      usePartner(
        (s) => s.partner
      );
  
    useEffect(() => {
      if (
        !user ||
        !partner?.connectionId ||
        !partner?.id
      ) {
        return;
      }
  
      async function reloadCards() {
        if (
          !user ||
          !partner?.connectionId ||
          !partner?.id
        ) {
          return;
        }
  
        const rows =
          await getSupabaseCards({
            partnerConnectionId:
              partner.connectionId,
          });
  
        const cards =
          convertSupabaseCardsToDuoCards({
            rows,
  
            currentUserId:
              user.id,
  
            partnerUserId:
              partner.id,
          });
  
        const {
          activeCards,
          historyCards,
        } = splitCards(cards);
  
        useCards.setState({
          activeCards,
  
          historyCards,
        });
      }
  
      const channel =
        supabase
          .channel(
            `cards:${partner.connectionId}`
          )
          .on(
            'postgres_changes',
            {
              event: '*',
  
              schema: 'public',
  
              table: 'cards',
  
              filter: `partner_connection_id=eq.${partner.connectionId}`,
            },
            () => {
              reloadCards().catch(
                (error) => {
                  console.error(
                    'Could not reload cards after realtime change',
                    error
                  );
                }
              );
            }
          )
          .subscribe();
  
      return () => {
        supabase.removeChannel(
          channel
        );
      };
    }, [
      user,
      partner?.connectionId,
      partner?.id,
    ]);
  }