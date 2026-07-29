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
    'Notification' in window &&
    typeof window.Notification !== 'undefined'
  );
}

export function getBrowserNotificationPermission():
  BrowserNotificationPermission {
  try {
    if (!isBrowserNotificationSupported()) {
      return 'unsupported';
    }

    return Notification.permission;
  } catch (error) {
    console.error(
      'Could not read browser notification permission',
      error
    );

    return 'unsupported';
  }
}

export function areBrowserNotificationsEnabled() {
  try {
    if (!isBrowserNotificationSupported()) {
      return false;
    }

    return (
      Notification.permission === 'granted' &&
      window.localStorage.getItem(
        STORAGE_KEY
      ) === 'true'
    );
  } catch (error) {
    console.error(
      'Could not check browser notification status',
      error
    );

    return false;
  }
}

export async function requestBrowserNotifications() {
  try {
    if (!isBrowserNotificationSupported()) {
      return 'unsupported' as const;
    }

    if (
      typeof Notification.requestPermission !==
      'function'
    ) {
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
  } catch (error) {
    console.error(
      'Could not request browser notification permission',
      error
    );

    try {
      window.localStorage.removeItem(
        STORAGE_KEY
      );
    } catch {
      // Ignore storage cleanup errors.
    }

    return 'unsupported' as const;
  }
}

export function disableBrowserNotifications() {
  try {
    if (typeof window === 'undefined') return;

    window.localStorage.removeItem(
      STORAGE_KEY
    );
  } catch (error) {
    console.error(
      'Could not disable browser notifications',
      error
    );
  }
}

export function showBrowserNotification({
  title,
  body,
  cardId,
}: ShowBrowserNotificationInput) {
  try {
    if (!areBrowserNotificationsEnabled()) {
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
      try {
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
      } catch (error) {
        console.error(
          'Could not handle notification click',
          error
        );
      }
    };
  } catch (error) {
    console.error(
      'Could not show browser notification',
      error
    );
  }
}