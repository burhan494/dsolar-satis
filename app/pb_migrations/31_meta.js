/// <reference path="../pb_data/types.d.ts" />
// Meta (Facebook/Instagram) reklam bağlantısı: form ile gelen müşteriler otomatik aday olur, reklam harcaması günlük çekilir.
// Erişim anahtarı (token) gizli alandır: API yanıtında hiç dönmez, yalnız /api/dsolar/meta-ayar ile yazılır.
migrate((app) => {
  const YON = "@request.auth.aktif = true && @request.auth.rol = 'yonetici'";
  const SAT = "@request.auth.aktif = true && (@request.auth.rol = 'yonetici' || @request.auth.rol = 'satis')";
  const users = app.findCollectionByNameOrId("users");
  let c; try { c = app.findCollectionByNameOrId("meta_ayar"); } catch (e) { c = null; }
  if (!c) c = new Collection({ type: "base", name: "meta_ayar", fields: [
    { name: "anahtar", type: "text", required: true },
    { name: "token", type: "text", hidden: true },
    { name: "api", type: "text" },
    { name: "adHesap", type: "text" }, { name: "sayfaId", type: "text" },
    { name: "hesapAd", type: "text" }, { name: "sayfaAd", type: "text" },
    { name: "atananlar", type: "relation", collectionId: users.id, maxSelect: 20, cascadeDelete: false },
    { name: "siradaki", type: "number" },
    { name: "kampanyalar", type: "json", maxSize: 200000 },
    { name: "sonLead", type: "text" }, { name: "sonSenk", type: "text" }, { name: "sonDeneme", type: "text" }, { name: "hata", type: "text" },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ],
    indexes: ["CREATE UNIQUE INDEX idx_meta_anahtar ON meta_ayar (anahtar)"] });
  c.listRule = SAT; c.viewRule = SAT; c.createRule = null; c.updateRule = null; c.deleteRule = YON;
  app.save(c);

  let g; try { g = app.findCollectionByNameOrId("meta_gunluk"); } catch (e) { g = null; }
  if (!g) g = new Collection({ type: "base", name: "meta_gunluk", fields: [
    { name: "tarih", type: "text", required: true }, { name: "kampanyaId", type: "text", required: true }, { name: "kampanya", type: "text" },
    { name: "harcama", type: "number" }, { name: "gosterim", type: "number" }, { name: "tiklama", type: "number" }, { name: "lead", type: "number" }, { name: "mesaj", type: "number" },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ],
    indexes: ["CREATE UNIQUE INDEX idx_meta_gun ON meta_gunluk (tarih, kampanyaId)"] });
  g.listRule = SAT; g.viewRule = SAT; g.createRule = null; g.updateRule = null; g.deleteRule = null;
  app.save(g);

  const a = app.findCollectionByNameOrId("adaylar");
  const k = a.fields.getByName("kaynak"); if (k && k.values.indexOf("Meta reklam") < 0) { k.values = k.values.concat(["Meta reklam"]); }
  [["metaKampanya", 200], ["metaReklam", 200], ["metaForm", 200], ["evTipi", 80], ["faturaAralik", 80], ["leadKalite", 40], ["leadZaman", 40]].forEach((d) => {
    if (!a.fields.getByName(d[0])) a.fields.add(new TextField({ name: d[0], max: d[1] })); });
  app.save(a);
}, (app) => {});
