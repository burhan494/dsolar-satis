/// <reference path="../pb_data/types.d.ts" />
// Ekip yönetimi (yönetici kişi ekler/çıkarır, rol verir) ve aday takip alanları
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  // İç ekip birbirini görür (keşifçi atamak için); iş ortağı yalnız kendini
  users.listRule = "@request.auth.aktif = true && (@request.auth.rol != 'ortak' || id = @request.auth.id)";
  users.viewRule = users.listRule;
  // Yalnız yönetici yeni kişi ekler
  users.createRule = "@request.auth.aktif = true && @request.auth.rol = 'yonetici'";
  users.fields.add(new TextField({ name: "tel" }));
  app.save(users);

  const ad = app.findCollectionByNameOrId("adaylar");
  ad.fields.add(new TextField({ name: "email" }));
  ad.fields.add(new DateField({ name: "sonraki" }));
  ad.fields.add(new TextField({ name: "sonrakiIs" }));
  ad.fields.add(new NumberField({ name: "aylikFatura" }));
  ad.fields.add(new NumberField({ name: "yillikKwh" }));
  ad.fields.add(new TextField({ name: "kayipNedeni" }));
  ad.fields.add(new AutodateField({ name: "created", onCreate: true }));
  ad.fields.add(new AutodateField({ name: "updated", onCreate: true, onUpdate: true }));
  app.save(ad);

  const t = app.findCollectionByNameOrId("teklifler");
  t.fields.add(new TextField({ name: "no" }));
  t.fields.add(new TextField({ name: "not" }));
  t.fields.add(new AutodateField({ name: "created", onCreate: true }));
  app.save(t);

  // Görüşme notları
  const g = new Collection({ type: "base", name: "gorusmeler", fields: [
    { name: "aday", type: "relation", collectionId: ad.id, maxSelect: 1, required: true, cascadeDelete: true },
    { name: "metin", type: "text", required: true },
    { name: "yazan", type: "relation", collectionId: users.id, maxSelect: 1 },
    { name: "created", type: "autodate", onCreate: true } ] });
  const okuG = "@request.auth.aktif = true && (@request.auth.rol = 'yonetici' || @request.auth.rol = 'satis' || @request.auth.rol = 'proje' || (@request.auth.rol = 'saha' && aday.kesifci = @request.auth.id))";
  g.listRule = okuG; g.viewRule = okuG; g.createRule = okuG + " && yazan = @request.auth.id"; g.updateRule = null; g.deleteRule = "@request.auth.aktif = true && @request.auth.rol = 'yonetici'";
  app.save(g);
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("gorusmeler")); } catch (e) {}
});
