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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
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

  return data as SupabaseCardRow;
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
  if (!isUuid(cardId)) {
    return;
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
  if (!isUuid(cardId)) {
    return;
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
  if (!isUuid(cardId)) {
    return;
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

export async function delaySupabaseCard({
  cardId,
  dueAt,
  modifierForId,
}: {
  cardId: string;

  dueAt: number;

  modifierForId?: string;
}) {
  if (!isUuid(cardId)) {
    return;
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