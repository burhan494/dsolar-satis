/// <reference path="../pb_data/types.d.ts" />
// Tek ödeme için onay: muhasebe Gelecek/Gidecek'te bir ödemeyi listeye koymadan doğrudan onaya gönderir; yönetici onaylar ya da gerekçeyle geri çevirir.
// Erken ödenecekse ödeme tarihi öne alınır, asıl vade "vade" alanında saklanır.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  const H = app.findCollectionByNameOrId("fin_hareketler");
  const ekle = (f) => { if (!H.fields.getByName(f.name)) H.fields.add(f); };
  ekle(new RelationField({ name: "onayIsteyen", collectionId: users.id, maxSelect: 1, cascadeDelete: false }));
  ekle(new DateField({ name: "onayIstek" }));
  ekle(new DateField({ name: "vade" }));
  ekle(new TextField({ name: "onayNot", max: 500 }));
  ekle(new TextField({ name: "redNedeni", max: 500 }));
  app.save(H);
}, (app) => {});
