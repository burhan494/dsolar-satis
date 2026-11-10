/// <reference path="../pb_data/types.d.ts" />
// Finans (hesaplar, nakit hareketleri, krediler), ortak cari, varlıklar ve GES aylık takibi.
// Erişim: hesaplar/hareketler/krediler -> yönetici + muhasebe; ortak cari, varlıklar, GES -> yalnız yönetici.
// Silme yalnız yönetici. Satış, keşif, proje ve iş ortağı rolleri bu tabloları hiç göremez.
migrate((app) => {
  const A = "@request.auth.aktif = true && ";
  const YON = A + "@request.auth.rol = 'yonetici'";
  const FIN = A + "(@request.auth.rol = 'yonetici' || @request.auth.rol = 'muhasebe')";
  const zaman = [{ name: "created", type: "autodate", onCreate: true }, { name: "updated", type: "autodate", onCreate: true, onUpdate: true }];
  const kur = (name, fields, okuYaz, idx) => {
    const c = new Collection({ type: "base", name: name, fields: fields.concat(zaman), indexes: idx || [] });
    c.listRule = okuYaz; c.viewRule = okuYaz; c.createRule = okuYaz; c.updateRule = okuYaz; c.deleteRule = YON;
    app.save(c); return c;
  };

  // Eski boş yer tutucular (ekranı hiç olmadı). Kayıt varsa dokunulmaz.
  ["kasa", "banka", "ortakcari"].forEach((n) => { try { const c = app.findCollectionByNameOrId(n); if (app.countRecords(c) === 0) app.delete(c); } catch (e) {} });

  const hesap = kur("fin_hesaplar", [
    { name: "ad", type: "text", required: true },
    { name: "tur", type: "select", values: ["Kasa", "Banka", "Kredi kartı"], maxSelect: 1, required: true },
    { name: "pb", type: "select", values: ["TRY", "USD", "EUR"], maxSelect: 1, required: true },
    { name: "acilis", type: "number" },
    { name: "acilisTarihi", type: "date" },
    { name: "aktif", type: "bool" },
    { name: "not", type: "text" } ], FIN);

  const adaylar = app.findCollectionByNameOrId("adaylar");
  const users = app.findCollectionByNameOrId("users");
  kur("fin_hareketler", [
    { name: "tarih", type: "date", required: true },
    { name: "hesap", type: "relation", collectionId: hesap.id, maxSelect: 1, required: true, cascadeDelete: false },
    { name: "yon", type: "select", values: ["Giriş", "Çıkış"], maxSelect: 1, required: true },
    { name: "tutar", type: "number", min: 0, required: true },
    { name: "kategori", type: "select", maxSelect: 1, values: ["Satış tahsilatı", "Amcor kira", "Diğer gelir", "Malzeme", "İşçilik / taşeron", "Maaş", "Vergi / SGK", "Kredi ödemesi", "Kira / ofis", "Araç", "GES gideri", "Ortak koydu", "Ortak aldı", "Hesaplar arası", "Diğer gider"] },
    { name: "durum", type: "select", values: ["Gerçekleşti", "Planlandı"], maxSelect: 1, required: true },
    { name: "aciklama", type: "text" },
    { name: "aday", type: "relation", collectionId: adaylar.id, maxSelect: 1, cascadeDelete: false },
    { name: "giren", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false } ], FIN,
    ["CREATE INDEX idx_hareket_tarih ON fin_hareketler (tarih)"]);

  kur("krediler", [
    { name: "ad", type: "text", required: true },
    { name: "pb", type: "select", values: ["TRY", "USD", "EUR"], maxSelect: 1, required: true },
    { name: "anaPara", type: "number" },
    { name: "kalan", type: "number" },
    { name: "taksit", type: "number" },
    { name: "faiz", type: "number" },
    { name: "sonOdeme", type: "date" },
    { name: "not", type: "text" } ], FIN);

  kur("ortak_cari", [
    { name: "tarih", type: "date", required: true },
    { name: "ortak", type: "select", values: ["Burhan", "Batur"], maxSelect: 1, required: true },
    { name: "yon", type: "select", values: ["Koydu", "Aldı"], maxSelect: 1, required: true },
    { name: "tutarUsd", type: "number", min: 0, required: true },
    { name: "aciklama", type: "text" } ], YON);

  kur("varliklar", [
    { name: "ad", type: "text", required: true },
    { name: "tur", type: "select", values: ["Araç", "Arsa", "Dükkan / bina", "Ekipman", "Diğer"], maxSelect: 1 },
    { name: "sahip", type: "text" },
    { name: "tahminiUsd", type: "number" },
    { name: "durum", type: "select", values: ["Elde", "Satışta", "Satıldı"], maxSelect: 1 },
    { name: "satisUsd", type: "number" },
    { name: "not", type: "text" } ], YON);

  kur("ges_aylik", [
    { name: "donem", type: "text", required: true, pattern: "^\\d{4}-(0[1-9]|1[0-2])$" },
    { name: "uretimKwh", type: "number" },
    { name: "tahminKwh", type: "number" },
    { name: "kiraTl", type: "number" },
    { name: "kiraTahsil", type: "date" },
    { name: "reaktifTl", type: "number" },
    { name: "digerGiderTl", type: "number" },
    { name: "not", type: "text" } ], YON,
    ["CREATE UNIQUE INDEX idx_ges_donem ON ges_aylik (donem)"]);
}, (app) => {
  ["ges_aylik", "varliklar", "ortak_cari", "krediler", "fin_hareketler", "fin_hesaplar"].forEach((n) => { try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {} });
});
