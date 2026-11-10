/// <reference path="../pb_data/types.d.ts" />
// Ön hesap ayarları: tarife, verim, sözleşme gücü kuralı, fiyat eğrisi. Yalnız yönetici değiştirir.
migrate((app) => {
  const c = new Collection({ type: "base", name: "ayarlar", fields: [
    { name: "anahtar", type: "text", required: true },
    { name: "deger", type: "json", maxSize: 20000 },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ],
    indexes: ["CREATE UNIQUE INDEX idx_ayar_anahtar ON ayarlar (anahtar)"] });
  c.listRule = "@request.auth.aktif = true && @request.auth.rol != 'ortak'"; c.viewRule = c.listRule;
  c.createRule = "@request.auth.aktif = true && @request.auth.rol = 'yonetici'"; c.updateRule = c.createRule; c.deleteRule = null;
  app.save(c);
  const r = new Record(c);
  r.set("anahtar", "hesap");
  r.set("deger", {
    k1Limit: 240, k1: 3.40, k2: 5.04, tarifeDonem: "Nisan 2026 mesken kademe fiyatları (vergiler dahil); EPDK bülteniyle güncellenmeli",
    ozgulVerim: 1350, panelW: 615, dcAc: 1.3, varsayimSoz: 10, kesifAlt: 3, kesifUst: 20,
    fiyatSabit: 4925, fiyatKwp: 404, fiyatKaynak: "Telefondaki katalogdan türetildi (10.11.2026, en küçük kareler; sapma ±%5): 3,1 kWp 6.345 USD; 11,1 kWp 9.329 USD; 17,2 kWp 12.127 USD",
    kur: 50.1, kdv: 0.20, aralik: 0.10 });
  app.save(r);
}, (app) => { try { app.delete(app.findCollectionByNameOrId("ayarlar")); } catch (e) {} });
