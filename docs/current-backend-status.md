# Duo Backend Status

## Current working backend

Duo now has a real Supabase backend for the core shared-app structure.

### Authentication

- Supabase magic-link authentication works.
- Logged-in session persists across refresh.
- Sign out returns the user to the login screen.

### Partner connection

- One user can invite another user by email.
- Incoming invitations are detected inside Duo.
- The invited user can accept.
- Accepting creates a real `partner_connections` row.
- Active partner connection restores from Supabase on app load.
- Partner disconnect is backend-backed:
  - Disconnect asks for confirmation.
  - The active `partner_connections` row is changed to `disconnected`.
  - Local partner state is cleared.
  - Active and history cards are cleared from the app.
  - Refresh stays not connected.
- Reconnect works through the normal invite flow:
  - User A invites User B again.
  - User B accepts.
  - A new active connection is created.
  - Cards work again on the new connection.

### Cards

Supabase is now the source of truth for cards.

Working card behavior:

- Create card writes to Supabase.
- Created cards use the real Supabase UUID immediately.
- If Supabase creation fails, Duo shows an error instead of creating a fake local-only card.
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
- Realtime card sync works.
- A 10-second backup refresh also runs while connected so shared updates appear reliably.
- Two-user card flow was tested:
  - User A creates a card for User B.
  - User B sees it.
  - User B accepts.
  - User A sees accepted.
  - User B marks Done.
  - User A sees it move to History.

### History

History is now readable and removable.

Working history behavior:

- Done, cancelled, stopped, and expired cards appear in History.
- History cards can be opened.
- History cards show `Remove from history`.
- Removing from history deletes the card row from Supabase.
- Removed cards stay removed after refresh.
- Removed cards disappear for the other user after sync.

### Lifecycle automation

Lifecycle automation is now Supabase-backed.

Working lifecycle behavior:

- Requested cards overdue by more than 24 hours expire.
- Expired cards move to History as `EXPIRED`.
- Accepted / delayed cards due soon trigger one quiet reminder.
- Reminder state is saved to Supabase in `reminder_sent_at`.
- Reminder toast now includes the card title:
  - `Upcoming: [card title]`

## Current architecture

- Supabase stores real shared data.
- Zustand holds runtime card state while the app is open.
- Zustand card state is refilled from Supabase.
- Local card storage is no longer persisted.
- Partner state still uses local state, but restores from Supabase.
- Supabase realtime is used for shared updates.
- A 10-second backup refresh improves reliability when realtime is slow.

## Not fully finished

### Browser / push notifications

Duo currently uses in-app quiet reminder toasts only.

Not yet added:

- Browser push notifications
- Mobile push notifications
- Email notifications

This is intentional for now. The lifecycle rules needed to exist first.

### Take / Stop full two-user testing

These actions are coded, but still need stronger two-user testing:

- Take
- Stop

They should be tested with two real logged-in users and a returned/blocked responsibility flow.

### History removal policy

History removal currently deletes the Supabase card row.

This works for V1, but later we may want to revisit whether “remove from history” should be a soft delete instead of a hard delete.

## Known testing notes

- Supabase Table Editor may take a few seconds to show updated rows.
- Sometimes the table needs manual refresh.
- Local dev server must be running with `npm run dev`.
- Magic-link emails can expire or be rate-limited during repeated testing.
- For Incognito login, copy the magic-link URL and paste it into the Incognito address bar so the session stays in Incognito.

## Current tested milestone

Duo now supports the core V1 shared responsibility loop:

1. Users authenticate.
2. Users connect as partners.
3. Cards are created in Supabase.
4. Cards sync between both users.
5. Cards can be accepted, completed, delayed, cancelled, declined, stopped, removed from history, and expired.
6. Lifecycle reminders and expiration are Supabase-backed.
7. Partner disconnect and reconnect work.

## Next recommended steps

1. Test Take / Stop with a real two-user returned-card flow.
2. Improve the in-app notification/toast interaction.
3. Decide whether History removal should stay hard delete or become soft delete later.
4. Prepare for deployment testing outside local development.
5. Add browser/mobile notifications only after deployment basics are stable.