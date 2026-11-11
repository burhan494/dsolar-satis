/// <reference path="../pb_data/types.d.ts" />
// İnverter bazında günlük üretim (iSolarCloud): liste + son 90 gün
migrate((app) => {
  const c = app.findCollectionByNameOrId("isc_ayar");
  if (!c.fields.getByName("inv")) c.fields.add(new JSONField({ name: "inv", maxSize: 2000000 }));
  app.save(c);
}, (app) => {});
