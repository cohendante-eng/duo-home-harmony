import { create } from 'zustand';

import { persist } from 'zustand/middleware';

type PartnerStatus =
  | 'not_connected'
  | 'pending'
  | 'connected';

type PartnerStore = {
  status: PartnerStatus;

  partnerName: string | null;

  partnerEmail: string | null;

  invitePartner: () => void;

  connectMockPartner: () => void;

  disconnectPartner: () => void;
};

export const usePartner =
  create<PartnerStore>()(
    persist(
      (set) => ({
        status:
          'not_connected',

        partnerName:
          null,

        partnerEmail:
          null,

        invitePartner: () =>
          set({
            status:
              'pending',

            partnerName:
              null,

            partnerEmail:
              'partner@example.com',
          }),

        connectMockPartner: () =>
          set({
            status:
              'connected',

            partnerName:
              'Partner',

            partnerEmail:
              'partner@example.com',
          }),

        disconnectPartner: () =>
          set({
            status:
              'not_connected',

            partnerName:
              null,

            partnerEmail:
              null,
          }),
      }),

      {
        name: 'duo-partner-storage',

        partialize: (state) => ({
          status:
            state.status,

          partnerName:
            state.partnerName,

          partnerEmail:
            state.partnerEmail,
        }),
      }
    )
  );