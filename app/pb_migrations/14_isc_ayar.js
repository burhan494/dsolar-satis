/// <reference path="../pb_data/types.d.ts" />
// iSolarCloud bağlantı ayarı (yalnız yönetici). appkey/secret/şifre/token gizli alanlar: API yanıtında hiç dönmez, yalnız yazılır.
migrate((app) => {
  const YON = "@request.auth.aktif = true && @request.auth.rol = 'yonetici'";
  let c; try { c = app.findCollectionByNameOrId("isc_ayar"); } catch (e) { c = null; }
  if (!c) c = new Collection({ type: "base", name: "isc_ayar", fields: [
    { name: "anahtar", type: "text", required: true },
    { name: "appkey", type: "text", hidden: true }, { name: "secret", type: "text", hidden: true },
    { name: "kullanici", type: "text" }, { name: "sifre", type: "text", hidden: true },
    { name: "gw", type: "text" }, { name: "baslangic", type: "text" },
    { name: "psId", type: "text" }, { name: "psAd", type: "text" }, { name: "santraller", type: "json", maxSize: 20000 },
    { name: "token", type: "text", hidden: true }, { name: "tokenAt", type: "number", hidden: true },
    { name: "canli", type: "json", maxSize: 5000 }, { name: "alarm", type: "json", maxSize: 200000 },
    { name: "sonGun", type: "text" }, { name: "sonSenk", type: "text" }, { name: "sonDeneme", type: "text" }, { name: "hata", type: "text" },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ],
    indexes: ["CREATE UNIQUE INDEX idx_isc_anahtar ON isc_ayar (anahtar)"] });
  c.listRule = YON; c.viewRule = YON; c.createRule = null; c.updateRule = null; c.deleteRule = YON; // yazma yalnız /api/dsolar/isc-ayar ile
  app.save(c);
  const g = app.findCollectionByNameOrId("ges_aylik");
  [{ name: "iscT", type: "json", maxSize: 20000 }, { name: "iscPR", type: "json", maxSize: 20000 }].forEach((d) => { if (!g.fields.getByName(d.name)) g.fields.add(new Field(d)); });
  app.save(g);
}, (app) => { try { app.delete(app.findCollectionByNameOrId("isc_ayar")); } catch (e) {} });
