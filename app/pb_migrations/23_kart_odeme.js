/// <reference path="../pb_data/types.d.ts" />
// Kredi kartıyla yapılan ödemeler: hareketin hangi kartla ödendiği ve kart ekstresi satırının hangi karta ait olduğu.
migrate((app) => {
  const k = app.findCollectionByNameOrId("fin_kartlar");
  const c = app.findCollectionByNameOrId("fin_hareketler");
  if (!c.fields.getByName("kart")) c.fields.add(new RelationField({ name: "kart", collectionId: k.id, maxSelect: 1, cascadeDelete: false }));
  app.save(c);
}, (app) => {});
