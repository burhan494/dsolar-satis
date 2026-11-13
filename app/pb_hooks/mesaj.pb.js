/// <reference path="../pb_data/types.d.ts" />
// Ekip içi mesajlaşma kuralları ve onay bildirimleri.
// - Sohbet açan otomatik üye olur; birebir sohbet iki kişi arasında tektir; iş ortakları üye olamaz.
// - Mesajın göndereni her zaman oturum sahibidir; istemci "eylem" (onay düğmesi) yazamaz.
// - Başkasının mesajında yalnız "okundu" eklenebilir; kendi mesajını düzelten "düzenlendi" işareti alır. Mesaj silinmez.
// - Ödeme listesi ve teklif onaya düşünce yöneticilere, sonuçlanınca hazırlayana sohbet mesajı gider.

onRecordCreateRequest((e) => {
  const a = e.auth; if (!a) throw new ForbiddenError("Oturum gerekli");
  const r = e.record, tip = r.getString("tip");
  if (tip === "kayit" && a.getString("rol") !== "yonetici" && !r.getString("kayitId")) throw new BadRequestError("Kayıt bilgisi eksik");
  let U = r.getStringSlice("uyeler"); if (U.indexOf(a.id) < 0) U.push(a.id);
  // yalnız aktif ekip üyeleri
  U = U.filter((id, i) => U.indexOf(id) === i && (() => { try { const u = e.app.findRecordById("users", id); return u.getBool("aktif") && u.getString("rol") !== "ortak"; } catch (x) { return false; } })());
  r.set("uyeler", U); r.set("olusturan", a.id);
  if (tip === "birebir") { if (U.length !== 2) throw new BadRequestError("Birebir sohbet iki kişi arasında olur"); r.set("anahtar", "bb:" + U.slice().sort().join(":")); r.set("ad", ""); }
  else if (tip === "kayit") r.set("anahtar", r.getString("kayitTip") + ":" + r.getString("kayitId"));
  else r.set("anahtar", "");
  r.set("sonMesajTarih", require(`${__hooks}/mesaj_lib.js`).simdi());
  e.next();
}, "sohbetler");

onRecordUpdateRequest((e) => {
  const o = e.record.original(), r = e.record;
  ["tip", "anahtar", "kayitTip", "kayitId", "olusturan", "sonMesaj", "sonMesajTarih", "sonGonderen"].forEach((k) => r.set(k, o.get(k)));
  if (o.getString("tip") === "birebir") { r.set("uyeler", o.get("uyeler")); r.set("ad", o.getString("ad")); }
  else { // üye çıkarılamaz, yalnız aktif ekip üyesi eklenebilir
    const eski = o.getStringSlice("uyeler"), yeni = r.getStringSlice("uyeler").filter((id) => eski.indexOf(id) < 0 && (() => { try { const u = e.app.findRecordById("users", id); return u.getBool("aktif") && u.getString("rol") !== "ortak"; } catch (x) { return false; } })());
    r.set("uyeler", eski.concat(yeni)); }
  e.next();
}, "sohbetler");

onRecordCreateRequest((e) => {
  const a = e.auth; if (!a) throw new ForbiddenError("Oturum gerekli");
  const ekSay = (r) => { try { const v = r.get("ek"); return v ? v.length || 0 : 0; } catch (x) { return 0; } };
  const ekIstek = (e) => { try { const f = e.request.multipartForm; return !!(f && f.file && ((f.file["ek"] || []).length || (f.file["ek+"] || []).length)); } catch (x) { return false; } };
  const r = e.record; r.set("gonderen", a.id); r.set("eylem", null); r.set("okuyanlar", [a.id]); r.set("duzenlendi", false);
  let s; try { s = e.app.findRecordById("sohbetler", r.getString("sohbet")); } catch (x) { throw new BadRequestError("Sohbet bulunamadı"); }
  if (s.getStringSlice("uyeler").indexOf(a.id) < 0) throw new ForbiddenError("Bu sohbetin üyesi değilsiniz");
  if (!r.getString("metin").trim() && !ekSay(r) && !ekIstek(e)) throw new BadRequestError("Boş mesaj gönderilemez");
  e.next();
}, "mesajlar");

