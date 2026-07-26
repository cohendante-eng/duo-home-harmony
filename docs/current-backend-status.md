# Duo Backend Status

## Current working backend

Duo now has a real Supabase backend for the core shared-app structure.

### Authentication

- Supabase magic-link authentication works.
- Logged-in session persists across refresh.
- Sign out returns the user to the login screen.
- Magic-link login works both locally and on the deployed Vercel URL.
- Supabase Auth now points to the stable production URL:
  - `https://duo-home-harmony.vercel.app`

### Partner connection

- One user can invite another user by email.
- Incoming invitations are detected inside Duo.
- Duo does not currently send a real invitation email.
- The invited user must open Duo with the invited email and accept the invite from Settings.
- The invited user can accept.
- Accepting creates a real `partner_connections` row.
- Active partner connection restores from Supabase on app load.
- Settings now shows the connected partner email.

Current Settings display:

- `Connected to Partner`
- `Partner account: [partner email]`
- `Disconnect partner`

This makes it clear which account the user is paired with.

### Partner disconnect / reconnect

Partner disconnect is backend-backed.

Working disconnect behavior:

- Disconnect asks for confirmation.
- The active `partner_connections` row is changed to `disconnected`.
- Local partner state is cleared.
- Active and history cards are cleared from the app.
- Refresh stays not connected.

Reconnect works through the normal invite flow:

- User A invites User B again.
- User B accepts.
- A new active connection is created.
- Cards work again on the new connection.

Known note:

- Partner disconnect / reconnect works in the backend.
- After refresh, both users see the correct partner connection state.
- The other user’s Partner connection UI may still not update live while Settings is already open.
- For now, partner connection changes may require a manual refresh on the other device.
- This is acceptable for V1 because partner connect / disconnect is a rare Settings action, while daily card sync is working quickly.

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

### Realtime sync

Realtime card sync works.

Current sync behavior:

- Supabase realtime is used for shared card updates.
- A 10-second backup refresh also runs while connected.
- This makes shared card updates appear reliably even when realtime is slow.
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

### In-app reminder toast

Reminder toasts are now more useful.

Working behavior:

- Reminder toast says `Upcoming: [card title]`.
- Reminder toast stays visible for about 8 seconds.
- Reminder toast includes an `Open` action.
- Tapping `Open` opens the related responsibility card.
- The close `×` dismisses the toast.
- The toast appears near the bottom of the screen above the bottom navigation.

### Reschedule undo toast

Reschedule toasts now work more reliably.

Working behavior:

- Rescheduling shows a toast such as `Rescheduled +30m`.
- Toast stays visible for about 8 seconds.
- `Undo` restores the previous due time and accepted state.
- Each toast has its own internal ID, so an older timer cannot close a newer toast early.

## Current architecture

- Supabase stores real shared data.
- Zustand holds runtime card state while the app is open.
- Zustand card state is refilled from Supabase.
- Local card storage is no longer persisted.
- Partner state still uses local state, but restores from Supabase.
- Supabase realtime is used for shared card updates.
- A 10-second backup refresh improves card sync reliability when realtime is slow.
- Vercel hosts the deployed React/Vite app.
- Supabase Auth URL Configuration now uses the stable deployed Vercel URL.

## Deployment status

Duo has been deployed to Vercel.

Stable deployed URL:

`https://duo-home-harmony.vercel.app`

Working deployment behavior:

- Vercel project is connected to the GitHub repository.
- Vercel environment variables are configured:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Supabase Auth URL Configuration includes the stable Vercel URL.
- Magic-link login works on the deployed URL.
- Project-level Vercel Authentication was turned off so testers reach the Duo login screen directly.
- Fresh tester access was confirmed:
  - Tester opened the deployed URL.
  - Tester saw the Duo login screen.
  - No Vercel access request appeared.

### Deployed QA pass

A full deployed QA pass was completed with two real users on separate computers.

Passed deployed QA behavior:

- Friend login works through Supabase magic link.
- Both users can connect as partners.
- User A can create a card for User B.
- User B sees the card.
- User B can accept the card.
- User A sees the accepted state quickly.
- User B can mark the card Done.
- User A sees the card move to History.
- History card can be opened.
- `Remove from history` works on the deployed app.
- Removed history card disappears.
- Disconnect partner works on the deployed app.
- After refresh, disconnected state remains.
- Reconnect works through normal invite / accept.
- After reconnect, creating a new test card works and the friend sees it.
- Settings now shows the connected partner email.
- Reminder toast opens the related card.
- Reschedule undo toast stays visible longer and works reliably.

