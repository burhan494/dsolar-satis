/// <reference path="../pb_data/types.d.ts" />
// v91 · Satış B+ — sunucu tarafı kurallar
//  • Müşteri: aynı telefonla ikinci kayıt engellenir (bilerek "yine de kaydet" denirse ?cift=1). Aşama geçmişi tutulur.
//  • Sıradaki iş ↔ ana görev eşitlenir; aynı müşteri, aynı başlık ve aynı gün için ikinci açık görev açılmaz.
//  • Onaylanmış/anlaşılmış teklifin fiyat alanları değişmez (revizyon gerekir); aynı teklif iki kez kaydedilmez.
//  • Maliyet ve kâr payı alanları fiyat/finans yetkisi olmayanlara API'de gösterilmez.
onRecordCreateRequest((e) => {
  const L = require(`${__hooks}/satis_lib.js`);
  let cift = ""; try { cift = String((e.requestInfo().query || {})["cift"] || ""); } catch (x) {}
  if (cift !== "1") { const c = L.telCift(e.app, e.record.getString("tel"), ""); if (c) throw new BadRequestError("Bu telefon zaten kayıtlı: " + c.getString("ad") + " (" + (c.getString("asama") || "Aday") + "). Aynı kişiyse mevcut kaydı açın."); }
  e.next();
  try { L.adayDegisti(e.app, e.record, null, e.auth ? e.auth.id : ""); } catch (x) { console.log("satış: yeni müşteri eşitlenemedi", x); }
}, "adaylar");
onRecordUpdateRequest((e) => {
  const L = require(`${__hooks}/satis_lib.js`), o = e.record.original();
  if (o.getString("tel") !== e.record.getString("tel")) { let cift = ""; try { cift = String((e.requestInfo().query || {})["cift"] || ""); } catch (x) {} if (cift !== "1") { const c = L.telCift(e.app, e.record.getString("tel"), e.record.id); if (c) throw new BadRequestError("Bu telefon başka bir müşteride kayıtlı: " + c.getString("ad")); } }
  e.next();
  try { L.adayDegisti(e.app, e.record, o, e.auth ? e.auth.id : ""); } catch (x) { console.log("satış: müşteri eşitlenemedi", x); }
}, "adaylar");
onRecordCreateRequest((e) => {
  const L = require(`${__hooks}/satis_lib.js`), r = e.record, au = e.auth;
  if (!r.getString("durum")) r.set("durum", L.ACIK); if (!r.getString("oncelik")) r.set("oncelik", "Normal"); if (au && !r.getString("olusturan")) r.set("olusturan", au.id);
  if (r.getString("durum") !== L.ACIK) r.set("ana", false);
  if (au && au.getBool("kendi") && au.getString("rol") !== "yonetici" && r.getString("aday")) {
    let a = null; try { a = e.app.findRecordById("adaylar", r.getString("aday")); } catch (x) {}
    const s = r.get("sorumlu") || []; if (!a || !(a.getString("sorumlu") === au.id || a.getString("kesifci") === au.id || s.indexOf(au.id) >= 0)) throw new ForbiddenError("Bu müşteri için görev açma yetkiniz yok.");
  }
  const m = L.mukerrerGorev(e.app, r, ""); if (m) throw new BadRequestError("Bu görev zaten açık: " + m.getString("baslik"));
  if (r.getBool("ana") && (!r.getString("aday") || L.anaBul(e.app, r.getString("aday")))) r.set("ana", false);
  e.next();
  try { L.gorevSonra(e.app, r); } catch (x) { console.log("satış: görev eşitlenemedi", x); }
}, "gorevler");
onRecordUpdateRequest((e) => {
  const L = require(`${__hooks}/satis_lib.js`), r = e.record, o = r.original(), au = e.auth;
  if (o.getString("durum") !== r.getString("durum") && r.getString("durum") !== L.ACIK) { if (!r.getString("tamamTarih")) r.set("tamamTarih", L.simdi()); if (au && !r.getString("tamamlayan")) r.set("tamamlayan", au.id); }
  if (o.getString("ana") !== r.getString("ana") && r.getBool("ana") && !o.getBool("ana")) { const v = L.anaBul(e.app, r.getString("aday")); if (v && v.id !== r.id) r.set("ana", false); }
  if (r.getString("aday") !== o.getString("aday")) throw new BadRequestError("Görevin müşterisi değiştirilemez.");
  const m = L.mukerrerGorev(e.app, r, r.id); if (m) throw new BadRequestError("Aynı gün için aynı görev zaten açık: " + m.getString("baslik"));
  e.next();
  try { L.gorevSonra(e.app, r); } catch (x) { console.log("satış: görev eşitlenemedi", x); }
}, "gorevler");
onRecordDeleteRequest((e) => {
  const ad = e.record.getString("aday"), ana = e.record.getBool("ana") && e.record.getString("durum") === "Açık";
  e.next();
  if (ad && ana) { try { require(`${__hooks}/satis_lib.js`).terfi(e.app, ad); } catch (x) { console.log("satış: görev silme eşitlenemedi", x); } }
}, "gorevler");
onRecordCreateRequest((e) => {
  const r = e.record; let L = [];
  try { L = e.app.findRecordsByFilter("teklifler", "aday = {:a} && fiyatUSD = {:f} && kwp = {:k} && created >= {:t}", "", 5, 0, { a: r.getString("aday"), f: r.getFloat("fiyatUSD"), k: r.getFloat("kwp"), t: new Date(Date.now() - 120000).toISOString().replace("T", " ") }); } catch (x) { L = []; }
  if (L.length) throw new BadRequestError("Bu teklif az önce kaydedildi (" + L[0].getString("no") + "). Çift kayıt açılmadı.");
  e.next();
}, "teklifler");
onRecordUpdateRequest((e) => {
  const L = require(`${__hooks}/satis_lib.js`), r = e.record, o = r.original(), od = o.getString("durum"), yd = r.getString("durum");
  if ((od === "Gönderildi" || od === "Anlaşıldı") && ["fiyatUSD", "kalemler", "kwp", "malzemeUsd", "marj", "panelAdet", "kur", "tip"].some((k) => o.getString(k) !== r.getString(k)))
    throw new BadRequestError("Onaylanmış teklifin fiyatı ve kalemleri değiştirilemez; yeni revizyon oluşturun.");
  if (od !== "Gönderildi" && yd === "Gönderildi") {
    let g = 7; try { const s = e.app.findFirstRecordByFilter("ayarlar", "anahtar = 'teklif'"); const v = JSON.parse(s.getString("deger") || "{}"); if (+v.gecerlilik > 0) g = +v.gecerlilik; } catch (x) {}
    if (!r.getString("gecerlilik")) r.set("gecerlilik", L.isGunuEkle(g)); if (!r.getString("takipTarihi")) r.set("takipTarihi", L.isGunuEkle(Math.min(3, g)));
  }
  e.next();
}, "teklifler");
onRecordEnrich((e) => {
  const au = e.requestInfo && e.requestInfo.auth;
  if (!require(`${__hooks}/satis_lib.js`).yetkili(au, ["fiyat", "fin"])) { e.record.hide("malzemeUsd", "marj"); }
  e.next();
}, "teklifler");
onRecordEnrich((e) => {
  const au = e.requestInfo && e.requestInfo.auth;
  if (!require(`${__hooks}/satis_lib.js`).yetkili(au, ["fiyat", "fin"])) e.record.hide("maliyetUsd");
  e.next();
}, "projeler");
// maliyeti görmeyen kişi projeyi başlatırsa malzeme maliyeti anlaşılan tekliften alınır (Finans'taki planlı gider eksik kalmasın)
onRecordCreateRequest((e) => {
  const r = e.record; let pl = {}; try { pl = JSON.parse(r.getString("odemePlan") || "{}") || {}; } catch (x) { pl = {}; }
  const stok = !!(pl.maliyet && pl.maliyet.stok);
  if (!stok && !(pl.maliyet && +pl.maliyet.usd > 0) && r.getString("teklif")) {
    try { const t = e.app.findRecordById("teklifler", r.getString("teklif")), m = t.getFloat("malzemeUsd"); if (m > 0) { pl.maliyet = { usd: m }; r.set("odemePlan", pl); if (!(r.getFloat("maliyetUsd") > 0)) r.set("maliyetUsd", m); } } catch (x) {}
  }
  e.next();
}, "projeler");
// maliyeti görmeyen kişi proje planını düzenlerse mevcut maliyet bilgisi korunur
onRecordUpdateRequest((e) => {
  const r = e.record, o = r.original();
  if (!require(`${__hooks}/satis_lib.js`).yetkili(e.auth, ["fiyat", "fin"])) {
    r.set("maliyetUsd", o.getFloat("maliyetUsd"));
    let p = {}, po = {}; try { p = JSON.parse(r.getString("odemePlan") || "{}") || {}; } catch (x) {} try { po = JSON.parse(o.getString("odemePlan") || "{}") || {}; } catch (x) {}
    if (r.getString("odemePlan") !== o.getString("odemePlan")) { if (po.maliyet) p.maliyet = po.maliyet; else delete p.maliyet; r.set("odemePlan", p); }
  }
  e.next();
}, "projeler");
