/// <reference path="../pb_data/types.d.ts" />
// Saatte bir iSolarCloud senkronu ve yöneticinin "Şimdi çek" düğmesi için uç nokta.
cronAdd("isc_senk", "17 * * * *", () => { try { require(`${__hooks}/isc_lib.js`).senk($app, false); } catch (e) { console.log("isc senk hatası", e); } });
routerAdd("POST", "/api/dsolar/isc-senk", (e) => {
  const a = e.auth;
  if (!a || !a.getBool("aktif") || (a.getString("rol") !== "yonetici" && a.getString("y_ges") !== "d")) return e.json(403, { mesaj: "GES düzenleme yetkisi gerekli" });
  return e.json(200, require(`${__hooks}/isc_lib.js`).senk($app, true));
}, $apis.requireAuth("users"));
// Bağlantı bilgilerini kaydet (gizli alanlar API'den yazılamadığı için sunucu tarafında yazılır)
routerAdd("POST", "/api/dsolar/isc-ayar", (e) => {
  const a = e.auth;
  if (!a || a.getString("rol") !== "yonetici" || !a.getBool("aktif")) return e.json(403, { mesaj: "Yalnız yönetici" });
  const b = e.requestInfo().body || {};
  let r; try { r = $app.findFirstRecordByFilter("isc_ayar", "anahtar = 'ana'"); } catch (x) { r = new Record($app.findCollectionByNameOrId("isc_ayar")); r.set("anahtar", "ana"); }
  ["appkey", "secret", "sifre"].forEach((k) => { if (b[k]) r.set(k, String(b[k]).trim()); });
  ["kullanici", "gw", "baslangic", "psId"].forEach((k) => { if (b[k] != null) r.set(k, String(b[k]).trim()); });
  if (b.appkey || b.secret || b.sifre || b.kullanici) { r.set("token", ""); r.set("tokenAt", 0); }
  $app.save(r);
  return e.json(200, { tamam: true });
}, $apis.requireAuth("users"));
