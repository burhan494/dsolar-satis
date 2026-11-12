/// <reference path="../pb_data/types.d.ts" />
// Her gün 07:05 ve 13:05 (TR): vadesi yaklaşan onaysız ödemeler yöneticinin onay listesine düşer.
cronAdd("onay_tara", "5 4,10 * * *", () => { try { require(`${__hooks}/onay_lib.js`).tara($app); } catch (e) { console.log("onay tarama hatası", e); } });
routerAdd("POST", "/api/dsolar/onay-tara", (e) => {
  const a = e.auth;
  if (!a || !a.getBool("aktif") || (a.getString("rol") !== "yonetici" && a.getString("y_fin") !== "d" && a.getString("y_odeme") !== "d")) return e.json(403, { mesaj: "Yetki yok" });
  try { return e.json(200, require(`${__hooks}/onay_lib.js`).tara($app)); } catch (x) { return e.json(500, { mesaj: String((x && x.message) || x) }); }
}, $apis.requireAuth("users"));
