import { create } from 'zustand';

import { persist } from 'zustand/middleware';

type PartnerStatus =
  | 'not_connected'
  | 'pending'
  | 'connected';

type Partner = {
  id: string;

  name: string;

  email: string;
};

type PartnerInvite = {
  email: string;

  createdAt: number;
};

type PartnerStore = {
  status: PartnerStatus;

  partner: Partner | null;

  pendingInvite: PartnerInvite | null;

  invitePartner: (
    email?: string
  ) => void;

  connectMockPartner: () => void;

  cancelInvite: () => void;

  disconnectPartner: () => void;
};

export const usePartner =
  create<PartnerStore>()(
    persist(
      (set, get) => ({
        status:
          'not_connected',

        partner:
          null,

        pendingInvite:
          null,

        invitePartner: (
          email =
            'partner@example.com'
        ) =>
          set({
            status:
              'pending',

            partner:
              null,

            pendingInvite: {
              email,

              createdAt:
                Date.now(),
            },
          }),

        connectMockPartner: () => {
          const invite =
            get().pendingInvite;

          set({
            status:
              'connected',

            partner: {
              id: 'mock-partner',

              name: 'Partner',

              email:
                invite?.email ??
                'partner@example.com',
            },

            pendingInvite:
              null,
          });
        },

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