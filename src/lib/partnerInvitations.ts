import {
    supabase,
  } from './supabase';
  
  export type PartnerInvitation = {
    id: string;
  
    inviter_id: string;
  
    invitee_email: string;
  
    status: 'pending' | 'accepted' | 'cancelled' | 'expired';
  
    created_at: string;
  
    accepted_at: string | null;
  };
  
  export async function createPartnerInvitation({
    inviterId,
    inviteeEmail,
  }: {
    inviterId: string;
  
    inviteeEmail: string;
  }) {
    const cleanEmail =
      inviteeEmail
        .trim()
        .toLowerCase();
  
    if (!cleanEmail) {
      throw new Error(
        'Partner email is required.'
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
  
          invitee_email: cleanEmail,
  
          status: 'pending',
        })
        .select()
        .single();
  
    if (error) {
      throw error;
    }
  
    return {
      id: data.id as string,
  
      email:
        data.invitee_email as string,
  
      createdAt:
        new Date(
          data.created_at as string
        ).getTime(),
    };
  }
  
  export async function getLatestPendingPartnerInvitation({
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