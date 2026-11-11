/// <reference path="../pb_data/types.d.ts" />
// Proje başlayınca, müşteri bir iş ortağından geldiyse komisyon kaydı "Bekliyor" olarak otomatik açılır.
// Oran ayarlar › ortak_program'dan okunur; hak ediş (peşinat tahsili) ve ödeme yönetici/muhasebe tarafından işaretlenir.
onRecordAfterCreateSuccess((e) => {
  try {
    const p = e.record, app = e.app;
    const aday = app.findRecordById("adaylar", p.getString("aday"));
    const ortak = aday.getString("ortak");
    if (ortak) {
      let var_ = false;
      try { app.findFirstRecordByFilter("komisyonlar", "aday = {:a}", { a: aday.id }); var_ = true; } catch (x) {}
      if (!var_) {
        let P = { oran: 0, sabitUsd: 0 };
        try { P = JSON.parse(app.findFirstRecordByData("ayarlar", "anahtar", "ortak_program").getString("deger")) || P; } catch (x) {}
        const bedel = p.getFloat("bedelUsd"), oran = +P.oran || 0, sabit = +P.sabitUsd || 0;
        const k = new Record(app.findCollectionByNameOrId("komisyonlar"));
        k.set("ortak", ortak); k.set("aday", aday.id); k.set("proje", p.id); k.set("bedelUsd", bedel); k.set("oran", oran);
        k.set("tutarUSD", Math.round((bedel * oran / 100 + sabit) * 100) / 100); k.set("durum", "Bekliyor");
        k.set("not", "Proje başlayınca otomatik açıldı");
        app.save(k);
      }
    }
  } catch (x) { console.log("komisyon otomatik açılamadı", x); }
  e.next();
}, "projeler");
