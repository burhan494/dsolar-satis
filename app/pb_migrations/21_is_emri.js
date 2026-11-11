/// <reference path="../pb_data/types.d.ts" />
// GES iş emirleri: bakımcı listesi ve olay defterine iş emri alanları (numara, bakımcı, öncelik, son tarih, durum adımları, fotoğraf).
migrate((app) => {
  const YON = "@request.auth.aktif = true && @request.auth.rol = 'yonetici'";
  let b; try { b = app.findCollectionByNameOrId("ges_bakimcilar"); } catch (e) { b = null; }
  if (!b) {
    b = new Collection({ type: "base", name: "ges_bakimcilar", fields: [
      { name: "ad", type: "text", required: true, max: 160 },
      { name: "tur", type: "select", values: ["Firma", "Şahıs"], maxSelect: 1 },
      { name: "yetkili", type: "text", max: 120 },
      { name: "tel", type: "text", max: 40 },
      { name: "eposta", type: "text", max: 160 },
      { name: "alan", type: "text", max: 200 },
      { name: "aktif", type: "bool" },
      { name: "not", type: "text", max: 1000 },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ] });
    b.listRule = YON; b.viewRule = YON; b.createRule = YON; b.updateRule = YON; b.deleteRule = YON;
    app.save(b);
  }
  const c = app.findCollectionByNameOrId("ges_olaylar");
  const ekle = (f) => { if (!c.fields.getByName(f.name)) c.fields.add(f); };
  ekle(new TextField({ name: "ieNo", max: 30 }));
  ekle(new RelationField({ name: "bakimci", collectionId: b.id, maxSelect: 1, cascadeDelete: false }));
  ekle(new SelectField({ name: "oncelik", values: ["Acil", "Normal"], maxSelect: 1 }));
  ekle(new DateField({ name: "sonTarih" }));
  ekle(new SelectField({ name: "ieDurum", values: ["Açık", "Gönderildi", "Sahada", "Çözüldü", "Doğrulandı", "Düzelmedi"], maxSelect: 1 }));
  ekle(new DateField({ name: "gonderim" }));
  ekle(new DateField({ name: "cozumTarih" }));
  ekle(new TextField({ name: "invKey", max: 80 }));
  ekle(new TextField({ name: "kanit", max: 2000 }));
  ekle(new TextField({ name: "yapilan", max: 3000 }));
  ekle(new JSONField({ name: "gecmis", maxSize: 50000 }));
  ekle(new FileField({ name: "foto", maxSelect: 12, maxSize: 15000000, protected: true, thumbs: ["240x240"], mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"] }));
  app.save(c);
}, (app) => {});
