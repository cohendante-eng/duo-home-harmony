# Duo Backend Status

## Current working backend

Duo now has a real Supabase backend for the core shared-app structure.

### Authentication

- Supabase magic-link authentication works.
- Logged-in session persists across refresh.
- Sign out returns the user to the login screen.

### Partner connection

- One user can invite another user by email.
- Incoming invitations are detected.
- The invited user can accept.
- Accepting creates a real `partner_connections` row.
- Active partner connection restores from Supabase on app load.

### Cards

Supabase is now the source of truth for cards.

Working card behavior:

- Create card writes to Supabase.
- Created cards use the real Supabase UUID immediately.
- Cards load from Supabase on app start.
- Local card persistence was removed.
- Card actions write to Supabase:
  - Accept
  - Done
  - Delay / Reschedule
  - Cancel
  - Decline
  - Take
  - Stop
- Realtime card sync works:
  - Updating a card row in Supabase updates Duo without browser refresh.

## Current architecture

- Supabase stores real shared data.
- Zustand still holds runtime card state while the app is open.
- Zustand card state is refilled from Supabase.
- Local card storage is no longer persisted.
- Partner state still uses local state but restores from Supabase.

## Paused / not fully finished

### Lifecycle automation is paused

The old local-only lifecycle behavior was paused because Supabase is now the source of truth.

Paused behavior:

- Requested overdue cards expiring automatically
- Accepted / delayed due-soon reminder marking

These should return later as Supabase-backed lifecycle updates.

### Not fully tested alone

These actions are coded but awkward to test with one user:

- Take
- Stop

They should be tested properly with two real logged-in users.

## Known testing notes

- Supabase Table Editor may take a few seconds to show updated rows.
- Sometimes the table needs manual refresh.
- Local dev server must be running with `npm run dev`.
- Magic-link emails can expire or be rate-limited during repeated testing.

## Next recommended steps

1. Clean and stabilize backend card flow.
2. Test with two real users in two browser sessions.
3. Rebuild lifecycle automation using Supabase writes.
4. Add minimal notification/badge logic later.
5. Revisit History remove/delete behavior.
6. Prepare for deployment/testing outside local development.