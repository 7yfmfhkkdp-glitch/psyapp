// Offline-Unterstützung für „Befund lernen“: hält die App-Datei (bei der geschützten Version verschlüsselt) auf dem Gerät vor.
// Mit Netz wird immer die aktuelle Version geladen, ohne Netz die zuletzt gespeicherte.
const CACHE = "befund-lernen-v1";
const CORE = ["./", "./index.html"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  // Nur ältere Fassungen des eigenen Caches löschen: mehrere Apps (Psyntax, Psychodiagnostik) teilen sich die Domain und damit den Cache-Speicher.
  const FAM = CACHE.replace(/-v\d+$/, "-v");
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.startsWith(FAM)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("./index.html")))
  );
});
