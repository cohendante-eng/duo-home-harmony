const STORAGE_KEY =
  'duo-browser-notifications-enabled';

type BrowserNotificationPermission =
  | 'unsupported'
  | NotificationPermission;

type ShowBrowserNotificationInput = {
  title: string;

  body: string;

  cardId?: string;
};

export function isBrowserNotificationSupported() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window
  );
}

export function getBrowserNotificationPermission():
  BrowserNotificationPermission {
  if (!isBrowserNotificationSupported()) {
    return 'unsupported';
  }

  return Notification.permission;
}

export function areBrowserNotificationsEnabled() {
  if (!isBrowserNotificationSupported()) {
    return false;
  }

  return (
    Notification.permission ===
      'granted' &&
    window.localStorage.getItem(
      STORAGE_KEY
    ) === 'true'
  );
}

export async function requestBrowserNotifications() {
  if (!isBrowserNotificationSupported()) {
    return 'unsupported' as const;
  }

  const permission =
    await Notification.requestPermission();

  if (permission === 'granted') {
    window.localStorage.setItem(
      STORAGE_KEY,
      'true'
    );
  } else {
    window.localStorage.removeItem(
      STORAGE_KEY
    );
  }

  return permission;
}

export function disableBrowserNotifications() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(
    STORAGE_KEY
  );
}

export function showBrowserNotification({
  title,
  body,
  cardId,
}: ShowBrowserNotificationInput) {
  if (
    !areBrowserNotificationsEnabled()
  ) {
    return;
  }

  const notification =
    new Notification(title, {
      body,

      tag: cardId
        ? `duo-card-${cardId}`
        : 'duo-notification',
    });

  notification.onclick = () => {
    window.focus();

    if (cardId) {
      window.dispatchEvent(
        new CustomEvent(
          'duo:open-card',
          {
            detail: {
              cardId,
            },
          }
        )
      );
    }

    notification.close();
  };
}