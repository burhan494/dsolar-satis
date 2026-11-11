/// <reference path="../pb_data/types.d.ts" />
// OSOS sayaç dosyası verileri (gün/saat üretim, çekiş, reaktif endeksleri) ve reaktif takibi için alanlar.
migrate((app) => {
  const c = app.findCollectionByNameOrId("ges_aylik");
  const ekle = (f) => { if (!c.fields.getByName(f.name)) c.fields.add(f); };
  ekle(new JSONField({ name: "osGun", maxSize: 20000 }));
  ekle(new JSONField({ name: "osSaat", maxSize: 200000 }));
  ekle(new NumberField({ name: "osCekis" }));
  ekle(new NumberField({ name: "osRi" }));
  ekle(new NumberField({ name: "osRc" }));
  ekle(new NumberField({ name: "osCap" }));
  ekle(new TextField({ name: "osSayac", max: 40 }));
  ekle(new TextField({ name: "osDosya", max: 200 }));
  ekle(new DateField({ name: "osTarih" }));
  app.save(c);
}, (app) => {});
