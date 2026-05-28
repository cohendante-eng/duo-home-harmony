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
    getLatestPendingPartnerInvitation,
  } from '../lib/partnerInvitations';
  
  export function usePartnerSync() {
    const {
      user,
    } = useAuth();
  
    const status =
      usePartner(
        (s) => s.status
      );
  
    const setPendingInvite =
      usePartner(
        (s) => s.setPendingInvite
      );
  
    useEffect(() => {
      if (!user) {
        return;
      }
  
      if (status === 'connected') {
        return;
      }
  
      getLatestPendingPartnerInvitation({
        userId: user.id,
      })
        .then((invite) => {
          if (!invite) {
            return;
          }
  
          setPendingInvite({
            id: invite.id,
  
            email: invite.email,
  
            createdAt:
              invite.createdAt,
          });
        })
        .catch(() => {
          // Keep app quiet for now.
          // We will add visible error handling later if needed.
        });
    }, [
      user,
      status,
      setPendingInvite,
    ]);
  }