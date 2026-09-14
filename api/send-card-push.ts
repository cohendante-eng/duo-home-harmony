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

  state:
    | 'requested'
    | 'accepted'
    | 'delayed'
    | 'done'
    | 'cancelled'
    | 'stopped'
    | 'expired';

  owner_id: string;

  creator_id: string;

  payload: any;
};

type CardPushEvent =
  | 'created'
  | 'accepted'
  | 'done'
  | 'returned'
  | 'cancelled'
  | 'delayed'
  | 'stopped';

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

function getBearerToken(
  authorizationHeader:
    | string
    | undefined
) {
  if (!authorizationHeader) {
    return null;
  }

  const [type, token] =
    authorizationHeader.split(' ');

  if (
    type !== 'Bearer' ||
    !token
  ) {
    return null;
  }

  return token;
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

function getEventType(
  value: unknown
): CardPushEvent {
  if (
    value === 'accepted' ||
    value === 'done' ||
    value === 'returned' ||
    value === 'cancelled' ||
    value === 'delayed' ||
    value === 'stopped'
  ) {
    return value;
  }

  return 'created';
}

function getNotificationText({
  eventType,
  card,
}: {
  eventType: CardPushEvent;
  card: CardRow;
}) {
  const cardTitle =
    getCardTitle(card);

  if (eventType === 'created') {
    return {
      title: 'New responsibility in Duo',
      body: cardTitle,
    };
  }

  if (eventType === 'accepted') {
    return {
      title: 'Responsibility accepted',
      body: cardTitle,
    };
  }

  if (eventType === 'done') {
    return {
      title: 'Responsibility done',
      body: cardTitle,
    };
  }

  if (eventType === 'returned') {
    return {
      title: 'Returned to you',
      body: cardTitle,
    };
  }

  if (eventType === 'cancelled') {
    return {
      title: 'Responsibility cancelled',
      body: cardTitle,
    };
  }

  if (eventType === 'delayed') {
    return {
      title: 'Responsibility rescheduled',
      body: cardTitle,
    };
  }

  if (eventType === 'stopped') {
    return {
      title: 'Responsibility stopped',
      body: cardTitle,
    };
  }

  return {
    title: 'Duo update',
    body: cardTitle,
  };
}

function getRecipientUserId({
  eventType,
  card,
  actorUserId,
}: {
  eventType: CardPushEvent;
  card: CardRow;
  actorUserId: string;
}) {
  if (eventType === 'created') {
    return card.owner_id;
  }

  if (
    eventType === 'accepted' ||
    eventType === 'done'
  ) {
    return card.creator_id;
  }

  if (
    eventType === 'returned' ||
    eventType === 'delayed'
  ) {
    return card.owner_id;
  }

  if (
    eventType === 'cancelled' ||
    eventType === 'stopped'
  ) {
    if (
      card.creator_id &&
      card.creator_id !== actorUserId
    ) {
      return card.creator_id;
    }

    return card.owner_id;
  }

  return card.owner_id;
}

function canUserSendEvent({
  eventType,
  card,
  actorUserId,
}: {
  eventType: CardPushEvent;
  card: CardRow;
  actorUserId: string;
}) {
  if (eventType === 'created') {
    return card.creator_id === actorUserId;
  }

  if (
    eventType === 'accepted' ||
    eventType === 'done' ||
    eventType === 'delayed'
  ) {
    return card.owner_id === actorUserId;
  }

  if (
    eventType === 'cancelled' ||
    eventType === 'stopped'
  ) {
    return (
      card.owner_id === actorUserId ||
      card.creator_id === actorUserId
    );
  }

  if (eventType === 'returned') {
    return true;
  }

  return false;
}

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method not allowed',
    });

    return;
  }

  try {
    const supabaseUrl =
      getEnvValue(
        'VITE_SUPABASE_URL'
      );

    const supabaseAnonKey =
      getEnvValue(
        'VITE_SUPABASE_ANON_KEY'
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

    const token =
      getBearerToken(
        req.headers.authorization
      );

    if (!token) {
      res.status(401).json({
        error: 'Missing auth token',
      });

      return;
    }

    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;

    const cardId =
      body?.cardId;

    const eventType =
      getEventType(
        body?.eventType
      );

    if (!cardId) {
      res.status(400).json({
        error: 'Missing cardId',
      });

      return;
    }

    const userClient =
      createClient(
        supabaseUrl,
        supabaseAnonKey
      );

    const {
      data: userData,
      error: userError,
    } =
      await userClient.auth.getUser(
        token
      );

    if (
      userError ||
      !userData.user
    ) {
      res.status(401).json({
        error: 'Invalid auth token',
      });

      return;
    }

    const actorUserId =
      userData.user.id;

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

    const {
      data: card,
      error: cardError,
    } = await serviceClient
      .from('cards')
      .select(
        'id, type, state, owner_id, creator_id, payload'
      )
      .eq('id', cardId)
      .maybeSingle();

    if (cardError) {
      throw cardError;
    }

    if (!card) {
      res.status(404).json({
        error: 'Card not found',
      });

      return;
    }

    const cardRow =
      card as CardRow;

    if (
      !canUserSendEvent({
        eventType,
        card: cardRow,
        actorUserId,
      })
    ) {
      res.status(403).json({
        error:
          'You cannot send this card notification.',
      });

      return;
    }

    const recipientUserId =
      getRecipientUserId({
        eventType,
        card: cardRow,
        actorUserId,
      });

    if (
      !recipientUserId ||
      recipientUserId === actorUserId
    ) {
      res.status(200).json({
        ok: true,
        skipped: true,
        reason:
          'No other user to notify.',
      });

      return;
    }

    const {
      data: subscriptions,
      error: subscriptionsError,
    } = await serviceClient
      .from('push_subscriptions')
      .select(
        'id, endpoint, p256dh, auth'
      )
      .eq(
        'user_id',
        recipientUserId
      );

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    if (
      !subscriptions ||
      subscriptions.length === 0
    ) {
      res.status(200).json({
        ok: true,
        skipped: true,
        reason:
          'No push subscriptions found for recipient.',
      });

      return;
    }

    webPush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    const notificationText =
      getNotificationText({
        eventType,
        card: cardRow,
      });

    const payload =
      JSON.stringify({
        title:
          notificationText.title,
        body:
          notificationText.body,
        cardId: cardRow.id,
        eventType,
      });

    const results =
      await Promise.allSettled(
        (
          subscriptions as PushSubscriptionRow[]
        ).map(
          async (
            subscription
          ) => {
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

              return {
                id: subscription.id,
                ok: true,
              };
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

              return {
                id: subscription.id,
                ok: false,
                statusCode:
                  error?.statusCode,
                message:
                  error?.message,
              };
            }
          }
        )
      );

    res.status(200).json({
      ok: true,
      eventType,
      sentTo:
        subscriptions.length,
      recipientUserId,
      results,
    });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Could not send card push.',
    });
  }
}