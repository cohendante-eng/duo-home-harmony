import {
    supabase,
  } from './supabase';
  
  type PushNotificationStatus =
    | 'unsupported'
    | 'missing-public-key'
    | 'blocked'
    | 'denied'
    | 'subscribed';
  
  function urlBase64ToUint8Array(
    base64String: string
  ) {
    const padding =
      '='.repeat(
        (4 -
          (base64String.length % 4)) %
          4
      );
  
    const base64 =
      (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
  
    const rawData =
      window.atob(base64);
  
    const outputArray =
      new Uint8Array(rawData.length);
  
    for (
      let i = 0;
      i < rawData.length;
      i += 1
    ) {
      outputArray[i] =
        rawData.charCodeAt(i);
    }
  
    return outputArray;
  }
  
  function getVapidPublicKey() {
    return import.meta.env
      .VITE_VAPID_PUBLIC_KEY as
      | string
      | undefined;
  }
  
  export function isPushNotificationSupported() {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }
  
  export function getPushPermissionStatus():
    | NotificationPermission
    | 'unsupported' {
    if (!isPushNotificationSupported()) {
      return 'unsupported';
    }
  
    return Notification.permission;
  }
  
  async function getCurrentUserId() {
    const {
      data,
      error,
    } = await supabase.auth.getUser();
  
    if (error) {
      throw error;
    }
  
    if (!data.user?.id) {
      throw new Error(
        'You need to be signed in.'
      );
    }
  
    return data.user.id;
  }
  
  export async function registerPushNotifications():
    Promise<PushNotificationStatus> {
    if (!isPushNotificationSupported()) {
      return 'unsupported';
    }
  
    const vapidPublicKey =
      getVapidPublicKey();
  
    if (!vapidPublicKey) {
      return 'missing-public-key';
    }
  
    if (
      Notification.permission === 'denied'
    ) {
      return 'blocked';
    }
  
    const permission =
      Notification.permission ===
      'granted'
        ? 'granted'
        : await Notification.requestPermission();
  
    if (permission !== 'granted') {
      return 'denied';
    }
  
    const userId =
      await getCurrentUserId();
  
    const existingRegistrations =
      await navigator.serviceWorker.getRegistrations();
  
    await Promise.all(
      existingRegistrations.map(
        async (registration) => {
          const scriptUrl =
            registration.active?.scriptURL ||
            registration.installing?.scriptURL ||
            registration.waiting?.scriptURL ||
            '';
  
          if (
            scriptUrl.includes(
              '/push-sw.js'
            )
          ) {
            await registration.unregister();
          }
        }
      )
    );
  
    const registration =
      await navigator.serviceWorker.register(
        '/sw.js',
        {
          scope: '/',
        }
      );
  
    await navigator.serviceWorker.ready;
  
    const existingSubscription =
      await registration.pushManager.getSubscription();
  
    const subscription =
      existingSubscription ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(
            vapidPublicKey
          ),
      }));
  
    const json =
      subscription.toJSON();
  
    const p256dh =
      json.keys?.p256dh;
  
    const auth =
      json.keys?.auth;
  
    if (
      !subscription.endpoint ||
      !p256dh ||
      !auth
    ) {
      throw new Error(
        'Could not read push subscription keys.'
      );
    }
  
    const {
      error,
    } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint:
            subscription.endpoint,
          p256dh,
          auth,
          user_agent:
            navigator.userAgent,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            'user_id,endpoint',
        }
      );
  
    if (error) {
      throw error;
    }
  
    return 'subscribed';
  }
  
  export async function unregisterPushNotifications() {
    if (!isPushNotificationSupported()) {
      return;
    }
  
    const registration =
      await navigator.serviceWorker.getRegistration(
        '/'
      );
  
    const subscription =
      await registration?.pushManager.getSubscription();
  
    if (!subscription) {
      return;
    }
  
    const {
      error,
    } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq(
        'endpoint',
        subscription.endpoint
      );
  
    if (error) {
      throw error;
    }
  
    await subscription.unsubscribe();
  }
  
  export async function sendTestPushNotification() {
    const {
      data,
      error,
    } =
      await supabase.auth.getSession();
  
    if (error) {
      throw error;
    }
  
    const accessToken =
      data.session?.access_token;
  
    if (!accessToken) {
      throw new Error(
        'You need to be signed in.'
      );
    }
  
    const response =
      await fetch(
        '/api/send-test-push',
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        }
      );
  
    const responseData =
      await response.json().catch(
        () => null
      );
  
    if (!response.ok) {
      throw new Error(
        responseData?.error ||
          'Could not send test notification.'
      );
    }
  
    return responseData;
  }