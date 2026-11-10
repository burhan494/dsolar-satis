/// <reference path="../pb_data/types.d.ts" />
// Finans şemasını Beacon'daki D Solar finans modeline uyumlu hale getirir (kayıpsız taşıma için).
// Var olan tabloları silmez: eksik alanları ekler, değişen alanları günceller. Yeni tablolar: kartlar, limitler,
// teminat mektupları, sabit giderler, finans soruları, finans ayarları.
migrate((app) => {
  const A = "@request.auth.aktif = true && ";
  const YON = A + "@request.auth.rol = 'yonetici'";
  const FIN = A + "(@request.auth.rol = 'yonetici' || @request.auth.rol = 'muhasebe')";
  const PB = ["TRY", "USD", "EUR"];
  const zaman = [{ name: "created", type: "autodate", onCreate: true }, { name: "updated", type: "autodate", onCreate: true, onUpdate: true }];
  const kaynak = [{ name: "kaynak", type: "text" }, { name: "kaynakId", type: "text" }];

  function uyumla(name, fields, kural, idx) {
    let c; const tasinan = [];
    try { c = app.findCollectionByNameOrId(name); } catch (e) { c = null; }
    const tum = fields.concat(kaynak).concat(zaman);
    if (!c) {
      c = new Collection({ type: "base", name: name, fields: tum, indexes: idx || [] });
    } else {
      tum.forEach((def) => {
        const eski = c.fields.getByName(def.name);
        if (eski && eski.type() !== def.type) {
          // tür değişiyor (ör. kategori seçimden serbest metne): mevcut değerleri koru
          app.findAllRecords(c).forEach((r) => { const v = r.get(def.name); if (v !== "" && v != null) { tasinan.push([r.id, def.name, String(v)]); } });
          c.fields.removeByName(def.name);
        }
        else if (eski) def = Object.assign({}, def, { id: eski.id });
        c.fields.add(new Field(def));
      });
      (idx || []).forEach((i) => { if (c.indexes.indexOf(i) < 0) c.indexes.push(i); });
    }
    c.listRule = kural; c.viewRule = kural; c.createRule = kural; c.updateRule = kural; c.deleteRule = YON;
    app.save(c);
    tasinan.forEach((t) => { const r = app.findRecordById(c, t[0]); r.set(t[1], t[2]); app.saveNoValidate(r); });
    return c;
  }
  const ix = (t) => "CREATE INDEX idx_" + t + "_kaynakId ON " + t + " (kaynakId)";

  const hesap = uyumla("fin_hesaplar", [
    { name: "ad", type: "text", required: true },
    { name: "sirket", type: "text" },
    { name: "banka", type: "text" },
    { name: "hesapNo", type: "text" },
    { name: "tur", type: "select", values: ["Vadesiz", "KMH", "Vadeli", "Kasa", "Banka", "Kredi kartı", "Diğer"], maxSelect: 1, required: true },
    { name: "pb", type: "select", values: PB, maxSelect: 1, required: true },
    { name: "acilis", type: "number" },
    { name: "acilisTarihi", type: "date" },
    { name: "aktif", type: "bool" },
    { name: "not", type: "text" } ], FIN, [ix("fin_hesaplar")]);

  const kredi = uyumla("krediler", [
    { name: "ad", type: "text", required: true },
    { name: "banka", type: "text" },
    { name: "pb", type: "select", values: PB, maxSelect: 1, required: true },
    { name: "anaPara", type: "number" },
    { name: "kalan", type: "number" },
    { name: "taksit", type: "number" },
    { name: "faiz", type: "number" },
    { name: "baslangic", type: "date" },
    { name: "sonOdeme", type: "date" },
    { name: "durum", type: "select", values: ["Aktif", "Kapandı"], maxSelect: 1 },
    { name: "not", type: "text" } ], FIN, [ix("krediler")]);

  const adaylar = app.findCollectionByNameOrId("adaylar");
  const users = app.findCollectionByNameOrId("users");
  uyumla("fin_hareketler", [
    { name: "tarih", type: "date", required: true },
    { name: "hesap", type: "relation", collectionId: hesap.id, maxSelect: 1, required: false, cascadeDelete: false },
    { name: "pb", type: "select", values: PB, maxSelect: 1 },
    { name: "yon", type: "select", values: ["Giriş", "Çıkış"], maxSelect: 1, required: true },
    { name: "tutar", type: "number", min: 0, required: true },
    { name: "kategori", type: "text" },
    { name: "durum", type: "select", values: ["Gerçekleşti", "Planlandı", "Tahsilde"], maxSelect: 1, required: true },
    { name: "oncelik", type: "select", values: ["Kritik", "Esnek"], maxSelect: 1 },
    { name: "aciklama", type: "text" },
    { name: "karsiTaraf", type: "text" },
    { name: "belgeNo", type: "text" },
    { name: "kur", type: "number" },
    { name: "kredi", type: "relation", collectionId: kredi.id, maxSelect: 1, cascadeDelete: false },
    { name: "cek", type: "json", maxSize: 5000 },
    { name: "not", type: "text" },
    { name: "aday", type: "relation", collectionId: adaylar.id, maxSelect: 1, cascadeDelete: false },
    { name: "giren", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false } ], FIN, [ix("fin_hareketler")]);

  uyumla("fin_kartlar", [
    { name: "ad", type: "text", required: true },
    { name: "banka", type: "text" },
    { name: "son4", type: "text", max: 4 },
    { name: "pb", type: "select", values: PB, maxSelect: 1 },
    { name: "limit", type: "number" },
    { name: "borc", type: "number" },
    { name: "kesimGunu", type: "number" },
    { name: "sonOdeme", type: "date" },
    { name: "odemeTutar", type: "number" },
    { name: "durum", type: "select", values: ["Aktif", "Kapandı"], maxSelect: 1 },
    { name: "not", type: "text" } ], FIN, [ix("fin_kartlar")]);

  uyumla("fin_limitler", [
    { name: "banka", type: "text", required: true },
    { name: "grupLimit", type: "number" }, { name: "grupRisk", type: "number" },
    { name: "nakdiLimit", type: "number" }, { name: "nakdiRisk", type: "number" },
    { name: "gayriLimit", type: "number" }, { name: "gayriRisk", type: "number" },
    { name: "revize", type: "date" },
    { name: "not", type: "text" } ], FIN, [ix("fin_limitler")]);

  uyumla("fin_teminatlar", [
    { name: "banka", type: "text" },
    { name: "no", type: "text" },
    { name: "lehtar", type: "text", required: true },
    { name: "tutar", type: "number" },
    { name: "pb", type: "select", values: PB, maxSelect: 1 },
    { name: "duzenleme", type: "date" },
    { name: "bitis", type: "date" },
    { name: "iadePlan", type: "date" },
    { name: "komisyonOran", type: "number" },
    { name: "durum", type: "select", values: ["Aktif", "İade edildi", "Kapandı"], maxSelect: 1 },
    { name: "not", type: "text" } ], FIN, [ix("fin_teminatlar")]);

  uyumla("fin_sabitler", [
    { name: "ad", type: "text", required: true },
    { name: "kategori", type: "text" },
    { name: "yon", type: "select", values: ["Giriş", "Çıkış"], maxSelect: 1, required: true },
    { name: "tutar", type: "number", min: 0 },
    { name: "pb", type: "select", values: PB, maxSelect: 1 },
    { name: "bas", type: "text", pattern: "^(\\d{4}-(0[1-9]|1[0-2]))?$" },
    { name: "bit", type: "text", pattern: "^(\\d{4}-(0[1-9]|1[0-2]))?$" },
    { name: "gun", type: "number" },
    { name: "artis", type: "text" },
    { name: "oncelik", type: "select", values: ["Kritik", "Esnek"], maxSelect: 1 },
    { name: "not", type: "text" } ], FIN, [ix("fin_sabitler")]);

  uyumla("fin_talepler", [
    { name: "no", type: "number" },
    { name: "konu", type: "text" },
    { name: "soru", type: "text", required: true },
    { name: "cevap", type: "text" },
    { name: "durum", type: "select", values: ["Açık", "Cevaplandı", "Kapandı"], maxSelect: 1 },
    { name: "cevapTarihi", type: "date" },
    { name: "cevaplayan", type: "text" },
    { name: "kime", type: "text" },
    { name: "oncelik", type: "text" },
    { name: "aciklama", type: "text" } ], FIN, [ix("fin_talepler")]);

  uyumla("fin_ayarlar", [
    { name: "anahtar", type: "text", required: true },
    { name: "deger", type: "json", maxSize: 2000000 } ], YON, ["CREATE UNIQUE INDEX idx_fin_ayar_anahtar ON fin_ayarlar (anahtar)"]);

  uyumla("ortak_cari", [
    { name: "tarih", type: "date" },
    { name: "ortak", type: "select", values: ["Burhan", "Batur"], maxSelect: 1, required: true },
    { name: "yon", type: "select", values: ["Koydu", "Aldı"], maxSelect: 1, required: true },
    { name: "tutarUsd", type: "number", min: 0, required: true },
    { name: "tutar", type: "number" },
    { name: "pb", type: "select", values: PB, maxSelect: 1 },
    { name: "kur", type: "number" },
    { name: "sirket", type: "text" },
    { name: "devir", type: "bool" },
    { name: "aciklama", type: "text" } ], YON, [ix("ortak_cari")]);

  uyumla("varliklar", [
    { name: "ad", type: "text", required: true },
    { name: "tur", type: "text" },
    { name: "sahip", type: "text" },
    { name: "konum", type: "text" },
    { name: "rehin", type: "text" },
    { name: "deger", type: "number" },
    { name: "pb", type: "select", values: PB, maxSelect: 1 },
    { name: "degerTarihi", type: "date" },
    { name: "durum", type: "select", values: ["Elde", "Satışta", "Satıldı"], maxSelect: 1 },
    { name: "alisTarihi", type: "date" },
    { name: "alisBedeli", type: "number" },
    { name: "satisaUygun", type: "text" },
    { name: "hizliFiyat", type: "number" },
    { name: "satisTutar", type: "number" },
    { name: "satisTarihi", type: "date" },
    { name: "tahminiUsd", type: "number" },
    { name: "satisUsd", type: "number" },
    { name: "not", type: "text" } ], YON, [ix("varliklar")]);

  uyumla("ges_aylik", [
    { name: "donem", type: "text", required: true, pattern: "^\\d{4}-(0[1-9]|1[0-2])$" },
    { name: "uretimKwh", type: "number" },
    { name: "tahminKwh", type: "number" },
    { name: "cekisKwh", type: "number" },
    { name: "kiraTl", type: "number" },
    { name: "kiraTahsil", type: "date" },
    { name: "reaktifTl", type: "number" },
    { name: "digerGiderTl", type: "number" },
    { name: "ososGun", type: "json", maxSize: 20000 },
    { name: "iscGun", type: "json", maxSize: 20000 },
    { name: "ososDosya", type: "text" },
    { name: "not", type: "text" } ], YON, ["CREATE UNIQUE INDEX idx_ges_donem ON ges_aylik (donem)"]);
}, (app) => {
  ["fin_kartlar", "fin_limitler", "fin_teminatlar", "fin_sabitler", "fin_talepler", "fin_ayarlar"].forEach((n) => { try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {} });
});
