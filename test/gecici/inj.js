(function(){var st=document.createElement("style");st.textContent="\n.scSerit{position:relative;height:118px;margin:6px 18px 2px;}\n.scCizgi{position:absolute;left:0;right:0;top:58px;height:3px;background:linear-gradient(90deg,#93c5fd,#1d4ed8);border-radius:2px}\n.scNok{position:absolute;top:0;width:0;height:118px}\n.scNok i{position:absolute;left:-6px;top:53px;width:12px;height:12px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 0 0 1px #f59e0b}\n.scNok span{position:absolute;left:-60px;width:120px;font-size:10.5px;line-height:1.25;text-align:center;color:var(--muted)}\n.scNok span b{display:block;color:var(--text,#0f172a);font-size:11px}\n.scNok.ust span{bottom:68px}.scNok.alt span{top:70px}\n.scYil{position:absolute;top:64px;font-size:10px;color:#64748b;transform:translateX(-50%)}\n.scV label{font-size:13px}\n@media (max-width:700px){.scSerit{height:132px;margin:6px 6px 2px}.scNok span{width:84px;left:-42px;font-size:9.5px}.scNok.ust span{bottom:74px}.scNok.alt span{top:76px}}\n";document.head.appendChild(st);})();
/* ---------- v54 Finans · 5 yıllık senaryo (yalnız ortak/yönetici) ---------- */
var SC = { gor: "yil", sen: "baz" };
var SC_GEL = ["GES geliri", "Varlık satışı", "Cari alacak", "Çek tahsilatı", "Proje tahsilatı", "Finansman"];
var SC_GID = ["Sabit giderler", "Kredi ödemeleri", "Kredi kartları", "Cari ödemeler", "KDV (kira)", "Kurumlar vergisi", "Orhan Bey payı", "Ortaklara ödeme"];
function scVarsayilan(V, AY) {
  var vg = {}, ges = 4650000, arsa = 0;
  (V || []).forEach(function (v) { if (v.durum === "Satıldı") return; var d = v.deger != null && v.deger !== 0 ? +v.deger : +v.tahminiUsd || 0, pb = v.pb || "USD";
    if (/ges|santral/i.test(v.ad)) { ges = pb === "USD" ? d : ges; return; }
    if (/uzunburun/i.test(v.ad)) { arsa = { tutar: d, pb: pb }; return; }
    vg[v.id] = { dahil: v.durum === "Satışta", tarih: "2027-06", tutar: d, pb: pb }; });
  return { kesinti: "2027-03", sabitHedef: 250000, enf: 0.25, kurArtis: 0, kdvNet: true, kv: 0.25, amortUsd: 380000, orhanBas: "2028-06", orhanOran: 0.2,
    kotu: -0.10, iyi: 0.05, varlik: vg, erken: { banka: "", tarih: "2027-06" }, cikis: { tarih: "2028-05", gesUsd: ges, arsa: arsa || { tutar: 0, pb: "TRY" }, arsaDahil: true, orhanPay: 0.2 } };
}
function scBirles(a, b) { var o = JSON.parse(JSON.stringify(a)); Object.keys(b || {}).forEach(function (k) { if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && o[k] && typeof o[k] === "object") o[k] = scBirles(o[k], b[k]); else o[k] = b[k]; }); return o; }
function scNum(s) { var m = /([\d.]+,\d+|[\d.]+)/.exec(s || ""); return m ? +m[1].replace(/\./g, "").replace(",", ".") : 0; }
function scFaiz(m) { // planlı kredi hareketinin faiz + BSMV kısmı (TL/hareket para birimi)
  if (!m) return 0; var k = (m.kategori || "").toLocaleLowerCase("tr"), a = m.aciklama || "";
  if (/faiz/.test(k)) return +m.tutar || 0;
  var f = /faiz\s*([\d.]+,\d+|[\d.]+)/i.exec(a), b = /bsmv\s*([\d.]+,\d+|[\d.]+)/i.exec(a);
  return (f ? scNum(f[1]) : 0) + (b ? scNum(b[1]) : 0);
}
function scAnapara(m) { var a = /anapara\s*([\d.]+,\d+|[\d.]+)/i.exec((m && m.aciklama) || ""); return a ? scNum(a[1]) : null; }
/* tek senaryo hesabı: D = veriler, S = ayarlar, o = { uretim, varlik, erken } */
function scHesap(D, S, o) {
  var KU = D.KU, N = nakitAkis({ M: D.M, S: D.S, G: D.G, BG: D.AY.beacon_genel, RA: D.AY.ges_ayar }, KU, 61), ay0 = N.aylar[0], b = bugun(), MM = {};
  D.M.forEach(function (m) { MM[m.id] = m; });
  var P = gesParam(D.AY.beacon_genel), kdvO = P.kdv, idx = {}; N.aylar.forEach(function (a, i) { idx[a] = i; });
  var kf = function (i, pb) { return pb === "USD" ? 1 : 1 / Math.pow(1 + (+S.kurArtis || 0), i / 12); };
  var A = {}; N.aylar.forEach(function (a) { A[a] = { gel: {}, git: {}, kal: [], matrah: 0, faiz: 0, gider: 0, kredi: 0, santral: 0 }; });
  var ekle = function (a, yon, g, usd, k) { if (!A[a] || !usd) return; var o2 = yon === "Giriş" ? A[a].gel : A[a].git; o2[g] = (o2[g] || 0) + usd; k.grup = g; k.usd = usd; k.yon = yon; A[a].kal.push(k); };
  var erkenT = 0, erkenOdeme = 0, erkenTasarruf = 0, erk = o.erken && S.erken && S.erken.banka && S.erken.tarih ? S.erken : null;
  N.aylar.forEach(function (a) { var i = idx[a];
    N.A[a].kal.forEach(function (k0) { var k = Object.assign({}, k0), f = kf(i, k.pb), usd = k0.usd * f, m = k.id ? MM[k.id] : null;
      if (k.sabit && a >= S.kesinti) return;
      if (k.ges && /reaktif/i.test(k.ad) && a >= "2027-01") return;
      if (k.grup === "GES geliri") { if (/tahmini/.test(k.ad)) usd *= 1 + (o.uretim || 0); var mt = usd / (1 + kdvO);
        A[a].matrah += mt;
        if (S.kdvNet) { var ka = ayEkle(a + "-01", 1); ekle(ka, "Çıkış", "KDV (kira)", usd - mt, { t: ka + "-26", ad: "Kira KDV'si (" + ayAd(a) + " tahsilatı)", tutar: (k0.tutar || 0) - (k0.tutar || 0) / (1 + kdvO), pb: k0.pb }); }
        if (a >= S.orhanBas) ekle(a, "Çıkış", "Orhan Bey payı", mt * (+S.orhanOran || 0), { t: k.t, ad: "Orhan Bey payı · %" + sayi((+S.orhanOran || 0) * 100) + " (KDV hariç kira üzerinden)", tutar: Math.round(mt * (+S.orhanOran || 0)), pb: "USD" }); }
      if (k.grup === "Kredi ödemeleri" && erk && m && (m.karsiTaraf || "") === erk.banka && a >= erk.tarih) { erkenT += usd; var an = scAnapara(m); erkenOdeme += an != null ? an * usd / (+m.tutar || 1) : usd; return; }
      if (k.grup === "Kredi ödemeleri") { A[a].kredi += usd; A[a].faiz += m ? scFaiz(m) * usd / (+m.tutar || 1) : 0; }
      if (k.grup === "Sabit giderler") { A[a].gider += usd; if (m && /santral/i.test(m.kategori || "")) A[a].santral += usd; }
      ekle(a, k.yon, k.grup, usd, k); });
    if (a >= S.kesinti) { var tl = (+S.sabitHedef || 0) * Math.pow(1 + (+S.enf || 0), i / 12), u = tl / KU.usd * kf(i, "TRY");
      ekle(a, "Çıkış", "Sabit giderler", u, { t: a + "-05", ad: "Sabit giderler (senaryo: " + sayi(S.sabitHedef) + " TL bugünkü para, enflasyonla)", tutar: Math.round(tl), pb: "TRY", sab: true }); A[a].gider += u; } });
  // geçen ay tahsil edilmiş kiranın KDV'si (ödeme günü henüz gelmediyse)
  if (S.kdvNet) D.M.forEach(function (m) { if (m.durum !== "Gerçekleşti" || grupOf(m) !== "GES geliri") return; var ma = m.tarih.slice(0, 7), od = ayEkle(ma + "-01", 1) + "-26";
    if (od < b || !A[od.slice(0, 7)]) return; var u = usdKarsilik(+m.tutar || 0, m.pb || "TRY", KU); ekle(od.slice(0, 7), "Çıkış", "KDV (kira)", u - u / (1 + kdvO), { t: od, ad: "Kira KDV'si (" + ayAd(ma) + " tahsilatı, gerçekleşen)", tutar: Math.round((+m.tutar || 0) * kdvO / (1 + kdvO)), pb: m.pb || "TRY" }); });
  if (erk && erkenT > 0) { erkenTasarruf = erkenT - erkenOdeme; var ea = idx[erk.tarih] != null ? erk.tarih : ay0;
    ekle(ea, "Çıkış", "Kredi ödemeleri", erkenOdeme, { t: ea + "-15", ad: erk.banka + " erken kapama (kalan anapara)", tutar: Math.round(erkenOdeme), pb: "USD" }); A[ea].kredi += erkenOdeme; }
  if (o.varlik) Object.keys(S.varlik || {}).forEach(function (id) { var v = S.varlik[id], vv = (D.V || []).filter(function (x) { return x.id === id; })[0]; if (!v || !v.dahil || !vv || vv.durum === "Satıldı" || idx[v.tarih] == null) return;
    var u = usdKarsilik(+v.tutar || 0, v.pb || "TRY", KU) * kf(idx[v.tarih], v.pb || "TRY"); ekle(v.tarih, "Giriş", "Varlık satışı", u, { t: v.tarih + "-15", ad: vv.ad + " satışı (senaryo)", tutar: +v.tutar, pb: v.pb }); });
  // kurumlar vergisi: çeyreklik geçici vergi (Mayıs/Ağustos/Kasım 17) + yıllık beyan (Nisan sonu)
  var yil = {}; N.aylar.forEach(function (a) { var y = a.slice(0, 4), q = Math.floor((+a.slice(5, 7) - 1) / 3), x = A[a];
    var kar = x.matrah - x.gider - x.faiz - (+S.amortUsd || 0) / 12 - ((x.git["Orhan Bey payı"]) || 0);
    yil[y] = yil[y] || { q: [0, 0, 0, 0], od: 0 }; yil[y].q[q] += kar; });
  Object.keys(yil).sort().forEach(function (y) { var Y = yil[y], kum = 0;
    [[0, "05"], [1, "08"], [2, "11"], [3, null]].forEach(function (z) { kum += Y.q[z[0]]; var bor = Math.max(0, kum * (+S.kv || 0)) - Y.od; if (bor <= 0) return;
      var oa = z[1] ? y + "-" + z[1] : (+y + 1) + "-04", t = z[1] ? oa + "-17" : oa + "-30"; if (t < b || !A[oa]) return;
      Y.od += bor; ekle(oa, "Çıkış", "Kurumlar vergisi", bor, { t: t, ad: (z[1] ? (z[0] + 1) + ". çeyrek geçici vergi " : "Kurumlar vergisi beyanı ") + y + " (tahmini)", tutar: Math.round(bor), pb: "USD" }); }); });
  // kasa + ortak girişi (tampona tamamla, 60/40)
  var net = ortakNet(D.OC || []), kasa = D.kasa0, sat = [], top = 0, enD = null, enDg = null, kasaG = D.kasa0;
  N.aylar.forEach(function (a) { var x = A[a], gel = 0, git = 0; Object.keys(x.gel).forEach(function (g) { gel += x.gel[g]; }); Object.keys(x.git).forEach(function (g) { git += x.git[g]; });
    x.kal.sort(function (p, q) { return p.t < q.t ? -1 : 1; });
    var bas = kasa, son = bas + gel - git, gir = 0, bol = null; kasaG += gel - git;
    if (son < D.tampon) { gir = Math.ceil((D.tampon - son) / 1000) * 1000; bol = ortakBol(net.Burhan, net.Batur, gir); net.Burhan -= bol.B; net.Batur -= bol.T; top += gir; }
    kasa = son + gir; if (!enD || son < enD.v) enD = { a: a, v: son }; if (!enDg || kasaG < enDg.v) enDg = { a: a, v: kasaG };
    sat.push({ a: a, bas: bas, gel: gel, git: git, son: son, gir: gir, bol: bol, x: x, kasaG: kasaG }); });
  var B = 0, T = 0; sat.forEach(function (s) { if (s.bol) { B += s.bol.B; T += s.bol.T; } });
  return { sat: sat, A: A, aylar: N.aylar, top: top, B: B, T: T, enD: enD, enDg: enDg, son: kasaG, erkenT: erkenT, erkenOdeme: erkenOdeme, erkenTasarruf: erkenTasarruf };
}
function scYillar(R) { var Y = {}, L = [];
  R.sat.forEach(function (s) { var y = s.a.slice(0, 4); if (!Y[y]) { Y[y] = { y: y, bas: s.bas, gel: {}, git: {}, gelT: 0, gitT: 0, gir: 0, B: 0, T: 0, matrah: 0, kredi: 0, santral: 0, ilk: s.a }; L.push(Y[y]); }
    var o = Y[y]; o.son = s.son + s.gir; o.son0 = s.son; o.sonA = s.a; o.gelT += s.gel; o.gitT += s.git; o.gir += s.gir; if (s.bol) { o.B += s.bol.B; o.T += s.bol.T; }
    Object.keys(s.x.gel).forEach(function (g) { o.gel[g] = (o.gel[g] || 0) + s.x.gel[g]; }); Object.keys(s.x.git).forEach(function (g) { o.git[g] = (o.git[g] || 0) + s.x.git[g]; });
    o.matrah += s.x.matrah; o.kredi += s.x.kredi; o.santral += s.x.santral; });
  return L; }
