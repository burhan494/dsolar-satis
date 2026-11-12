/// <reference path="../pb_data/types.d.ts" />
// Proje türü (anahtar teslim / öz tüketim / malzeme satışı), ödeme planı ve maliyet; sözleşme formu bilgileri; belge şablonları.
migrate((app) => {
  const p = app.findCollectionByNameOrId("projeler");
  const ekP = (f) => { if (!p.fields.getByName(f.name)) p.fields.add(f); };
  ekP(new SelectField({ name: "tur", values: ["Anahtar teslim", "Öz tüketim", "Malzeme satışı"], maxSelect: 1 }));
  ekP(new NumberField({ name: "maliyetUsd" }));
  ekP(new JSONField({ name: "odemePlan", maxSize: 20000 }));
  ekP(new BoolField({ name: "planAktarildi" }));
  app.save(p);
  const a = app.findCollectionByNameOrId("adaylar");
  if (!a.fields.getByName("sozlesme")) a.fields.add(new JSONField({ name: "sozlesme", maxSize: 20000 }));
  app.save(a);
  let s; try { s = app.findCollectionByNameOrId("sablonlar"); } catch (e) { s = null; }
  if (!s) {
    s = new Collection({ type: "base", name: "sablonlar", fields: [
      { name: "anahtar", type: "text", required: true, max: 60 },
      { name: "ad", type: "text", max: 200 },
      { name: "dosya", type: "file", maxSelect: 1, maxSize: 10000000, protected: true },
      { name: "created", type: "autodate", onCreate: true }, { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ] });
    const A = "@request.auth.aktif = true", Y = "@request.auth.rol = 'yonetici'";
    s.listRule = A + " && (" + Y + " || @request.auth.y_musteri = 'd' || @request.auth.y_teklif = 'd' || @request.auth.y_proje = 'd')"; s.viewRule = s.listRule;
    s.createRule = A + " && " + Y; s.updateRule = A + " && " + Y; s.deleteRule = A + " && " + Y;
    app.save(s);
  }
}, (app) => {});
