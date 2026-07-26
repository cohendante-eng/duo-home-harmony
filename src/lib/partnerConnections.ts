import {
  supabase,
} from './supabase';

type PartnerConnectionRow = {
  id: string;

  user_a_id: string;

  user_b_id: string;

  user_a_email: string | null;

  user_b_email: string | null;

  status:
    | 'active'
    | 'disconnected';

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

  const isUserA =
    connection.user_a_id === userId;

  const partnerId =
    isUserA
      ? connection.user_b_id
      : connection.user_a_id;

  const partnerEmail =
    isUserA
      ? connection.user_b_email
      : connection.user_a_email;

  return {
    id: connection.id,

    partnerId,

    partnerEmail:
      partnerEmail ?? '',

    createdAt:
      new Date(
        connection.created_at
      ).getTime(),
  };
}

export async function disconnectPartnerConnection({
  connectionId,
}: {
  connectionId: string;
}) {
  const {
    error,
  } =
    await supabase
      .from('partner_connections')
      .update({
        status: 'disconnected',
      })
      .eq('id', connectionId);

  if (error) {
    throw error;
  }
}