/// <reference path="../pb_data/types.d.ts" />
// v57: Param (kişisel para). Kayıt tarayıcıda AES-GCM ile şifrelenir; sunucuda yalnız şifreli metin durur.
// Her kayıt yalnız sahibine açıktır (yönetici dahil başka hiç kimse listeleyemez/okuyamaz).
migrate((app) => {
  let P; try { P = app.findCollectionByNameOrId("kisisel"); } catch (e) { P = null; }
  if (!P) P = new Collection({ type: "base", name: "kisisel", fields: [
    { name: "sahip", type: "relation", required: true, collectionId: app.findCollectionByNameOrId("users").id, maxSelect: 1, cascadeDelete: false },
    { name: "salt", type: "text", max: 200 },
    { name: "iv", type: "text", max: 200 },
    { name: "veri", type: "text", max: 15000000 },
    { name: "surum", type: "number" },
    { name: "created", type: "autodate", onCreate: true }, { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ] });
  const S = "@request.auth.aktif = true && @request.auth.id = sahip";
  P.listRule = S; P.viewRule = S; P.updateRule = S + " && (@request.body.sahip:isset = false || @request.body.sahip = @request.auth.id)"; P.deleteRule = S;
  P.createRule = "@request.auth.aktif = true && @request.auth.rol = 'yonetici' && @request.body.sahip = @request.auth.id";
  app.save(P);
}, (app) => { try { app.delete(app.findCollectionByNameOrId("kisisel")); } catch (e) {} });
