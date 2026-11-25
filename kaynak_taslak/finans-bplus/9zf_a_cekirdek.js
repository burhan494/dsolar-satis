/* v92 · Finans B+ Premium — çekirdek: menü, şirket/para birimi seçici, tutar gizleme, veri ve hesap motoru
   Hesap kuralları mevcut motorla aynıdır: bakiyeler(), kasaHesap(), nakitAkis(), usdKarsilik() — Bugün ekranıyla birebir.
   Yeni olan: şirket ayrımı, gün bazlı kısa vade projeksiyonu, hareketlerin durum sınıfı, borç/alacak grupları (her yükümlülük bir kez). */
(function () {
  var I = {
    fbBanka: '<path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>', fbAkis: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    fbOdeme: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12l2.5 2.5 4.5-5"/>', fbBorc: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    fbCuzdan: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16.5" height="11" rx="2.5"/><path d="M16 13.5h.1"/>', fbKalkan: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    fbPasta: '<path d="M12 3v9h9A9 9 0 1 1 12 3z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>', fbAsagiOk: '<path d="M12 4v14M6 12l6 6 6-6"/>', fbYukariOk: '<path d="M12 20V6M6 12l6-6 6 6"/>',
    fbKart: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>', fbGozK: '<path d="M3 3l18 18M10.6 6.1A9.9 9.9 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.6M6.4 7.4A17 17 0 0 0 2.5 12S6 18 12 18a9.6 9.6 0 0 0 4.3-1"/>',
    fbBina: '<path d="M4 21V5l8-2v18M12 8h8v13M8 8h.1M8 12h.1M8 16h.1M16 12h.1M16 16h.1M2 21h20"/>', fbPusula: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'
  };
  Object.keys(I).forEach(function (k) { ICO[k] = I[k]; });
})();
var FB = { s: "hep", pb: "USD", giz: false, v: null, vt: 0, per: 30, ozB: "", ozS: "", sen: "", kayit: {} };
try { FB.s = localStorage.getItem("fbSirket") || "hep"; FB.pb = localStorage.getItem("fbPb") || "USD"; FB.giz = localStorage.getItem("fbGiz") === "1"; FB.per = +localStorage.getItem("fbPer") || 30; } catch (e) {}
if (["hep", "D Solar", "DRK"].indexOf(FB.s) < 0) FB.s = "hep";
var FB_SIRKETLER = ["D Solar", "DRK"];
function fbI(n, c) { return sbI(n, c); }
function fbEsc(s) { return esc(s == null ? "" : String(s)); }
/* ---------- menü ---------- */
var FB_TAB = [["genel", "Genel", "Genel", "sbGrid"], ["kasa", "Hesaplar", "Hesap", "fbBanka"], ["akis", "Nakit akışı", "Akış", "fbAkis"], ["odeme", "Ödemeler", "Ödeme", "fbOdeme"], ["borc", "Borç / Alacak", "Borç", "fbBorc"], ["diger", "Diğer", "Diğer", "sbNokta"]];
var FB_GRUP = { genel: "genel", mali: "genel", kasa: "kasa", hesap: "kasa", hareket: "kasa", akis: "akis", nakit: "akis", plan: "akis", senaryo: "akis", odeme: "odeme", borc: "borc", kredi: "borc", cek: "borc", diger: "diger", ortak: "diger", personel: "diger", sabit: "diger", soru: "diger", varlik: "diger", rapor: "diger", ayar: "diger", gecmis: "diger" };
function fbSekmeler() { if (!yt("fin")) return FB_TAB.filter(function (t) { return t[0] === "odeme"; }); return FB_TAB; }
function fbNav(alt) {
  document.body.classList.add("fbAcik"); document.body.classList.remove("adBarV");
  var g = FB_GRUP[alt] || "genel", L = fbSekmeler(), k = document.querySelector(".altS"), m = $("m");
  if (!k) { k = document.createElement("div"); if (m) m.parentNode.insertBefore(k, m); }
  if (L.length > 1) { k.className = "altS sbTab fbTab"; k.style.gridTemplateColumns = "repeat(" + L.length + ",minmax(0,1fr))";
    k.innerHTML = L.map(function (t) { var on = t[0] === g; return '<a href="#finans/' + t[0] + '" class="' + (on ? "on" : "") + '"' + (on ? ' aria-current="page"' : "") + ">" + fbI(t[3]) + "<span>" + t[2] + '</span><em class="sbRz" data-fbrz="' + t[0] + '" hidden></em></a>'; }).join(""); }
  else k.remove();
  var y = document.querySelector('nav.yan a[data-nv="finans"]');
  if (y && L.length > 1) { var d = document.createElement("div"); d.className = "fbYan";
    d.innerHTML = '<div class="yGrp">Finans</div>' + L.map(function (t) { var on = t[0] === g; return '<a href="#finans/' + t[0] + '" class="' + (on ? "on" : "") + '"><i>' + ikon(t[3], "#34d399", on ? "dolu" : "") + "</i><span>" + t[1] + "</span>" + (t[0] === "odeme" ? '<u class="rz" data-fbrz2="odeme"></u>' : "") + "</a>"; }).join("");
    var on = y.previousElementSibling, sirk = on && on.classList.contains("yGrp") && /şirket/i.test(on.textContent);
    y.parentNode.replaceChild(d, y); if (sirk) { on.remove(); d.insertAdjacentHTML("afterend", '<div class="yGrp">Şirket</div>'); } }
  fbRozet();
}
function fbRozet() { var n = (ROZ && ROZ.v && ROZ.v.finans) || 0; Array.prototype.forEach.call(document.querySelectorAll('[data-fbrz="odeme"]'), function (e) { e.hidden = !n; e.textContent = n > 99 ? "99+" : n || ""; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-fbrz2="odeme"]'), function (e) { e.textContent = n || ""; }); }
window.addEventListener("hashchange", function () { var s = (location.hash.replace(/^#/, "").split("/")[0]) || ""; if (s !== "finans") { document.body.classList.remove("fbAcik"); document.body.classList.remove("fbGizli"); FB.aktif = false; } });
/* ---------- şirket ve para birimi ---------- */
function fbSecici(o) {
  o = o || {}; var s = '<div class="sbSeg fbSeg" role="group" aria-label="Şirket">' + [["hep", "Birlikte"], ["D Solar", "D Solar"], ["DRK", "DRK"]].filter(function (x) { return !BEN.y_sirket || x[0] === BEN.y_sirket; }).map(function (x) { return '<button data-fbs="' + x[0] + '" aria-pressed="' + (FB.s === x[0]) + '">' + x[1] + "</button>"; }).join("") + "</div>";
  var p = o.pb === false ? "" : '<div class="sbSeg fbSeg" role="group" aria-label="Para birimi">' + ["USD", "TL", "EUR"].map(function (x) { var k = x === "TL" ? "TRY" : x; return '<button data-fbp="' + k + '" aria-pressed="' + (FB.pb === k) + '">' + x + "</button>"; }).join("") + "</div>";
  return '<div class="fbSec">' + s + p + (o.giz === false ? "" : '<button class="sbIb fbGizB" data-fbgiz="1" aria-pressed="' + FB.giz + '" aria-label="Tutarları gizle" title="Tutarları gizle">' + fbI(FB.giz ? "fbGozK" : "sbGoz") + "</button>") + "</div>";
}
function fbSeciciBagla(yenile) {
  bagT("[data-fbs]", function (e) { FB.s = e.dataset.fbs; try { localStorage.setItem("fbSirket", FB.s); } catch (x) {} yenile(); });
  bagT("[data-fbp]", function (e) { FB.pb = e.dataset.fbp; try { localStorage.setItem("fbPb", FB.pb); } catch (x) {} yenile(); });
  bagT("[data-fbgiz]", function () { FB.giz = !FB.giz; try { localStorage.setItem("fbGiz", FB.giz ? "1" : "0"); } catch (x) {} yenile(); });
}
function fbSirketAd(s) { return s === "hep" || !s ? "D Solar + DRK" : s; }
/* yeni kayıt hangi şirkete yazılır: seçili şirket; Birlikte görünümde hesabın şirketi, hesap yoksa D Solar */
function fbYeniSirket() { return FB.s === "hep" ? "D Solar" : FB.s; }
function fbYeniNot() { return '<span class="sbCh fbYeniC">' + fbI("sbArti", "xs") + "Yeni kayıt: " + (FB.s === "hep" ? "seçilen hesabın şirketi, hesapsızsa D Solar" : FB.s) + "</span>"; }
/* ---------- tutar biçimleri (taban USD; görünüm TL/EUR) ---------- */
function fbKurO() { return (FB.v && FB.v.KU) || { usd: 1, eur: 1 }; }
function fbCev(usd, pb) { var K = fbKurO(); pb = pb || FB.pb; return pb === "TRY" ? usd * K.usd : pb === "EUR" ? usd * K.usd / K.eur : usd; }
function fbSem(pb) { pb = pb || FB.pb; return pb === "TRY" ? "₺" : pb === "EUR" ? "€" : "$"; }
function fbF(usd, o) { o = o || {}; var v = fbCev(usd || 0, o.pb), s = (v < 0 ? "−" : o.isaret && v > 0 ? "+" : "") + sayi(Math.abs(v), o.d || 0); return '<span class="fbT">' + s + (o.sem === false ? "" : " " + fbSem(o.pb)) + "</span>"; }
function fbK(usd, o) { o = o || {}; var v = fbCev(usd || 0, o.pb), a = Math.abs(v), s = a >= 1e6 ? sayi(a / 1e6, 2) + " mn" : a >= 1e4 ? sayi(a / 1e3, 0) + " bin" : sayi(a, 0);
  return '<span class="fbT">' + (v < 0 ? "−" : o.isaret && v > 0 ? "+" : "") + s + (o.sem === false ? "" : " " + fbSem(o.pb)) + "</span>"; }
function fbOrj(t, pb) { return '<span class="fbT">' + sayi(t, Math.abs(t) < 1000 && t % 1 ? 2 : 0) + " " + (pb === "TRY" ? "₺" : pb === "EUR" ? "€" : "$") + "</span>"; }
function fbKurEt() { var K = fbKurO(), eski = isGunuFark(K.tarih) > 2;
  return '<span class="sbCh ' + (eski ? "u" : "ok") + ' fbKurC"><i class="fbNk"></i>Kasa kuru · ' + fbEsc(K.kaynak || "") + (K.tarih ? " " + tarih(String(K.tarih).slice(0, 10)) : "") + " · USD " + sayi(K.usd, 2) + " · EUR " + sayi(K.eur, 2) + (eski ? " · eski" : "") + "</span>"; }
/* ---------- tutar gizleme: bütün Finans ekranlarında (grafik etiketleri dahil). Yalnız görünüm; erişim güvenliği sunucudadır. ---------- */
var FB_RX = /([−\-+]?\d{1,3}(?:\.\d{3})+(?:,\d+)?|[−\-+]?\d+,\d+|[−\-+]?\d{3,})(\s*(?:\$|₺|€|TL|USD|EUR|bin|mn|K\b|M\b))?/g;
var FB_TARIH = /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b|\b\d{4}-\d{2}(-\d{2})?\b|\b\d{1,2}:\d{2}\b/;
function fbMaskeMetin(s) { if (FB_TARIH.test(s) && !/[\$₺€]/.test(s)) { return s.replace(FB_TARIH, "\u0000$&\u0000").split("\u0000").map(function (p, i) { return i % 2 ? p : p.replace(FB_RX, function (m0, n, u) { return "•••" + (u || ""); }); }).join(""); }
  return s.replace(FB_RX, function (m0, n, u) { return "•••" + (u || ""); }); }
function fbMaskele(kok) {
  if (!FB.giz || !kok) return; var w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT, null), n, L = [];
  while ((n = w.nextNode())) { var p = n.parentNode; if (!p || /^(SCRIPT|STYLE|TEXTAREA|OPTION)$/.test(p.nodeName)) continue; if (p.closest && p.closest(".fbAcikT,input,select,.fbSec")) continue; L.push(n); }
  L.forEach(function (x) { var v = x.nodeValue; if (!/\d/.test(v)) return; var pn = x.parentNode, hucre = pn.closest && pn.closest("td,text,tspan") && /^[\s−\-+]*\d[\d.,]*\s*(\$|₺|€|%|bin|mn|K|M)?\s*$/.test(v) && !/%\s*$/.test(v);
    var y = (pn.closest && pn.closest(".fbT")) || hucre ? v.replace(/\d/g, "•").replace(/•[•.,]*/g, "•••") : fbMaskeMetin(v); if (y !== v) x.nodeValue = y; });
  Array.prototype.forEach.call(kok.querySelectorAll("input.fbTutar"), function (i) { i.type = "password"; });
}
var FB_GOZ = null;
function fbGizUygula() {
  document.body.classList.toggle("fbGizli", !!FB.giz); var m = $("m"); if (!m) return;
  if (FB_GOZ) { FB_GOZ.disconnect(); FB_GOZ = null; }
  if (!FB.giz) return; fbMaskele(m);
  var t = 0; FB_GOZ = new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () { if (FB_GOZ) { FB_GOZ.disconnect(); fbMaskele(m); FB_GOZ.observe(m, { childList: true, subtree: true, characterData: true }); } }, 30); });
  FB_GOZ.observe(m, { childList: true, subtree: true, characterData: true });
}
/* ---------- şirket filtresi: Finans ekranlarındayken eski ekranlar da (akış, plan, ödemeler, raporlar…) seçili şirketin kayıtlarını görür ---------- */
var fbListe0 = liste, fbApi0 = api;
var FB_SK = { fin_hesaplar: 1, fin_hareketler: 1, fin_sabitler: 1, krediler: 1, fin_kartlar: 1, fin_limitler: 1, fin_teminatlar: 1, ortak_cari: 1, varliklar: 1 };
liste = function (col, filtre, sirala, genis) {
  if (FB.aktif && FB.s !== "hep" && FB_SK[col] && /^#finans/.test(location.hash)) filtre = (filtre ? "(" + filtre + ") && " : "") + "sirket = '" + FB.s + "'";
  return fbListe0(col, filtre, sirala, genis);
};
api = function (yol, opt) {
  opt = opt || {}; var m = /^\/api\/collections\/(fin_hareketler|fin_sabitler|krediler|fin_kartlar|fin_limitler|fin_teminatlar|varliklar|ortak_cari)\/records(\?|$)/.exec(yol);
  if (FB.aktif && /^#finans/.test(location.hash) && m && (opt.method || "GET") === "POST" && opt.body && !(opt.body instanceof FormData) && !opt.body.sirket && FB.s !== "hep") opt = Object.assign({}, opt, { body: Object.assign({}, opt.body, { sirket: FB.s }) });
  return fbApi0(yol, opt);
};
/* ---------- veri ---------- */
function fbVeri(zorla) {
  if (!zorla && FB.v && Date.now() - FB.vt < 30000) return Promise.resolve(FB.v);
  var L = fbListe0, bos = function () { return []; }, o = yt("ortak");
  return Promise.all([L("fin_hesaplar", "", "sirket,ad"), L("fin_hareketler", "", "tarih"), L("fin_sabitler", "", "ad"), kurKartiGetir(),
    yt("ges") ? L("ges_aylik", "", "donem").catch(bos) : Promise.resolve([]),
    L("fin_ayarlar", "anahtar = 'nakit_ayar' || anahtar = 'beacon_genel' || anahtar = 'ges_ayar' || anahtar = 'senaryo5' || anahtar = 'personel_ayar'").catch(bos),
    L("krediler", "", "ad").catch(bos), L("fin_kartlar", "", "banka").catch(bos), L("projeler", "durum = 'Sürüyor'", "basla", "aday").catch(bos),
    o ? L("ortak_cari", "", "tarih").catch(bos) : Promise.resolve([]), o ? L("varliklar", "", "ad").catch(bos) : Promise.resolve([]), o ? L("personel", "", "ad").catch(bos) : Promise.resolve([]),
    L("odeme_listeleri", "", "-created").catch(bos)]).then(function (R) {
    var AY = {}, AYR = {}; R[5].forEach(function (x) { AY[x.anahtar] = x.deger; AYR[x.anahtar] = x; });
    var V = { H: R[0], M: R[1], S: R[2], KU: R[3], G: R[4], AY: AY, AYR: AYR, KR: R[6], KT: R[7], PR: R[8], OC: R[9], VR: R[10], PS: R[11], OL: R[12], b: bugun() };
    V.MM = {}; V.M.forEach(function (m) { V.MM[m.id] = m; });
    V.B = bakiyeler(V.H, V.M.filter(function (m) { return m.durum === "Gerçekleşti"; }));
    FB.v = V; FB.vt = Date.now(); FB.c = {}; return V; });
}
function fbTampon(V, s) { var n = V.AY.nakit_ayar || {}, T = n.tampon || {};
  if (s === "hep") return fbTampon(V, "D Solar") + fbTampon(V, "DRK");
  if (T[s] != null) return +T[s] || 0;
  if (s === "D Solar") return n.tamponUsd != null ? +n.tamponUsd || 0 : V.AY.beacon_genel && V.AY.beacon_genel.tampon ? Math.round(usdKarsilik(+V.AY.beacon_genel.tampon.tutar || 0, V.AY.beacon_genel.tampon.pb === "TL" ? "TRY" : V.AY.beacon_genel.tampon.pb, V.KU)) : 0;
  return 0; }
var FB_KMH = /kmh|rotatif|spot|bch|kredili mevduat/i;
/* şirket bazlı hesap: s = "hep" | "D Solar" | "DRK" */
function fbHesap(s) {
  var V = FB.v; FB.c = FB.c || {}; if (FB.c[s]) return FB.c[s];
  var ic = function (x) { return s === "hep" || (x.sirket || "D Solar") === s; }, KU = V.KU, b = V.b;
  var H = V.H.filter(ic), M = V.M.filter(ic), S = V.S.filter(ic), K = kasaHesap(H, V.B, KU);
  var N = nakitAkis({ M: M, S: S, G: V.G, BG: s === "DRK" ? null : V.AY.beacon_genel, RA: V.AY.ges_ayar }, KU, 5), IT = [];
  N.aylar.forEach(function (a) { N.A[a].kal.forEach(function (k) { var m = k.id ? V.MM[k.id] : null, st;
    if (k.gec || (k.ges && k.yon === "Giriş" && k.t < b)) st = "gec"; else if (k.ges) st = /\(fatura/.test(k.ad) ? "kes" : "tah"; else if (k.sabit) st = "kes";
    else if (m && /amcor|kira geliri|ges/i.test(m.kategori || "") && m.yon === "Giriş") st = /tahmin/i.test((m.aciklama || "") + " " + (m.not || "")) ? "tah" : /fatura/i.test((m.aciklama || "") + " " + (m.not || "")) ? "kes" : "pla";
    else if (m && (m.kredi || m.cek || m.kart || m.durum === "Tahsilde" || m.onay === "Onaylandı" || /kredi|çek/i.test(m.kategori || ""))) st = "kes"; else st = "pla";
    IT.push({ t: k.t, usd: k.usd || 0, yon: k.yon, st: st, ad: k.ad, grup: k.grup, id: k.id || "", tutar: k.tutar, pb: k.pb, ges: !!k.ges, sabit: !!k.sabit, onay: k.onay || "", m: m }); }); });
  IT.sort(function (x, y) { return x.t < y.t ? -1 : x.t > y.t ? 1 : 0; });
  // tarihi belirsiz proje alacakları (mevcut kural: sözleşme bedeli − bu müşteriye yazılmış tahsilatlar)
  var tah = {}; M.forEach(function (m) { if (m.aday && m.yon === "Giriş") tah[m.aday] = (tah[m.aday] || 0) + usdKarsilik(+m.tutar || 0, m.pb || "TRY", KU); });
  var BEL = s === "DRK" ? [] : V.PR.filter(function (p) { return p.bedelUsd > 0; }).map(function (p) { return { p: p, ad: ((p.expand || {}).aday || {}).ad || "Proje", kalan: p.bedelUsd - (tah[p.aday] || 0) }; }).filter(function (x) { return x.kalan > 1; });
  // borç grupları — her yükümlülük bir kez: kredi taksitleri yalnız kredi grubunda, kart ekstreleri yalnız kart borcunda, çekler yalnız çek grubunda
  var u = function (m) { return usdKarsilik(+m.tutar || 0, m.pb || "TRY", KU); }, acik = M.filter(function (m) { return m.durum !== "Gerçekleşti" && m.onay !== "Reddedildi" && !m.transferId && !/hesaplar arası|şirketler arası/i.test(m.kategori || ""); });
  var KRD = V.KR.filter(function (k) { return k.durum !== "Kapandı" && (s === "hep" || (k.sirket || "D Solar") === s); }).map(function (k) {
    var hs = V.M.filter(function (m) { return m.kredi === k.id; }), pl = hs.filter(function (m) { return m.durum !== "Gerçekleşti"; }).sort(function (x, y) { return x.tarih < y.tarih ? -1 : 1; }), od = hs.filter(function (m) { return m.durum === "Gerçekleşti"; });
    var top = function (L) { return L.reduce(function (t, m) { return t + (+m.tutar || 0); }, 0); }, pb = k.pb || (hs[0] && hs[0].pb) || "TRY";
    return { k: k, pb: pb, pl: pl, od: od, pT: top(pl), oT: top(od), pU: usdKarsilik(top(pl), pb, KU), kmh: FB_KMH.test(k.ad + " " + (k.not || "")) && V.H.some(function (h) { return (h.tur === "KMH" || h.tur === "Diğer") && (V.B[h.id] || 0) < 0 && (h.banka || h.ad || "").toLocaleLowerCase("tr").indexOf((k.banka || "~").toLocaleLowerCase("tr")) >= 0; }), sir: pl.filter(function (m) { return m.tarih.slice(0, 10) >= b; })[0], gec: pl.filter(function (m) { return m.tarih.slice(0, 10) < b; }) }; });
  var krId = {}; V.KR.forEach(function (k) { krId[k.id] = 1; });
  var BG = { kredi: 0, kart: 0, ted: 0, cek: 0, prs: 0, ort: 0, dig: 0 }, BL = { ted: [], cek: [], dig: [] };
  KRD.forEach(function (x) { if (!x.kmh) BG.kredi += x.pU; });
  V.KT.filter(function (k) { return k.durum !== "Kapandı" && (s === "hep" || (k.sirket || "D Solar") === s); }).forEach(function (k) { BG.kart += usdKarsilik(+k.borc || 0, k.pb || "TRY", KU); });
  acik.filter(function (m) { return m.yon === "Çıkış"; }).forEach(function (m) {
    if (m.kredi && krId[m.kredi]) return; if (m.kart || /kredi kart/i.test(m.kategori || "")) return; if (/kredi/i.test(m.kategori || "")) return;
    var g = m.cek || /çek/i.test(m.kategori || "") ? "cek" : /personel|maaş|maas|sgk/i.test(m.kategori || "") ? "dig" : /ortak/i.test(m.kategori || "") ? "dig" : grupOf(m) === "Cari ödemeler" ? "ted" : "dig";
    BG[g] += u(m); BL[g].push(m); });
  if (s !== "DRK" && V.PS.length && typeof prsOzet === "function") { try { var po = prsOzet(V.PS, prsAyar({ personel_ayar: V.AY.personel_ayar })); BG.prs = po.top / KU.usd; } catch (e) {} }
  var OCs = V.OC.filter(function (c) { return s === "hep" || (c.sirket || "D Solar") === s; }), ON = ortakNet(OCs);
  (s === "hep" ? FB_SIRKETLER : [s]).forEach(function (s2) { var n2 = ortakNet(V.OC.filter(function (c) { return (c.sirket || "D Solar") === s2; })); Object.keys(n2).forEach(function (o) { if (n2[o] < 0) BG.ort += -n2[o]; }); });
  var borcTop = BG.kredi + BG.kart + BG.ted + BG.cek + BG.prs + BG.ort + BG.dig;
  // alacaklar: sözleşmeye dayalı (proje ödeme planı), alınan çek, faturalı GES kirası = kesin; elle girilen beklenti = planlı; tahmini GES kirası = tahmini
  var AL = []; acik.filter(function (m) { return m.yon === "Giriş"; }).forEach(function (m) {
    var g = m.durum === "Tahsilde" || m.cek || /çek/i.test(m.kategori || "") ? "cek" : m.aday || /proje|malzeme satışı/i.test(m.kategori || "") ? "proje" : /amcor|kira|ges/i.test(m.kategori || "") ? "ges" : "dig";
    if (g === "ges" && /tahmin/i.test((m.aciklama || "") + " " + (m.not || ""))) return; var kes = g === "cek" || g === "proje" || (g === "ges" && /fatura/i.test((m.aciklama || "") + " " + (m.not || ""))), gun = gunFark(m.tarih.slice(0, 10), b), kisa = m.ana ? V.MM[m.ana] : null;
    AL.push({ m: m, g: g, kes: kes, usd: u(m), gun: gun, ad: m.karsiTaraf || m.aciklama || m.kategori || "", kismi: kisa ? { top: +kisa.tutar || 0, pb: kisa.pb } : null }); });
  var gesTah = IT.filter(function (k) { return k.ges && k.yon === "Giriş" && k.st === "tah"; }).reduce(function (t, k) { return t + k.usd; }, 0), gesFat = IT.filter(function (k) { return k.ges && k.yon === "Giriş" && k.st === "kes"; });
  gesFat.forEach(function (k) { AL.push({ m: null, g: "ges", kes: true, usd: k.usd, gun: gunFark(k.t, b), ad: k.ad, kismi: null }); });
  var kesA = AL.filter(function (a) { return a.kes; }).reduce(function (t, a) { return t + a.usd; }, 0), plaA = AL.filter(function (a) { return !a.kes; }).reduce(function (t, a) { return t + a.usd; }, 0);
  var R = { s: s, H: H, M: M, S: S, K: K, kul: K.T.kul, vadeli: K.T.vadeli, kmh: K.T.kmh, pbD: K.T.pb, IT: IT, BEL: BEL, belTop: BEL.reduce(function (t, x) { return t + x.kalan; }, 0), KRD: KRD, BG: BG, BL: BL, borcTop: borcTop,
    AL: AL, kesA: kesA, plaA: plaA, gesTah: gesTah, ON: ON, tampon: fbTampon(V, s), transferSay: s === "hep" ? V.M.filter(function (m) { return /^Şirketler arası/.test(m.transferTur || ""); }).length / 2 : 0 };
  FB.c[s] = R; return R;
}
/* gün bazlı projeksiyon: başlangıç = bugünkü kullanılabilir nakit. Geciken tahsilat nakde sayılmaz; geciken ödeme bugün ödenecek gibi düşülür. */
function fbProj(R, bitis, tamp) {
  var b = FB.v.b, v = R.kul, min = { v: v, t: b }, alt = null, eksi = v < 0 ? b : null, T = { gir: 0, cik: 0, kes: 0, pla: 0, tah: 0, gecG: 0, gecC: 0 }, seri = [{ t: b, v: v }], L = [];
  tamp = tamp == null ? R.tampon : tamp; if (tamp && v < tamp) alt = b;
  R.IT.forEach(function (k) { if (k.t > bitis || Math.abs(k.usd) < 0.5) return;
    if (k.st === "gec") { if (k.yon === "Giriş") { T.gecG += k.usd; return; } T.gecC += k.usd; }
    else T[k.st] += (k.yon === "Giriş" ? 1 : -1) * k.usd;
    var g = k.yon === "Giriş"; v += (g ? 1 : -1) * k.usd; if (g) T.gir += k.usd; else T.cik += k.usd; L.push(k);
    var t = k.t < b ? b : k.t; if (v < min.v) min = { v: v, t: t }; if (tamp && v < tamp && !alt) alt = t; if (v < 0 && !eksi) eksi = t;
    if (seri[seri.length - 1].t === t) seri[seri.length - 1].v = v; else seri.push({ t: t, v: v }); });
  return { bas: R.kul, son: v, min: min, alt: alt, eksi: eksi, acik: tamp ? Math.max(0, tamp - min.v) : 0, T: T, seri: seri, L: L, tampon: tamp, bitis: bitis };
}
/* risk seviyeleri: eksi bakiye (kritik) ayrı, tampon altı (uyarı) ayrı; Birlikte görünümde her şirket kendi nakdiyle değerlendirilir */
function fbRiskler(bitis) {
  var L = [], ss = FB.s === "hep" ? FB_SIRKETLER : [FB.s];
  ss.forEach(function (s) { var R = fbHesap(s), P = fbProj(R, bitis); if (!R.H.length && !R.IT.length) return;
    if (P.eksi) L.push({ sv: "kt", ik: "sbUyari", t: s + " nakdi eksiye düşüyor · " + tarih(P.eksi), d: "en düşük " + fbF(P.min.v) + " · " + tarih(P.min.t), h: "#finans/akis", s: s });
    else if (P.alt) L.push({ sv: "u", ik: "sbUyari", t: s + " nakit tamponunun altına iniyor · " + tarih(P.alt), d: "en düşük " + fbF(P.min.v) + " · tampon açığı " + fbF(P.acik), h: "#finans/akis", s: s }); });
  var R = fbHesap(FB.s), gc = R.AL.filter(function (a) { return a.gun > 0; });
  if (gc.length) L.push({ sv: "u", ik: "sbSaat", t: gc.length + " tahsilat gecikti", d: fbF(gc.reduce(function (t, a) { return t + a.usd; }, 0)) + " · en eskisi " + Math.max.apply(null, gc.map(function (a) { return a.gun; })) + " gün · nakde sayılmadı", h: "#finans/borc/gecikme" });
  var ob = FB.v.M.filter(function (m) { return m.onay === "Onay bekliyor" && m.durum !== "Gerçekleşti" && (FB.s === "hep" || m.sirket === FB.s); });
  if (ob.length && yon()) L.push({ sv: "p", ik: "fbOdeme", t: ob.length + " ödeme onayınızı bekliyor", d: fbF(ob.reduce(function (t, m) { return t + usdKarsilik(+m.tutar || 0, m.pb || "TRY", FB.v.KU); }, 0)), h: "#finans/odeme" });
  if (R.BEL.length) L.push({ sv: "b", ik: "sbTakvim", t: "Tarihi belirsiz " + R.BEL.length + " proje alacağı", d: fbF(R.belTop) + " · akışa dahil değil", h: "#finans/akis" });
  return L;
}
function fbRiskSat(x) { return '<a class="sbIs fbRs" href="' + x.h + '"><span class="sbIk sbIk-' + x.sv + '">' + fbI(x.ik) + '</span><span class="sbIsT"><b>' + x.t + "</b><small>" + x.d + '</small></span><span class="sbIsO">' + fbI("sbSag", "s") + "</span></a>"; }
/* başlık */
function fbBaslik(bas, alt, sag, geri) {
  return '<div class="sbBas fbBas">' + (geri ? '<a class="sbGeri" href="' + geri + '" aria-label="Geri">' + fbI("sbSol") + "</a>" : "") + '<div class="sbBasA"><h1>' + bas + '</h1><div class="sbBasT">' + (alt || "") + "</div></div>" + (sag ? '<div class="sbBasS">' + sag + "</div>" : "") + "</div>";
}
function fbAltNav(L, ak) { return '<div class="sbSeg w fbAlt" style="grid-template-columns:repeat(' + L.length + ',minmax(0,1fr))">' + L.map(function (x) { return '<a href="#finans/' + x[0] + '" aria-pressed="' + (x[0] === ak) + '">' + x[1] + "</a>"; }).join("") + "</div>"; }
/* kaydırma ve filtre konumu: detaydan geri dönüldüğünde korunur */
function fbKonumKaydet() { try { FB.kayit[location.hash] = window.scrollY; } catch (e) {} }
function fbKonumGeri() { var y = FB.kayit[location.hash]; if (y) setTimeout(function () { window.scrollTo(0, y); }, 30); }
window.addEventListener("hashchange", function (e) { try { var o = new URL(e.oldURL).hash; if (/^#finans/.test(o)) FB.kayit[o] = FB.sonY || 0; } catch (x) {} });
window.addEventListener("scroll", function () { if (FB.aktif) FB.sonY = window.scrollY; }, { passive: true });
