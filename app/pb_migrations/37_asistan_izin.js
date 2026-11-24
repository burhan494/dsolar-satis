/// <reference path="../pb_data/types.d.ts" />
// v88: Claude asistan bağlantısını yalnız Burhan Gökdemir kullanabilir (izin listesi). Kayıt zaten varsa dokunulmaz.
migrate((app) => {
  try { app.findFirstRecordByFilter("fin_ayarlar", "anahtar = 'asistan_izin'"); return; } catch (e) {}
  const r = new Record(app.findCollectionByNameOrId("fin_ayarlar"));
  r.set("anahtar", "asistan_izin"); r.set("deger", { eposta: ["burhan@drk-enerji.com"] }); app.save(r);
}, (app) => { try { app.delete(app.findFirstRecordByFilter("fin_ayarlar", "anahtar = 'asistan_izin'")); } catch (e) {} });
