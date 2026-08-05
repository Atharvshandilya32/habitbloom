importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// This will be overridden dynamically by the client, but required for init
const firebaseConfig = {
  apiKey: "PLACEHOLDER",
  authDomain: "PLACEHOLDER",
  projectId: "PLACEHOLDER",
  storageBucket: "PLACEHOLDER",
  messagingSenderId: "PLACEHOLDER",
  appId: "PLACEHOLDER"
};

// Retrieve config from URL params if passed (optional trick for SW initialization)
const urlParams = new URLSearchParams(location.search);
const apiKey = urlParams.get('apiKey');
if (apiKey) {
  firebaseConfig.apiKey = apiKey;
  firebaseConfig.authDomain = urlParams.get('authDomain');
  firebaseConfig.projectId = urlParams.get('projectId');
  firebaseConfig.storageBucket = urlParams.get('storageBucket');
  firebaseConfig.messagingSenderId = urlParams.get('messagingSenderId');
  firebaseConfig.appId = urlParams.get('appId');
}

// Ensure the app is initialized
try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'HabitBloom Reminder';
    const notificationOptions = {
      body: payload.notification?.body,
      icon: '/assets/icon-192.png'
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch(e) {
  console.log('Firebase SW initialization error:', e);
}
