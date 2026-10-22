// Service Worker - SHFMU "Emin Duraku" - platforma e klasave I–V - v1 (20.10.2026)
// Fshin VETËM kopjet e veta të vjetra (emin-duraku-15-*) - jo ato të platformës VI–IX në të njëjtin domen.
// RREGULLIM: me v2, aplikacioni hapej nga kopja e vjetër në pajisje dhe versioni i ri dilte
// vetëm herën tjetër - kështu pajisje/dritare të ndryshme shfaqnin versione të ndryshme.
// Tani: me internet merret GJITHMONË versioni më i ri (nëse rrjeti përgjigjet brenda 4 sekondave);
// pa internet ose me rrjet shumë të dobët hapet kopja e ruajtur.
// • Firebase dhe shërbimet e jashtme NUK kalojnë këtu.
var CACHE = 'emin-duraku-15-v1';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
var NET_TIMEOUT = 4000;

self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(FILES); }).then(function() { return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e) {
    e.waitUntil(caches.keys().then(function(keys) {
        return Promise.all(keys.filter(function(k) { return k.indexOf('emin-duraku-15-') === 0 && k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e) {
    var req = e.request;
    if (req.method !== 'GET') return;
    var url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    var isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
    if (isPage) {
        var network = fetch(req, { cache: 'no-store' }).then(function(res) {
            if (res && res.ok) {
                var copy = res.clone();
                caches.open(CACHE).then(function(c) { c.put('./index.html', copy); });
            }
            return res;
        });
        var timeout = new Promise(function(resolve) { setTimeout(resolve, NET_TIMEOUT, null); });
        e.respondWith(Promise.race([network.catch(function() { return null; }), timeout]).then(function(res) {
            if (res) return res;
            // rrjet i ngadaltë/pa internet: kopja e ruajtur (versioni i ri ruhet në sfond kur të vijë)
            e.waitUntil(network.catch(function() {}));
            return caches.match('./index.html').then(function(c) { return c || network; });
        }));
        return;
    }
    e.respondWith(caches.match(req).then(function(r) { return r || fetch(req); }));
});
