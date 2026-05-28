import {
    useEffect,
  } from 'react';
  
  import {
    usePartner,
  } from '../store/usePartner';
  
  import {
    getSupabaseCards,
  } from '../lib/supabaseCards';
  
  export function useSupabaseCardsDebug() {
    const partner =
      usePartner(
        (s) => s.partner
      );
  
    useEffect(() => {
      if (!partner?.connectionId) {
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
        })
        .catch((error) => {
          console.error(
            'Could not load Supabase cards',
            error
          );
        });
    }, [
      partner?.connectionId,
    ]);
  }