import { create } from 'zustand';

import { persist } from 'zustand/middleware';

type PartnerStatus =
  | 'not_connected'
  | 'pending'
  | 'connected';

type Partner = {
  id: string;

  connectionId?: string;

  name: string;

  email: string;
};

type PartnerInvite = {
  id?: string;

  direction:
    | 'outgoing'
    | 'incoming';

  inviterId?: string;

  email: string;

  createdAt: number;
};

type PartnerStore = {
  status: PartnerStatus;

  partner: Partner | null;

  pendingInvite: PartnerInvite | null;

  invitePartner: (
    email?: string,
    id?: string,
    createdAt?: number
  ) => void;

  setPendingInvite: (
    invite: PartnerInvite
  ) => void;

  connectPartner: (
    partner: Partner
  ) => void;

  cancelInvite: () => void;

  disconnectPartner: () => void;
};

export const usePartner =
  create<PartnerStore>()(
    persist(
      (set) => ({
        status:
          'not_connected',

        partner:
          null,

        pendingInvite:
          null,

        invitePartner: (
          email =
            'partner@example.com',
          id,
          createdAt =
            Date.now()
        ) =>
          set({
            status:
              'pending',

            partner:
              null,

            pendingInvite: {
              id,

              direction:
                'outgoing',

              email,

              createdAt,
            },
          }),

        setPendingInvite: (
          invite
        ) =>
          set({
            status:
              'pending',

            partner:
              null,

            pendingInvite:
              invite,
          }),

        connectPartner: (
          partner
        ) =>
          set({
            status:
              'connected',

            partner,

            pendingInvite:
              null,
          }),

        cancelInvite: () =>
          set({
            status:
              'not_connected',

            partner:
              null,

            pendingInvite:
              null,
          }),

        disconnectPartner: () =>
          set({
            status:
              'not_connected',

            partner:
              null,

            pendingInvite:
              null,
          }),
      }),

      {
        name: 'duo-partner-storage',

        partialize: (state) => ({
          status:
            state.status,

          partner:
            state.partner,

          pendingInvite:
            state.pendingInvite,
        }),
      }
    )
  );