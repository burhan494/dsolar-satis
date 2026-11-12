/// <reference path="../pb_data/types.d.ts" />
// Son giriş zamanı ve kayıt geçmişi (ekip yetkileri, teklif onayı, ödeme listesi onayı, silinen müşteri/finans kaydı).
onRecordAuthRequest((e) => {
  e.next();
  try { const r = e.record, s = r.getString("sonGiris"), simdi = new Date();
    if (!s || simdi.getTime() - new Date(s.replace(" ", "T")).getTime() > 5 * 60000) { const x = e.app.findRecordById("users", r.id); x.set("sonGiris", simdi.toISOString().replace("T", " ")); e.app.unsafeWithoutHooks().save(x); } } catch (x) { console.log("son giriş yazılamadı", x); }
}, "users");
onRecordCreateRequest((e) => { e.next(); const L = require(`${__hooks}/kayit_lib.js`); L.yaz(e.app, L.kim(e), "ekip", (e.record.getString("name") || e.record.getString("email")) + ": hesap açıldı"); }, "users");
onRecordUpdateRequest((e) => {
  const o = e.record.original(), ALAN = { y_musteri: "Müşteriler", y_teklif: "Teklifler", y_fiyat: "Fiyat", y_proje: "Projeler", y_fin: "Finans", y_odeme: "Ödemeler", y_ges: "GES", y_ortak: "Ortaklar", y_ekip: "Ekip" }, D = { "": "yok", g: "görür", d: "düzenler" }, F = [];
  Object.keys(ALAN).forEach((k) => { const a = o.getString(k), b = e.record.getString(k); if (a !== b) F.push(ALAN[k] + ": " + D[b]); });
  if (o.getString("rol") !== e.record.getString("rol")) F.push("rol " + e.record.getString("rol"));
  if (o.getBool("aktif") !== e.record.getBool("aktif")) F.push(e.record.getBool("aktif") ? "hesap açıldı" : "hesap kapatıldı");
  if (o.getString("unvan") !== e.record.getString("unvan")) F.push("etiket " + (e.record.getString("unvan") || "—"));
  if (o.getBool("kendi") !== e.record.getBool("kendi")) F.push(e.record.getBool("kendi") ? "sadece kendi müşterileri" : "tüm müşteriler");
  const sifre = o.getString("password") !== e.record.getString("password");
  e.next();
  const L = require(`${__hooks}/kayit_lib.js`), ad = e.record.getString("name") || e.record.getString("email");
  if (F.length) L.yaz(e.app, L.kim(e), "ekip", ad + ": " + F.join(", "));
  if (sifre && (!e.auth || e.auth.id !== e.record.id)) L.yaz(e.app, L.kim(e), "ekip", ad + ": şifre sıfırlandı");
}, "users");
onRecordUpdateRequest((e) => {
  const o = e.record.original().getString("durum"), y = e.record.getString("durum"); e.next();
  if (o !== y && (y === "Gönderildi" || y === "Anlaşıldı" || y === "Kaybedildi")) { const L = require(`${__hooks}/kayit_lib.js`); L.yaz(e.app, L.kim(e), "teklif", "Teklif " + e.record.getString("no") + ": " + (y === "Gönderildi" ? "onaylandı" : y.toLocaleLowerCase())); }
}, "teklifler");
onRecordUpdateRequest((e) => {
  const o = e.record.original().getString("durum"), y = e.record.getString("durum"); e.next();
  if (o !== y && y !== "Onayda") { const L = require(`${__hooks}/kayit_lib.js`); L.yaz(e.app, L.kim(e), "ödeme", "Ödeme listesi " + e.record.getString("ad") + ": " + y.toLocaleLowerCase()); }
}, "odeme_listeleri");
onRecordDeleteRequest((e) => { const ad = e.record.getString("ad"); e.next(); const L = require(`${__hooks}/kayit_lib.js`); L.yaz(e.app, L.kim(e), "müşteri", "Müşteri silindi: " + ad); }, "adaylar");
onRecordDeleteRequest((e) => { const r = e.record, ne = [r.getString("karsiTaraf"), r.getString("aciklama")].filter((x) => x).join(" · ") + " " + r.getFloat("tutar") + " " + r.getString("pb"); e.next(); const L = require(`${__hooks}/kayit_lib.js`); L.yaz(e.app, L.kim(e), "finans", "Finans kaydı silindi: " + ne); }, "fin_hareketler");
