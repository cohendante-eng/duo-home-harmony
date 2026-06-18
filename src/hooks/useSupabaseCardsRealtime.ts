import {
    useCallback,
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
  
    const reloadCards =
      useCallback(async () => {
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
      }, [
        user,
        partner?.connectionId,
        partner?.id,
      ]);
  
    useEffect(() => {
      if (
        !user ||
        !partner?.connectionId ||
        !partner?.id
      ) {
        return;
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
      reloadCards,
    ]);
  
    useEffect(() => {
      if (
        !user ||
        !partner?.connectionId ||
        !partner?.id
      ) {
        return;
      }
  
      const interval =
        window.setInterval(() => {
          reloadCards().catch(
            (error) => {
              console.error(
                'Could not reload cards during backup refresh',
                error
              );
            }
          );
        }, 1000 * 10);
  
      return () => {
        window.clearInterval(
          interval
        );
      };
    }, [
      user,
      partner?.connectionId,
      partner?.id,
      reloadCards,
    ]);
  }