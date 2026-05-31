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
    convertSupabaseCardsToDuoCards,
    getSupabaseCards,
  } from '../lib/supabaseCards';
  
  export function useSupabaseCardsDebug() {
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
        .then((cards) => {
          console.log(
            'Supabase cards:',
            cards
          );
  
          const convertedCards =
            convertSupabaseCardsToDuoCards({
              rows: cards,
  
              currentUserId:
                user.id,
  
              partnerUserId:
                partner.id,
            });
  
          console.log(
            'Converted Duo cards:',
            convertedCards
          );
        })
        .catch((error) => {
          console.error(
            'Could not load Supabase cards',
            error
          );
        });
    }, [
      user,
      partner?.connectionId,
      partner?.id,
    ]);
  }