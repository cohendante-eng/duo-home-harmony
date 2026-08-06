import {
  supabase,
} from './supabase';

import {
  DuoCard,
  UserId,
} from '../types/card';

type CreateSupabaseCardInput = {
  partnerConnectionId: string;

  type: DuoCard['type'];

  ownerId: string;

  creatorId: string;

  payload: DuoCard['payload'];

  dueAt?: number;
};

export type SupabaseCardRow = {
  id: string;

  partner_connection_id: string;

  type: DuoCard['type'];

  state:
    | 'requested'
    | 'accepted'
    | 'delayed'
    | 'done'
    | 'cancelled'
    | 'stopped'
    | 'expired';

  owner_id: string;

  creator_id: string;

  payload: DuoCard['payload'];

  due_at: string | null;

  reminder_sent_at: string | null;

  block_count: number;

  modifier: string | null;

  modifier_for: string | null;

  created_at: string;

  updated_at: string;
};

function hasCardId(cardId: string) {
  return Boolean(
    cardId &&
      String(cardId).trim().length > 0
  );
}

async function sendCardPushNotification({
  cardId,
}: {
  cardId: string;
}) {
  const {
    data,
    error,
  } =
    await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const accessToken =
    data.session?.access_token;

  if (!accessToken) {
    throw new Error(
      'You need to be signed in.'
    );
  }

  const response =
    await fetch(
      '/api/send-card-push',
      {
        method: 'POST',
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          cardId,
        }),
      }
    );

  const responseData =
    await response.json().catch(
      () => null
    );

  if (!response.ok) {
    throw new Error(
      responseData?.error ||
        'Could not send card notification.'
    );
  }

  return responseData;
}

