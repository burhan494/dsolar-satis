/// <reference path="../pb_data/types.d.ts" />
// İş ortağı programı: ortağın kendisinin müşteri yönlendirmesi, komisyon ayrıntıları, program ayarı (oran yönetici tarafından girilir).
migrate((app) => {
  const A = "@request.auth.aktif = true && ";
  const yon = "@request.auth.rol = 'yonetici'";
  const users = app.findCollectionByNameOrId("users"), ad = app.findCollectionByNameOrId("adaylar"), pr = app.findCollectionByNameOrId("projeler");
  let y; try { y = app.findCollectionByNameOrId("yonlendirmeler"); } catch (e) { y = null; }
  if (!y) y = new Collection({ type: "base", name: "yonlendirmeler", fields: [
    { name: "ortak", type: "relation", collectionId: users.id, maxSelect: 1, required: true, cascadeDelete: false },
    { name: "ad", type: "text", required: true, max: 120 },
    { name: "tel", type: "text", max: 40 },
    { name: "ilce", type: "text", max: 80 },
    { name: "not", type: "text", max: 1000 },
    { name: "izin", type: "bool" },
    { name: "durum", type: "select", values: ["Yeni", "Kaydedildi", "Uygun değil"], maxSelect: 1 },
    { name: "aday", type: "relation", collectionId: ad.id, maxSelect: 1, cascadeDelete: false },
    { name: "created", type: "autodate", onCreate: true },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ] });
  const ekip = "(" + yon + " || @request.auth.rol = 'satis')";
  y.listRule = A + "(" + ekip + " || (@request.auth.rol = 'ortak' && ortak = @request.auth.id))"; y.viewRule = y.listRule;
  // Ortak yalnız kendi adına, "Yeni" durumunda ve müşteri bağlamadan kayıt açabilir
  y.createRule = A + "@request.auth.rol = 'ortak' && @request.body.ortak = @request.auth.id && @request.body.aday:isset = false && (@request.body.durum:isset = false || @request.body.durum = 'Yeni')";
  y.updateRule = A + ekip; y.deleteRule = A + yon;
  app.save(y);

  const k = app.findCollectionByNameOrId("komisyonlar");
  const ekle = (f) => { if (!k.fields.getByName(f.name)) k.fields.add(f); };
  ekle(new RelationField({ name: "proje", collectionId: pr.id, maxSelect: 1, cascadeDelete: false }));
  ekle(new NumberField({ name: "bedelUsd" }));
  ekle(new NumberField({ name: "oran" }));
  ekle(new DateField({ name: "odemeTarihi" }));
  ekle(new TextField({ name: "not", max: 500 }));
  ekle(new AutodateField({ name: "created", onCreate: true }));
  app.save(k);

  try { app.findFirstRecordByData("ayarlar", "anahtar", "ortak_program"); } catch (e) {
    const r = new Record(app.findCollectionByNameOrId("ayarlar"));
    r.set("anahtar", "ortak_program");
    r.set("deger", { oran: 0, sabitUsd: 0, hakEdis: "Müşteri peşinatı tahsil edilince", davet: "" });
    app.save(r);
  }
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("yonlendirmeler")); } catch (e) {}
  try { app.delete(app.findFirstRecordByData("ayarlar", "anahtar", "ortak_program")); } catch (e) {}
});
