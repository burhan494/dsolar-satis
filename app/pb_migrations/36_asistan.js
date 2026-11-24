/// <reference path="../pb_data/types.d.ts" />
// v88: Yönetici asistanı (Claude) için salt okunur bağlantı.
// Mevcut tablolara dokunulmaz; yalnız yeni tablolar eklenir.
//  asistan_oauth   : Claude bağlantısının giriş kayıtları (istemci, tek kullanımlık kod, erişim/yenileme anahtarlarının özeti). Yalnız sunucu okur.
//  asistan_log     : her asistan erişiminin denetim kaydı. Yalnız sunucu yazar; yönetici okuyabilir.
//  asistan_gunluk  : yönetici günlüğü (kararlar, açık işler, uyarılar). Yalnız sahibi görür.
//  asistan_kisisel : Param'dan sahibinin açıkça gönderdiği özet. Yalnız sahibi görür.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users").id;
  const yoksa = (ad, olustur) => { try { app.findCollectionByNameOrId(ad); } catch (e) { app.save(olustur()); } };
  yoksa("asistan_oauth", () => new Collection({ type: "base", name: "asistan_oauth", fields: [
    { name: "tur", type: "select", required: true, maxSelect: 1, values: ["istemci", "kod", "erisim", "yenileme"] },
    { name: "anahtar", type: "text", required: true, max: 200 },
    { name: "istemci", type: "text", max: 200 },
    { name: "kullanici", type: "relation", collectionId: users, maxSelect: 1, cascadeDelete: true },
    { name: "bitis", type: "date" },
    { name: "veri", type: "json", maxSize: 20000 },
    { name: "created", type: "autodate", onCreate: true } ],
    indexes: ["CREATE UNIQUE INDEX idx_asistan_oauth_anahtar ON asistan_oauth (anahtar)"] }));
  yoksa("asistan_log", () => { const c = new Collection({ type: "base", name: "asistan_log", fields: [
    { name: "kullanici", type: "relation", collectionId: users, maxSelect: 1, cascadeDelete: false },
    { name: "islem", type: "text", max: 200 },
    { name: "sonuc", type: "text", max: 200 },
    { name: "ip", type: "text", max: 100 },
    { name: "ayrinti", type: "text", max: 2000 },
    { name: "created", type: "autodate", onCreate: true } ] });
    c.listRule = "@request.auth.aktif = true && @request.auth.rol = 'yonetici'"; c.viewRule = c.listRule; return c; });
  const S = "@request.auth.aktif = true && @request.auth.id = sahip";
  yoksa("asistan_gunluk", () => { const c = new Collection({ type: "base", name: "asistan_gunluk", fields: [
    { name: "sahip", type: "relation", required: true, collectionId: users, maxSelect: 1, cascadeDelete: true },
    { name: "alan", type: "select", required: true, maxSelect: 1, values: ["sirket", "kisisel"] },
    { name: "tur", type: "select", required: true, maxSelect: 1, values: ["karar", "is", "hedef", "onay", "gorev", "yatirim", "uyari", "not"] },
    { name: "baslik", type: "text", required: true, max: 300 },
    { name: "durum", type: "select", maxSelect: 1, values: ["acik", "devam", "bekliyor", "tamam", "iptal"] },
    { name: "sorumlu", type: "text", max: 120 },
    { name: "tarih", type: "date" },
    { name: "sonraki", type: "text", max: 500 },
    { name: "not", type: "text", max: 4000 },
    { name: "anahtar", type: "text", max: 200 },
    { name: "kaynak", type: "text", max: 40 },
    { name: "created", type: "autodate", onCreate: true }, { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ] });
    c.listRule = S; c.viewRule = S; c.deleteRule = S; c.updateRule = S + " && (@request.body.sahip:isset = false || @request.body.sahip = @request.auth.id)";
    c.createRule = "@request.auth.aktif = true && @request.body.sahip = @request.auth.id"; return c; });
  yoksa("asistan_kisisel", () => { const c = new Collection({ type: "base", name: "asistan_kisisel", fields: [
    { name: "sahip", type: "relation", required: true, collectionId: users, maxSelect: 1, cascadeDelete: true },
    { name: "ozet", type: "json", maxSize: 200000 },
    { name: "kapsam", type: "json", maxSize: 2000 },
    { name: "created", type: "autodate", onCreate: true }, { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ] });
    c.listRule = S; c.viewRule = S; c.deleteRule = S; c.updateRule = S + " && (@request.body.sahip:isset = false || @request.body.sahip = @request.auth.id)";
    c.createRule = "@request.auth.aktif = true && @request.body.sahip = @request.auth.id"; return c; });
}, (app) => { ["asistan_kisisel", "asistan_gunluk", "asistan_log", "asistan_oauth"].forEach((n) => { try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {} }); });
