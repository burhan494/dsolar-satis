/// <reference path="../pb_data/types.d.ts" />
// v55: Personel kartları (kıdem/ihbar/izin hesabı için). Yalnız yönetici ve "ortak" bölüm yetkisi olanlar görür/düzenler.
migrate((app) => {
  let P; try { P = app.findCollectionByNameOrId("personel"); } catch (e) { P = null; }
  if (!P) P = new Collection({ type: "base", name: "personel", fields: [
    { name: "ad", type: "text", required: true, max: 120 },
    { name: "gorev", type: "text", max: 120 },
    { name: "yer", type: "text", max: 60 },
    { name: "giris", type: "date" },
    { name: "onceki", type: "json", maxSize: 20000 },
    { name: "net", type: "number" },
    { name: "brut", type: "number" },
    { name: "yemek", type: "number" },
    { name: "yol", type: "number" },
    { name: "diger", type: "number" },
    { name: "izinGun", type: "number" },
    { name: "izinTarih", type: "date" },
    { name: "gvMatrah", type: "number" },
    { name: "sigortasiz", type: "bool" },
    { name: "tesvik", type: "bool" },
    { name: "durum", type: "select", values: ["Aktif", "Çıkış planlandı", "Ayrıldı"], maxSelect: 1 },
    { name: "cikis", type: "date" },
    { name: "ihbar", type: "text", max: 40 },
    { name: "hareketler", type: "json", maxSize: 20000 },
    { name: "izinler", type: "json", maxSize: 20000 },
    { name: "maasGecmis", type: "json", maxSize: 50000 },
    { name: "not", type: "text", max: 2000 },
    { name: "created", type: "autodate", onCreate: true }, { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ] });
  const A = "@request.auth.aktif = true", Y = "@request.auth.rol = 'yonetici'";
  const G = "(" + Y + " || @request.auth.y_ortak = 'g' || @request.auth.y_ortak = 'd')", D = "(" + Y + " || @request.auth.y_ortak = 'd')";
  P.listRule = A + " && " + G; P.viewRule = P.listRule; P.createRule = A + " && " + D; P.updateRule = A + " && " + D; P.deleteRule = A + " && " + D;
  app.save(P);
}, (app) => { try { app.delete(app.findCollectionByNameOrId("personel")); } catch (e) {} });
