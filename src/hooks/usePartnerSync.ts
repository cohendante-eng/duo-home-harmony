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
  getLatestIncomingPartnerInvitation,
  getLatestOutgoingPartnerInvitation,
} from '../lib/partnerInvitations';

import {
  getActivePartnerConnection,
} from '../lib/partnerConnections';

function clearRuntimeCards() {
  useCards.setState({
    activeCards: [],

    historyCards: [],
  });
}

function clearStalePartnerConnection() {
  const partnerState =
    usePartner.getState();

  const hasStaleConnection =
    partnerState.status ===
      'connected' ||
    Boolean(partnerState.partner);

  if (!hasStaleConnection) {
    return;
  }

  partnerState.disconnectPartner();

  clearRuntimeCards();
}

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

  const connectPartner =
    usePartner(
      (s) => s.connectPartner
    );

  const cancelInvite =
    usePartner(
      (s) => s.cancelInvite
    );

  const syncPartnerState =
    useCallback(async () => {
      if (!user || !email) {
        return;
      }

      const activeConnection =
        await getActivePartnerConnection({
          userId: user.id,
        });

      if (activeConnection) {
        const currentPartner =
          usePartner
            .getState()
            .partner;

        if (
          currentPartner?.connectionId !==
          activeConnection.id
        ) {
          connectPartner({
            id: activeConnection.partnerId,

            connectionId:
              activeConnection.id,

            name: 'Partner',

            email: '',
          });
        }

        return;
      }

      clearStalePartnerConnection();

      const incoming =
        await getLatestIncomingPartnerInvitation({
          email,
        });

      if (incoming) {
        const currentInvite =
          usePartner
            .getState()
            .pendingInvite;

        if (
          currentInvite?.id !==
          incoming.id
        ) {
          setPendingInvite({
            id: incoming.id,

            direction:
              incoming.direction,

            inviterId:
              incoming.inviterId,

            email:
              incoming.email,

            createdAt:
              incoming.createdAt,
          });
        }

        return;
      }

      const outgoing =
        await getLatestOutgoingPartnerInvitation({
          userId: user.id,
        });

      if (outgoing) {
        const currentInvite =
          usePartner
            .getState()
            .pendingInvite;

        if (
          currentInvite?.id !==
          outgoing.id
        ) {
          setPendingInvite({
            id: outgoing.id,

            direction:
              outgoing.direction,

            inviterId:
              outgoing.inviterId,

            email:
              outgoing.email,

            createdAt:
              outgoing.createdAt,
          });
        }

        return;
      }

      if (
        usePartner
          .getState()
          .status === 'pending'
      ) {
        cancelInvite();
      }
    }, [
      user,
      email,
      setPendingInvite,
      connectPartner,
      cancelInvite,
    ]);

  useEffect(() => {
    syncPartnerState().catch(
      () => {
        // Keep app quiet for now.
        // Visible partner sync errors can be added later.
      }
    );
  }, [
    syncPartnerState,
    status,
  ]);

  useEffect(() => {
    if (!user || !email) {
      return;
    }

    const interval =
      window.setInterval(() => {
        syncPartnerState().catch(
          () => {
            // Keep app quiet for now.
          }
        );
      }, 1000 * 5);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    user,
    email,
    syncPartnerState,
  ]);

  useEffect(() => {
    if (!user || !email) {
      return;
    }

    function handleFocus() {
      syncPartnerState().catch(
        () => {
          // Keep app quiet for now.
        }
      );
    }

    window.addEventListener(
      'focus',
      handleFocus
    );

    document.addEventListener(
      'visibilitychange',
      handleFocus
    );

    return () => {
      window.removeEventListener(
        'focus',
        handleFocus
      );

      document.removeEventListener(
        'visibilitychange',
        handleFocus
      );
    };
  }, [
    user,
    email,
    syncPartnerState,
  ]);

  useEffect(() => {
    if (!user || !email) {
      return;
    }

    const channel =
      supabase
        .channel(
          `partner-sync:${user.id}`
        )
        .on(
          'postgres_changes',
          {
            event: '*',

            schema: 'public',

            table:
              'partner_connections',
          },
          () => {
            syncPartnerState().catch(
              () => {
                // Keep app quiet for now.
              }
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',

            schema: 'public',

            table:
              'partner_invitations',
          },
          () => {
            syncPartnerState().catch(
              () => {
                // Keep app quiet for now.
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
    email,
    syncPartnerState,
  ]);
}