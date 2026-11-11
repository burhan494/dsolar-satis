/// <reference path="../pb_data/types.d.ts" />
// TCMB kurları: iş günleri 15:40, 16:10 ve 10:05 (TR saati) çekilir; kur 15:30 civarı açıklanır.
cronAdd("kur_tcmb", "40,10 12,13 * * 1-5", () => { try { require(`${__hooks}/kur_lib.js`).kurCek($app, false); } catch (e) { console.log("kur hatası", e); } });
cronAdd("kur_tcmb_sabah", "5 7 * * 1-5", () => { try { require(`${__hooks}/kur_lib.js`).kurCek($app, false); } catch (e) { console.log("kur hatası", e); } });
routerAdd("POST", "/api/dsolar/kur-cek", (e) => {
  const a = e.auth;
  if (!a || !a.getBool("aktif") || ["yonetici", "muhasebe"].indexOf(a.getString("rol")) < 0) return e.json(403, { mesaj: "Yetki yok" });
  try { return e.json(200, require(`${__hooks}/kur_lib.js`).kurCek($app, true)); } catch (x) { return e.json(502, { mesaj: "TCMB'ye ulaşılamadı: " + String((x && x.message) || x) }); }
}, $apis.requireAuth("users"));
