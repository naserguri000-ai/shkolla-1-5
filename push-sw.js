/*! © 2025–2026 Naser Guri – Sistemi i Menaxhimit Shkollor. Të gjitha të drejtat e rezervuara. */
// 📱 Service worker VETËM për njoftimet në telefon (fushëveprim i veçantë ./push/ - nuk prek sw.js e aplikacionit)
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function (e) {
  var d = {};
  try { var j = e.data ? e.data.json() : {}; d = j.data || j.notification || j; } catch (x) { d = { title: 'Njoftim i ri', body: e.data ? e.data.text() : '' }; }
  var app = new URL('../', self.registration.scope).href;
  e.waitUntil(self.registration.showNotification('📢 ' + (d.title || 'Njoftim i ri'), {
    body: (d.body || '') + (d.by ? '\n— ' + d.by : ''),
    icon: app + 'icon-192.png', badge: app + 'icon-192.png',
    tag: 'nt-' + (d.nid || Date.now()), renotify: true,
    requireInteraction: d.imp === '1',
    data: { url: app }
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || new URL('../', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (L) {
    for (var i = 0; i < L.length; i++) if (L[i].url.indexOf(url) === 0 && 'focus' in L[i]) { L[i].postMessage({ ntOpen: 1 }); return L[i].focus(); }
    return self.clients.openWindow(url + '#njoftimet');
  }));
});
