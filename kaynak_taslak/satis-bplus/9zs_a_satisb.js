/* v91 · Satış B+ Premium — çekirdek: menü, ortak yardımcılar, Satış Genel, Hedefler ve Performans, Diğer */
(function () {
  var I = {
    sbGrid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    sbKisi: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.6.8 2.6 2.5 3 5.2"/>',
    sbBelge: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    sbTakvim: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    sbPanel: '<rect x="3" y="5" width="18" height="11" rx="1.5"/><path d="M3 10.5h18M9 5v11M15 5v11M12 16v4M8 20h8"/>',
    sbNokta: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    sbTel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    sbWa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.6-2-1-1 .9a4 4 0 0 1-2.2-2.2l.9-1-1-2z"/>',
    sbSag: '<path d="M9 6l6 6-6 6"/>', sbSol: '<path d="M15 6l-6 6 6 6"/>', sbAsagi: '<path d="M6 9l6 6 6-6"/>',
    sbFiltre: '<path d="M4 6h16M7 12h10M10 18h4"/>', sbHedef: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    sbUyari: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5M12 17.5v.1"/>', sbSaat: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    sbOk: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', sbKonum: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    sbTek: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"/>', sbNot: '<path d="M5 4h10l4 4v12H5z"/><path d="M8 12h8M8 16h5"/>',
    sbGorev: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12l2.5 2.5 4.5-5"/>', sbX: '<path d="M6 6l12 12M18 6 6 18"/>',
    sbListe: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.1M4 12h.1M4 18h.1"/>', sbKanban: '<rect x="3.5" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="16.5" y="4" width="4" height="13" rx="1.5"/>',
    sbSimsek: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>', sbTrend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>', sbHoparlor: '<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9a4 4 0 0 1 0 6"/>',
    sbKilit: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>', sbKalem: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', sbArti: '<path d="M12 5v14M5 12h14"/>',
    sbKutu: '<path d="M3 7.5l9-4.5 9 4.5v9l-9 4.5-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>', sbBanka: '<path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
    sbGoz: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>', sbGonder: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
    sbOdul: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.5 5 2.5-1.5-7.5"/>', sbKamyon: '<path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    sbSirala: '<path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5"/>', sbKaydet: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    sbGecmis: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 4v4h4M12 8v4.5l3 1.5"/>', sbNakit: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/>',
    sbEl: '<path d="M7 11.5V6a1.5 1.5 0 0 1 3 0v5M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9a1.5 1.5 0 0 1 3 0v5a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L3.5 14.5a1.6 1.6 0 0 1 2.4-2l1.1 1.2"/>',
    sbAyar: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 6.5l2.6 1.5M17.2 16l2.6 1.5M4.2 17.5 6.8 16M17.2 8l2.6-1.5"/>'
  };
  Object.keys(I).forEach(function (k) { ICO[k] = I[k]; });
  NAV_IK.satis = ["sbGrid", "#7c3aed"]; NAV_IK.planlama = ["sbTakvim", "#7c3aed"]; NAV_IK.sdiger = ["sbNokta", "#7c3aed"]; NAV_IK.adaylar = ["sbKisi", "#7c3aed"]; NAV_IK.teklifler = ["sbBelge", "#7c3aed"]; NAV_IK.projeler = ["sbPanel", "#7c3aed"];
  ["satis", "planlama", "sdiger", "hedefler", "reklamlar"].forEach(function (s) { if (SATIS_S.indexOf(s) < 0) SATIS_S.push(s); });
})();
var SB = { don: "ay", c: null, ct: 0, tkAdim: {}, kuyrukKim: "ben" };
function sbI(n, c) { return '<svg class="sbI' + (c ? " " + c : "") + '" viewBox="0 0 24 24">' + (ICO[n] || "") + "</svg>"; }
/* Satış alt menüsü: 6 bölüm (telefonda üstte eşit sekmeler, masaüstünde sol menü) */
function satisAlt() {
  var L = [], m = yt("musteri"), t = yt("teklif"), p = yt("proje");
  if (m || t) L.push(["satis", "Genel"]);
  if (m) L.push(["adaylar", rol() === "saha" && BEN.kendi ? "Keşiflerim" : BEN.kendi && !yon() ? "Müşterilerim" : "Müşteriler"]);
  if (t) L.push(["teklifler", "Teklifler"]);
  if (m || p) L.push(["planlama", "Planlama"]);
  if (p) L.push(["projeler", "Projeler"]);
  if (m || t || yt("fiyat")) L.push(["sdiger", "Diğer"]);
  return L;
}
var SB_KISA = { satis: "Genel", adaylar: "Müşteri", teklifler: "Teklif", planlama: "Plan", projeler: "Proje", sdiger: "Diğer" };
var SB_IK = { satis: "sbGrid", adaylar: "sbKisi", teklifler: "sbBelge", planlama: "sbTakvim", projeler: "sbPanel", sdiger: "sbNokta" };
function sbAkt() { var s = (location.hash.replace(/^#/, "").split("/")[0]) || ""; return { aday: "adaylar", yeni: "adaylar", teklif: "teklifler", tpdf: "teklifler", katalog: "sdiger", reklamlar: "sdiger", hedefler: "satis" }[s] || s; }
function sbNav() {
  document.body.classList.add("sbAcik"); document.body.classList.remove("adBarV");
  var ak = sbAkt(), L = satisAlt(), k = document.querySelector(".altS");
  if (!k && L.length > 1) { k = document.createElement("div"); var m = $("m"); if (m) m.parentNode.insertBefore(k, m); }
  if (k && L.length > 1 && !/^#tpdf/.test(location.hash)) {
    k.className = "altS sbTab"; k.style.gridTemplateColumns = "repeat(" + L.length + ",1fr)";
    k.innerHTML = L.map(function (s) { return '<a href="#' + s[0] + '" class="' + (s[0] === ak ? "on" : "") + '"' + (s[0] === ak ? ' aria-current="page"' : "") + ">" + sbI(SB_IK[s[0]]) + "<span>" + (SB_KISA[s[0]] || s[1]) + '</span><em class="sbRz" data-sbrz="' + s[0] + '" hidden></em></a>'; }).join("");
    sbRozet();
  }
  Array.prototype.forEach.call(document.querySelectorAll("nav.yan a[href^='#']"), function (a) { var h = a.getAttribute("href").slice(1); if (SB_KISA[h]) a.classList.toggle("on", h === ak); });
  Array.prototype.forEach.call(document.querySelectorAll("nav.yan a[href='#satis'] span, nav.y a[data-nv='satis'] span"), function () {});
}
function sbRozet() { var v = SB.rz || {}; Array.prototype.forEach.call(document.querySelectorAll("[data-sbrz]"), function (e) { var n = v[e.dataset.sbrz]; e.hidden = !n; e.textContent = n > 99 ? "99+" : n || ""; }); }
window.addEventListener("hashchange", function () { var s = (location.hash.replace(/^#/, "").split("/")[0]) || ""; if (SATIS_S.indexOf(s) < 0 || s === "tpdf") document.body.classList.remove("sbAcik"); });
/* ortak yardımcılar */
function sbEsc(s) { return esc(s == null ? "" : s); }
function sbBas(baslik, alt, sag, geri) {
  return '<div class="sbBas">' + (geri ? '<a class="sbGeri" href="' + geri + '" aria-label="Geri">' + sbI("sbSol") + "</a>" : "") + '<div class="sbBasA"><h1>' + baslik + "</h1>" + (alt ? '<div class="sbBasT">' + alt + "</div>" : "") + "</div>" + (sag ? '<div class="sbBasS">' + sag + "</div>" : "") + "</div>";
}
function sbBos(ik, b, s) { return '<div class="sbBos">' + sbI(ik) + "<b>" + b + "</b>" + (s ? "<small>" + s + "</small>" : "") + "</div>"; }
function sbKart(baslik, ic, o) { o = o || {}; return '<section class="sbK' + (o.c ? " " + o.c : "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + ">" + (baslik ? '<div class="sbKh"><h2>' + baslik + "</h2>" + (o.ks ? '<span class="sbKs">' + o.ks + "</span>" : "") + (o.sag || "") + "</div>" : "") + ic + "</section>"; }
function sbAs(a) { a = a || "Aday"; return '<span class="sbAs sbAs-' + ({ "Keşif": "Kesif", "Sözleşme": "Sozlesme" }[a] || a) + '">' + sbEsc(a) + "</span>"; }
var SB_ASR = { Aday: "#94a3b8", Nitelikli: "#2563eb", "Keşif": "#0d9488", Teklif: "#ea580c", "Sözleşme": "#15803d", Kaybedildi: "#dc2626" };
function sbAv(ad, renk, s) { var p = String(ad || "?").trim().split(/\s+/), h = (p[0] || "?").charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : ""); return '<span class="sbAv" style="background:' + (renk || "#64748b") + (s ? ";width:" + s + "px;height:" + s + "px;font-size:" + Math.round(s * 0.38) + "px" : "") + '">' + sbEsc(h.toLocaleUpperCase("tr")) + "</span>"; }
var SB_RENK = ["#7c3aed", "#ed7d31", "#0d9488", "#2563eb", "#db2777", "#475569", "#b45309", "#0891b2"];
function sbKRenk(id) { var s = String(id || ""), h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997; return SB_RENK[h % SB_RENK.length]; }
function sbTL(tl, kisa) { if (tl == null || isNaN(tl)) return "—"; var a = Math.abs(tl); if (kisa !== false && a >= 1e6) return sayi(tl / 1e6, 2) + " mn ₺"; if (kisa !== false && a >= 1e4) return sayi(Math.round(tl / 1000)) + " bin ₺"; return sayi(tl) + " ₺"; }
function sbGunEkle(t, n) { var d = new Date(String(t).slice(0, 10) + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function sbDonem(k) {
  var b = bugun(), y = +b.slice(0, 4), m = +b.slice(5, 7), p2 = function (n) { return String(n).padStart(2, "0"); };
  var ayS = function (yy, mm) { return new Date(Date.UTC(yy, mm, 0)).getUTCDate(); };
  if (k === "gecen") { var yy = m === 1 ? y - 1 : y, mm = m === 1 ? 12 : m - 1; return { bas: yy + "-" + p2(mm) + "-01", son: yy + "-" + p2(mm) + "-" + p2(ayS(yy, mm)), ad: AY_AD_SB[mm - 1] + " " + yy, gun: ayS(yy, mm), gecen: ayS(yy, mm), ay: 1 }; }
  if (k === "ceyrek") { var q = Math.floor((m - 1) / 3) * 3 + 1; return { bas: y + "-" + p2(q) + "-01", son: y + "-" + p2(q + 2) + "-" + p2(ayS(y, q + 2)), ad: (Math.floor((m - 1) / 3) + 1) + ". çeyrek " + y, ay: 3 }; }
  if (k === "yil") return { bas: y + "-01-01", son: y + "-12-31", ad: String(y), ay: 12 };
  return { bas: y + "-" + p2(m) + "-01", son: y + "-" + p2(m) + "-" + p2(ayS(y, m)), ad: AY_AD_SB[m - 1] + " " + y, gun: ayS(y, m), gecen: +b.slice(8, 10), ay: 1, bu: true };
}
var AY_AD_SB = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
function sbIcinde(t, D) { t = String(t || "").slice(0, 10); return t && t >= D.bas && t <= D.son; }
function sbAcik(a) { return a.asama !== "Sözleşme" && a.asama !== "Kaybedildi"; }
/* veri: tüm Satış ekranları aynı önbelleği kullanır (30 sn) */
function sbVeri(zorla) {
  if (!zorla && SB.c && Date.now() - SB.ct < 30000) return Promise.resolve(SB.c);
  var bos = function () { return []; }, D0 = sbGunEkle(bugun(), -400);
  return Promise.all([
    yt("musteri") || yt("teklif") ? liste("adaylar", kendiF(), "-updated", "sorumlu,kesifci").catch(bos) : Promise.resolve([]),
    yt("teklif") ? liste("teklifler", "", "-created").catch(bos) : Promise.resolve([]),
    yt("proje") || yt("fin") ? liste("projeler", "", "-created").catch(bos) : Promise.resolve([]),
    liste("users", "aktif = true", "name").catch(bos),
    liste("ayarlar", "anahtar = 'hesap' || anahtar = 'satis_hedef' || anahtar = 'teklif'").catch(bos),
    yt("fin") ? liste("fin_hareketler", "yon = 'Giriş' && (kategori = 'Proje tahsilatı' || kategori = 'Malzeme satışı tahsilatı') && tarih >= " + q(D0)).catch(function () { return null; }) : Promise.resolve(null),
    yt("musteri") || yt("proje") ? liste("gorusmeler", "created >= " + q(sbGunEkle(bugun(), -120)), "-created").catch(bos) : Promise.resolve([]),
    liste("asama_gecmis", "created >= " + q(D0), "created").catch(function () { return null; }),
    liste("gorevler", "durum = 'Açık' || tamamTarih >= " + q(sbGunEkle(bugun(), -60)), "tarih").catch(function () { return null; })
  ]).then(function (R) {
    var AY = {}; R[4].forEach(function (x) { AY[x.anahtar] = x.deger; });
    var V = { A: R[0], T: R[1], P: R[2], U: R[3], H: AY.hesap || {}, TA: AY.teklif || {}, HD: AY.satis_hedef || null, F: R[5], G: R[6], AG: R[7], GV: R[8], b: bugun() };
    V.kur = +(V.H.kur || 0) || 0; V.ST = sonTeklifMap(V.T); V.AM = {}; V.A.forEach(function (a) { V.AM[a.id] = a; });
    V.PM = {}; V.P.forEach(function (p) { if (!V.PM[p.aday]) V.PM[p.aday] = p; });
    V.GA = {}; V.G.forEach(function (g) { (V.GA[g.aday] = V.GA[g.aday] || []).push(g); });
    V.UM = {}; V.U.forEach(function (u) { V.UM[u.id] = u; });
    V.sat = sbSozlesmeler(V); V.q = sbKuyruk(V);
    SB.c = V; SB.ct = Date.now();
    SB.rz = { adaylar: V.A.filter(function (a) { return sbAcik(a) && a.sonraki && a.sonraki.slice(0, 10) < V.b && (!BEN.kendi || a.sorumlu === BEN.id || a.kesifci === BEN.id); }).length, teklifler: V.T.filter(function (t) { return yon() && (t.durum === "Onay bekliyor" || t.durum === "Taslak"); }).length };
    sbRozet();
    return V;
  });
}
function sbSifirla() { SB.c = null; }
/* gerçek satış = sözleşme. Tarih: aşama geçmişi > proje başlangıcı > anlaşılan teklif güncellemesi */
function sbSozlesmeler(V) {
  var AGs = {}; (V.AG || []).forEach(function (g) { if (g.yeni === "Sözleşme") AGs[g.aday] = g.created; });
  var L = [];
  V.A.forEach(function (a) {
    var P = V.PM[a.id], acT = V.T.filter(function (t) { return t.aday === a.id && t.durum === "Anlaşıldı"; })[0];
    if (!P && a.asama !== "Sözleşme") return;
    var usd = P && +P.bedelUsd > 0 ? +P.bedelUsd : acT ? +acT.fiyatUSD : 0, kur = (acT && +acT.kur) || V.kur;
    L.push({ a: a, tarih: String(AGs[a.id] || (P && P.basla) || (acT && acT.updated) || a.updated).slice(0, 10), usd: usd, tl: usd && V.kur ? usd * V.kur : null, kwp: (P && +P.kwp) || (acT && +acT.kwp) || 0, sor: a.sorumlu, P: P, kaynakTarih: AGs[a.id] ? "aşama geçmişi" : P ? "proje başlangıcı" : "teklif onayı" });
  });
  return L;
}
/* açıklanabilir öncelik: yeni aday, sıcak teklif, saatli randevu, geciken takip, teklif süresi, elle öncelik */
function sbOncelik(a, V) {
  if (!sbAcik(a)) return null;
  var b = V.b, p = 0, N = [], t = V.ST[a.id], so = String(a.sonraki || ""), gun = so.slice(0, 10), saat = so.slice(11, 16), g = V.GA[a.id] || [];
  var yas = gunFark(String(a.created).slice(0, 10), b), kon = g.length > 0;
  if ((a.asama || "Aday") === "Aday" && !kon && yas <= 2) { p += 60 - yas * 10; N.push(["p", "Yeni aday", yas === 0 ? "bugün geldi, henüz aranmadı" : yas + " gün önce geldi, henüz aranmadı"]); }
  if (t && t.durum === "Gönderildi") {
    var son = t.gecerlilik ? String(t.gecerlilik).slice(0, 10) : tkGecSon(t), kal = gunFark(b, son);
    if (kal < 0) { p += 22; N.push(["u", "Teklif süresi doldu", Math.abs(kal) + " gün önce · güncel fiyatla yenileyin"]); }
    else if (kal <= 2) { p += 38 - kal * 6; N.push(["o", "Teklif süresi " + (kal === 0 ? "bugün" : kal + " gün") + " doluyor", sayi(t.fiyatUSD) + " $ · " + (t.no || "")]); }
    var tg = gunFark(String(t.updated || t.created).slice(0, 10), b); if (tg <= 5 && kal >= 0) { p += 18; N.push(["o", "Sıcak teklif", "son " + (tg || 1) + " günde onaylandı"]); }
  }
  if (gun && gun === b && saat && saat !== "09:00") { p += 45; N.push(["b", "Saatli randevu " + saat, a.sonrakiIs || ""]); }
  else if (gun && gun < b) { var gf = gunFark(gun, b); p += 26 + Math.min(gf, 10) * 2; N.push(["k", gf + " gün gecikti", a.sonrakiIs || "takip"]); }
  else if (gun === b) { p += 16; N.push(["n", "Bugün planlı", a.sonrakiIs || ""]); }
  else if (!gun && (a.asama || "Aday") !== "Aday") { p += 8; N.push(["u", "Planı yok", "sıradaki iş yazılmamış"]); }
  var o = String(a.oncelik || ""); var zam = N.length;
  if (o === "Yüksek" || o === "A") { p += o === "Yüksek" ? 40 : 15; N.push(["p", o === "Yüksek" ? "Elle: yüksek öncelik" : "Öncelik A", ""]); } else if (o === "Düşük") { p -= 25; N.push(["n", "Elle: düşük öncelik", ""]); }
  if (!zam || p <= 0) return null;
  return { a: a, p: p, N: N };
}
function sbKuyruk(V) { var L = []; V.A.forEach(function (a) { var x = sbOncelik(a, V); if (x && (x.N.some(function (n) { return n[0] !== "u" || /Teklif/.test(n[1]); }) || x.p >= 20)) L.push(x); }); L.sort(function (x, y) { return y.p - x.p; }); return L; }
function sbNedenH(N, kisa) { return '<span class="sbNe">' + N.slice(0, kisa ? 2 : 4).map(function (n) { return '<span class="sbNe-' + n[0] + '">' + sbEsc(n[1]) + "</span>"; }).join("") + "</span>"; }
function sbTelBtn(a, s) { var t = String(a.tel || "").replace(/[^\d+]/g, ""); return t ? '<a class="sbIb sbTl' + (s ? " " + s : "") + '" href="tel:' + sbEsc(t) + '" aria-label="Ara" onclick="event.stopPropagation()">' + sbI("sbTel") + "</a>" : ""; }
function sbWaBtn(a, metin, s) { var l = waLink(a.tel, metin); return l ? '<a class="sbIb sbWa' + (s ? " " + s : "") + '" href="' + l + '" target="_blank" rel="noopener" aria-label="WhatsApp" onclick="event.stopPropagation()">' + sbI("sbWa") + "</a>" : ""; }
function sbHedef(V) { var h = V.HD || {}; return { aylik: +h.aylik > 0 ? +h.aylik : 20, kisi: h.kisi || {}, varsayilan: !(+h.aylik > 0) }; }
function sbEkip(V) { return V.U.filter(function (u) { return u.rol !== "ortak" && (u.rol === "yonetici" || u.y_musteri === "d" || u.y_teklif === "d" || u.rol === "saha"); }); }
/* ---------- SATIŞ GENEL ---------- */
function sSatisGenel() {
  sbNav(); var m = $("m"); m.className = "sbM"; m.innerHTML = sbIskelet();
  sbVeri().then(function (V) {
    var D = sbDonem(SB.don), HD = sbHedef(V), hd = HD.aylik * (D.ay || 1), b = V.b;
    var S = V.sat.filter(function (s) { return sbIcinde(s.tarih, D); }), n = S.length, kalan = Math.max(0, hd - n);
    var bedel = S.reduce(function (t, s) { return t + (s.tl || 0); }, 0), fiyatGor = !!yt("teklif");
    var acikT = V.A.filter(sbAcik).map(function (a) { return V.ST[a.id]; }).filter(function (t) { return t && t.durum === "Gönderildi"; });
    var acikTG = acikT.filter(function (t) { return (t.gecerlilik ? String(t.gecerlilik).slice(0, 10) : tkGecSon(t)) >= b; });
    var acikTut = acikTG.reduce(function (s, t) { return s + (+t.fiyatUSD || 0) * V.kur; }, 0);
    var oran = sbTeklifOran(V), tahmin = oran.n >= 3 ? acikTut * oran.r : null;
    var tah = V.F ? V.F.filter(function (h) { return h.durum === "Gerçekleşti" && sbIcinde(h.tarih, D); }).reduce(function (s, h) { return s + (h.pb === "TRY" ? +h.tutar : (+h.tutar || 0) * ((+h.kur) || V.kur)); }, 0) : null;
    var yeni = V.A.filter(function (a) { return sbIcinde(a.created, D); }), h7 = sbGunEkle(b, 6);
    var kesifP = V.A.filter(function (a) { return sbAcik(a) && (a.asama === "Keşif" || /keşif|kesif/i.test(a.sonrakiIs || "")) && a.sonraki && a.sonraki.slice(0, 10) >= b && a.sonraki.slice(0, 10) <= h7; });
    var kesifA = V.A.filter(function (a) { return a.asama === "Keşif"; });
    var gec = V.A.filter(function (a) { return sbAcik(a) && a.sonraki && a.sonraki.slice(0, 10) < b; });
    var dolan = acikT.filter(function (t) { var s = t.gecerlilik ? String(t.gecerlilik).slice(0, 10) : tkGecSon(t); return s >= b && s <= sbGunEkle(b, 3); });
    var onayB = V.T.filter(function (t) { return t.durum === "Onay bekliyor" || (yon() && t.durum === "Taslak"); });
    /* başlık + dönem */
    var donS = '<div class="sbSeg" role="group" aria-label="Dönem">' + [["ay", "Bu ay"], ["gecen", "Geçen ay"], ["ceyrek", "Çeyrek"]].map(function (x) { return '<button data-sbdon="' + x[0] + '" aria-pressed="' + (SB.don === x[0]) + '">' + x[1] + "</button>"; }).join("") + "</div>";
    var h = sbBas("Satış", sbEsc(D.ad) + (D.bu ? " · " + sbGunAd(b) : ""), (satisci() ? '<a class="btn sbBtn or" href="#yeni" aria-label="Yeni müşteri">' + sbI("sbArti") + '<span class="sbMas">Müşteri</span></a>' : "")) + '<div class="sbDonR">' + donS + "</div>";
    /* tek satır kritik uyarı */
    var kr = []; if (gec.length) kr.push(gec.length + " geciken takip"); if (dolan.length) kr.push(dolan.length + " teklifin süresi 3 gün içinde doluyor"); if (yon() && onayB.length) kr.push(onayB.length + " teklif onayınızı bekliyor");
    if (kr.length) h += '<a class="sbKrit" href="#adaylar/kuyruk">' + sbI("sbUyari") + "<span>" + kr.join(" · ") + "</span>" + sbI("sbSag", "s") + "</a>";
    /* hedef kartı */
    var yuz = Math.min(1, hd ? n / hd : 0), bek = D.bu && D.gun ? hd * D.gecen / D.gun : null, tempo = D.bu && D.gecen ? n / D.gecen * D.gun : null;
    var r = 42, cev = 2 * Math.PI * r;
    var hk = '<a class="sbPan" href="#hedefler" aria-label="Hedefler ve performans"><div class="sbPanU"><div class="sbRing"><svg viewBox="0 0 100 100"><circle class="r0" cx="50" cy="50" r="' + r + '"/><circle class="r1" cx="50" cy="50" r="' + r + '" stroke-dasharray="' + (cev * yuz).toFixed(1) + " " + cev.toFixed(1) + '"/></svg><div><b>' + n + "</b><span>/ " + hd + "</span></div></div>" +
      '<div class="sbPanT"><span class="sbLb">' + (D.ay > 1 ? sbEsc(D.ad) : sbEsc(D.ad.split(" ")[0])) + " · sözleşme (gerçek satış)</span><b>" + (kalan ? "Hedefe " + kalan + " satış" : "Hedef tamamlandı") + "</b><small>" + (tempo != null ? "Bu tempoyla ay sonu ≈ " + Math.round(tempo) + ' <i class="sbEt">TAHMİNİ</i>' : sbEsc(D.ad)) + (HD.varsayilan ? " · hedef varsayılan" : "") + "</small></div>" + sbI("sbSag", "sbPanOk") + "</div>" +
      (bek != null ? '<div class="sbPanB"><b style="width:' + (yuz * 100).toFixed(1) + '%"></b><s style="left:' + Math.min(100, bek / hd * 100).toFixed(1) + '%"></s></div><div class="sbPanBt"><span>' + n + " sözleşme</span><span>bugüne kadar beklenen " + sayi(bek, 1) + "</span></div>" : "") +
      '<div class="sbPanG"><div><b>' + (fiyatGor ? sbTL(bedel) : "—") + "</b><span>Sözleşme bedeli · KDV hariç</span></div><div><b>" + (fiyatGor ? sbTL(acikTut) : "—") + "</b><span>Açık teklif · " + acikTG.length + " teklif</span></div>" +
      "<div><b>" + (tahmin != null && fiyatGor ? "≈ " + sbTL(tahmin) : "—") + '</b><span><i class="sbEt">TAHMİNİ</i> ' + (oran.n >= 3 ? "açık teklif × %" + Math.round(oran.r * 100) : "veri az") + "</span></div><div><b>" + (tah != null ? sbTL(tah) : "—") + "</b><span>" + (tah != null ? "Tahsilat · Finans kaydı" : "Tahsilat · Finans yetkisi gerekli") + "</span></div></div></a>";
    /* 4 KPI */
    var kp = '<div class="sbKp">' + sbKpi("sbKisi", "Yeni aday", yeni.length, sbEsc(D.ad.split(" ")[0]) + " · bu hafta " + V.A.filter(function (a) { return String(a.created).slice(0, 10) >= sbGunEkle(b, -6); }).length, "#adaylar", { tarih: "donem" }) +
      sbKpi("sbKonum", "Planlanan keşif", kesifP.length, "7 gün · keşif aşamasında " + kesifA.length, "#planlama", null) +
      sbKpi("sbBelge", "Açık teklif", acikTG.length, dolan.length ? dolan.length + " tanesinin süresi doluyor" : "geçerli, sonuç bekleyen", "#teklifler", null) +
      sbKpi("sbSaat", "Geciken takip", gec.length, gec.length ? "en eskisi " + Math.max.apply(null, gec.map(function (a) { return gunFark(a.sonraki, b); })) + " gün" : "gecikme yok", "#adaylar", { takip: "Geciken" }, gec.length ? "kt" : "") + "</div>";
    /* öncelikli işler (en fazla 3) */
    var Q = V.q.slice(0, 3), isl = sbKart("Öncelikli işler" + (V.q.length ? ' <span class="sbSay kt">' + V.q.length + "</span>" : ""), Q.length ? Q.map(function (x) { return sbIsSat(x, V); }).join("") : sbBos("sbOk", "Bugün öncelikli iş yok", "Geciken takip, süresi dolan teklif ya da yeni aday görünmüyor."), { sag: V.q.length ? '<a class="sbKl" href="#adaylar/kuyruk">Tümünü gör' + sbI("sbSag", "s") + "</a>" : "" });
    /* huni */
    var huni = sbKart("Satış hunisi", '<div class="sbHuniS" data-sbhs="su">' + sbHuniSuAn(V, D) + '</div><div class="sbHuniS" data-sbhs="don" hidden>' + sbHuniDon(V) + "</div>", { sag: '<div class="sbSeg k" role="group" aria-label="Huni görünümü"><button data-sbhu="su" aria-pressed="true">Şu an</button><button data-sbhu="don" aria-pressed="false">Dönüşüm</button></div>' });
    /* ekip */
    var ekip = sbKart("Ekip performansı", sbEkipKompakt(V, S, D, HD), { ks: sbEsc(D.ad.split(" ")[0]), sag: '<a class="sbKl" href="#hedefler">Rapor' + sbI("sbSag", "s") + "</a>" });
    var mas = window.innerWidth >= 1000;
    m.innerHTML = '<div class="sbSayfa">' + h + '<div class="sbIki"><div class="sbSut">' + hk + kp + isl + '</div><div class="sbSut">' + huni + ekip + (mas ? sbKaynakKart(V, D) : "") + "</div></div></div>";
    sbGenelBagla(V);
  }).catch(function (e) { m.innerHTML = '<div class="sbSayfa">' + sbBos("sbUyari", "Satış verisi yüklenemedi", sbEsc(e.message || "")) + "</div>"; });
}
function sbGunAd(b) { var d = new Date(b + "T12:00:00"); return +b.slice(8, 10) + " " + AY_AD_SB[+b.slice(5, 7) - 1] + " " + ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"][d.getDay()]; }
function sbIskelet() { return '<div class="sbSayfa sbIsk"><div class="sbIskB"></div><div class="sbIskP"></div><div class="sbKp"><i></i><i></i><i></i><i></i></div><div class="sbIskK"></div></div>'; }
function sbKpi(ik, t, v, d, href, f, cls) { return '<a class="sbKpi ' + (cls || "") + '" href="' + href + '"' + (f ? " data-sbf='" + JSON.stringify(f) + "'" : "") + '><span class="sbKpT">' + sbI(ik) + t + '</span><span class="sbKpV">' + v + '</span><span class="sbKpD">' + d + "</span>" + sbI("sbSag", "sbKpO") + "</a>"; }
function sbIsSat(x, V, tam) {
  var a = x.a, n = x.N[0], ik = { p: "sbSimsek", o: "sbBelge", k: "sbSaat", b: "sbTakvim", u: "sbUyari", n: "sbGorev" }[n[0]] || "sbGorev", sor = (a.expand && a.expand.sorumlu) || V.UM[a.sorumlu] || {};
  return '<div class="sbIs" data-sbgit="' + a.id + '"><span class="sbIk sbIk-' + n[0] + '">' + sbI(ik) + '</span><span class="sbIsT">' + sbNedenH(x.N, !tam) + "<b>" + sbEsc(a.ad) + "</b><small>" + sbEsc([a.sonrakiIs || n[2], a.ilce, (sor.name || "").split(" ")[0]].filter(Boolean).join(" · ")) + '</small></span><span class="sbIsA">' + sbTelBtn(a) + (tam ? sbWaBtn(a) : "") + "</span></div>";
}
function sbTeklifOran(V) {
  var b0 = sbGunEkle(V.b, -180), say = {};
  V.T.forEach(function (t) { if (String(t.created).slice(0, 10) < b0) return; var d = t.durum; if (d !== "Anlaşıldı" && d !== "Kaybedildi" && !(d === "Gönderildi" && tkSuresiDoldu(t))) return; var o = say[t.aday] || (say[t.aday] = { k: 0 }); if (d === "Anlaşıldı") o.k = 1; });
  var ids = Object.keys(say), k = ids.filter(function (i) { return say[i].k; }).length; return { n: ids.length, k: k, r: ids.length ? k / ids.length : 0 };
}
function sbHuniSuAn(V, D) {
  var S = ["Aday", "Nitelikli", "Keşif", "Teklif"].map(function (s) { return [s, V.A.filter(function (a) { return (a.asama || "Aday") === s; }).length]; });
  S.push(["Sözleşme", V.sat.filter(function (s) { return sbIcinde(s.tarih, D); }).length]);
  var mx = Math.max.apply(null, S.map(function (s) { return s[1]; }).concat([1]));
  return '<div class="sbHu">' + S.map(function (s) { return '<a class="sbHuR" href="#adaylar" data-sbf=\'' + JSON.stringify({ asama: s[0] }) + "'><span>" + s[0] + '</span><span class="sbHuB"><b style="width:' + Math.max(4, s[1] / mx * 100).toFixed(1) + "%;background:" + SB_ASR[s[0]] + '"></b></span><span class="sbHuN">' + s[1] + "</span></a>"; }).join("") + '</div><div class="sbKay"><i></i>Şu an her aşamadaki müşteri · Sözleşme: ' + sbEsc(D.ad) + " imzalanan</div>";
}
/* dönüşüm: aşama geçmişi varsa ondan, yoksa son 180 günde giren müşterilerin ulaştığı en ileri aşamadan (yaklaşık) */
function sbDonusum(V) {
  var SR = ["Aday", "Nitelikli", "Keşif", "Teklif", "Sözleşme"], b0 = sbGunEkle(V.b, -180), en = {};
  var gir = V.A.filter(function (a) { return String(a.created).slice(0, 10) >= b0; });
  gir.forEach(function (a) { var i = a.asama === "Kaybedildi" ? 0 : Math.max(0, SR.indexOf(a.asama || "Aday")); if (V.PM[a.id]) i = 4; if (V.ST[a.id] && i < 3) i = 3; en[a.id] = i; });
  var kaynak = "yaklaşık · ulaşılan en ileri aşama";
  if (V.AG && V.AG.length) { kaynak = "aşama geçmişinden"; V.AG.forEach(function (g) { if (en[g.aday] == null) return; var i = SR.indexOf(g.yeni); if (i > en[g.aday]) en[g.aday] = i; if (g.yeni === "Kaybedildi") { var j = SR.indexOf(g.eski); if (j > en[g.aday]) en[g.aday] = j; } }); }
  var ul = SR.map(function (s, i) { return gir.filter(function (a) { return en[a.id] >= i; }).length; });
  return { SR: SR, ul: ul, n: gir.length, kaynak: kaynak, r: ul.map(function (x, i) { return i ? (ul[i - 1] ? x / ul[i - 1] : null) : 1; }) };
}
function sbHuniDon(V) {
  var X = sbDonusum(V);
  if (X.n < 5) return sbBos("sbTrend", "Dönüşüm için veri az", "Son 180 günde " + X.n + " yeni müşteri var.");
  return X.SR.slice(1).map(function (s, i) { var r = X.r[i + 1]; return '<div class="sbKv"><span>' + X.SR[i] + " → " + s + '</span><b><small>' + X.ul[i + 1] + " / " + X.ul[i] + "</small>" + (r == null ? "—" : "%" + sayi(r * 100, 0)) + "</b></div>"; }).join("") +
    '<div class="sbKv sbKvT"><span>Aday → Sözleşme</span><b>%' + sayi(X.ul[0] ? X.ul[4] / X.ul[0] * 100 : 0, 1) + '</b></div><div class="sbKay u"><i></i>Son 180 gün · ' + X.n + " müşteri · " + X.kaynak + "</div>";
}
function sbEkipKompakt(V, S, D, HD) {
  var E = sbEkip(V), b = V.b, sat = E.filter(function (u) { return u.rol !== "saha" || V.A.some(function (a) { return a.sorumlu === u.id; }); });
  var sat2 = sat.map(function (u) { var s = S.filter(function (x) { return x.sor === u.id; }).length, g = V.A.filter(function (a) { return a.sorumlu === u.id && sbAcik(a) && a.sonraki && a.sonraki.slice(0, 10) < b; }).length, ac = V.A.filter(function (a) { return a.sorumlu === u.id && sbAcik(a); }).length, h = +(HD.kisi || {})[u.id] || 0;
    return { u: u, s: s, g: g, ac: ac, h: h * (D.ay || 1) }; }).filter(function (x) { return x.ac || x.s || x.h; }).sort(function (x, y) { return y.s - x.s || y.ac - x.ac; });
  var kes = E.filter(function (u) { return u.rol === "saha"; }).map(function (u) { return { u: u, n: V.A.filter(function (a) { return a.kesifci === u.id && sbIcinde(a.updated, D) && ["Teklif", "Sözleşme"].indexOf(a.asama) >= 0; }).length, p: V.A.filter(function (a) { return a.kesifci === u.id && a.asama === "Keşif"; }).length }; });
  if (!sat2.length && !kes.length) return sbBos("sbKisi", "Ekip verisi yok", "Müşterilere sorumlu atandıkça burada görünür.");
  return '<div class="sbEk">' + sat2.slice(0, 5).map(function (x) { return '<div class="sbEkR">' + sbAv(x.u.name || x.u.email, sbKRenk(x.u.id)) + '<div class="sbEkT"><b>' + sbEsc((x.u.name || x.u.email).split(" ")[0]) + "</b><small>" + x.ac + " açık müşteri" + (x.g ? ' · <em class="kt">' + x.g + " geciken</em>" : "") + "</small>" + (x.h ? '<span class="sbBar"><b style="width:' + Math.min(100, x.s / x.h * 100) + '%"></b></span>' : "") + '</div><div class="sbEkV"><b>' + x.s + (x.h ? "<small> / " + x.h + "</small>" : "") + "</b><small>sözleşme</small></div></div>"; }).join("") +
    kes.map(function (x) { return '<div class="sbEkR">' + sbAv(x.u.name || x.u.email, "#0d9488") + '<div class="sbEkT"><b>' + sbEsc((x.u.name || x.u.email).split(" ")[0]) + "</b><small>Keşif · " + x.p + " müşteri keşif aşamasında</small></div><div class=\"sbEkV\"><b>" + x.p + "</b><small>keşifte</small></div></div>"; }).join("") + "</div>" +
    (Object.keys(HD.kisi || {}).length ? "" : '<div class="sbKay u"><i></i>Kişisel hedef girilmedi' + (yon() ? ' · <a href="#hedefler">hedef belirle</a>' : "") + "</div>");
}
function sbKaynakKart(V, D) {
  var K = {}; V.A.forEach(function (a) { if (!sbIcinde(a.created, D)) return; var k = a.kaynak || "Diğer"; (K[k] = K[k] || { a: 0, s: 0 }).a++; });
  V.sat.forEach(function (s) { if (!sbIcinde(s.tarih, D)) return; var k = s.a.kaynak || "Diğer"; (K[k] = K[k] || { a: 0, s: 0 }).s++; });
  var L = Object.keys(K).sort(function (x, y) { return K[y].a - K[x].a; });
  if (!L.length) return "";
  return sbKart("Kaynak → satış", '<table class="sbTb"><thead><tr><th>Kaynak</th><th class="r">Yeni aday</th><th class="r">Sözleşme</th></tr></thead><tbody>' + L.slice(0, 7).map(function (k) { return "<tr><td>" + sbEsc(k) + '</td><td class="r n">' + K[k].a + '</td><td class="r n">' + K[k].s + "</td></tr>"; }).join("") + '</tbody></table><div class="sbKay"><i></i>Sözleşme sayısı o dönemde imzalananlar; aday sayısı o dönemde gelenler</div>', { ks: sbEsc(D.ad) });
}
function sbGenelBagla(V) {
  bagT("[data-sbdon]", function (e) { SB.don = e.dataset.sbdon; sSatisGenel(); });
  bagT("[data-sbhu]", function (e) { Array.prototype.forEach.call(document.querySelectorAll("[data-sbhu]"), function (x) { x.setAttribute("aria-pressed", x === e); }); Array.prototype.forEach.call(document.querySelectorAll("[data-sbhs]"), function (x) { x.hidden = x.dataset.sbhs !== e.dataset.sbhu; }); });
  sbFiltreLink(); sbGitBagla();
}
function sbFiltreLink() { Array.prototype.forEach.call(document.querySelectorAll("[data-sbf]"), function (a) { a.addEventListener("click", function () { try { SB.musF = JSON.parse(a.dataset.sbf); } catch (x) {} }); }); }
function sbGitBagla() { Array.prototype.forEach.call(document.querySelectorAll("[data-sbgit]"), function (r) { r.onclick = function (e) { if (e.target.closest("a,button,input,label")) return; location.hash = "#aday/" + r.dataset.sbgit; }; }); }
/* ---------- HEDEFLER VE PERFORMANS ---------- */
function sSatisHedef() {
  sbNav(); var m = $("m"); m.className = "sbM"; m.innerHTML = sbIskelet();
  sbVeri().then(function (V) {
    var D = sbDonem(SB.don), HD = sbHedef(V), hd = HD.aylik * (D.ay || 1), b = V.b, S = V.sat.filter(function (s) { return sbIcinde(s.tarih, D); }), n = S.length;
    var donS = '<div class="sbSeg" role="group" aria-label="Dönem">' + [["ay", "Bu ay"], ["gecen", "Geçen ay"], ["ceyrek", "Çeyrek"], ["yil", "Yıl"]].map(function (x) { return '<button data-sbdon2="' + x[0] + '" aria-pressed="' + (SB.don === x[0]) + '">' + x[1] + "</button>"; }).join("") + "</div>";
    var h = sbBas("Hedefler ve performans", sbEsc(D.ad), yon() ? '<button class="btn sbBtn" id="sbHdD">' + sbI("sbKalem") + '<span>Hedefleri düzenle</span></button>' : "", "#satis") + '<div class="sbDonR">' + donS + "</div>";
    /* tempo */
    var tempoK = "";
    if (D.ay === 1) {
      var gs = D.gun, gun = D.bu ? D.gecen : gs, kum = []; for (var i = 1; i <= gs; i++) { var t = D.bas.slice(0, 8) + String(i).padStart(2, "0"); kum.push(i <= gun ? S.filter(function (s) { return s.tarih <= t; }).length : null); }
      var tah = D.bu && gun ? n / gun * gs : null;
      tempoK = '<div class="sbPan sbPanD"><div class="sbPanU2"><div><span class="sbLb">' + sbEsc(D.ad) + ' · sözleşme</span><div class="sbBig">' + n + " <small>/ " + hd + "</small></div></div>" + (tah != null ? '<div class="sbPanSag"><span class="sbLb">Ay sonu tahmini</span><b>' + Math.round(tah) + '</b><i class="sbEt">TAHMİNİ</i></div>' : "") + "</div>" + sbTempoSvg(kum, hd, gs) +
        '<div class="sbPanG k3"><div><b>' + Math.max(0, hd - n) + "</b><span>hedefe kalan</span></div><div><b>" + (D.bu && gs - gun > 0 ? sayi(Math.max(0, hd - n) / (gs - gun + 1), 1) : "—") + "</b><span>gereken / gün</span></div><div><b>" + (gun ? sayi(n / gun, 2) : "—") + "</b><span>gerçekleşen / gün</span></div></div></div>";
    }
    /* 20 satış için gereken */
    var X = sbDonusum(V), r = X.r, az = X.n < 30 || X.ul[3] < 8, VR = [null, 0.42, 0.55, 0.78, 0.28];
    var kul = [1, 2, 3, 4].map(function (i) { return !az && r[i] ? r[i] : VR[i]; });
    var gerek = sbGerekli(hd, kul);
    var ger = { aday: V.A.filter(function (a) { return sbIcinde(a.created, D); }).length };
    var AGd = (V.AG || []).filter(function (g) { return sbIcinde(g.created, D); });
    var ulD = function (s) { return AGd.length ? AGd.filter(function (g) { return g.yeni === s; }).length : null; };
    var plan = sbKart(sbI("sbHedef", "s") + hd + " satış için gereken", '<div class="sbHp">' + [["aday", gerek[0], ger.aday], ["nitelikli", gerek[1], ulD("Nitelikli")], ["keşif", gerek[2], ulD("Keşif")], ["teklif", gerek[3], V.T.filter(function (t) { return sbIcinde(t.created, D) && !t.onceki; }).length]].map(function (x, i) { return '<div class="' + (i === 3 ? "so" : "") + '"><b>' + sayi(x[1]) + "</b><span>" + x[0] + "</span><small>" + sbEsc(D.ad.split(" ")[0]) + ": " + (x[2] == null ? "—" : x[2]) + "</small></div>"; }).join("") + "</div>" +
      '<div class="sbHpO">' + kul.map(function (k, i) { return "<span>%" + Math.round(k * 100) + " →</span>"; }).join("").replace(/→<\/span>$/, "→ " + hd + "</span>") + "</div>" +
      '<div class="sbUy">' + sbI("sbUyari", "s") + "<span>" + (az ? "<b>Varsayım.</b> Son 180 günde yeterli geçmiş yok (" + X.n + " müşteri, " + X.ul[3] + " teklif). Oranlar örnek değerlerdir: %42 · %55 · %78 · %28. Veri biriktikçe gerçek oranlar kullanılır." : "<b>Gerçek oranlar</b> · son 180 gün, " + X.kaynak + ". Örnek: " + X.n + " müşteri.") + "</span></div>", { ks: "aylık" });
    /* kişi hedefleri */
    var E = sbEkip(V).filter(function (u) { return u.rol !== "saha"; }), dag = 0;
    var kisi = sbKart("Kişi hedefleri", '<div class="sbLb2">' + E.map(function (u) { var s = S.filter(function (x) { return x.sor === u.id; }).length, kh = (+(HD.kisi || {})[u.id] || 0) * (D.ay || 1); dag += kh; var d = ""; for (var i = 0; i < Math.max(kh, s); i++) d += '<i class="' + (i < s ? "d" : "") + '"></i>';
      return '<div class="sbLbR">' + sbAv(u.name || u.email, sbKRenk(u.id)) + '<div class="sbLbT"><b>' + sbEsc(u.name || u.email) + "</b><small>" + sbEsc(u.unvan || ROL_AD[u.rol] || "") + (kh ? "" : " · kişisel hedef girilmedi") + "</small>" + (d ? '<span class="sbHd2">' + d + "</span>" : "") + '</div><div class="sbEkV"><b>' + s + (kh ? "<small> / " + kh + "</small>" : "") + "</b><small>sözleşme</small></div></div>"; }).join("") + "</div>" +
      '<div class="sbKay' + (dag !== hd ? " u" : "") + '"><i></i>Ekip hedefi ' + hd + " · kişilere dağıtılan " + dag + (dag !== hd ? " · otomatik dağıtılmaz, yönetici belirler" : "") + "</div>", { ks: sbEsc(D.ad) });
    /* haftalık faaliyet */
    var h7 = sbGunEkle(b, -6), akt = E.concat(sbEkip(V).filter(function (u) { return u.rol === "saha"; })).map(function (u) {
      return { u: u, g: V.G.filter(function (g) { return g.yazan === u.id && String(g.created).slice(0, 10) >= h7; }).length, k: V.A.filter(function (a) { return a.kesifci === u.id && a.asama === "Keşif"; }).length, t: V.T.filter(function (t) { return t.hazirlayan === u.id && String(t.created).slice(0, 10) >= h7; }).length, s: V.sat.filter(function (s) { return s.sor === u.id && s.tarih >= h7; }).length }; });
    var aktK = sbKart("Son 7 gün faaliyet", '<div class="sbTbS"><table class="sbTb"><thead><tr><th>Kişi</th><th class="r">Görüşme</th><th class="r">Keşifte</th><th class="r">Teklif</th><th class="r">Sözleşme</th></tr></thead><tbody>' + akt.map(function (x) { return "<tr><td>" + sbEsc((x.u.name || x.u.email).split(" ")[0]) + '</td><td class="r n">' + x.g + '</td><td class="r n">' + x.k + '</td><td class="r n">' + x.t + '</td><td class="r n">' + x.s + "</td></tr>"; }).join("") + '</tbody></table></div><div class="sbKay"><i></i>Görüşme: sisteme yazılan görüşme notları · Teklif: hazırlanan teklifler</div>');
    /* kaynak + kayıp */
    var K = {}; V.A.forEach(function (a) { if (!sbIcinde(a.created, D)) return; var k = a.kaynak || "Diğer"; (K[k] = K[k] || { a: 0, s: 0, n: 0 }).a++; if (a.asama !== "Aday" && a.asama !== "Kaybedildi") K[k].n++; });
    S.forEach(function (s) { var k = s.a.kaynak || "Diğer"; (K[k] = K[k] || { a: 0, s: 0, n: 0 }).s++; });
    var kL = Object.keys(K).sort(function (x, y) { return K[y].a - K[x].a; });
    var kay = sbKart("Kaynak performansı", kL.length ? '<div class="sbTbS"><table class="sbTb"><thead><tr><th>Kaynak</th><th class="r">Aday</th><th class="r">İlerleyen</th><th class="r">Sözleşme</th></tr></thead><tbody>' + kL.map(function (k) { return "<tr><td>" + sbEsc(k) + '</td><td class="r n">' + K[k].a + '</td><td class="r n">' + K[k].n + '</td><td class="r n">' + K[k].s + "</td></tr>"; }).join("") + "</tbody></table></div>" : sbBos("sbHoparlor", "Bu dönemde yeni aday yok", ""), { ks: sbEsc(D.ad) }) ;
    var KN = {}; V.A.forEach(function (a) { if (a.asama !== "Kaybedildi" || !sbIcinde(a.updated, D)) return; var k = String(a.kayipNedeni || "Neden yazılmamış").split(":")[0]; KN[k] = (KN[k] || 0) + 1; });
    var knL = Object.keys(KN).sort(function (x, y) { return KN[y] - KN[x]; }), knT = knL.reduce(function (s, k) { return s + KN[k]; }, 0);
    var kayip = sbKart("Kayıp nedenleri", knL.length ? knL.map(function (k) { return '<div class="sbKv"><span>' + sbEsc(k) + '</span><b><span class="sbMiniB"><i style="width:' + (KN[k] / knT * 100).toFixed(0) + '%"></i></span>' + KN[k] + "</b></div>"; }).join("") : sbBos("sbOk", "Bu dönemde kayıp yok", ""), { ks: knT ? knT + " kayıp" : "" });
    var rek = reklamci() ? '<a class="sbK sbLinkK" href="#reklamlar">' + sbI("sbHoparlor") + '<span><b>Reklam harcaması ve aday başı maliyet</b><small>Meta bağlantısından · bağlantı yoksa tutar gösterilmez</small></span>' + sbI("sbSag", "s") + "</a>" : "";
    m.innerHTML = '<div class="sbSayfa">' + h + '<div class="sbIki"><div class="sbSut">' + tempoK + plan + kisi + '</div><div class="sbSut">' + aktK + kay + kayip + rek + "</div></div></div>";
    bagT("[data-sbdon2]", function (e) { SB.don = e.dataset.sbdon2; sSatisHedef(); });
    var dz = $("sbHdD"); if (dz) dz.onclick = function () { sbHedefDuzenle(V, HD); };
  }).catch(function (e) { m.innerHTML = '<div class="sbSayfa">' + sbBos("sbUyari", "Veri yüklenemedi", sbEsc(e.message || "")) + "</div>"; });
}
function sbGerekli(hd, kul) { var t = Math.ceil(hd / kul[3]), k = Math.ceil(t / kul[2]), n = Math.ceil(k / kul[1]), a = Math.ceil(n / kul[0]); return [a, n, k, t]; }
function sbTempoSvg(kum, hd, gs) {
  var W = window.innerWidth >= 1000 ? 620 : 320, H = window.innerWidth >= 1000 ? 150 : 118, x = function (i) { return 8 + i / Math.max(1, gs - 1) * (W - 16); }, y = function (v) { return H - 16 - v / Math.max(1, hd) * (H - 30); };
  var son = -1, p = ""; kum.forEach(function (v, i) { if (v == null) return; p += (p ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1) + " "; son = i; });
  var dol = son >= 0 ? p + "L" + x(son).toFixed(1) + " " + y(0).toFixed(1) + " L" + x(0).toFixed(1) + " " + y(0).toFixed(1) + "Z" : "";
  return '<svg class="sbTempo" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Aylık sözleşme temposu"><line x1="' + x(0) + '" y1="' + y(0) + '" x2="' + x(gs - 1) + '" y2="' + y(hd) + '" stroke="rgba(255,255,255,.35)" stroke-dasharray="4 4" stroke-width="1.5"/>' +
    (dol ? '<path d="' + dol + '" fill="rgba(237,125,49,.18)"/><path d="' + p + '" fill="none" stroke="#ed7d31" stroke-width="2.5" stroke-linejoin="round"/><circle cx="' + x(son) + '" cy="' + y(kum[son]) + '" r="4.5" fill="#ed7d31" stroke="#fff" stroke-width="2"/>' : "") +
    '<text x="' + (x(gs - 1) - 2) + '" y="' + (y(hd) - 5) + '" fill="#c7d4e6" font-size="10" text-anchor="end">hedef ' + hd + '</text><text x="8" y="' + (H - 2) + '" fill="#9fb0c4" font-size="9.5">1</text><text x="' + (W - 8) + '" y="' + (H - 2) + '" fill="#9fb0c4" font-size="9.5" text-anchor="end">' + gs + "</text></svg>";
}
function sbHedefDuzenle(V, HD) {
  var E = sbEkip(V).filter(function (u) { return u.rol !== "saha"; });
  panelAc('<div class="pnlB"><b>Satış hedefleri</b><small>Aylık · kişilere otomatik dağıtılmaz</small></div><div class="f"><label>Ekip hedefi (aylık sözleşme)<input id="sbHT" inputmode="numeric" value="' + HD.aylik + '"></label>' +
    E.map(function (u) { return '<label>' + sbEsc(u.name || u.email) + ' · kişisel hedef<input data-sbhk="' + u.id + '" inputmode="numeric" placeholder="boş = hedef yok" value="' + sbEsc((HD.kisi || {})[u.id] || "") + '"></label>'; }).join("") +
    '<small id="sbHTo" style="color:var(--muted)"></small><button class="btn pri" id="sbHK">Kaydet</button></div>', "alt");
  var top = function () { var t = 0; Array.prototype.forEach.call(document.querySelectorAll("[data-sbhk]"), function (i) { t += parseInt(i.value, 10) || 0; }); $("sbHTo").textContent = "Kişilere dağıtılan: " + t + " · ekip hedefi " + (parseInt($("sbHT").value, 10) || 0); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-sbhk], #sbHT"), function (i) { i.oninput = top; }); top();
  $("sbHK").onclick = function () { var a = parseInt($("sbHT").value, 10); if (!(a > 0)) { toast("Ekip hedefi gerekli"); return; } var k = {}; Array.prototype.forEach.call(document.querySelectorAll("[data-sbhk]"), function (i) { var v = parseInt(i.value, 10); if (v > 0) k[i.dataset.sbhk] = v; });
    var b = this; b.disabled = true; var deger = { aylik: a, kisi: k, guncelleyen: BEN.id, guncelleme: new Date().toISOString() };
    liste("ayarlar", "anahtar = 'satis_hedef'").then(function (L) { return L[0] ? api("/api/collections/ayarlar/records/" + L[0].id, { method: "PATCH", body: { deger: deger } }) : api("/api/collections/ayarlar/records", { method: "POST", body: { anahtar: "satis_hedef", deger: deger } }); })
      .then(function () { panelKapat(); toast("Hedefler kaydedildi"); sbSifirla(); sSatisHedef(); }).catch(function (e) { b.disabled = false; hata(e); }); };
}
/* ---------- DİĞER ---------- */
function sSatisDiger() {
  sbNav(); var m = $("m"); m.className = "sbM";
  var L = [];
  L.push(["#hedefler", "sbHedef", "Hedefler ve performans", "Tempo, gereken aday/keşif/teklif, kişi hedefleri, kaynak ve kayıp"]);
  if (reklamci() && yt("musteri")) L.push(["#reklamlar", "sbHoparlor", "Reklamlar", "Meta kampanyaları, harcama, aday başı maliyet"]);
  if (yt("teklif") || yt("fiyat")) L.push(["#katalog", "sbKutu", "Ürün kataloğu", "Panel, inverter, batarya ve diğer kalemler"]);
  if (yt("ekip") || yon()) { L.push(["#ekip", "sbKisi", "Ekip ve yetkiler", "Roller, kişi bazlı yetkiler, teklif metni"]); L.push(["#ekip/ortaklar", "sbEl", "İş ortakları", "Yönlendirmeler, satışlar ve komisyonlar"]); }
  if (yt("musteri")) L.push(["#yeni", "sbArti", "Yeni müşteri", "Telefon, ilçe ve kaynakla hızlı kayıt"]);
  m.innerHTML = '<div class="sbSayfa">' + sbBas("Diğer", "Satış araçları ve ayarlar") + '<div class="sbDg">' + L.map(function (x) { return '<a class="sbDgK" href="' + x[0] + '"' + (x[0] === "#ekip/ortaklar" ? ' data-sbek="ortaklar"' : "") + '><span class="sbIk sbIk-p">' + sbI(x[1]) + "</span><span><b>" + x[2] + "</b><small>" + x[3] + "</small></span>" + sbI("sbSag", "s") + "</a>"; }).join("") + "</div></div>";
  Array.prototype.forEach.call(document.querySelectorAll("[data-sbek]"), function (a) { a.onclick = function (e) { e.preventDefault(); SB.ekipSek = "ortaklar"; location.hash = "#ekip"; }; });
}
