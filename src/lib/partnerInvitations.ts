import {
    supabase,
  } from './supabase';
  
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
  
    const { error } =
      await supabase
        .from('partner_invitations')
        .insert({
          inviter_id: inviterId,
  
          invitee_email: cleanEmail,
  
          status: 'pending',
        });
  
    if (error) {
      throw error;
    }
  
    return {
      email: cleanEmail,
    };
  }