export async function createSupabaseCard({
  partnerConnectionId,
  type,
  ownerId,
  creatorId,
  payload,
  dueAt,
}: CreateSupabaseCardInput) {
  const {
    data,
    error,
  } =
    await supabase
      .from('cards')
      .insert({
        partner_connection_id:
          partnerConnectionId,

        type,

        state: 'requested',

        owner_id:
          ownerId,

        creator_id:
          creatorId,

        payload,

        due_at:
          typeof dueAt === 'number'
            ? new Date(
                dueAt
              ).toISOString()
            : null,

        block_count: 0,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  const createdCard =
    data as SupabaseCardRow;

  if (
    createdCard.owner_id !==
    createdCard.creator_id
  ) {
    sendCardPushNotification({
      cardId: createdCard.id,
    }).catch((pushError) => {
      console.warn(
        'Card saved, but push notification failed.',
        pushError
      );
    });
  }

  return createdCard;
}

export async function getSupabaseCards({
  partnerConnectionId,
}: {
  partnerConnectionId: string;
}) {
  const {
    data,
    error,
  } =
    await supabase
      .from('cards')
      .select('*')
      .eq(
        'partner_connection_id',
        partnerConnectionId
      )
      .order('created_at', {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as SupabaseCardRow[];
}

export async function acceptSupabaseCard({
  cardId,
}: {
  cardId: string;
}) {
  if (!hasCardId(cardId)) {
    throw new Error(
      'Missing card id.'
    );
  }

  const { error } =
    await supabase
      .from('cards')
      .update({
        state: 'accepted',

        block_count: 0,

        modifier: null,

        modifier_for: null,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', cardId);

  if (error) {
    throw error;
  }
}

export async function completeSupabaseCard({
  cardId,
}: {
  cardId: string;
}) {
  if (!hasCardId(cardId)) {
    throw new Error(
      'Missing card id.'
    );
  }

  const { error } =
    await supabase
      .from('cards')
      .update({
        state: 'done',

        modifier: null,

        modifier_for: null,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', cardId);

  if (error) {
    throw error;
  }
}

export async function cancelSupabaseCard({
  cardId,
}: {
  cardId: string;
}) {
  if (!hasCardId(cardId)) {
    throw new Error(
      'Missing card id.'
    );
  }

  const { error } =
    await supabase
      .from('cards')
      .update({
        state: 'cancelled',

        modifier: null,

        modifier_for: null,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', cardId);

  if (error) {
    throw error;
  }
}

export async function stopSupabaseCard({
  cardId,
}: {
  cardId: string;
}) {
  if (!hasCardId(cardId)) {
    throw new Error(
      'Missing card id.'
    );
  }

  const { error } =
    await supabase
      .from('cards')
      .update({
        state: 'stopped',

        modifier: null,

        modifier_for: null,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', cardId);

  if (error) {
    throw error;
  }
}

export async function expireSupabaseCard({
  cardId,
}: {
  cardId: string;
}) {
  if (!hasCardId(cardId)) {
    throw new Error(
      'Missing card id.'
    );
  }

  const { error } =
    await supabase
      .from('cards')
      .update({
        state: 'expired',

        modifier: null,

        modifier_for: null,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', cardId);

  if (error) {
    throw error;
  }
}

export async function markSupabaseReminderSent({
  cardId,
}: {
  cardId: string;
}) {
  if (!hasCardId(cardId)) {
    throw new Error(
      'Missing card id.'
    );
  }

  const now =
    new Date().toISOString();

  const { error } =
    await supabase
      .from('cards')
      .update({
        reminder_sent_at:
          now,

        updated_at:
          now,
      })
      .eq('id', cardId);

  if (error) {
    throw error;
  }
}

export async function removeSupabaseCard({
  cardId,
}: {
  cardId: string;
}) {
  if (!hasCardId(cardId)) {
    throw new Error(
      'Missing card id.'
    );
  }

  const { error } =
    await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);

  if (error) {
    throw error;
  }
}

export async function removeAllSupabaseHistoryCards({
  cardIds,
}: {
  cardIds: string[];
}) {
  const validCardIds =
    cardIds.filter(hasCardId);

  if (validCardIds.length === 0) {
    return;
  }

  const { error } =
    await supabase
      .from('cards')
      .delete()
      .in('id', validCardIds);

  if (error) {
    throw error;
  }
}

export async function delaySupabaseCard({
  cardId,
  dueAt,
  modifierForId,
}: {
  cardId: string;

  dueAt: number;

  modifierForId?: string;
}) {
  if (!hasCardId(cardId)) {
    throw new Error(
      'Missing card id.'
    );
  }

  const { error } =
    await supabase
      .from('cards')
      .update({
        state: 'delayed',

        due_at:
          new Date(
            dueAt
          ).toISOString(),

        reminder_sent_at:
          null,

        modifier: 'updated',

        modifier_for:
          modifierForId ?? null,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', cardId);

  if (error) {
    throw error;
  }
}

export async function declineSupabaseCard({
  cardId,
  newOwnerId,
  nextBlockCount,
}: {
  cardId: string;

  newOwnerId?: string;

  nextBlockCount: number;
}) {
  if (!hasCardId(cardId)) {
    throw new Error(
      'Missing card id.'
    );
  }

  if (!newOwnerId) {
    throw new Error(
      'Missing new owner id.'
    );
  }

  const { error } =
    await supabase
      .from('cards')
      .update({
        owner_id:
          newOwnerId,

        state: 'requested',

        due_at: null,

        reminder_sent_at:
          null,

        block_count:
          nextBlockCount,

        modifier:
          nextBlockCount >= 2
            ? 'updated'
            : 'returned',

        modifier_for:
          newOwnerId,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', cardId);

  if (error) {
    throw error;
  }
}

export async function takeSupabaseCard({
  cardId,
  currentUserId,
}: {
  cardId: string;

  currentUserId?: string;
}) {
  if (!hasCardId(cardId)) {
    throw new Error(
      'Missing card id.'
    );
  }

  if (!currentUserId) {
    throw new Error(
      'Missing current user id.'
    );
  }

  const { error } =
    await supabase
      .from('cards')
      .update({
        owner_id:
          currentUserId,

        state: 'accepted',

        block_count: 0,

        reminder_sent_at:
          null,

        modifier: null,

        modifier_for: null,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', cardId);

  if (error) {
    throw error;
  }
}

function mapUserId({
  realUserId,
  currentUserId,
  partnerUserId,
}: {
  realUserId: string;

  currentUserId: string;

  partnerUserId: string;
}): UserId {
  if (realUserId === currentUserId) {
    return 'me';
  }

  if (realUserId === partnerUserId) {
    return 'partner';
  }

  return 'partner';
}

export function convertSupabaseCardToDuoCard({
  row,
  currentUserId,
  partnerUserId,
}: {
  row: SupabaseCardRow;

  currentUserId: string;

  partnerUserId: string;
}): DuoCard {
  return {
    id: row.id,

    type: row.type,

    state: row.state,

    ownerId: mapUserId({
      realUserId: row.owner_id,

      currentUserId,

      partnerUserId,
    }),

    creatorId: mapUserId({
      realUserId: row.creator_id,

      currentUserId,

      partnerUserId,
    }),

    payload: row.payload,

    dueAt: row.due_at
      ? new Date(
          row.due_at
        ).getTime()
      : undefined,

    reminderSentAt:
      row.reminder_sent_at
        ? new Date(
            row.reminder_sent_at
          ).getTime()
        : undefined,

    blockCount:
      row.block_count ?? 0,

    modifier:
      row.modifier as DuoCard['modifier'],

    modifierFor:
      row.modifier_for
        ? mapUserId({
            realUserId:
              row.modifier_for,

            currentUserId,

            partnerUserId,
          })
        : undefined,
  } as DuoCard;
}

export function convertSupabaseCardsToDuoCards({
  rows,
  currentUserId,
  partnerUserId,
}: {
  rows: SupabaseCardRow[];

  currentUserId: string;

  partnerUserId: string;
}) {
  return rows.map((row) =>
    convertSupabaseCardToDuoCard({
      row,

      currentUserId,

      partnerUserId,
    })
  );
}