function scTarihler(D, S) { var L = [["2026-11", "Bugün"], [S.kesinti, "Personel azaltma · sabit gider " + sayi(S.sabitHedef / 1000) + " bin TL"], ["2027-05", "Araç kirası biter"], ["2028-05", "2 yıllık bekleme biter (hisse satışı mümkün)"], [S.orhanBas, "Orhan Bey payı başlar (%" + sayi(S.orhanOran * 100) + ")"]];
  var kr = D.M.filter(function (m) { return m.durum !== "Gerçekleşti" && grupOf(m) === "Kredi ödemeleri"; }), son = {}; kr.forEach(function (m) { var k = m.karsiTaraf || "Kredi"; if (!son[k] || m.tarih > son[k]) son[k] = m.tarih; });
  Object.keys(son).forEach(function (k) { L.push([son[k].slice(0, 7), k + " son taksit"]); });
  Object.keys(S.varlik || {}).forEach(function (id) { var v = S.varlik[id], vv = (D.V || []).filter(function (x) { return x.id === id; })[0]; if (v && v.dahil && vv) L.push([v.tarih, vv.ad + " satışı"]); });
  if (S.cikis && S.cikis.tarih) L.push([S.cikis.tarih, "Çıkış senaryosu tarihi"]);
  return L.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; }); }
