/// <reference path="../pb_data/types.d.ts" />
// Ödeme onay akışı: muhasebe ödeme listesi hazırlar (elle / Excel), yönetici onaylar (tam, kısmi, ertele, reddet), muhasebe öder.
// Onaysız çıkış ödemesi muhasebe tarafından "Gerçekleşti" yapılamaz (sunucu kuralı); yönetici kendi ödediğinde onay kendiliğinden verilir.
migrate((app) => {
  const A = "@request.auth.aktif = true && ";
  const YON = "@request.auth.rol = 'yonetici'", MUH = "@request.auth.rol = 'muhasebe'";
  const FIN = A + "(" + YON + " || " + MUH + ")";
  const users = app.findCollectionByNameOrId("users");
  let L; try { L = app.findCollectionByNameOrId("odeme_listeleri"); } catch (e) { L = null; }
  if (!L) L = new Collection({ type: "base", name: "odeme_listeleri", fields: [
    { name: "ad", type: "text", required: true, max: 200 },
    { name: "tur", type: "select", values: ["Haftalık", "Aylık", "Dönem", "Anlık", "Excel"], maxSelect: 1 },
    { name: "bas", type: "date" }, { name: "bit", type: "date" },
    { name: "durum", type: "select", values: ["Onayda", "Onaylandı", "Kısmen onaylandı", "Reddedildi", "Kapandı"], maxSelect: 1, required: true },
    { name: "hazirlayan", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
    { name: "onaylayan", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
    { name: "onayTarihi", type: "date" },
    { name: "not", type: "text", max: 2000 },
    { name: "kaynakDosya", type: "text", max: 200 },
    { name: "created", type: "autodate", onCreate: true }, { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ] });
  L.listRule = FIN; L.viewRule = FIN; L.createRule = FIN;
  L.updateRule = A + "(" + YON + " || (" + MUH + " && @request.body.onaylayan:isset = false && (@request.body.durum:isset = false || @request.body.durum = 'Onayda' || @request.body.durum = 'Kapandı')))";
  L.deleteRule = A + YON;
  app.save(L);

  const H = app.findCollectionByNameOrId("fin_hareketler");
  const ekle = (f) => { if (!H.fields.getByName(f.name)) H.fields.add(f); };
  ekle(new SelectField({ name: "onay", values: ["Onay bekliyor", "Onaylandı", "Reddedildi"], maxSelect: 1 }));
  ekle(new TextField({ name: "onaylayan", max: 120 }));
  ekle(new DateField({ name: "onayTarihi" }));
  ekle(new RelationField({ name: "odemeListesi", collectionId: L.id, maxSelect: 1, cascadeDelete: false }));
  ekle(new TextField({ name: "ana", max: 40 }));
  ekle(new TextField({ name: "iban", max: 40 }));
  const muhOnay = "(@request.body.onay:isset = false || @request.body.onay = '' || @request.body.onay = 'Onay bekliyor') && @request.body.onaylayan:isset = false";
  H.createRule = A + "(" + YON + " || (" + MUH + " && " + muhOnay + " && (@request.body.durum != 'Gerçekleşti' || @request.body.yon = 'Giriş')))";
  H.updateRule = A + "(" + YON + " || (" + MUH + " && " + muhOnay +
    " && (@request.body.durum:isset = false || @request.body.durum != 'Gerçekleşti' || yon = 'Giriş' || onay = 'Onaylandı')" +
    " && (onay != 'Onaylandı' || @request.body.tutar:isset = false || @request.body.tutar <= tutar)))";
  app.save(H);
}, (app) => {});
