/// <reference path="../pb_data/types.d.ts" />
// Mevcut projelerin Finans'taki planlı malzeme giderlerini KDV dahil tutara günceller. Gerçekleşmiş kayıtlara dokunulmaz.
migrate((app) => {
  let L = null; try { L = require(`${__hooks}/proje_lib.js`); } catch (x) { console.log("proje_lib yüklenemedi; planlar ilk proje güncellemesinde yenilenir", x); return; }
  app.findAllRecords("projeler").forEach((p) => { if (p.getBool("planAktarildi")) { try { L.planYenile(app, p); } catch (x) { console.log("plan güncellenemedi", p.id, x); } } });
}, (app) => {});
