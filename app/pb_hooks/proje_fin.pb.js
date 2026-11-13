/// <reference path="../pb_data/types.d.ts" />
// Projenin ödeme planı ve malzeme maliyeti Finans'a planlı tahsilat ve gider olarak aktarılır
// (satış ekibinin finans yetkisi olmasa da). Sözleşme tarihi, bedel, tür ya da plan sonradan değişirse
// gerçekleşmemiş planlı kayıtlar yeni bilgilere göre güncellenir; gerçekleşmiş kayıtlara dokunulmaz.
onRecordAfterCreateSuccess((e) => { try { require(`${__hooks}/proje_lib.js`).planAktar(e.app, e.record); } catch (x) { console.log("proje planı aktarılamadı", x); } e.next(); }, "projeler");
onRecordAfterUpdateSuccess((e) => {
  try {
    const L = require(`${__hooks}/proje_lib.js`), r = e.record, o = r.original();
    if (!r.getBool("planAktarildi")) L.planAktar(e.app, r);
    else if (["basla", "bedelUsd", "tur", "odemePlan", "maliyetUsd"].some((k) => o.getString(k) !== r.getString(k))) L.planYenile(e.app, r);
  } catch (x) { console.log("proje planı aktarılamadı", x); }
  e.next();
}, "projeler");
