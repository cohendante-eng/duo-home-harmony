import {
    useEffect,
    useState,
  } from 'react';
  
  import {
    Session,
  } from '@supabase/supabase-js';
  
  import {
    supabase,
  } from '../lib/supabase';
  
  export function useAuth() {
    const [session, setSession] =
      useState<Session | null>(null);
  
    const [loading, setLoading] =
      useState(true);
  
    useEffect(() => {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          setSession(
            data.session
          );
  
          setLoading(false);
        });
  
      const {
        data: {
          subscription,
        },
      } =
        supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
  
            setLoading(false);
          }
        );
  
      return () => {
        subscription.unsubscribe();
      };
    }, []);
  
    async function signInWithEmail(
      email: string
    ) {
      const { error } =
        await supabase.auth.signInWithOtp({
          email,
  
          options: {
            emailRedirectTo:
              window.location.origin,
          },
        });
  
      if (error) {
        throw error;
      }
    }
  
    async function signOut() {
      await supabase.auth.signOut();
    }
  
    return {
      session,
  
      user:
        session?.user ?? null,
  
      email:
        session?.user.email ?? null,
  
      loading,
  
      signInWithEmail,
  
      signOut,
    };
  }