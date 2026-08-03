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
    owner_id: string;
    creator_id: string;
    payload: any;
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
  
    return 'New responsibility';
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
          'id, type, owner_id, creator_id, payload'
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
        cardRow.creator_id !==
        userData.user.id
      ) {
        res.status(403).json({
          error:
            'Only the creator can send this card notification.',
        });
  
        return;
      }
  
      if (
        cardRow.owner_id ===
        userData.user.id
      ) {
        res.status(200).json({
          ok: true,
          skipped: true,
          reason:
            'Card owner is the creator.',
        });
  
        return;
      }
  
      const {
        data: subscriptions,
        error:
          subscriptionsError,
      } = await serviceClient
        .from('push_subscriptions')
        .select(
          'id, endpoint, p256dh, auth'
        )
        .eq(
          'user_id',
          cardRow.owner_id
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
            'No push subscriptions found for card owner.',
        });
  
        return;
      }
  
      webPush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
      );
  
      const payload =
        JSON.stringify({
          title: 'New responsibility in Duo',
          body: getCardTitle(
            cardRow
          ),
          cardId: cardRow.id,
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
                  error?.statusCode ===
                    404 ||
                  error?.statusCode ===
                    410
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
        sentTo:
          subscriptions.length,
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