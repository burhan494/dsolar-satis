/// <reference path="../pb_data/types.d.ts" />
// Beacon'da tutarı 0 olan kayıtlar (ör. henüz tutarı belli olmayan plan kalemleri) aktarılabilsin:
// PocketBase sayı alanında "zorunlu" 0'ı boş sayıyor. Zorunluluk kaldırılır; ekranlar tutarı yine kontrol eder.
migrate((app) => {
  [["fin_hareketler", "tutar"], ["ortak_cari", "tutarUsd"]].forEach((x) => {
    const c = app.findCollectionByNameOrId(x[0]), f = c.fields.getByName(x[1]);
    if (f) { f.required = false; app.save(c); }
  });
}, (app) => {});
