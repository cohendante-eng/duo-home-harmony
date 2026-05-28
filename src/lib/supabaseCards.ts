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
  
    return data;
  }