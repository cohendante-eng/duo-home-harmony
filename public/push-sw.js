self.addEventListener('push', (event) => {
    let data = {
      title: 'Duo',
      body: 'You have a new Duo update.',
      cardId: null,
    };
  
    if (event.data) {
      try {
        data = {
          ...data,
          ...event.data.json(),
        };
      } catch {
        data.body = event.data.text();
      }
    }
  
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.cardId
        ? `duo-card-${data.cardId}`
        : 'duo-notification',
      data: {
        cardId: data.cardId,
        url: data.cardId
          ? `/?cardId=${data.cardId}`
          : '/',
      },
    };
  
    event.waitUntil(
      self.registration.showNotification(
        data.title,
        options
      )
    );
  });
  
  self.addEventListener(
    'notificationclick',
    (event) => {
      event.notification.close();
  
      const targetUrl =
        event.notification.data?.url || '/';
  
      event.waitUntil(
        clients
          .matchAll({
            type: 'window',
            includeUncontrolled: true,
          })
          .then((clientList) => {
            for (const client of clientList) {
              if (
                'focus' in client
              ) {
                client.focus();
  
                client.postMessage({
                  type: 'DUO_OPEN_CARD',
                  cardId:
                    event.notification.data
                      ?.cardId || null,
                });
  
                return;
              }
            }
  
            if (
              clients.openWindow
            ) {
              return clients.openWindow(
                targetUrl
              );
            }
          })
      );
    }
  );