onRecordUpdateRequest((e) => {
  const a = e.auth, o = e.record.original(), r = e.record;
  ["sohbet", "gonderen", "eylem", "created"].forEach((k) => r.set(k, o.get(k)));
  const okuyan = o.getStringSlice("okuyanlar"); if (okuyan.indexOf(a.id) < 0) okuyan.push(a.id); r.set("okuyanlar", okuyan); // yalnız kendini ekleyebilir
  if (o.getString("gonderen") !== a.id) { r.set("metin", o.getString("metin")); r.set("ek", o.get("ek")); r.set("duzenlendi", o.getBool("duzenlendi")); }
  else if (o.getString("metin") !== r.getString("metin")) { if (!r.getString("metin").trim()) r.set("metin", o.getString("metin")); r.set("duzenlendi", true); r.set("ek", o.get("ek")); }
  else r.set("ek", o.get("ek"));
  e.next();
}, "mesajlar");

onRecordAfterCreateSuccess((e) => { try { require(`${__hooks}/mesaj_lib.js`).ozetYaz(e.app, e.record); } catch (x) { console.log(x); } e.next(); }, "mesajlar");

// yeni ekip üyesi Ekip grubuna girer
onRecordAfterCreateSuccess((e) => { try { require(`${__hooks}/mesaj_lib.js`).ekibeEkle(e.app, e.record); } catch (x) {} e.next(); }, "users");
onRecordAfterUpdateSuccess((e) => { try { require(`${__hooks}/mesaj_lib.js`).ekibeEkle(e.app, e.record); } catch (x) {} e.next(); }, "users");

// ödeme listesi onaya düştü / sonuçlandı
onRecordAfterCreateSuccess((e) => {
  try { const r = e.record; if (r.getString("durum") !== "Onayda") return e.next();
    const L = require(`${__hooks}/mesaj_lib.js`), hz = r.getString("hazirlayan"), ad = r.getString("ad");
    let n = 0; try { n = e.app.findRecordsByFilter("fin_hareketler", "odemeListesi = {:l}", "", 1000, 0, { l: r.id }).length; } catch (x) {}
    const s = L.sohbetAc(e.app, "odeme:" + r.id, "Ödeme listesi · " + ad, "odeme", r.id, [hz].concat(L.yoneticiler(e.app)));
    L.yaz(e.app, s, hz || (e.auth && e.auth.id), "📋 " + (L.kisiAd(e.app, hz) || "Muhasebe") + " ödeme listesini onaya gönderdi: " + ad + (n ? " · " + n + " kalem" : "") + ". Onaylar mısınız?", { tip: "odeme_onay", id: r.id });
  } catch (x) { console.log("ödeme onay mesajı yazılamadı", x); }
  e.next();
}, "odeme_listeleri");
onRecordAfterUpdateSuccess((e) => {
  try { const r = e.record, o = r.original(), d0 = o.getString("durum"), d = r.getString("durum"); if (d0 === d) return e.next();
    const L = require(`${__hooks}/mesaj_lib.js`), hz = r.getString("hazirlayan"), ad = r.getString("ad"), kim = (e.auth && e.auth.id) || r.getString("onaylayan");
    if (d === "Onayda") { const s = L.sohbetAc(e.app, "odeme:" + r.id, "Ödeme listesi · " + ad, "odeme", r.id, [hz].concat(L.yoneticiler(e.app)));
      L.yaz(e.app, s, hz || kim, "📋 Ödeme listesi yeniden onaya gönderildi: " + ad + ". Onaylar mısınız?", { tip: "odeme_onay", id: r.id }); }
    else if (d0 === "Onayda" && (d === "Onaylandı" || d === "Kısmen onaylandı" || d === "Reddedildi")) { const s = L.sohbetAc(e.app, "odeme:" + r.id, "Ödeme listesi · " + ad, "odeme", r.id, [hz].concat(L.yoneticiler(e.app)));
      L.yaz(e.app, s, kim, (d === "Reddedildi" ? "✕ " : "✓ ") + (L.kisiAd(e.app, kim) || "Yönetici") + " ödeme listesini " + (d === "Onaylandı" ? "onayladı" : d === "Kısmen onaylandı" ? "kısmen onayladı" : "reddetti") + ": " + ad, { tip: "odeme_sonuc", id: r.id }); }
  } catch (x) { console.log("ödeme sonuç mesajı yazılamadı", x); }
  e.next();
}, "odeme_listeleri");

