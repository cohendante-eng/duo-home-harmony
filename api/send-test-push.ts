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
          userData.user.id
        );
  
      if (subscriptionsError) {
        throw subscriptionsError;
      }
  
      if (
        !subscriptions ||
        subscriptions.length === 0
      ) {
        res.status(404).json({
          error:
            'No push subscriptions found for this user.',
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
          title: 'Duo',
          body: 'Test notification from Duo.',
          cardId: null,
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
            : 'Could not send test push.',
      });
    }
  }