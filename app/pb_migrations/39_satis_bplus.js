/// <reference path="../pb_data/types.d.ts" />
// v91 · Satış B+ Premium — kontrollü veri modeli aşaması.
// Mevcut tablolardaki hiçbir alan silinmez ya da yeniden adlandırılmaz; yalnız ekleme yapılır.
//  gorevler      : görüşme, keşif, montaj, resmî işlem görevleri (birden çok sorumlu). Müşterinin "sıradaki işi"
//                  (adaylar.sonrakiIs/sonraki) "ana görev" olarak burada da tutulur; eşitlemeyi satis.pb.js yapar.
//  asama_gecmis  : müşteri aşama değişiklikleri (kim, ne zaman, hangi aşamadan hangisine). Yalnız sunucu yazar.
//  teklifler     : gecerlilik, takipTarihi, gonderildi, gonderimler (elle işaretlenen gerçek gönderim kayıtları).
// Taşıma: sıradaki işi olan her müşteri için tek bir açık ana görev açılır (anahtar "ana:<aday>"; ikinci çalışmada tekrar açılmaz).
migrate((app) => {
  const users = app.findCollectionByNameOrId("users").id, adaylar = app.findCollectionByNameOrId("adaylar").id, projeler = app.findCollectionByNameOrId("projeler").id;
  const A = "@request.auth.aktif = true", Y = "@request.auth.rol = 'yonetici'";
  const G = (...ms) => "(" + [Y].concat(ms.map((m) => "@request.auth.y_" + m + " = 'g' || @request.auth.y_" + m + " = 'd'")).join(" || ") + ")";
  const D = (...ms) => "(" + [Y].concat(ms.map((m) => "@request.auth.y_" + m + " = 'd'")).join(" || ") + ")";
  const KG = "(@request.auth.kendi = false || sorumlu ?= @request.auth.id || aday.sorumlu = @request.auth.id || aday.kesifci = @request.auth.id || olusturan = @request.auth.id)";
  const yoksa = (ad, olustur) => { try { app.findCollectionByNameOrId(ad); } catch (e) { app.save(olustur()); } };
  yoksa("gorevler", () => { const c = new Collection({ type: "base", name: "gorevler", fields: [
    { name: "aday", type: "relation", collectionId: adaylar, maxSelect: 1, cascadeDelete: true },
    { name: "proje", type: "relation", collectionId: projeler, maxSelect: 1, cascadeDelete: true },
    { name: "tur", type: "select", required: true, maxSelect: 1, values: ["Arama", "Görüşme", "Keşif", "Teklif", "Montaj", "Resmî işlem", "Diğer"] },
    { name: "baslik", type: "text", required: true, max: 200 },
    { name: "sorumlu", type: "relation", collectionId: users, maxSelect: 6, cascadeDelete: false },
    { name: "tarih", type: "date" },
    { name: "saatli", type: "bool" },
    { name: "sure", type: "number", min: 0, max: 1440 },
    { name: "adres", type: "text", max: 300 },
    { name: "konum", type: "text", max: 300 },
    { name: "oncelik", type: "select", maxSelect: 1, values: ["Yüksek", "Normal", "Düşük"] },
    { name: "durum", type: "select", required: true, maxSelect: 1, values: ["Açık", "Tamamlandı", "İptal"] },
    { name: "ana", type: "bool" },
    { name: "tamamNot", type: "text", max: 1000 },
    { name: "tamamlayan", type: "relation", collectionId: users, maxSelect: 1, cascadeDelete: false },
    { name: "tamamTarih", type: "date" },
    { name: "olusturan", type: "relation", collectionId: users, maxSelect: 1, cascadeDelete: false },
    { name: "anahtar", type: "text", max: 100 },
    { name: "created", type: "autodate", onCreate: true },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ],
    indexes: ["CREATE INDEX idx_gorev_aday ON gorevler (aday)", "CREATE INDEX idx_gorev_tarih ON gorevler (tarih)", "CREATE INDEX idx_gorev_durum ON gorevler (durum)", "CREATE UNIQUE INDEX idx_gorev_anahtar ON gorevler (anahtar) WHERE anahtar != ''"] });
    c.listRule = A + " && " + G("musteri", "proje") + " && " + KG; c.viewRule = c.listRule;
    c.createRule = A + " && " + D("musteri", "proje");
    c.updateRule = A + " && " + D("musteri", "proje") + " && " + KG;
    c.deleteRule = A + " && (" + Y + " || olusturan = @request.auth.id)";
    return c; });
  yoksa("asama_gecmis", () => { const c = new Collection({ type: "base", name: "asama_gecmis", fields: [
    { name: "aday", type: "relation", required: true, collectionId: adaylar, maxSelect: 1, cascadeDelete: true },
    { name: "eski", type: "text", max: 40 },
    { name: "yeni", type: "text", max: 40 },
    { name: "kim", type: "relation", collectionId: users, maxSelect: 1, cascadeDelete: false },
    { name: "created", type: "autodate", onCreate: true } ],
    indexes: ["CREATE INDEX idx_asg_aday ON asama_gecmis (aday)", "CREATE INDEX idx_asg_created ON asama_gecmis (created)"] });
    c.listRule = A + " && " + G("musteri", "proje", "teklif") + " && (@request.auth.kendi = false || aday.sorumlu = @request.auth.id || aday.kesifci = @request.auth.id)"; c.viewRule = c.listRule;
    c.createRule = null; c.updateRule = null; c.deleteRule = null; return c; });
  const t = app.findCollectionByNameOrId("teklifler");
  const ekle = (f) => { if (!t.fields.getByName(f.name)) t.fields.add(f); };
  ekle(new DateField({ name: "gecerlilik" })); ekle(new DateField({ name: "takipTarihi" })); ekle(new DateField({ name: "gonderildi" })); ekle(new JSONField({ name: "gonderimler", maxSize: 20000 })); ekle(new JSONField({ name: "odeme", maxSize: 5000 }));
  app.save(t);
  // taşıma: mevcut sıradaki işler → açık ana görev (tekrar çalışırsa yeni kayıt açmaz)
  const gc = app.findCollectionByNameOrId("gorevler"), tur = (s) => /keşif|kesif/i.test(s) ? "Keşif" : /teklif/i.test(s) ? "Teklif" : /montaj|kurulum/i.test(s) ? "Montaj" : /\bara|arama|aranacak|tekrar ara/i.test(s) ? "Arama" : "Görüşme";
  app.findRecordsByFilter("adaylar", "sonrakiIs != ''", "", 0, 0).forEach((a) => {
    const k = "ana:" + a.id; try { app.findFirstRecordByFilter("gorevler", "anahtar = {:k}", { k: k }); return; } catch (e) {}
    const r = new Record(gc); r.set("aday", a.id); r.set("baslik", a.getString("sonrakiIs").slice(0, 200)); r.set("tur", tur(a.getString("sonrakiIs")));
    if (a.getString("sonraki")) { r.set("tarih", a.getString("sonraki")); const s = a.getString("sonraki").slice(11, 16); r.set("saatli", !!s && s !== "09:00" && s !== "00:00"); }
    if (a.getString("sorumlu")) r.set("sorumlu", [a.getString("sorumlu")]);
    r.set("adres", [a.getString("adres"), a.getString("ilce")].filter(Boolean).join(", ").slice(0, 300)); r.set("durum", a.getString("asama") === "Kaybedildi" ? "İptal" : "Açık"); r.set("ana", true); r.set("anahtar", k);
    app.saveNoValidate(r);
  });
}, (app) => {
  ["gorevler", "asama_gecmis"].forEach((n) => { try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {} });
  const t = app.findCollectionByNameOrId("teklifler"); ["gecerlilik", "takipTarihi", "gonderildi", "gonderimler", "odeme"].forEach((n) => { const f = t.fields.getByName(n); if (f) t.fields.removeById(f.id); }); app.save(t);
});