// teklif onaya düştü / onaylandı
onRecordAfterCreateSuccess((e) => {
  try { const t = e.record; if (t.getString("durum") !== "Onay bekliyor") return e.next();
    const { L, ad, s } = require(`${__hooks}/mesaj_lib.js`).teklifSohbet(e.app, t), hz = t.getString("hazirlayan") || (e.auth && e.auth.id);
    L.yaz(e.app, s, hz, "📄 " + (L.kisiAd(e.app, hz) || "Satış") + " teklif hazırladı: " + t.getString("no") + (ad ? " · " + ad : "") + " · " + String(Math.round(t.getFloat("kwp") * 10) / 10).replace(".", ",") + " kWp · " + String(Math.round(t.getFloat("fiyatUSD"))).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " $. Onaylar mısınız?", { tip: "teklif_onay", id: t.id, aday: t.getString("aday") });
  } catch (x) { console.log("teklif onay mesajı yazılamadı", x); }
  e.next();
}, "teklifler");
// onay isteği üzerinden çalışır: onaylayan kişi oturumdan alınır
onRecordUpdateRequest((e) => {
  const d0 = e.record.original().getString("durum");
  e.next();
  try { const t = e.record, d = t.getString("durum"); if (d0 === d) return;
    if (d === "Onay bekliyor") { const { L, ad, s } = require(`${__hooks}/mesaj_lib.js`).teklifSohbet(e.app, t), hz = (e.auth && e.auth.id) || t.getString("hazirlayan");
      L.yaz(e.app, s, hz, "📄 Teklif " + t.getString("no") + (ad ? " · " + ad : "") + " onaya gönderildi. Onaylar mısınız?", { tip: "teklif_onay", id: t.id, aday: t.getString("aday") }); }
    else if (d0 === "Onay bekliyor" && d === "Gönderildi") { const { L, s } = require(`${__hooks}/mesaj_lib.js`).teklifSohbet(e.app, t), kim = e.auth && e.auth.id;
      L.yaz(e.app, s, kim, "✓ " + (L.kisiAd(e.app, kim) || "Yönetici") + " teklifi onayladı: " + t.getString("no"), { tip: "teklif_sonuc", id: t.id, aday: t.getString("aday") }); }
  } catch (x) { console.log("teklif sonuç mesajı yazılamadı", x); }
}, "teklifler");

// Bir kayıt (müşteri, proje, teklif, ödeme listesi) hakkındaki sohbeti açar ya da kişiyi mevcut sohbete ekler.
// Yalnız o kaydı görme yetkisi olan kişi katılabilir.
routerAdd("POST", "/api/dsolar/kayit-sohbet", (e) => {
  const a = e.auth; if (!a || !a.getBool("aktif") || a.getString("rol") === "ortak") return e.json(403, { mesaj: "Yetki yok" });
  const b = e.requestInfo().body || {}, T = { aday: "adaylar", proje: "projeler", teklif: "teklifler", odeme: "odeme_listeleri" }, col = T[b.tip];
  if (!col || !b.id) return e.json(400, { mesaj: "Eksik bilgi" });
  let r; try { r = e.app.findRecordById(col, String(b.id)); } catch (x) { return e.json(404, { mesaj: "Kayıt bulunamadı" }); }
  let ok = false; try { ok = e.app.canAccessRecord(r, e.requestInfo(), r.collection().viewRule); } catch (x) { ok = a.getString("rol") === "yonetici"; }
  if (!ok) return e.json(403, { mesaj: "Bu kaydı görme yetkiniz yok" });
  const L = require(`${__hooks}/mesaj_lib.js`);
  let ad = "", ek = [];
  if (b.tip === "aday") { ad = "Müşteri · " + r.getString("ad"); ek = [r.getString("sorumlu")]; }
  else if (b.tip === "proje") { let n = ""; try { n = e.app.findRecordById("adaylar", r.getString("aday")).getString("ad"); } catch (x) {} ad = "Proje · " + n; }
  else if (b.tip === "teklif") { ad = "Teklif " + r.getString("no"); ek = [r.getString("hazirlayan")]; }
  else { ad = "Ödeme listesi · " + r.getString("ad"); ek = [r.getString("hazirlayan")]; }
  const s = L.sohbetAc(e.app, b.tip + ":" + r.id, ad, b.tip, r.id, [a.id].concat(ek, L.yoneticiler(e.app)));
  return e.json(200, { id: s.id });
}, $apis.requireAuth("users"));
