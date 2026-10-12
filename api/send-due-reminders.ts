import {
  createClient,
} from '@supabase/supabase-js';

import webPush from 'web-push';

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

type CardRow = {
  id: string;
  type:
    | 'transport'
    | 'pay'
    | 'acquire'
    | 'appointment'
    | 'maintenance';
  state: 'accepted';
  owner_id: string;
  payload: any;
  due_at: string;
  reminder_sent_at: string | null;
};

function getEnvValue(
  key: string
) {
  const value =
    process.env[key];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}`
    );
  }

  return value;
}

function getCardTitle(
  card: CardRow
) {
  if (card.type === 'transport') {
    return card.payload?.title
      ? String(card.payload.title)
      : 'Transport request';
  }

  if (card.type === 'pay') {
    return card.payload?.title
      ? String(card.payload.title)
      : 'Payment request';
  }

  if (card.type === 'acquire') {
    return card.payload?.item
      ? `Get ${String(card.payload.item)}`
      : 'Purchase request';
  }

  if (card.type === 'appointment') {
    return card.payload?.title
      ? String(card.payload.title)
      : 'Appointment request';
  }

  if (card.type === 'maintenance') {
    return card.payload?.title
      ? `Fix ${String(card.payload.title)}`
      : 'Maintenance request';
  }

  return 'Responsibility';
}

function isAuthorizedCronRequest(
  req: any
) {
  const cronSecret =
    process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  return (
    req.headers.authorization ===
    `Bearer ${cronSecret}`
  );
}

export default async function handler(
  req: any,
  res: any
) {
  if (
    req.method !== 'GET' &&
    req.method !== 'POST'
  ) {
    res.status(405).json({
      error: 'Method not allowed',
    });

    return;
  }

  if (!isAuthorizedCronRequest(req)) {
    res.status(401).json({
      error: 'Unauthorized',
    });

    return;
  }

  try {
    const supabaseUrl =
      getEnvValue(
        'VITE_SUPABASE_URL'
      );

    const supabaseServiceRoleKey =
      getEnvValue(
        'SUPABASE_SERVICE_ROLE_KEY'
      );

    const vapidPublicKey =
      process.env
        .VAPID_PUBLIC_KEY ||
      process.env
        .VITE_VAPID_PUBLIC_KEY;

    const vapidPrivateKey =
      getEnvValue(
        'VAPID_PRIVATE_KEY'
      );

    const vapidSubject =
      process.env
        .VAPID_SUBJECT ||
      'mailto:hello@example.com';

    if (!vapidPublicKey) {
      throw new Error(
        'Missing VAPID_PUBLIC_KEY or VITE_VAPID_PUBLIC_KEY'
      );
    }

    const serviceClient =
      createClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

    const now =
      new Date();

    const reminderWindowEnd =
      new Date(
        now.getTime() +
          60 * 60 * 1000
      );

    const {
      data: dueCards,
      error: dueCardsError,
    } = await serviceClient
      .from('cards')
      .select(
        'id, type, state, owner_id, payload, due_at, reminder_sent_at'
      )
      .eq('state', 'accepted')
      .not('due_at', 'is', null)
      .is('reminder_sent_at', null)
      .gte(
        'due_at',
        now.toISOString()
      )
      .lte(
        'due_at',
        reminderWindowEnd.toISOString()
      )
      .order('due_at', {
        ascending: true,
      });

    if (dueCardsError) {
      throw dueCardsError;
    }

    if (
      !dueCards ||
      dueCards.length === 0
    ) {
      res.status(200).json({
        ok: true,
        checked: 0,
        sent: 0,
      });

      return;
    }

    webPush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    let sentCount = 0;
    const results = [];

    for (const rawCard of dueCards) {
      const card =
        rawCard as CardRow;

      const claimedAt =
        new Date().toISOString();

      const {
        data: claimedCard,
        error: claimError,
      } = await serviceClient
        .from('cards')
        .update({
          reminder_sent_at:
            claimedAt,
        })
        .eq('id', card.id)
        .eq('state', 'accepted')
        .is(
          'reminder_sent_at',
          null
        )
        .select('id')
        .maybeSingle();

      if (claimError) {
        results.push({
          cardId: card.id,
          ok: false,
          reason:
            'Could not claim reminder',
        });

        continue;
      }

      if (!claimedCard) {
        continue;
      }

      const {
        data: subscriptions,
        error:
          subscriptionsError,
      } = await serviceClient
        .from(
          'push_subscriptions'
        )
        .select(
          'id, endpoint, p256dh, auth'
        )
        .eq(
          'user_id',
          card.owner_id
        );

      if (subscriptionsError) {
        await serviceClient
          .from('cards')
          .update({
            reminder_sent_at:
              null,
          })
          .eq('id', card.id)
          .eq(
            'reminder_sent_at',
            claimedAt
          );

        results.push({
          cardId: card.id,
          ok: false,
          reason:
            'Could not load push subscriptions',
        });

        continue;
      }

      if (
        !subscriptions ||
        subscriptions.length === 0
      ) {
        await serviceClient
          .from('cards')
          .update({
            reminder_sent_at:
              null,
          })
          .eq('id', card.id)
          .eq(
            'reminder_sent_at',
            claimedAt
          );

        results.push({
          cardId: card.id,
          ok: false,
          reason:
            'No push subscriptions found',
        });

        continue;
      }

      const payload =
        JSON.stringify({
          title: 'Upcoming',
          body:
            getCardTitle(card),
          cardId: card.id,
          eventType:
            'upcoming',
        });

      let cardSent = false;

      for (
        const subscription of
        subscriptions as PushSubscriptionRow[]
      ) {
        try {
          await webPush.sendNotification(
            {
              endpoint:
                subscription.endpoint,
              keys: {
                p256dh:
                  subscription.p256dh,
                auth:
                  subscription.auth,
              },
            },
            payload
          );

          cardSent = true;
        } catch (error: any) {
          if (
            error?.statusCode === 404 ||
            error?.statusCode === 410
          ) {
            await serviceClient
              .from(
                'push_subscriptions'
              )
              .delete()
              .eq(
                'id',
                subscription.id
              );
          }
        }
      }

      if (cardSent) {
        sentCount += 1;

        results.push({
          cardId: card.id,
          ok: true,
        });
      } else {
        await serviceClient
          .from('cards')
          .update({
            reminder_sent_at:
              null,
          })
          .eq('id', card.id)
          .eq(
            'reminder_sent_at',
            claimedAt
          );

        results.push({
          cardId: card.id,
          ok: false,
          reason:
            'Push delivery failed',
        });
      }
    }

    res.status(200).json({
      ok: true,
      checked:
        dueCards.length,
      sent:
        sentCount,
      results,
    });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Could not send due reminders.',
    });
  }
}
