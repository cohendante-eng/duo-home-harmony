# Duo Backend Status

## Current working backend

Duo now has a real Supabase backend for the core shared-app structure.

### Authentication

* Supabase magic-link authentication works.
* Logged-in session persists across refresh.
* Sign out returns the user to the login screen.
* Magic-link login works both locally and on the deployed Vercel URL.

### Partner connection

* One user can invite another user by email.
* Incoming invitations are detected inside Duo.
* Duo does not currently send a real invitation email.
* The invited user must open Duo with the invited email and accept the invite from Settings.
* The invited user can accept.
* Accepting creates a real `partner_connections` row.
* Active partner connection restores from Supabase on app load.

### Partner disconnect / reconnect

Partner disconnect is backend-backed.

Working disconnect behavior:

* Disconnect asks for confirmation.
* The active `partner_connections` row is changed to `disconnected`.
* Local partner state is cleared.
* Active and history cards are cleared from the app.
* Refresh stays not connected.

Reconnect works through the normal invite flow:

* User A invites User B again.
* User B accepts.
* A new active connection is created.
* Cards work again on the new connection.

### Cards

Supabase is now the source of truth for cards.

Working card behavior:

* Create card writes to Supabase.
* Created cards use the real Supabase UUID immediately.
* If Supabase creation fails, Duo shows an error instead of creating a fake local-only card.
* Cards load from Supabase on app start.
* Local card persistence was removed.
* Card actions write to Supabase:

  * Accept
  * Done
  * Delay / Reschedule
  * Cancel
  * Decline
  * Take
  * Stop

### Realtime sync

Realtime card sync works.

Current sync behavior:

* Supabase realtime is used for shared updates.
* A 10-second backup refresh also runs while connected.
* This makes shared updates appear reliably even when realtime is slow.
* Two-user card flow was tested:

  * User A creates a card for User B.
  * User B sees it.
  * User B accepts.
  * User A sees accepted.
  * User B marks Done.
  * User A sees it move to History.

### History

History is now readable and removable.

Working history behavior:

* Done, cancelled, stopped, and expired cards appear in History.
* History cards can be opened.
* History cards show `Remove from history`.
* Removing from history deletes the card row from Supabase.
* Removed cards stay removed after refresh.
* Removed cards disappear for the other user after sync.

### Lifecycle automation

Lifecycle automation is now Supabase-backed.

Working lifecycle behavior:

* Requested cards overdue by more than 24 hours expire.
* Expired cards move to History as `EXPIRED`.
* Accepted / delayed cards due soon trigger one quiet reminder.
* Reminder state is saved to Supabase in `reminder_sent_at`.
* Reminder toast includes the card title:

  * `Upcoming: [card title]`

## Current architecture

* Supabase stores real shared data.
* Zustand holds runtime card state while the app is open.
* Zustand card state is refilled from Supabase.
* Local card storage is no longer persisted.
* Partner state still uses local state, but restores from Supabase.
* Supabase realtime is used for shared updates.
* A 10-second backup refresh improves reliability when realtime is slow.
* Vercel hosts the deployed React/Vite app.
* Supabase Auth URL Configuration includes the deployed Vercel URL.

## Deployment status

Duo has been deployed to Vercel.

Deployed URL:

`https://duo-home-harmony-63onyzjdw-cohendante-engs-projects.vercel.app`

Working deployment behavior:

* Vercel project is connected to the GitHub repository.
* Vercel environment variables are configured:

  * `VITE_SUPABASE_URL`
  * `VITE_SUPABASE_ANON_KEY`
* Supabase Auth URL Configuration includes the Vercel URL.
* Magic-link login works on the deployed URL.
* Deployed two-user test passed:

  * Users can connect through Duo invite / accept.
  * Cards can be created.
  * Cards can be accepted.
  * Done moves cards to History.
  * Decline / return flow works.
  * Cancel works.
* Vercel Deployment Protection was checked because a tester initially saw an access request.
* Project-level Vercel Authentication was turned off so testers should reach the Duo login screen directly.

## Current tested milestone

Duo now supports the core V1 shared responsibility loop:

1. Users authenticate.
2. Users connect as partners.
3. Cards are created in Supabase.
4. Cards sync between both users.
5. Cards can be accepted, completed, delayed, cancelled, declined, stopped, removed from history, and expired.
6. Lifecycle reminders and expiration are Supabase-backed.
7. Partner disconnect and reconnect work.
8. The app is deployed and works outside localhost.

## Not fully finished

### Browser / push notifications

Duo currently uses in-app quiet reminder toasts only.

Not yet added:

* Browser push notifications
* Mobile push notifications
* Email notifications

This is intentional for now. The lifecycle rules needed to exist first.

### Take / Stop deeper testing

Take and Stop are coded and have been checked, but they may still need deeper testing with a realistic two-user returned-card flow.

Recommended test later:

* User A creates a card for User B.
* User B declines.
* User A sees the returned card.
* User A chooses Take.
* Repeat the decline flow enough to confirm Stop appears and works correctly.

### History removal policy

History removal currently deletes the Supabase card row.

This works for V1, but later we may want to revisit whether `Remove from history` should be a soft delete instead of a hard delete.

### Invitation email

Duo does not yet send a real invitation email.

Current behavior:

* User A enters User B’s email.
* Invite is saved in Supabase.
* User B must open Duo manually with that same email.
* User B sees `Invite received` in Settings.

Later we may add a real email invitation or shareable invite link.

### UI / visual identity

The app is currently functional and correct, but still visually plain and generic.

A future visual identity phase should explore:

* More distinctive card design
* Softer colors and accents
* Better icon styling
* Card type accents
* State-based visual treatments
* More polished empty states
* A stronger Duo visual personality

This should be done later without changing the product logic.

## Known testing notes

* Supabase Table Editor may take a few seconds to show updated rows.
* Sometimes the table needs manual refresh.
* Local dev server must be running with `npm run dev` for localhost testing.
* Magic-link emails can expire or be rate-limited during repeated testing.
* For Incognito login, copy the magic-link URL and paste it into the Incognito address bar so the session stays in Incognito.
* On Vercel, magic-link login may open a duplicate window. This is normal; keep one logged-in Duo window and close the duplicate.
* Duo invite emails are not real emails yet. Only Supabase login magic links are emailed.

## Next recommended steps

1. Confirm fresh tester access after disabling Vercel Authentication.
2. Run one short deployed QA pass:

   * Login
   * Invite / accept
   * Create
   * Accept
   * Done
   * History remove
   * Disconnect / reconnect
3. Test Take / Stop again if needed with a returned-card flow.
4. Improve the in-app notification/toast interaction.
5. Begin a focused visual identity pass later, without changing product logic.
6. Add browser/mobile notifications only after deployment basics are stable.