Known deployment note:

- Card sync is fast on the deployed app.
- Partner disconnect / reconnect works in the backend.
- After refresh, both users see the correct partner connection state.
- The other user’s Partner connection UI may still not update live while Settings is already open.
- For now, partner connection changes may require a manual refresh on the other device.
- This is acceptable for V1 because partner connect / disconnect is a rare Settings action, while daily card sync is working quickly.

## Current tested milestone

Duo now supports the core V1 shared responsibility loop:

1. Users authenticate.
2. Users connect as partners.
3. Users can clearly see the connected partner email in Settings.
4. Cards are created in Supabase.
5. Cards sync between both users.
6. Cards can be accepted, completed, delayed, cancelled, declined, stopped, removed from history, and expired.
7. Lifecycle reminders and expiration are Supabase-backed.
8. Reminder toasts can open the related responsibility.
9. Reschedule undo toasts are stable and stay visible longer.
10. Partner disconnect and reconnect work.
11. The app is deployed and works outside localhost.
12. A deployed QA pass with two real users on separate computers passed.

## Not fully finished

### Browser / push notifications

Duo currently uses in-app quiet reminder toasts only.

Not yet added:

- Browser push notifications
- Mobile push notifications
- Email notifications

This is intentional for now. The lifecycle rules needed to exist first.

### Take / Stop deeper testing

Take and Stop are coded and have been checked, but they may still need deeper testing with a realistic two-user returned-card flow.

Recommended test later:

- User A creates a card for User B.
- User B declines.
- User A sees the returned card.
- User A chooses Take.
- Repeat the decline flow enough to confirm Stop appears and works correctly.

### Partner connection live sync

Partner connection changes are backend-backed and correct after refresh, but the UI does not always update live on the other device while Settings is already open.

Current behavior:

- Disconnect works in Supabase.
- Reconnect works in Supabase.
- Refresh shows the correct connection state.
- Card sync is fast and reliable.
- Partner connection UI may still need manual refresh after disconnect or reconnect.

Recommended later improvement:

- Revisit partner connection live-sync with a cleaner connection-state model.
- Consider a dedicated realtime channel or a simpler Settings-specific refresh strategy.
- This is not a blocker for V1 because connect / disconnect is a rare Settings action.

### History removal policy

History removal currently deletes the Supabase card row.

This works for V1, but later we may want to revisit whether `Remove from history` should be a soft delete instead of a hard delete.

### Invitation email

Duo does not yet send a real invitation email.

Current behavior:

- User A enters User B’s email.
- Invite is saved in Supabase.
- User B must open Duo manually with that same email.
- User B sees `Invite received` in Settings.

Later we may add a real email invitation or shareable invite link.

### UI / visual identity

The app is currently functional and correct, but still visually plain and generic.

A future visual identity phase should explore:

- More distinctive card design
- Softer colors and accents
- Better icon styling
- Card type accents
- State-based visual treatments
- More polished empty states
- A stronger Duo visual personality

This should be done later without changing the product logic.

## Known testing notes

- Supabase Table Editor may take a few seconds to show updated rows.
- Sometimes the table needs manual refresh.
- Local dev server must be running with `npm run dev` for localhost testing.
- Magic-link emails can expire or be rate-limited during repeated testing.
- For Incognito login, copy the magic-link URL and paste it into the Incognito address bar so the session stays in Incognito.
- On Vercel, magic-link login may open a duplicate window. This is normal; keep one logged-in Duo window and close the duplicate.
- Use the stable Vercel URL:
  - `https://duo-home-harmony.vercel.app`
- Old random deployment URLs should not be used for normal testing.
- Duo invite emails are not real emails yet. Only Supabase login magic links are emailed.
- Partner connection changes may require refresh on the other device.
- Card changes should sync quickly.
- Reminder toast and reschedule undo toast should stay visible for about 8 seconds.

## Next recommended steps

1. Test Take / Stop again if needed with a returned-card flow.
2. Do a small polish pass on the toast layout and wording if needed.
3. Begin a focused visual identity pass later, without changing product logic.
4. Decide later whether History removal should stay hard delete or become soft delete.
5. Add browser/mobile notifications only after deployment basics are stable.
6. Revisit partner connection live-sync later if connect / disconnect needs to feel fully realtime.