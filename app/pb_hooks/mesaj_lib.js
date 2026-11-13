// Ekip içi mesajlaşma yardımcıları: kayda bağlı sohbet bulma/açma ve sistem mesajı yazma (onay bildirimleri).
function simdi() { return new Date().toISOString().replace("T", " "); }
function ekipUyeleri(app) { try { return app.findRecordsByFilter("users", "aktif = true && rol != 'ortak'", "created", 500, 0); } catch (x) { return []; } }
function yoneticiler(app) { try { return app.findRecordsByFilter("users", "aktif = true && rol = 'yonetici'", "created", 50, 0).map((u) => u.id); } catch (x) { return []; } }
// anahtar ile tekil sohbet; yoksa açılır, varsa eksik üyeler eklenir
function sohbetAc(app, anahtar, ad, kayitTip, kayitId, uyeler) {
  let s = null; try { s = app.findFirstRecordByFilter("sohbetler", "anahtar = {:a}", { a: anahtar }); } catch (x) { s = null; }
  const U = uyeler.filter((x, i) => x && uyeler.indexOf(x) === i);
  if (!s) { s = new Record(app.findCollectionByNameOrId("sohbetler")); s.set("tip", "kayit"); s.set("anahtar", anahtar); s.set("ad", ad); s.set("kayitTip", kayitTip); s.set("kayitId", kayitId); s.set("uyeler", U); app.save(s); return s; }
  const m = s.getStringSlice("uyeler"), yeni = U.filter((x) => m.indexOf(x) < 0);
  if (yeni.length) { s.set("uyeler", m.concat(yeni)); app.save(s); }
  return s;
}
// sistem mesajı: gönderen, işlemi yapan kişidir; eylem düğmeleri istemcide gösterilir
function yaz(app, sohbet, gonderen, metin, eylem) {
  const m = new Record(app.findCollectionByNameOrId("mesajlar"));
  m.set("sohbet", sohbet.id); if (gonderen) m.set("gonderen", gonderen); m.set("metin", metin); if (eylem) m.set("eylem", eylem); if (gonderen) m.set("okuyanlar", [gonderen]);
  app.save(m);
  return m;
}
function ozetYaz(app, m) {
  try { const s = app.findRecordById("sohbetler", m.getString("sohbet")); let t = m.getString("metin") || (m.getStringSlice("ek").length ? "📎 Ek" : "");
    s.set("sonMesaj", t.slice(0, 280)); s.set("sonMesajTarih", simdi()); s.set("sonGonderen", m.getString("gonderen")); app.unsafeWithoutHooks().save(s); } catch (x) { console.log("sohbet özeti yazılamadı", x); }
}
function kisiAd(app, id) { try { const u = app.findRecordById("users", id); return u.getString("name") || u.getString("email"); } catch (x) { return ""; } }
function ekibeEkle(app, u) {
  if (!u.getBool("aktif") || u.getString("rol") === "ortak") return;
  try { const s = app.findFirstRecordByFilter("sohbetler", "anahtar = 'ekip'"), U = s.getStringSlice("uyeler"); if (U.indexOf(u.id) < 0) { s.set("uyeler", U.concat([u.id])); app.unsafeWithoutHooks().save(s); } } catch (x) {}
}
function teklifSohbet(app, t) {
  let ad = ""; try { ad = app.findRecordById("adaylar", t.getString("aday")).getString("ad"); } catch (x) {}
  return { L: module.exports, ad: ad, s: sohbetAc(app, "teklif:" + t.id, "Teklif " + t.getString("no") + (ad ? " · " + ad : ""), "teklif", t.id, [t.getString("hazirlayan")].concat(yoneticiler(app))) };
}
module.exports = { simdi, ekipUyeleri, yoneticiler, sohbetAc, yaz, ozetYaz, kisiAd, ekibeEkle, teklifSohbet };
