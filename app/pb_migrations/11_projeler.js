/// <reference path="../pb_data/types.d.ts" />
// Proje takibi (sözleşme sonrası): Beacon'daki iki kollu adım yapısı (saha + resmi süreç) aynen.
migrate((app) => {
  const A = "@request.auth.aktif = true && ";
  const yon = "@request.auth.rol = 'yonetici'";
  const ad = app.findCollectionByNameOrId("adaylar"), tk = app.findCollectionByNameOrId("teklifler");
  let p; try { p = app.findCollectionByNameOrId("projeler"); } catch (e) { p = null; }
  if (!p) p = new Collection({ type: "base", name: "projeler", fields: [
    { name: "aday", type: "relation", collectionId: ad.id, maxSelect: 1, required: true, cascadeDelete: false },
    { name: "teklif", type: "relation", collectionId: tk.id, maxSelect: 1, cascadeDelete: false },
    { name: "basla", type: "date", required: true },
    { name: "bedelUsd", type: "number" },
    { name: "kwp", type: "number" },
    { name: "adimlar", type: "json", maxSize: 50000 },
    { name: "durum", type: "select", values: ["Sürüyor", "Tamamlandı", "İptal"], maxSelect: 1, required: true },
    { name: "not", type: "text" },
    { name: "created", type: "autodate", onCreate: true },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ],
    indexes: ["CREATE UNIQUE INDEX idx_proje_aday ON projeler (aday)"] });
  const oku = A + "(" + yon + " || @request.auth.rol = 'satis' || @request.auth.rol = 'proje' || @request.auth.rol = 'muhasebe' || (@request.auth.rol = 'saha' && aday.kesifci = @request.auth.id))";
  p.listRule = oku; p.viewRule = oku;
  p.createRule = A + "(" + yon + " || @request.auth.rol = 'satis')";
  p.updateRule = A + "(" + yon + " || @request.auth.rol = 'satis' || @request.auth.rol = 'proje' || (@request.auth.rol = 'saha' && aday.kesifci = @request.auth.id && @request.body.bedelUsd:isset = false))";
  p.deleteRule = A + yon;
  app.save(p);
}, (app) => { try { app.delete(app.findCollectionByNameOrId("projeler")); } catch (e) {} });
