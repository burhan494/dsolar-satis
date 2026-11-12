/// <reference path="../pb_data/types.d.ts" />
// GDZ yük profili (15 dakikalık sayaç endeksleri): resmi OSOS formundan ayrı saklanır, ay içi takip ve kesinti tespiti için.
migrate((app) => {
  const c = app.findCollectionByNameOrId("ges_aylik");
  const ekle = (f) => { if (!c.fields.getByName(f.name)) c.fields.add(f); };
  ekle(new JSONField({ name: "ypOku", maxSize: 800000 }));
  ekle(new JSONField({ name: "ypGun", maxSize: 20000 }));
  ekle(new JSONField({ name: "ypSaat", maxSize: 200000 }));
  ekle(new JSONField({ name: "ypBosluk", maxSize: 50000 }));
  ekle(new NumberField({ name: "ypUretim" }));
  ekle(new NumberField({ name: "ypCekis" }));
  ekle(new NumberField({ name: "ypRi" }));
  ekle(new NumberField({ name: "ypRc" }));
  ekle(new TextField({ name: "ypSon", max: 20 }));
  ekle(new TextField({ name: "ypDosya", max: 200 }));
  ekle(new DateField({ name: "ypTarih" }));
  app.save(c);
}, (app) => {});
