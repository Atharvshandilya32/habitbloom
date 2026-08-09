importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// We use an empty object here and inject the config via URL query params 
// when registering the service worker in our app, since process.env is not available here.
const params = new URLSearchParams(self.location.search);
const configStr = params.get('config');

if (configStr) {
  try {
    const config = JSON.parse(decodeURIComponent(configStr));
    firebase.initializeApp(config);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      const notificationTitle = payload.notification?.title || 'HabitBloom';
      const notificationOptions = {
        body: payload.notification?.body,
        icon: '/assets/notification-icon.png'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (err) {
    console.error('Failed to parse Firebase config in SW', err);
  }
}
