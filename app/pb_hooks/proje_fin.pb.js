/// <reference path="../pb_data/types.d.ts" />
// Projenin ödeme planı ve malzeme maliyeti girilince Finans'a planlı tahsilat ve gider olarak bir kez aktarılır
// (satış ekibinin finans yetkisi olmasa da). Aktarılan hareketler sonra Finans'ta düzenlenir.
onRecordAfterCreateSuccess((e) => { try { require(`${__hooks}/proje_lib.js`).planAktar(e.app, e.record); } catch (x) { console.log("proje planı aktarılamadı", x); } e.next(); }, "projeler");
onRecordAfterUpdateSuccess((e) => { try { require(`${__hooks}/proje_lib.js`).planAktar(e.app, e.record); } catch (x) { console.log("proje planı aktarılamadı", x); } e.next(); }, "projeler");