function fSenaryo() {
  if (!yt("ortak")) { location.hash = "#finans/akis"; return; }
  Promise.all([liste("fin_hesaplar", "", "ad"), liste("fin_hareketler", "", "tarih"), liste("fin_sabitler", "", "ad"), kurKartiGetir(),
    yt("ges") ? liste("ges_aylik", "", "donem").catch(function () { return []; }) : Promise.resolve([]), liste("ortak_cari", "", "tarih").catch(function () { return []; }),
    liste("fin_ayarlar", "anahtar = 'nakit_ayar' || anahtar = 'beacon_genel' || anahtar = 'ges_ayar' || anahtar = 'senaryo5'").catch(function () { return []; }),
    liste("varliklar", "", "ad").catch(function () { return []; })]).then(function (R) {
    var H = R[0], M = R[1], KU = R[3], AY = {}, scK = null; R[6].forEach(function (x) { AY[x.anahtar] = x.deger; if (x.anahtar === "senaryo5") scK = x; });
    var K = kasaHesap(H, bakiyeler(H, M.filter(function (m) { return m.durum === "Gerçekleşti"; })), KU);
    var tampon = AY.nakit_ayar && AY.nakit_ayar.tamponUsd != null ? +AY.nakit_ayar.tamponUsd : AY.beacon_genel && AY.beacon_genel.tampon ? Math.round(usdKarsilik(+AY.beacon_genel.tampon.tutar || 0, AY.beacon_genel.tampon.pb === "TL" ? "TRY" : AY.beacon_genel.tampon.pb, KU)) : 0;
    var D = { M: M, S: R[2], G: R[4], AY: AY, KU: KU, OC: R[5], V: R[7], kasa0: K.T.kul, tampon: tampon };
    var S = scBirles(scVarsayilan(R[7], AY), (scK && scK.deger) || {}); window._SC = { D: D, S: S };
    var Rb = scHesap(D, S, { uretim: 0, varlik: true, erken: false }), Rk = scHesap(D, S, { uretim: S.kotu, varlik: false, erken: false }), Ri = scHesap(D, S, { uretim: S.iyi, varlik: true, erken: false }),
      Re = S.erken.banka ? scHesap(D, S, { uretim: 0, varlik: true, erken: true }) : null;
    var Rg = { baz: Rb, kotu: Rk, iyi: Ri }[SC.sen] || Rb, Y = scYillar(Rg), BIN = function (v) { return v ? sayi(v / 1000, Math.abs(v) < 10000 ? 1 : 0) : "–"; };
    var kpi = function (ik, renk, ad, deger, alt, kotu) { return '<div class="card" style="margin:0;padding:14px 16px;display:flex;gap:12px;align-items:center">' + ikon(ik, renk) + '<div style="min-width:0"><small style="color:var(--muted);font-size:12px">' + ad + '</small><div style="font-size:20px;font-weight:800;' + (kotu ? "color:var(--bad)" : "") + '">' + deger + '</div>' + (alt ? '<small style="color:var(--muted);font-size:11.5px">' + alt + "</small>" : "") + "</div></div>"; };
    var krSon = scTarihler(D, S).filter(function (t) { return /son taksit/.test(t[1]); }).pop();
    // kritik tarihler şeridi
    var TL = scTarihler(D, S), ilkA = Rg.aylar[0], sonA = Rg.aylar[Rg.aylar.length - 1], ayFark = function (a) { return (+a.slice(0, 4) - +ilkA.slice(0, 4)) * 12 + (+a.slice(5, 7) - +ilkA.slice(5, 7)); }, toplamAy = ayFark(sonA) || 1;
    var serit = '<div class="scSerit"><div class="scCizgi"></div>' + TL.filter(function (t) { return t[0] >= ilkA && t[0] <= sonA; }).map(function (t, i) { var x = ayFark(t[0]) / toplamAy * 100;
      return '<div class="scNok ' + (i % 2 ? "alt" : "ust") + '" style="left:' + x.toFixed(2) + '%"><i></i><span><b>' + AYLAR[+t[0].slice(5, 7) - 1].slice(0, 3) + " " + t[0].slice(0, 4) + "</b>" + esc(t[1]) + "</span></div>"; }).join("") +
      Rg.aylar.filter(function (a) { return a.slice(5, 7) === "01"; }).map(function (a) { return '<div class="scYil" style="left:' + (ayFark(a) / toplamAy * 100).toFixed(2) + '%">' + a.slice(0, 4) + "</div>"; }).join("") + "</div>";
    // grafik
    var gos = Rg.sat, n = gos.length, Wg = 1200, Hg = 200, bw = Wg / n, vals = gos.map(function (s) { return s.son; }), mx = Math.max.apply(null, vals.concat([tampon, 1])), mn = Math.min.apply(null, vals.concat([0])), y = function (v) { return 10 + (mx - v) / (mx - mn || 1) * (Hg - 20); };
    var grafik = '<svg viewBox="0 0 ' + Wg + " " + Hg + '" style="width:100%;height:auto;display:block">' + gos.map(function (s, i) { var ng = s.son < 0, yt0 = y(Math.max(s.son, 0)), y0 = y(0), yb = y(Math.min(s.son, 0));
        return '<rect x="' + (i * bw + bw * 0.15).toFixed(1) + '" y="' + (ng ? y0 : yt0).toFixed(1) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + Math.max(1, ng ? yb - y0 : y0 - yt0).toFixed(1) + '" rx="2" fill="' + (ng ? "#b91c1c" : s.son < tampon ? "#ef4444" : "#3b82f6") + '"><title>' + ayAd(s.a) + ": ay sonu " + sayi(s.son) + " $" + (s.gir ? " · ortak girişi " + sayi(s.gir) + " $" : "") + "</title></rect>"; }).join("") +
      '<line x1="0" x2="' + Wg + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '" stroke="#94a3b8"/>' + (tampon ? '<line x1="0" x2="' + Wg + '" y1="' + y(tampon).toFixed(1) + '" y2="' + y(tampon).toFixed(1) + '" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="6 4"/>' : "") + "</svg>";
    // yıllık / aylık tablo
    var kolon = SC.gor === "ay" ? Rg.sat.map(function (s) { return { ad: AYLAR[+s.a.slice(5, 7) - 1].slice(0, 3) + "<small>" + s.a.slice(0, 4) + "</small>", bas: s.bas, gel: s.x.gel, git: s.x.git, gelT: s.gel, gitT: s.git, son0: s.son, gir: s.gir, son: s.son + s.gir, dscr: null, B: s.bol ? s.bol.B : 0, T: s.bol ? s.bol.T : 0 }; })
      : Y.map(function (o) { var ay1 = AYLAR[+o.ilk.slice(5, 7) - 1].slice(0, 3), ay2 = AYLAR[+o.sonA.slice(5, 7) - 1].slice(0, 3); return { ad: o.y + "<small>" + (o.ilk.slice(5) === "01" && o.sonA.slice(5) === "12" ? "tam yıl" : ay1 + "–" + ay2) + "</small>", bas: o.bas, gel: o.gel, git: o.git, gelT: o.gelT, gitT: o.gitT, son0: o.son0, gir: o.gir, son: o.son, dscr: o.kredi + o.santral > 0 ? o.matrah / (o.kredi + o.santral) : null, B: o.B, T: o.T }; });
    var GG = SC_GEL.filter(function (g) { return kolon.some(function (c) { return c.gel[g]; }); }), GD = SC_GID.filter(function (g) { return kolon.some(function (c) { return c.git[g]; }); });
    var c = function (v, kl) { return '<td class="' + (kl || "") + (v < 0 ? " ng" : "") + '">' + BIN(v) + "</td>"; }, ilk = function (t, cl) { return '<td class="ilk ' + (cl || "") + '">' + t + "</td>"; };
    var tablo = '<div class="ntk"><table class="nt2 akis" style="min-width:' + (190 + kolon.length * (SC.gor === "ay" ? 70 : 96)) + 'px"><thead><tr><th class="ilk">bin $</th>' + kolon.map(function (k) { return "<th>" + k.ad + "</th>"; }).join("") + "</tr></thead><tbody>" +
      '<tr class="ana">' + ilk("Başlangıç kasası") + kolon.map(function (k) { return c(k.bas, "k"); }).join("") + "</tr>" +
      '<tr class="bas gel"><td class="ilk">▼ Gelecek</td><td colspan="' + kolon.length + '"></td></tr>' + GG.map(function (g) { return "<tr>" + ilk(esc(g === "GES geliri" ? "Santral kirası (KDV dahil)" : g), "alt") + kolon.map(function (k) { return c(k.gel[g] || 0); }).join("") + "</tr>"; }).join("") +
      '<tr class="top gel">' + ilk("Gelecek toplam") + kolon.map(function (k) { return c(k.gelT, "k"); }).join("") + "</tr>" +
      '<tr class="bas git"><td class="ilk">▲ Gidecek</td><td colspan="' + kolon.length + '"></td></tr>' + GD.map(function (g) { return "<tr>" + ilk(esc(g), "alt") + kolon.map(function (k) { return c(k.git[g] || 0); }).join("") + "</tr>"; }).join("") +
      '<tr class="top git">' + ilk("Gidecek toplam") + kolon.map(function (k) { return c(-k.gitT, "k"); }).join("") + "</tr>" +
      '<tr class="son">' + ilk("Dönem sonu (girişsiz)") + kolon.map(function (k) { return '<td><span class="pl ' + (k.son0 < tampon ? "kirmizi" : "yesil") + '">' + BIN(k.son0) + "</span></td>"; }).join("") + "</tr>" +
      '<tr class="ort">' + ilk("Ortak girişi (tampona tamamla)") + kolon.map(function (k) { return k.gir ? '<td class="k" style="color:var(--warn)">' + BIN(k.gir) + "<small>B " + BIN(k.B) + " · Bt " + BIN(k.T) + "</small></td>" : '<td class="bs">–</td>'; }).join("") + "</tr>" +
      '<tr class="ana">' + ilk("Dönem sonu kasası") + kolon.map(function (k) { return c(k.son, "k"); }).join("") + "</tr>" +
      (SC.gor === "yil" ? "<tr>" + ilk("Santral krediyi çeviriyor mu? <small>kira ÷ (kredi + santral gideri)</small>", "alt") + kolon.map(function (k) { return k.dscr == null ? '<td class="bs">–</td>' : '<td style="font-weight:700;color:' + (k.dscr >= 1.2 ? "#16a34a" : k.dscr >= 1 ? "#d97706" : "var(--bad)") + '">' + sayi(k.dscr, 2) + "×</td>"; }).join("") + "</tr>" : "") +
      "</tbody></table></div>";
    var sen3 = [["kotu", "Kötü", "üretim %" + sayi(S.kotu * 100) + ", varlık satışı yok", Rk], ["baz", "Baz", "ayarlardaki varsayımlar", Rb], ["iyi", "İyi", "üretim +%" + sayi(S.iyi * 100) + ", varlık satışları dahil", Ri]];
    var senKart = '<div class="card"><h3>Üç senaryo yan yana</h3><div class="ntk"><table class="nt2" style="min-width:560px"><thead><tr><th class="ilk"></th>' + sen3.map(function (x) { return "<th>" + x[1] + "<small>" + x[2] + "</small></th>"; }).join("") + "</tr></thead><tbody>" +
      "<tr>" + ilk("Toplam ortak girişi") + sen3.map(function (x) { return '<td class="k">' + sayi(x[3].top) + " $<small>B " + sayi(x[3].B) + " · Bt " + sayi(x[3].T) + "</small></td>"; }).join("") + "</tr>" +
      "<tr>" + ilk("En düşük kasa (girişsiz)") + sen3.map(function (x) { return '<td class="' + (x[3].enDg.v < 0 ? "ng" : "") + '">' + sayi(x[3].enDg.v) + " $<small>" + ayAd(x[3].enDg.a) + "</small></td>"; }).join("") + "</tr>" +
      "<tr>" + ilk("5 yıl sonu kasa (girişsiz)") + sen3.map(function (x) { return '<td class="' + (x[3].son < 0 ? "ng" : "") + '">' + sayi(x[3].son) + " $</td>"; }).join("") + "</tr>" +
      "<tr>" + ilk("5 yıl sonu kasa (girişlerle)") + sen3.map(function (x) { return "<td>" + sayi(x[3].son + x[3].top) + " $</td>"; }).join("") + "</tr>" +
      "</tbody></table></div><div class=\"not\"><small>Tablo ve grafik seçili senaryoyu gösterir. Erken kapama bu karşılaştırmaya dahil değil.</small></div></div>";
    // erken kapama
    var bankalar = {}; M.forEach(function (m) { if (m.durum !== "Gerçekleşti" && grupOf(m) === "Kredi ödemeleri" && m.karsiTaraf) bankalar[m.karsiTaraf] = true; });
    var erkKart = '<div class="card"><h3>Erken kapama denemesi</h3><div class="f"><div class="f2"><label>Kredi<select id="scEB"><option value="">— seçin —</option>' + sec(Object.keys(bankalar), S.erken.banka) + '</select></label><label>Kapama ayı<input type="month" id="scET" value="' + esc(S.erken.tarih || "") + '"></label></div></div>' +
      (Re ? '<div class="kv"><div><small>Kalan taksitler</small><b>' + sayi(Re.erkenT) + ' $</b></div><div><small>Kapama (kalan anapara)</small><b>' + sayi(Re.erkenOdeme) + ' $</b></div><div><small>Faiz tasarrufu</small><b style="color:#16a34a">' + sayi(Re.erkenTasarruf) + ' $</b></div><div><small>Ortak girişi (baz → erken)</small><b>' + sayi(Rb.top) + " → " + sayi(Re.top) + ' $</b></div><div><small>En düşük kasa (girişsiz)</small><b>' + sayi(Re.enDg.v) + " $</b><small>" + ayAd(Re.enDg.a) + "</small></div></div>" +
        (Re.erkenTasarruf < 1 ? '<div class="uyari" style="margin:0 14px 10px">Bu kredinin taksit açıklamalarında anapara ayrımı yok; kalan taksitlerin tamamı ödenmiş sayıldı, tasarruf hesaplanamadı.</div>' : "") : '<div class="not"><small>Bir kredi ve ay seçip "Kaydet ve hesapla"ya basın. Kapama tutarı taksit açıklamalarındaki anapara toplamıdır; parayı bir varlık satışından bekliyorsanız o satışı aynı ay ya da önceye koyun.</small></div>') +
      '<div style="padding:0 14px 12px"><button class="btn" id="scEK">Kaydet ve hesapla</button></div></div>';
    // çıkış senaryosu
    var C = S.cikis, cs = Rb.sat.filter(function (s) { return s.a === C.tarih; })[0], kalanKr = 0;
    M.forEach(function (m) { if (m.durum === "Gerçekleşti" || grupOf(m) !== "Kredi ödemeleri" || m.tarih.slice(0, 7) <= C.tarih) return; var an = scAnapara(m), u = usdKarsilik(+m.tutar || 0, m.pb || "TRY", KU);
      if (/faiz/i.test(m.kategori || "")) return; kalanKr += an != null ? an * u / (+m.tutar || 1) : u; });
    var arsaU = C.arsaDahil ? usdKarsilik(+C.arsa.tutar || 0, C.arsa.pb || "TRY", KU) : 0, kasaC = cs ? cs.son : 0, orhC = (+C.gesUsd || 0) * (+C.orhanPay || 0), netC = (+C.gesUsd || 0) + arsaU + kasaC - kalanKr - orhC;
    var cikKart = '<div class="card"><h3>Çıkış senaryosu · ' + ayAd(C.tarih) + "</h3>" + '<div class="ntk"><table class="nt2" style="min-width:420px"><tbody>' +
      [["Santral değeri", C.gesUsd], ["Uzunburun arsası" + (C.arsaDahil ? "" : " (dahil değil)"), arsaU], ["O ayın sonundaki kasa (girişsiz, baz)", kasaC], ["Kalan kredi anaparası", -kalanKr], ["Orhan Bey payı (santral değerinin %" + sayi(C.orhanPay * 100) + "'i)", -orhC]].map(function (r) { return "<tr>" + ilk(r[0]) + '<td class="' + (r[1] < 0 ? "ng" : "") + '">' + sayi(r[1]) + " $</td></tr>"; }).join("") +
      '<tr class="ana">' + ilk("Ortaklara kalan") + '<td class="k">' + sayi(netC) + " $</td></tr><tr>" + ilk("Burhan %60") + "<td>" + sayi(netC * 0.6) + " $</td></tr><tr>" + ilk("Batur %40") + "<td>" + sayi(netC * 0.4) + " $</td></tr></tbody></table></div>" +
      '<div class="not"><small>Vergi, komisyon ve ortak cari farkı hariç. Santral değeri ve arsa ayarlardan değiştirilebilir.</small></div></div>';
    // ayarlar
    var vSat = (D.V || []).filter(function (v) { return v.durum !== "Satıldı" && S.varlik[v.id]; });
    var ayar = '<details class="card" id="scAy"' + (SC.ayarAcik ? " open" : "") + '><summary><h3 style="display:inline">Senaryo ayarları</h3></summary><div class="f">' +
      '<div class="f2"><label>Personel azaltma ayı<input type="month" id="scKs" value="' + esc(S.kesinti) + '"></label><label>Sonraki sabit gider (TL/ay, bugünkü para)<input id="scSh" inputmode="decimal" value="' + S.sabitHedef + '"></label></div>' +
      '<div class="f2"><label>Yıllık enflasyon %<input id="scEn" inputmode="decimal" value="' + sayi(S.enf * 100, 1) + '"></label><label>Yıllık kur artışı % <small>(TL değer kaybı; şimdilik 0)</small><input id="scKr" inputmode="decimal" value="' + sayi(S.kurArtis * 100, 1) + '"></label></div>' +
      '<div class="f2"><label>Orhan Bey payı başlangıcı<input type="month" id="scOb" value="' + esc(S.orhanBas) + '"></label><label>Orhan Bey payı % (KDV hariç kira)<input id="scOo" inputmode="decimal" value="' + sayi(S.orhanOran * 100, 1) + '"></label></div>' +
      '<div class="f2"><label>Kurumlar vergisi %<input id="scKv" inputmode="decimal" value="' + sayi(S.kv * 100, 1) + '"></label><label>Yıllık amortisman ($) <small>vergi matrahından düşülür</small><input id="scAm" inputmode="decimal" value="' + S.amortUsd + '"></label></div>' +
      '<div class="f2"><label>Kötü senaryo üretim farkı %<input id="scKt" inputmode="decimal" value="' + sayi(S.kotu * 100, 1) + '"></label><label>İyi senaryo üretim farkı %<input id="scIy" inputmode="decimal" value="' + sayi(S.iyi * 100, 1) + '"></label></div>' +
      '<label class="nVd"><input type="checkbox" id="scKd"' + (S.kdvNet ? " checked" : "") + "> Kiradaki KDV'yi devlete ödenecek say (ertesi ay 26'sı)</label>" +
      "<h4 style=\"margin:10px 0 4px\">Varlık satış planı</h4>" + (vSat.length ? vSat.map(function (v) { var o = S.varlik[v.id]; return '<div class="f2 scV" data-vid="' + v.id + '" style="align-items:end"><label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" class="scVd"' + (o.dahil ? " checked" : "") + "> " + esc(v.ad) + '</label><label>Ay<input type="month" class="scVt" value="' + esc(o.tarih || "") + '"></label><label>Tutar (' + esc(PB_AD[o.pb] || o.pb) + ')<input class="scVu" inputmode="decimal" value="' + (o.tutar || 0) + '"></label></div>'; }).join("") : '<div class="bos">Satılabilir varlık yok.</div>') +
      '<h4 style="margin:10px 0 4px">Çıkış senaryosu</h4><div class="f2"><label>Satış ayı<input type="month" id="scCt" value="' + esc(C.tarih) + '"></label><label>Santral değeri ($)<input id="scCg" inputmode="decimal" value="' + C.gesUsd + '"></label></div>' +
      '<div class="f2"><label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="scCa"' + (C.arsaDahil ? " checked" : "") + "> Uzunburun arsası satışa dahil</label><label>Orhan Bey payı % (santral değeri)<input id=\"scCo\" inputmode=\"decimal\" value=\"" + sayi(C.orhanPay * 100, 1) + '"></label></div>' +
      '<button class="btn pri" id="scK">Kaydet ve yeniden hesapla</button></div></details>';
    var html = '<div class="izgara kpi4">' +
      kpi("el", Rg.top ? "#d97706" : "#16a34a", "Toplam ortak girişi (5 yıl)", sayi(Rg.top) + " $", Rg.top ? "Burhan " + sayi(Rg.B) + " · Batur " + sayi(Rg.T) + " $" : "gerekmiyor") +
      kpi("asagi", Rg.enDg.v < 0 ? "#dc2626" : "#0d9488", "En düşük kasa (girişsiz)", sayi(Rg.enDg.v) + " $", ayAd(Rg.enDg.a), Rg.enDg.v < 0) +
      kpi("kasa", "#2563eb", "5 yıl sonu kasa (girişsiz)", sayi(Rg.son) + " $", ayAd(Rg.aylar[Rg.aylar.length - 1]) + " sonu") +
      kpi("saat", "#7c3aed", "Krediler bitiyor", krSon ? ayAd(krSon[0]) : "—", krSon ? krSon[1] : "") + "</div>" +
      '<div class="card"><h3 style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">5 yıllık nakit akışı <span class="chips" style="padding:0;margin-left:auto">' + [["kotu", "Kötü"], ["baz", "Baz"], ["iyi", "İyi"]].map(function (x) { return '<button data-ss="' + x[0] + '" class="' + (SC.sen === x[0] ? "on" : "") + '">' + x[1] + "</button>"; }).join("") + "</span>" +
      '<span class="chips" style="padding:0">' + [["yil", "Yıllık"], ["ay", "Aylık"]].map(function (x) { return '<button data-sg="' + x[0] + '" class="' + (SC.gor === x[0] ? "on" : "") + '">' + x[1] + "</button>"; }).join("") + '</span><button class="btn sm" id="scPdf">PDF özet</button></h3>' +
      serit + '<div style="padding:10px 14px 4px">' + grafik + "</div>" + tablo +
      '<div class="not"><small>Tutarlar bin $. TL kalemler bugünkü kur ' + sayi(KU.usd, 2) + (S.kurArtis ? " + yılda %" + sayi(S.kurArtis * 100) + " kur artışı" : " (sabit)") + " ile çevrildi. Başlangıç = bugünkü kullanılabilir kasa. Krediler ve planlı ödemeler Gelecek/Gidecek kayıtlarından, santral kirası kira modelinden gelir. " + ayAd(S.kesinti) + "'ten itibaren sabit giderler yerine " + sayi(S.sabitHedef) + " TL/ay (yılda %" + sayi(S.enf * 100) + " enflasyon) kullanılır; reaktif bedel 2027'den itibaren sıfır (kompanzasyon). Tampon " + sayi(tampon) + " $: altına düşen ay ortak girişiyle tamamlanır (60/40 dengesine göre).</small></div></div>" +
      senKart + erkKart + cikKart + ayar;
    $("fm").innerHTML = html;
    Array.prototype.forEach.call(document.querySelectorAll("[data-ss]"), function (x) { x.onclick = function () { SC.sen = x.dataset.ss; fSenaryo(); }; });
    Array.prototype.forEach.call(document.querySelectorAll("[data-sg]"), function (x) { x.onclick = function () { SC.gor = x.dataset.sg; fSenaryo(); }; });
    var kaydet = function (S2) { var body = { anahtar: "senaryo5", deger: S2 };
      return (scK ? api("/api/collections/fin_ayarlar/records/" + scK.id, { method: "PATCH", body: { deger: S2 } }) : api("/api/collections/fin_ayarlar/records", { method: "POST", body: body })).then(function () { toast("Kaydedildi"); fSenaryo(); }).catch(hata); };
    var yuzde = function (id) { return num($(id).value) / 100; };
    $("scK").onclick = function () { var S2 = JSON.parse(JSON.stringify(S));
      S2.kesinti = $("scKs").value || S.kesinti; S2.sabitHedef = num($("scSh").value); S2.enf = yuzde("scEn"); S2.kurArtis = yuzde("scKr"); S2.orhanBas = $("scOb").value || S.orhanBas; S2.orhanOran = yuzde("scOo");
      S2.kv = yuzde("scKv"); S2.amortUsd = num($("scAm").value); S2.kotu = yuzde("scKt"); S2.iyi = yuzde("scIy"); S2.kdvNet = $("scKd").checked;
      Array.prototype.forEach.call(document.querySelectorAll(".scV"), function (r) { var o = S2.varlik[r.dataset.vid]; o.dahil = r.querySelector(".scVd").checked; o.tarih = r.querySelector(".scVt").value || o.tarih; o.tutar = num(r.querySelector(".scVu").value); });
      S2.cikis.tarih = $("scCt").value || C.tarih; S2.cikis.gesUsd = num($("scCg").value); S2.cikis.arsaDahil = $("scCa").checked; S2.cikis.orhanPay = yuzde("scCo");
      SC.ayarAcik = true; kaydet(S2); };
    $("scEK").onclick = function () { var S2 = JSON.parse(JSON.stringify(S)); S2.erken = { banka: $("scEB").value, tarih: $("scET").value || S.erken.tarih }; kaydet(S2); };
    $("scAy").ontoggle = function () { SC.ayarAcik = this.open; };
    $("scPdf").onclick = function () { scPdf(D, S, Rg, Y, sen3, tampon, KU, netC); };
  }).catch(hata);
}
function scPdf(D, S, Rg, Y, sen3, tampon, KU, netC) {
  var d = document.createElement("div"), K = function (v) { return sayi(v / 1000, Math.abs(v) < 10000 ? 1 : 0); };
  d.style.cssText = "position:absolute;left:-3000px;top:0;width:1000px;background:#fff;color:#0f172a;padding:34px 40px;font-family:inherit";
  var GG = SC_GEL.filter(function (g) { return Y.some(function (o) { return o.gel[g]; }); }), GD = SC_GID.filter(function (g) { return Y.some(function (o) { return o.git[g]; }); });
  var td = function (v, b) { return '<td style="text-align:right;padding:4px 8px;border-bottom:1px solid #e2e8f0;' + (b ? "font-weight:700;" : "") + (v < 0 ? "color:#b91c1c" : "") + '">' + K(v) + "</td>"; }, th = function (t, b) { return '<td style="padding:4px 8px;border-bottom:1px solid #e2e8f0;' + (b ? "font-weight:700" : "color:#334155") + '">' + t + "</td>"; };
  d.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #1d3557;padding-bottom:10px"><div><div style="font-size:13px;color:#64748b">D Solar A.Ş.</div><div style="font-size:26px;font-weight:800;color:#1d3557">5 yıllık nakit akışı senaryosu</div></div><div style="font-size:12px;color:#64748b;text-align:right">' + tarih(bugun()) + "<br>" + ({ baz: "Baz", kotu: "Kötü", iyi: "İyi" }[SC.sen]) + " senaryo · bin $</div></div>" +
    '<div style="display:flex;gap:12px;margin:16px 0">' + [["Toplam ortak girişi", sayi(Rg.top) + " $", "Burhan " + sayi(Rg.B) + " · Batur " + sayi(Rg.T)], ["En düşük kasa (girişsiz)", sayi(Rg.enDg.v) + " $", ayAd(Rg.enDg.a)], ["5 yıl sonu kasa (girişsiz)", sayi(Rg.son) + " $", ""], ["Çıkış (" + ayAd(S.cikis.tarih) + ") ortaklara", sayi(netC) + " $", "B %60 · Bt %40"]].map(function (x) { return '<div style="flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px"><div style="font-size:11px;color:#64748b">' + x[0] + '</div><div style="font-size:19px;font-weight:800">' + x[1] + '</div><div style="font-size:11px;color:#64748b">' + x[2] + "</div></div>"; }).join("") + "</div>" +
    '<table style="width:100%;border-collapse:collapse;font-size:12.5px"><tr style="background:#1d3557;color:#fff"><td style="padding:6px 8px">bin $</td>' + Y.map(function (o) { return '<td style="padding:6px 8px;text-align:right">' + o.y + "</td>"; }).join("") + "</tr>" +
    "<tr>" + th("Başlangıç kasası", 1) + Y.map(function (o) { return td(o.bas, 1); }).join("") + "</tr>" +
    GG.map(function (g) { return "<tr>" + th("+ " + (g === "GES geliri" ? "Santral kirası (KDV dahil)" : g)) + Y.map(function (o) { return td(o.gel[g] || 0); }).join("") + "</tr>"; }).join("") +
    GD.map(function (g) { return "<tr>" + th("− " + g) + Y.map(function (o) { return td(-(o.git[g] || 0)); }).join("") + "</tr>"; }).join("") +
    "<tr>" + th("Dönem sonu (girişsiz)", 1) + Y.map(function (o) { return td(o.son0, 1); }).join("") + "</tr>" +
    "<tr>" + th("Ortak girişi") + Y.map(function (o) { return td(o.gir); }).join("") + "</tr>" +
    "<tr>" + th("Dönem sonu kasası", 1) + Y.map(function (o) { return td(o.son, 1); }).join("") + "</tr>" +
    "<tr>" + th("Kira ÷ (kredi + santral gideri)") + Y.map(function (o) { var v = o.kredi + o.santral > 0 ? o.matrah / (o.kredi + o.santral) : null; return '<td style="text-align:right;padding:4px 8px">' + (v == null ? "–" : sayi(v, 2) + "×") + "</td>"; }).join("") + "</tr></table>" +
    '<div style="display:flex;gap:16px;margin-top:16px;font-size:12px"><div style="flex:1"><b>Senaryolar</b><table style="width:100%;border-collapse:collapse;margin-top:4px">' + sen3.map(function (x) { return "<tr>" + th(x[1] + " <small>(" + x[2] + ")</small>") + '<td style="text-align:right;padding:4px 8px;border-bottom:1px solid #e2e8f0">giriş ' + sayi(x[3].top) + " $ · dip " + sayi(x[3].enDg.v) + " $</td></tr>"; }).join("") + "</table></div>" +
    '<div style="flex:1"><b>Varsayımlar</b><ul style="margin:4px 0;padding-left:18px;color:#334155">' + ["Kur " + sayi(KU.usd, 2) + " TL/$" + (S.kurArtis ? ", yılda %" + sayi(S.kurArtis * 100) + " artış" : " (sabit)"), ayAd(S.kesinti) + "'ten itibaren sabit gider " + sayi(S.sabitHedef) + " TL/ay, yılda %" + sayi(S.enf * 100) + " enflasyon", "Santral kirası kira modelinden (tarife 2027'den yılda %20 artış), KDV ertesi ay devlete", "Kurumlar vergisi %" + sayi(S.kv * 100) + ", amortisman " + sayi(S.amortUsd) + " $/yıl", "Orhan Bey payı " + ayAd(S.orhanBas) + "'ten itibaren kiranın %" + sayi(S.orhanOran * 100) + "'i", "Tampon " + sayi(tampon) + " $; altı ortak girişiyle 60/40 tamamlanır"].map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div></div>";
  document.body.appendChild(d); toast("PDF hazırlanıyor…");
  sayfaPdf([d], "D Solar 5 yillik senaryo " + bugun()).then(function () { d.remove(); }).catch(function (e) { d.remove(); hata(e); });
}

location.hash="#finans/akis"; setTimeout(function(){fSenaryo();},1500); "ok"