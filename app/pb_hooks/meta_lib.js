// Meta (Facebook/Instagram) bağlantısı — sunucu tarafı.
// Reklam formu dolduran kişiler otomatik aday olur (sorumlu sırayla atanır, ekibe mesaj gider); reklam harcaması kampanya bazında günlük çekilir.
// Uygulama Meta'da hiçbir şey değiştirmez: yalnız okur.
const VARSAYILAN_API = "https://graph.facebook.com/v21.0";
function simdi() { return new Date().toISOString().replace("T", " "); }
function bugunTR() { return new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10); }
function gunEkle(t, n) { const d = new Date(t + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function kayit(app) {
  try { return app.findFirstRecordByData("meta_ayar", "anahtar", "ana"); }
  catch (e) { const r = new Record(app.findCollectionByNameOrId("meta_ayar")); r.set("anahtar", "ana"); return r; }
}
function qs(o) { return Object.keys(o).filter((k) => o[k] != null && o[k] !== "").map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(o[k])).join("&"); }
function get(url) {
  const r = $http.send({ url: url, method: "GET", timeout: 40 });
  const j = r.json;
  if (!j) throw new Error("Meta yanıtı okunamadı (" + r.statusCode + ")");
  if (j.error) { const m = j.error.message || "bilinmeyen hata";
    if (j.error.code === 190) throw new Error("Erişim anahtarı geçersiz ya da süresi dolmuş");
    if (j.error.code === 10 || j.error.code === 200) throw new Error("Bu anahtarın gerekli izni yok: " + m);
    throw new Error("Meta: " + m); }
  return j;
}
function graph(api, token, path, q) { return get(api + path + "?" + qs(Object.assign({}, q || {}, { access_token: token }))); }
// tüm sayfaları dolaş (en fazla 20 sayfa)
function hepsi(api, token, path, q) {
  let j = graph(api, token, path, q), L = (j.data || []).slice(), n = 0;
  while (j.paging && j.paging.next && n < 20) { j = get(j.paging.next); L = L.concat(j.data || []); n++; }
  return L;
}
function telNorm(t) { const d = String(t || "").replace(/\D/g, ""); return d.length >= 10 ? d.slice(-10) : d; }
function telYaz(t) { const d = telNorm(t); return d.length === 10 ? "0" + d.slice(0, 3) + " " + d.slice(3, 6) + " " + d.slice(6, 8) + " " + d.slice(8) : String(t || ""); }
function kucuk(s) { return String(s || "").toLocaleLowerCase("tr").replace(/[_\-]/g, " "); }
// form cevaplarını alanlara eşle: soru adları reklamdan reklama değişebilir, anahtar kelimeyle bulunur
function alanlar(fd) {
  const o = { ad: "", tel: "", ilce: "", evTipi: "", fatura: "", digerleri: [] };
  (fd || []).forEach((f) => {
    const n = kucuk(f.name), v = ((f.values || [])[0] || "").toString().replace(/_/g, " ").trim();
    if (!v) return;
    if (n === "full name" || n === "ad soyad" || /^(ad|isim|name)/.test(n) && !o.ad) o.ad = v;
    else if (n === "first name") o.ad = (v + " " + o.ad).trim();
    else if (n === "last name") o.ad = (o.ad + " " + v).trim();
    else if (/phone|telefon/.test(n)) o.tel = v;
    else if (/il[cç]e|city|şehir|sehir|semt/.test(n)) o.ilce = v;
    else if (/ev|konut|bina|tip/.test(n) && !/fatura/.test(n)) o.evTipi = v;
    else if (/fatura|tutar|tüketim|tuketim/.test(n)) o.fatura = v;
    else o.digerleri.push(f.name + ": " + v);
  });
  return o;
}
function kalite(o) {
  const e = kucuk(o.evTipi), f = kucuk(o.fatura);
  if (/apartman|daire|site içi daire/.test(e)) return "Uygun değil";
  if (/altı|alti|1\.?000 tl altı|2\.?000 tl altı/.test(f)) return "Düşük fatura";
  return "Uygun";
}
function atanacaklar(app, rec) {
  let L = rec.getStringSlice("atananlar").filter((id) => { try { const u = app.findRecordById("users", id); return u.getBool("aktif"); } catch (e) { return false; } });
  if (!L.length) { try { L = app.findRecordsByFilter("users", "aktif = true && (rol = 'yonetici' || rol = 'satis')", "created", 50, 0).map((u) => u.id); } catch (e) { L = []; } }
  return L;
}
function leadCek(app, rec, api, token) {
  const sayfa = rec.getString("sayfaId"); if (!sayfa) return 0;
  // sayfa erişim anahtarı (form ve lead okuma için); alınamazsa ana anahtar kullanılır
  let pt = token; try { const p = graph(api, token, "/" + sayfa, { fields: "access_token,name" }); if (p.access_token) pt = p.access_token; } catch (e) {}
  const son = parseInt(rec.getString("sonLead") || "0", 10) || Math.floor(Date.now() / 1000) - 14 * 86400;
  let enSon = son, yeni = 0;
  const formlar = hepsi(api, pt, "/" + sayfa + "/leadgen_forms", { fields: "id,name,status", limit: 100 });
  const L = require(`${__hooks}/mesaj_lib.js`), kisi = atanacaklar(app, rec);
  let sira = rec.getInt("siradaki");
  formlar.forEach((fm) => {
    const leads = hepsi(api, pt, "/" + fm.id + "/leads", { fields: "id,created_time,ad_name,adset_name,campaign_name,form_id,field_data,is_organic", limit: 100,
      filtering: JSON.stringify([{ field: "time_created", operator: "GREATER_THAN", value: son }]) });
    leads.forEach((ld) => {
      const zaman = Math.floor(new Date(String(ld.created_time).replace(/\+0000$/, "Z")).getTime() / 1000) || 0;
      if (zaman > enSon) enSon = zaman;
      const kid = "meta:" + ld.id;
      try { app.findFirstRecordByData("adaylar", "kaynakId", kid); return; } catch (e) {}
      const o = alanlar(ld.field_data), tn = telNorm(o.tel), kal = kalite(o);
      const not = ["Meta reklam formu · " + (fm.name || "")].concat(o.evTipi ? ["Ev tipi: " + o.evTipi] : [], o.fatura ? ["Aylık fatura: " + o.fatura] : [], o.digerleri).join("\n");
      // aynı telefon zaten kayıtlıysa yeni müşteri açılmaz; mevcut kayda not düşülür
      let var_ = null;
      if (tn.length === 10) { try { var_ = app.findRecordsByFilter("adaylar", "tel ~ {:t}", "-created", 500, 0, { t: tn.slice(-2) }).filter((a) => telNorm(a.getString("tel")) === tn)[0] || null; } catch (e) { var_ = null; } }
      let a, yeniMi = !var_;
      if (var_) { a = var_; a.set("not", (a.getString("not") ? a.getString("not") + "\n\n" : "") + "[" + bugunTR() + "] Meta formunu tekrar doldurdu.\n" + not);
        if (!a.getString("metaKampanya")) { a.set("metaKampanya", ld.campaign_name || ""); a.set("metaReklam", ld.ad_name || ""); a.set("metaForm", fm.name || ""); }
        if (!a.getString("leadZaman")) a.set("leadZaman", new Date(zaman * 1000).toISOString().replace("T", " ")); }
      else {
        a = new Record(app.findCollectionByNameOrId("adaylar"));
        a.set("ad", o.ad || "Meta form · " + telYaz(o.tel)); a.set("tel", telYaz(o.tel)); a.set("ilce", o.ilce);
        a.set("kaynak", "Meta reklam"); a.set("kaynakId", kid); a.set("asama", "Aday"); a.set("iys", "Sorulacak");
        a.set("metaKampanya", ld.campaign_name || ""); a.set("metaReklam", ld.ad_name || ""); a.set("metaForm", fm.name || "");
        a.set("evTipi", o.evTipi); a.set("faturaAralik", o.fatura); a.set("leadKalite", kal); a.set("leadZaman", new Date(zaman * 1000).toISOString().replace("T", " "));
        a.set("not", not);
        if (kal !== "Uygun değil") { a.set("sonrakiIs", "Meta reklamından geldi, hemen arayın"); a.set("sonraki", simdi()); }
        if (kisi.length) { a.set("sorumlu", kisi[sira % kisi.length]); sira++; }
      }
      app.save(a);
      if (yeniMi) yeni++;
      try {
        const sor = a.getString("sorumlu"), s = L.sohbetAc(app, "aday:" + a.id, "Müşteri · " + a.getString("ad"), "aday", a.id, [sor].concat(L.yoneticiler(app)).filter(Boolean));
        L.yaz(app, s, null, (yeniMi ? "📣 Meta reklamından yeni müşteri: " : "🔁 Kayıtlı müşteri Meta formunu tekrar doldurdu: ") + a.getString("ad") + (a.getString("ilce") ? " · " + a.getString("ilce") : "") +
          (o.evTipi ? " · " + o.evTipi : "") + (o.fatura ? " · fatura " + o.fatura : "") + (sor ? " · sorumlu " + L.kisiAd(app, sor) : "") + (yeniMi && kal === "Uygun" ? ". İlk 15 dakikada aramak en iyisi." : kal !== "Uygun" ? " (" + kal + ")" : ""), { tip: "lead", id: a.id });
      } catch (x) { console.log("lead mesajı yazılamadı", x); }
    });
  });
  rec.set("siradaki", sira); rec.set("sonLead", String(enSon));
  return yeni;
}
function jget(r, f) { try { const t = r.getString(f); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
function sayi(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function aksiyon(A, turler) { let m = 0; (A || []).forEach((x) => { if (turler.indexOf(x.action_type) >= 0) m = Math.max(m, sayi(x.value)); }); return m; }
function harcamaCek(app, rec, api, token) {
  const hs = rec.getString("adHesap"); if (!hs) return 0;
  const bit = bugunTR(), bas = gunEkle(bit, -35);
  const R = hepsi(api, token, "/" + hs + "/insights", { level: "campaign", fields: "campaign_id,campaign_name,spend,impressions,clicks,actions", time_increment: 1, limit: 500,
    time_range: JSON.stringify({ since: bas, until: bit }) });
  let n = 0;
  R.forEach((x) => {
    const t = x.date_start, k = x.campaign_id; if (!t || !k) return;
    let g; try { g = app.findFirstRecordByFilter("meta_gunluk", "tarih = {:t} && kampanyaId = {:k}", { t: t, k: k }); } catch (e) { g = new Record(app.findCollectionByNameOrId("meta_gunluk")); g.set("tarih", t); g.set("kampanyaId", k); }
    g.set("kampanya", x.campaign_name || ""); g.set("harcama", sayi(x.spend)); g.set("gosterim", sayi(x.impressions)); g.set("tiklama", sayi(x.clicks));
    g.set("lead", aksiyon(x.actions, ["lead", "onsite_conversion.lead_grouped", "leadgen_grouped"]));
    g.set("mesaj", aksiyon(x.actions, ["onsite_conversion.messaging_conversation_started_7d"]));
    app.save(g); n++;
  });
  let K = []; try { K = hepsi(api, token, "/" + hs + "/campaigns", { fields: "id,name,effective_status,objective,daily_budget", limit: 200 }).map((c) => ({ id: c.id, ad: c.name, durum: c.effective_status, amac: c.objective, gunluk: c.daily_budget ? sayi(c.daily_budget) / 100 : null })); } catch (e) {}
  rec.set("kampanyalar", { zaman: Date.now(), liste: K });
  return n;
}
function senk(app, zorla) {
  const rec = kayit(app), token = rec.getString("token");
  if (!rec.id || !token) return { durum: "bagli_degil" };
  const api = rec.getString("api") || VARSAYILAN_API;
  rec.set("sonDeneme", simdi());
  let yeni = 0, satir = 0, hata = "";
  try { yeni = leadCek(app, rec, api, token); } catch (e) { hata = "Lead: " + String((e && e.message) || e); }
  const k = jget(rec, "kampanyalar") || {}, eski = k && k.zaman ? Date.now() - k.zaman : 1e12;
  if (zorla || eski > 50 * 60e3) { try { satir = harcamaCek(app, rec, api, token); } catch (e) { hata = (hata ? hata + " · " : "") + "Harcama: " + String((e && e.message) || e); } }
  rec.set("hata", hata); if (!hata) rec.set("sonSenk", simdi());
  app.save(rec);
  return { durum: hata ? "hata" : "tamam", yeniLead: yeni, gunlukSatir: satir, hata: hata };
}
function ayarKaydet(app, b) {
  const rec = kayit(app);
  if (b.token) rec.set("token", String(b.token).trim());
  if (b.api != null) rec.set("api", String(b.api).trim());
  if (b.adHesap != null) { let h = String(b.adHesap).replace(/\s/g, ""); if (h && !/^act_/.test(h)) h = "act_" + h.replace(/\D/g, ""); rec.set("adHesap", h); }
  if (b.sayfaId != null) rec.set("sayfaId", String(b.sayfaId).replace(/\D/g, ""));
  if (Array.isArray(b.atananlar)) rec.set("atananlar", b.atananlar);
  const token = rec.getString("token"); if (!token) throw new Error("Erişim anahtarı girilmedi");
  const api = rec.getString("api") || VARSAYILAN_API;
  graph(api, token, "/me", { fields: "id,name" });
  if (rec.getString("adHesap")) rec.set("hesapAd", graph(api, token, "/" + rec.getString("adHesap"), { fields: "name" }).name || "");
  if (rec.getString("sayfaId")) rec.set("sayfaAd", graph(api, token, "/" + rec.getString("sayfaId"), { fields: "name" }).name || "");
  rec.set("hata", ""); app.save(rec);
  return { hesapAd: rec.getString("hesapAd"), sayfaAd: rec.getString("sayfaAd") };
}
// Reklamlar sayfası özeti: Meta harcaması + uygulamadaki gerçek satış hunisi
function ozet(app, auth, gun) {
  gun = Math.max(1, Math.min(120, parseInt(gun || 7, 10) || 7));
  const bit = bugunTR(), bas = gunEkle(bit, -(gun - 1)), oBas = gunEkle(bas, -gun), oBit = gunEkle(bas, -1);
  const rec = kayit(app), K = ((jget(rec, "kampanyalar") || {}).liste) || [];
  const G = app.findRecordsByFilter("meta_gunluk", "tarih >= {:a} && tarih <= {:b}", "tarih", 5000, 0, { a: oBas, b: bit });
  const top = { harcama: 0, gosterim: 0, tiklama: 0, lead: 0, mesaj: 0 }, onc = { harcama: 0, lead: 0 }, kamp = {};
  G.forEach((g) => { const t = g.getString("tarih"), k = g.getString("kampanyaId");
    if (t >= bas) { ["harcama", "gosterim", "tiklama", "lead", "mesaj"].forEach((f) => { top[f] += g.getFloat(f); });
      const o = kamp[k] = kamp[k] || { id: k, ad: g.getString("kampanya"), harcama: 0, gosterim: 0, lead: 0, mesaj: 0 }; o.harcama += g.getFloat("harcama"); o.gosterim += g.getFloat("gosterim"); o.lead += g.getFloat("lead"); o.mesaj += g.getFloat("mesaj"); }
    else { onc.harcama += g.getFloat("harcama"); onc.lead += g.getFloat("lead"); } });
  const ilerde = { "Nitelikli": 1, "Keşif": 2, "Teklif": 3, "Sözleşme": 4 };
  const A = app.findRecordsByFilter("adaylar", "kaynak = 'Meta reklam' && leadZaman >= {:a}", "-leadZaman", 2000, 0, { a: bas + " 00:00:00" });
  const huni = { lead: A.length, gorusuldu: 0, kesif: 0, teklif: 0, sozlesme: 0, uygunDegil: 0, aranmadi: 0 }, sozDeger = { usd: 0, kwp: 0 };
  const kAd = {}; K.forEach((c) => { kAd[c.ad] = c; });
  A.forEach((a) => { const s = ilerde[a.getString("asama")] || 0, kn = a.getString("metaKampanya");
    if (s >= 1) huni.gorusuldu++; if (s >= 2) huni.kesif++; if (s >= 3) huni.teklif++; if (s >= 4) huni.sozlesme++;
    if (a.getString("leadKalite") === "Uygun değil") huni.uygunDegil++; if (a.getString("asama") === "Aday" && a.getString("leadKalite") !== "Uygun değil") huni.aranmadi++;
    const kk = Object.keys(kamp).filter((id) => kamp[id].ad === kn)[0];
    const o = kk ? kamp[kk] : (kamp["ad:" + kn] = kamp["ad:" + kn] || { id: "", ad: kn || "Bilinmeyen kampanya", harcama: 0, gosterim: 0, lead: 0, mesaj: 0 });
    o.uLead = (o.uLead || 0) + 1; if (s >= 2) o.kesif = (o.kesif || 0) + 1; if (s >= 4) o.sozlesme = (o.sozlesme || 0) + 1;
    if (s >= 4) { try { const T = app.findRecordsByFilter("teklifler", "aday = {:a} && durum = 'Anlaşıldı'", "-created", 1, 0, { a: a.id })[0]; if (T) { sozDeger.usd += T.getFloat("fiyatUSD"); sozDeger.kwp += T.getFloat("kwp"); } } catch (e) {} } });
  let kur = 0; try { kur = (jget(app.findFirstRecordByData("fin_ayarlar", "anahtar", "kasa_kur"), "deger") || {}).usd || 0; } catch (e) {}
  const yon = auth.getString("rol") === "yonetici";
  const son = A.filter((a) => yon || a.getString("sorumlu") === auth.id).slice(0, 25).map((a) => ({ id: a.id, ad: a.getString("ad"), tel: a.getString("tel"), ilce: a.getString("ilce"), asama: a.getString("asama"),
    evTipi: a.getString("evTipi"), fatura: a.getString("faturaAralik"), kalite: a.getString("leadKalite"), kampanya: a.getString("metaKampanya"), zaman: a.getString("leadZaman"),
    sorumlu: a.getString("sorumlu") ? require(`${__hooks}/mesaj_lib.js`).kisiAd(app, a.getString("sorumlu")) : "" }));
  const kampL = Object.keys(kamp).map((id) => { const o = kamp[id], c = (o.id && K.filter((x) => x.id === o.id)[0]) || kAd[o.ad] || {}; return Object.assign(o, { durum: c.durum || "", gunluk: c.gunluk || null }); })
    .sort((x, y) => y.harcama - x.harcama);
  return { gun: gun, bas: bas, bit: bit, bagli: !!rec.getString("token"), hesapAd: rec.getString("hesapAd"), sayfaAd: rec.getString("sayfaAd"), sonSenk: rec.getString("sonSenk"), hata: rec.getString("hata"),
    toplam: top, onceki: onc, huni: huni, sozlesmeDeger: sozDeger, kur: kur, kampanyalar: kampL, sonLeadler: son };
}
module.exports = { senk, ayarKaydet, ozet, alanlar, kalite, telNorm };
