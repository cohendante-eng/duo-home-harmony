import {
  supabase,
} from './supabase';

export type PartnerInvitation = {
  id: string;

  inviter_id: string;

  inviter_email: string | null;

  invitee_email: string;

  status:
    | 'pending'
    | 'accepted'
    | 'cancelled'
    | 'expired';

  created_at: string;

  accepted_at: string | null;
};

export async function createPartnerInvitation({
  inviterId,
  inviterEmail,
  inviteeEmail,
}: {
  inviterId: string;

  inviterEmail: string;

  inviteeEmail: string;
}) {
  const cleanInviterEmail =
    inviterEmail
      .trim()
      .toLowerCase();

  const cleanInviteeEmail =
    inviteeEmail
      .trim()
      .toLowerCase();

  if (!cleanInviteeEmail) {
    throw new Error(
      'Partner email is required.'
    );
  }

  if (!cleanInviterEmail) {
    throw new Error(
      'Your account email is missing.'
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from('partner_invitations')
      .insert({
        inviter_id: inviterId,

        inviter_email:
          cleanInviterEmail,

        invitee_email:
          cleanInviteeEmail,

        status: 'pending',
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id as string,

    inviterId:
      data.inviter_id as string,

    inviterEmail:
      data.inviter_email as string,

    email:
      data.invitee_email as string,

    createdAt:
      new Date(
        data.created_at as string
      ).getTime(),
  };
}

export async function getLatestOutgoingPartnerInvitation({
  userId,
}: {
  userId: string;
}) {
  const {
    data,
    error,
  } =
    await supabase
      .from('partner_invitations')
      .select('*')
      .eq('inviter_id', userId)
      .eq('status', 'pending')
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

  const invitation =
    data as PartnerInvitation;

  return {
    id: invitation.id,

    direction:
      'outgoing' as const,

    inviterId:
      invitation.inviter_id,

    inviterEmail:
      invitation.inviter_email ?? '',

    email:
      invitation.invitee_email,

    createdAt:
      new Date(
        invitation.created_at
      ).getTime(),
  };
}

export async function getLatestIncomingPartnerInvitation({
  email,
}: {
  email: string;
}) {
  const cleanEmail =
    email.trim().toLowerCase();

  const {
    data,
    error,
  } =
    await supabase
      .from('partner_invitations')
      .select('*')
      .eq('invitee_email', cleanEmail)
      .eq('status', 'pending')
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

  const invitation =
    data as PartnerInvitation;

  return {
    id: invitation.id,

    direction:
      'incoming' as const,

    inviterId:
      invitation.inviter_id,

    inviterEmail:
      invitation.inviter_email ?? '',

    email:
      invitation.invitee_email,

    createdAt:
      new Date(
        invitation.created_at
      ).getTime(),
  };
}

export async function cancelPartnerInvitation({
  invitationId,
}: {
  invitationId: string;
}) {
  const { error } =
    await supabase
      .from('partner_invitations')
      .update({
        status: 'cancelled',
      })
      .eq('id', invitationId);

  if (error) {
    throw error;
  }
}

export async function acceptPartnerInvitation({
  invitationId,
  inviterId,
  inviterEmail,
  currentUserId,
  currentUserEmail,
}: {
  invitationId: string;

  inviterId: string;

  inviterEmail: string;

  currentUserId: string;

  currentUserEmail: string;
}) {
  const cleanInviterEmail =
    inviterEmail
      .trim()
      .toLowerCase();

  const cleanCurrentUserEmail =
    currentUserEmail
      .trim()
      .toLowerCase();

  const {
    error: connectionError,
  } =
    await supabase
      .from('partner_connections')
      .insert({
        user_a_id: inviterId,

        user_b_id: currentUserId,

        user_a_email:
          cleanInviterEmail,

        user_b_email:
          cleanCurrentUserEmail,

        status: 'active',
      });

  if (connectionError) {
    throw connectionError;
  }

  const {
    error: invitationError,
  } =
    await supabase
      .from('partner_invitations')
      .update({
        status: 'accepted',

        accepted_at:
          new Date().toISOString(),
      })
      .eq('id', invitationId);

  if (invitationError) {
    throw invitationError;
  }
}