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
    convertSupabaseCardsToDuoCards,
    getSupabaseCards,
  } from '../lib/supabaseCards';
  
  export function useSupabaseCardsSync() {
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
  
      getSupabaseCards({
        partnerConnectionId:
          partner.connectionId,
      })
        .then((rows) => {
          const cards =
            convertSupabaseCardsToDuoCards({
              rows,
  
              currentUserId:
                user.id,
  
              partnerUserId:
                partner.id,
            });
  
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
  
          useCards.setState({
            activeCards,
  
            historyCards,
          });
        })
        .catch((error) => {
          console.error(
            'Could not sync Supabase cards',
            error
          );
        });
    }, [
      user,
      partner?.connectionId,
      partner?.id,
    ]);
  }