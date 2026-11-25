// v91 · Satış B+ — görev ↔ sıradaki iş eşitleme, aşama geçmişi, teklif ve mükerrer kayıt kuralları
const ACIK = "Açık";
function simdi() { return new Date().toISOString().replace("T", " "); }
function turTahmin(s) { s = String(s || ""); return /keşif|kesif/i.test(s) ? "Keşif" : /teklif/i.test(s) ? "Teklif" : /montaj|kurulum/i.test(s) ? "Montaj" : /\bara\b|arama|aranacak|tekrar ara|^ara/i.test(s) ? "Arama" : "Görüşme"; }
function saatli(t) { const s = String(t || "").slice(11, 16); return !!s && s !== "09:00" && s !== "00:00"; }
function anaBul(app, adayId) { try { return app.findFirstRecordByFilter("gorevler", "aday = {:a} && ana = true && durum = 'Açık'", { a: adayId }); } catch (e) { return null; } }
function slotYaz(app, adayId, g) {
  let a; try { a = app.findRecordById("adaylar", adayId); } catch (e) { return; }
  const is = g ? g.getString("baslik") : "", t = g ? g.getString("tarih") : "";
  if (a.getString("sonrakiIs") === is && a.getString("sonraki") === t) return;
  a.set("sonrakiIs", is); a.set("sonraki", t); app.save(a);
}
// müşterinin açık ana görevi yoksa en yakın tarihli açık görevi ana yap ve sıradaki işe yaz
function terfi(app, adayId) {
  let L = []; try { L = app.findRecordsByFilter("gorevler", "aday = {:a} && durum = 'Açık'", "tarih", 50, 0, { a: adayId }); } catch (e) { L = []; }
  const ana = L.filter((g) => g.getBool("ana"))[0];
  if (ana) { slotYaz(app, adayId, ana); return; }
  const tarihli = L.filter((g) => g.getString("tarih")), sec = tarihli[0] || L[0];
  if (!sec) { slotYaz(app, adayId, null); return; }
  sec.set("ana", true); app.save(sec); slotYaz(app, adayId, sec);
}
// müşteri kaydı (istek) değişti: aşama geçmişi + sıradaki iş → ana görev
function adayDegisti(app, a, o, kimId) {
  const eski = o ? o.getString("asama") : "", yeni = a.getString("asama");
  if (!o || eski !== yeni) { try { const r = new Record(app.findCollectionByNameOrId("asama_gecmis")); r.set("aday", a.id); r.set("eski", eski); r.set("yeni", yeni || "Aday"); if (kimId) r.set("kim", kimId); app.save(r); } catch (e) { console.log("aşama geçmişi yazılamadı", e); } }
  if (yeni === "Kaybedildi" && eski !== "Kaybedildi") {
    let L = []; try { L = app.findRecordsByFilter("gorevler", "aday = {:a} && durum = 'Açık'", "", 100, 0, { a: a.id }); } catch (e) { L = []; }
    L.forEach((g) => { g.set("durum", "İptal"); g.set("tamamNot", "Müşteri kaybedildi"); g.set("tamamTarih", simdi()); if (kimId) g.set("tamamlayan", kimId); g.set("ana", false); app.save(g); });
    return;
  }
  const is = a.getString("sonrakiIs"), t = a.getString("sonraki");
  if (o && o.getString("sonrakiIs") === is && o.getString("sonraki") === t) return;
  let g = anaBul(app, a.id);
  if (is) {
    if (!g) { g = new Record(app.findCollectionByNameOrId("gorevler")); g.set("aday", a.id); g.set("ana", true); g.set("durum", ACIK); g.set("oncelik", "Normal"); if (a.getString("sorumlu")) g.set("sorumlu", [a.getString("sorumlu")]); if (kimId) g.set("olusturan", kimId);
      g.set("adres", [a.getString("adres"), a.getString("ilce")].filter(Boolean).join(", ").slice(0, 300)); g.set("tur", turTahmin(is)); }
    else if (g.getString("baslik") !== is) g.set("tur", turTahmin(is));
    g.set("baslik", is.slice(0, 200)); g.set("tarih", t); g.set("saatli", saatli(t)); app.save(g);
  } else if (g) {
    g.set("durum", "Tamamlandı"); g.set("ana", false); g.set("tamamTarih", simdi()); if (kimId) g.set("tamamlayan", kimId); if (!g.getString("tamamNot")) g.set("tamamNot", "Sıradaki iş kapatıldı"); app.save(g);
    terfi(app, a.id);
  }
}
function gorevSonra(app, g) {
  const ad = g.getString("aday"); if (!ad) return;
  if (g.getString("durum") === ACIK) { if (g.getBool("ana")) slotYaz(app, ad, g); else if (!anaBul(app, ad)) terfi(app, ad); }
  else { if (g.getBool("ana")) { g.set("ana", false); app.save(g); } if (!anaBul(app, ad)) terfi(app, ad); }
}
function gun(t) { return String(t || "").slice(0, 10); }
function mukerrerGorev(app, g, haricId) {
  const ad = g.getString("aday"); if (!ad || g.getString("durum") !== ACIK) return null;
  let L = []; try { L = app.findRecordsByFilter("gorevler", "aday = {:a} && durum = 'Açık' && baslik = {:b}", "", 20, 0, { a: ad, b: g.getString("baslik") }); } catch (e) { L = []; }
  return L.filter((x) => x.id !== haricId && gun(x.getString("tarih")) === gun(g.getString("tarih")))[0] || null;
}
function isGunuEkle(n) { const d = new Date(); let k = 0; while (k < n) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) k++; } return d.toISOString().slice(0, 10) + " 12:00:00.000Z"; }
function telNorm(t) { let s = String(t || "").replace(/\D/g, ""); if (s.indexOf("90") === 0 && s.length === 12) s = s.slice(2); if (s.length === 10) s = "0" + s; return s; }
function telCift(app, tel, haricId) {
  const n = telNorm(tel); if (n.length !== 11) return null;
  let L = []; try { L = app.findRecordsByFilter("adaylar", "tel ~ {:s}", "", 50, 0, { s: n.slice(-7) }); } catch (e) { L = []; }
  return L.filter((a) => a.id !== haricId && telNorm(a.getString("tel")) === n)[0] || null;
}
function yetkili(au, alanlar) { if (!au) return false; if (au.isSuperuser && au.isSuperuser()) return true; if (au.getString("rol") === "yonetici") return true; return alanlar.some((m) => !!au.getString("y_" + m)); }
module.exports = { adayDegisti, gorevSonra, mukerrerGorev, anaBul, terfi, simdi, isGunuEkle, telCift, yetkili, ACIK };
