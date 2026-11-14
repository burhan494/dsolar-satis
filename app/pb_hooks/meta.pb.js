/// <reference path="../pb_data/types.d.ts" />
// Meta reklam bağlantısı: 10 dakikada bir yeni form doldurucuları çeker (harcama saatte bir), ayar ve özet uçları.
cronAdd("meta_senk", "*/10 * * * *", () => { try { require(`${__hooks}/meta_lib.js`).senk($app, false); } catch (e) { console.log("meta senk hatası", e); } });
routerAdd("POST", "/api/dsolar/meta-ayar", (e) => {
  const a = e.auth; if (!a || !a.getBool("aktif") || a.getString("rol") !== "yonetici") return e.json(403, { mesaj: "Yalnız yönetici bağlayabilir" });
  try { const r = require(`${__hooks}/meta_lib.js`).ayarKaydet(e.app, e.requestInfo().body || {}); let s = {}; try { s = require(`${__hooks}/meta_lib.js`).senk(e.app, true); } catch (x) {} return e.json(200, Object.assign(r, { senk: s })); }
  catch (x) { return e.json(400, { mesaj: String((x && x.message) || x) }); }
}, $apis.requireAuth("users"));
routerAdd("POST", "/api/dsolar/meta-senk", (e) => {
  const a = e.auth; if (!a || !a.getBool("aktif") || ["yonetici", "satis"].indexOf(a.getString("rol")) < 0) return e.json(403, { mesaj: "Yetki yok" });
  try { return e.json(200, require(`${__hooks}/meta_lib.js`).senk(e.app, true)); } catch (x) { return e.json(502, { mesaj: String((x && x.message) || x) }); }
}, $apis.requireAuth("users"));
routerAdd("GET", "/api/dsolar/meta-ozet", (e) => {
  const a = e.auth; if (!a || !a.getBool("aktif") || ["yonetici", "satis"].indexOf(a.getString("rol")) < 0) return e.json(403, { mesaj: "Yetki yok" });
  try { return e.json(200, require(`${__hooks}/meta_lib.js`).ozet(e.app, a, e.request.url.query().get("gun"))); } catch (x) { return e.json(500, { mesaj: String((x && x.message) || x) }); }
}, $apis.requireAuth("users"));
