import {
  useEffect,
} from 'react';

export function useDuoLifecycle() {
  useEffect(() => {
    // Lifecycle automation is intentionally paused
    // while cards are being migrated to Supabase.
    //
    // Previously this hook changed local Zustand state:
    // - requested overdue cards expired locally
    // - accepted due-soon reminders were marked locally
    //
    // Now that Supabase is the source of truth, those
    // lifecycle changes must write to Supabase first.
    //
    // Next backend lifecycle step:
    // - expire requested overdue cards in Supabase
    // - mark reminder_sent_at in Supabase
    // - then sync back into local runtime state
  }, []);
}