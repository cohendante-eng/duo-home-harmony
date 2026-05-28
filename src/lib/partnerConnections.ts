import {
    supabase,
  } from './supabase';
  
  type PartnerConnectionRow = {
    id: string;
  
    user_a_id: string;
  
    user_b_id: string;
  
    status: 'active' | 'disconnected';
  
    created_at: string;
  };
  
  export async function getActivePartnerConnection({
    userId,
  }: {
    userId: string;
  }) {
    const {
      data,
      error,
    } =
      await supabase
        .from('partner_connections')
        .select('*')
        .or(
          `user_a_id.eq.${userId},user_b_id.eq.${userId}`
        )
        .eq('status', 'active')
        .order('created_at', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();
  
    if (error) {
      throw error;
    }
  
    if (!data) {
      return null;
    }
  
    const connection =
      data as PartnerConnectionRow;
  
    const partnerId =
      connection.user_a_id === userId
        ? connection.user_b_id
        : connection.user_a_id;
  
    return {
      id: connection.id,
  
      partnerId,
  
      createdAt:
        new Date(
          connection.created_at
        ).getTime(),
    };
  }