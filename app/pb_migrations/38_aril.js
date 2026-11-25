/// <reference path="../pb_data/types.d.ts" />
// v89: GDZ ARiL portalı Excel raporları (günlük tüketim/üretim, reaktif, veri oranı; endeks; kesinti). OSOS formu ve yük profilinden ayrı saklanır.
migrate((app) => {
  const c = app.findCollectionByNameOrId("ges_aylik");
  const ekle = (f) => { if (!c.fields.getByName(f.name)) c.fields.add(f); };
  ekle(new JSONField({ name: "arilGun", maxSize: 100000 }));
  ekle(new JSONField({ name: "arilEndeks", maxSize: 5000 }));
  ekle(new JSONField({ name: "arilKesinti", maxSize: 50000 }));
  ekle(new TextField({ name: "arilDosya", max: 200 }));
  ekle(new DateField({ name: "arilTarih" }));
  app.save(c);
}, (app) => {});
