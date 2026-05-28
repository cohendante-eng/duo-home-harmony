import {
  supabase,
} from './supabase';

import {
  DuoCard,
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