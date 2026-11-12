/// <reference path="../pb_data/types.d.ts" />
// Farklı para birimindeki hesaptan ödeme/tahsilat: hareket kendi para biriminde kalır, hesaptan çıkan/giren tutar hesabın para biriminde tutulur.
migrate((app) => {
  const c = app.findCollectionByNameOrId("fin_hareketler");
  if (!c.fields.getByName("hesapTutar")) c.fields.add(new NumberField({ name: "hesapTutar" }));
  app.save(c);
}, (app) => {});
