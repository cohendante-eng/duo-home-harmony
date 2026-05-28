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
    getLatestIncomingPartnerInvitation,
    getLatestOutgoingPartnerInvitation,
  } from '../lib/partnerInvitations';
  
  export function usePartnerSync() {
    const {
      user,
      email,
    } = useAuth();
  
    const status =
      usePartner(
        (s) => s.status
      );
  
    const setPendingInvite =
      usePartner(
        (s) => s.setPendingInvite
      );
  
    const cancelInvite =
      usePartner(
        (s) => s.cancelInvite
      );
  
    useEffect(() => {
      if (!user || !email) {
        return;
      }
  
      if (status === 'connected') {
        return;
      }
  
      async function syncPartnerInvite() {
        const incoming =
          await getLatestIncomingPartnerInvitation({
            email,
          });
  
        if (incoming) {
          setPendingInvite({
            id: incoming.id,
  
            direction:
              incoming.direction,
  
            inviterId:
              incoming.inviterId,
  
            email: incoming.email,
  
            createdAt:
              incoming.createdAt,
          });
  
          return;
        }
  
        const outgoing =
          await getLatestOutgoingPartnerInvitation({
            userId: user.id,
          });
  
        if (outgoing) {
          setPendingInvite({
            id: outgoing.id,
  
            direction:
              outgoing.direction,
  
            inviterId:
              outgoing.inviterId,
  
            email: outgoing.email,
  
            createdAt:
              outgoing.createdAt,
          });
  
          return;
        }
  
        if (status === 'pending') {
          cancelInvite();
        }
      }
  
      syncPartnerInvite().catch(() => {
        // Keep app quiet for now.
        // We will add visible error handling later if needed.
      });
    }, [
      user,
      email,
      status,
      setPendingInvite,
      cancelInvite,
    ]);
  }