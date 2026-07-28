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
  - I’ll handle it
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

### Returned and delayed-card flow

Returned-card behavior:

- User A creates a responsibility for User B.
- User B can decline / return it.
- The responsibility returns to User A.
- User A can accept it or stop it.
- If returned again, the card can continue back and forth until one user accepts it or stops it.

Delayed-card behavior:

- Delayed cards can show an `I’ll handle it` action.
- `I’ll handle it` lets the user take over the delayed responsibility.
- After `I’ll handle it`, the responsibility becomes accepted by that user.
- The card disappears from the other user’s Home because it no longer needs their attention.

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

### Local browser notifications

Local browser notifications now work for V1.

Working behavior:

- Settings includes notification permission controls.
- User can enable browser notifications.
- If browser notifications are blocked, Settings explains that the user must enable them in browser settings.
- Due-soon reminders trigger both:
  - an in-app toast
  - a browser notification
- Clicking the browser notification opens / focuses Duo.
- Clicking the notification opens the related responsibility card.
- This works while Duo is open in the browser.

Current limitation:

- This is not true background push yet.
- If Duo is fully closed, notifications are not guaranteed.
- True background push can be added later with a service worker and push subscription system.

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
- Browser notifications currently use local browser notification permission and app-side reminder events.

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
- Local browser notifications work while Duo is open.
- Clicking a browser notification opens the related responsibility card.
- Delayed-card takeover works and is now labeled `I’ll handle it`.

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
7. Delayed cards can be taken over with `I’ll handle it`.
8. Lifecycle reminders and expiration are Supabase-backed.
9. Reminder toasts can open the related responsibility.
10. Reschedule undo toasts are stable and stay visible longer.
11. Local browser notifications can be enabled from Settings.
12. Due-soon reminders can show browser notifications while Duo is open.
13. Clicking a browser notification opens the related responsibility.
14. Partner disconnect and reconnect work.
15. The app is deployed and works outside localhost.
16. A deployed QA pass with two real users on separate computers passed.

## Not fully finished

### True background push notifications

Duo currently has local browser notifications only.

Current behavior:

- Browser notifications work while Duo is open in the browser.
- Reminder notification click opens the related responsibility card.
- This is enough for V1 notification behavior testing.

Not yet added:

- True background push notifications when Duo is fully closed.
- Service worker push handling.
- Push subscription storage.
- Server-side push delivery.
- Mobile push testing.

Recommended later approach:

- Add service worker support.
- Store browser/device push subscriptions in Supabase.
- Use a Supabase Edge Function or similar server-side function to send true push notifications.
- Keep the same quiet notification rules:
  - new responsibility for me
  - due-soon responsibility
  - returned responsibility
- Avoid chat-like notification noise.

### Returned / Stop deeper testing

Returned cards work as a back-and-forth responsibility decision, but Stop behavior can still be tested more deeply.

Recommended test later:

- User A creates a card for User B.
- User B declines / returns it.
- User A sees the returned card.
- User A either accepts or lets it continue back and forth.
- Confirm Stop appears and works correctly when the return count reaches the intended threshold.
- Confirm Stop moves the card to History as stopped for both users.

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
- Local browser notifications require browser permission.
- Chrome may block notifications at first; the user may need to allow them from the browser permission popup or site settings.
- Incognito can behave differently with notification permissions, so normal Chrome is better for notification testing.
- Local browser notifications only work while Duo is open in the browser.

## Next recommended steps

1. Do one short final QA pass on the main V1 flows.
2. Begin the Duo visual identity and UI polish phase.
3. Later, add true background push notifications if needed.
4. Later, revisit partner connection live-sync if connect / disconnect needs to feel fully realtime.
5. Later, decide whether History removal should stay hard delete or become soft delete.
6. Later, add a real invitation email or shareable invite link.