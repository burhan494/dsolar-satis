/* v93 · D Solar — Final Premium Experience: Bugün (CEO kontrol merkezi) ve kişisel tercihler
   Hesap yapılmaz; değerler modüllerin kendi fonksiyonlarından gelir: Finans → fbVeri/fbHesap/fbProj, Satış → sbVeri/sbSozlesmeler/sbHedef/sbDonem, GES → ges_aylik (Bugün KPI ile aynı kural). */
(function () {
  var I = { fkGunes: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    fkZil: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>', fkYildiz: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    fkKaydir: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M3.5 8 5 6.5 3.5 5M3.5 19 5 17.5 3.5 16"/>', fkYukari: '<path d="M6 15l6-6 6 6"/>', fkCikis: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    fkKamera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', fkSohbet: '<path d="M4 5h16v11H9l-5 4z"/>' };
  Object.keys(I).forEach(function (k) { ICO[k] = I[k]; });
})();
var FK = { c: null, ct: 0, ac: {} };
function fkI(n, c) { return sbI(n, c); }
function fkE(s) { return esc(s == null ? "" : String(s)); }
/* ---------- kişisel tercihler: users.tercihler (cihazlar arası), yoksa yerel ---------- */
function fkT() { var t = (BEN && BEN.tercihler) || null; if (!t) { try { t = JSON.parse(localStorage.getItem("fkTercih") || "null"); } catch (e) {} } return t || {}; }
function fkTKaydet(f) {
  var t = JSON.parse(JSON.stringify(fkT())); f(t); BEN.tercihler = t;
  try { localStorage.setItem("fkTercih", JSON.stringify(t)); localStorage.setItem("dsBen", JSON.stringify(BEN)); } catch (e) {}
  return api("/api/collections/users/records/" + BEN.id, { method: "PATCH", body: { tercihler: t } }).catch(function () { return null; });
}
/* ---------- Bugün kartları: kritik olanlar gizlenemez ---------- */
var FK_KART = [["ajanda", "Bugünkü ajandam"], ["hafta", "Önümüzdeki 7 gün"], ["perf", "Şirket performansı"], ["ekip", "Ekibin bugünkü işleri"]];
function fkKartSira() { var t = fkT().bugun || {}, s = (t.sira || []).filter(function (k) { return FK_KART.some(function (x) { return x[0] === k; }); }); FK_KART.forEach(function (x) { if (s.indexOf(x[0]) < 0) s.push(x[0]); }); return { sira: s, gizli: t.gizli || [] }; }
/* ---------- veri: yalnız yetkili modüller, ortak önbelleklerle ---------- */
function fkVeri(zorla) {
  if (!zorla && FK.c && Date.now() - FK.ct < 30000) return Promise.resolve(FK.c);
  var b = bugun(), dun = gunSonra(-1), o = { b: b, hata: {} }, is = [];
  if (yt("fin")) is.push(fbVeri(zorla).then(function () { o.fin = true; }).catch(function () { o.hata.fin = 1; }));
  else if (finansci()) is.push(fbListe0("fin_hareketler", "onay != '' && durum != 'Gerçekleşti'", "tarih").then(function (L) { o.odL = L; }).catch(function () { o.hata.fin = 1; }));
  if (yt("musteri") || yt("teklif")) is.push(sbVeri(zorla).then(function (V) { o.sat = V; }).catch(function () { o.hata.sat = 1; }));
  if (yt("ges")) is.push(Promise.all([liste("ges_aylik", "donem = " + q(dun.slice(0, 7))), liste("ges_olaylar", "durum != 'Kapandı'", "-tarih").catch(function () { return []; })]).then(function (R) {
    var g = R[0][0] || {}, d = String(+dun.slice(8, 10)), ham = (g.iscGun || {})[d] != null ? (g.iscGun || {})[d] : (g.iscGun || {})[dun.slice(8, 10)], t = +((g.iscT || {})[d] || (g.iscT || {})[dun.slice(8, 10)] || 0);
    o.ges = { kwh: ham == null || ham === "" ? null : +ham, teorik: t, dun: dun, acik: R[1], ie: R[1].filter(function (x) { return x.ieNo; }) }; }).catch(function () { o.hata.ges = 1; }));
  if (yon() && yt("teklif")) is.push(topSay("teklifler", "durum = 'Onay bekliyor'").then(function (n) { o.tkOnay = n; }));
  if (yon()) is.push(topSay("odeme_listeleri", "durum = 'Onayda'").then(function (n) { o.olOnay = n; }));
  return Promise.all(is).then(function () { o.t = Date.now(); FK.c = o; FK.ct = Date.now(); return o; });
}
/* satış özeti: Satış Genel ile aynı tanım (gerçek satış = sözleşme, bu ay) */
function fkSatis(V) { var D = sbDonem("ay"), S = V.sat.filter(function (s) { return sbIcinde(s.tarih, D); }), H = sbHedef(V);
  var acik = V.A.filter(sbAcik).map(function (a) { return V.ST[a.id]; }).filter(function (t) { return t && t.durum === "Gönderildi"; });
  var sicak = V.q.filter(function (x) { return x.N.some(function (n) { return /Sıcak teklif|Saatli randevu|Yeni aday/.test(n[1]); }); });
  return { n: S.length, usd: S.reduce(function (t, s) { return t + (s.usd || 0); }, 0), hedef: H.aylik, varsayilan: H.varsayilan, oran: H.aylik ? S.length / H.aylik : 0, acik: acik.length, acikUsd: acik.reduce(function (t, x) { return t + (+x.fiyatUSD || 0); }, 0), sicak: sicak, D: D }; }
/* müdahale merkezi: yalnız gerçek kayıtlardan; puan = önem (açıklanabilir) */
function fkMudahale(o) {
  var L = [], b = o.b;
  if (o.fin) { FB_SIRKETLER.forEach(function (s) { var R = fbHesap(s), P = fbProj(R, gunSonra(30)); if (!R.H.length) return;
      if (P.eksi) L.push({ p: 100, sv: "kt", kat: "finans", ik: "sbUyari", t: s + " nakdi " + tarih(P.eksi) + " tarihinde eksiye düşüyor", d: "en düşük " + fbF(P.min.v, { pb: "USD" }) + " · 30 günlük plana göre", h: "#finans/akis", key: "nakit:eksi:" + s + ":" + P.eksi, neden: "eksi bakiye" });
      else if (P.alt) L.push({ p: 85, sv: "u", kat: "finans", ik: "fbKalkan", t: s + " nakit tamponunun altına iniyor · " + tarih(P.alt), d: "tampon açığı " + fbF(P.acik, { pb: "USD" }) + " · en düşük " + tarih(P.min.t), h: "#finans/akis", key: "nakit:tampon:" + s + ":" + P.alt, neden: "tampon altı" }); });
    var H = fbHesap("hep"), M = FB.v.M, ob = M.filter(function (m) { return m.onay === "Onay bekliyor" && m.durum !== "Gerçekleşti"; });
    if (ob.length && yon()) L.push({ p: 75, sv: "p", kat: "onay", ik: "fbOdeme", t: ob.length + " ödeme onayınızı bekliyor", d: fbF(ob.reduce(function (t, m) { return t + usdKarsilik(+m.tutar || 0, m.pb || "TRY", FB.v.KU); }, 0), { pb: "USD" }) + (o.olOnay ? " · " + o.olOnay + " liste" : ""), h: "#finans/odeme", key: "onay:odeme:" + ob.map(function (m) { return m.id; }).sort().join(","), neden: "onay" });
    var gc = H.AL.filter(function (a) { return a.gun > 7 || (a.gun > 0 && a.usd >= 5000); }).sort(function (x, y) { return y.usd - x.usd; });
    if (gc.length) L.push({ p: 60 + Math.min(15, gc.length * 3), sv: "u", kat: "finans", ik: "sbSaat", t: gc.length + " önemli tahsilat gecikti", d: fbF(gc.reduce(function (t, a) { return t + a.usd; }, 0), { pb: "USD" }) + " · en büyüğü " + fkE(gc[0].ad), h: "#finans/borc/gecikme", key: "tah:gec:" + gc.map(function (a) { return a.m ? a.m.id : a.ad; }).sort().join(","), neden: "7 günden eski ya da 5.000 $ üstü" });
    var s3 = gunSonra(3), yk = H.IT.filter(function (k) { return k.yon !== "Giriş" && k.t >= b && k.t <= s3 && k.st === "kes" && k.usd >= 10000; });
    if (yk.length) L.push({ p: 55, sv: "b", kat: "finans", ik: "fbKart", t: yk.length + " büyük ödeme 3 gün içinde", d: yk.slice(0, 2).map(function (k) { return fkE(k.ad) + " " + tarih(k.t).slice(0, 5); }).join(" · "), h: "#finans/akis", key: "yuk:" + yk.map(function (k) { return k.id || k.ad + k.t; }).join(","), neden: "kesin, 10.000 $ üstü" }); }
  else if (o.odL) { var oy = o.odL.filter(function (m) { return m.onay === "Onaylandı" && m.yon === "Çıkış"; }); if (oy.length) L.push({ p: 60, sv: "p", kat: "finans", ik: "fbOdeme", t: oy.length + " onaylı ödeme yapılmayı bekliyor", d: "Ödemeler ekranından 'Ödendi' işaretleyin", h: "#finans/odeme", key: "odeme:hazir:" + oy.map(function (m) { return m.id; }).join(","), neden: "onaylı" }); }
  if (o.tkOnay) L.push({ p: 72, sv: "p", kat: "onay", ik: "sbBelge", t: o.tkOnay + " teklif onayınızı bekliyor", d: "Teklifler · onay bekleyen", h: "#teklifler", key: "onay:teklif:" + o.tkOnay + ":" + b, neden: "onay" });
  if (o.ges) { var g = o.ges; if (g.kwh != null && g.teorik > 0 && g.kwh / g.teorik < 0.7) L.push({ p: 65, sv: "u", kat: "ges", ik: "fkGunes", t: "Dünkü GES üretimi teorik değerin %" + sayi(g.kwh / g.teorik * 100) + "'i", d: sayi(g.kwh / 1000, 1) + " MWh · beklenen " + sayi(g.teorik / 1000, 1) + " MWh", h: "#ges", key: "ges:dusuk:" + g.dun, neden: "%70 altı" });
    if (g.kwh == null) L.push({ p: 45, sv: "b", kat: "ges", ik: "fkGunes", t: "Dünkü GES üretim verisi gelmedi", d: tarih(g.dun), h: "#ges", key: "ges:veri:" + g.dun, neden: "veri yok" });
    if (g.ie.length) L.push({ p: 50 + Math.min(10, g.ie.length * 3), sv: g.ie.length > 2 ? "u" : "b", kat: "ges", ik: "sbKamyon", t: g.ie.length + " açık GES iş emri", d: fkE(g.ie[0].baslik), h: "#ges", key: "ges:ie:" + g.ie.map(function (x) { return x.id; }).sort().join(","), neden: "açık iş emri" }); }
  if (o.sat) { var V = o.sat, gec = V.A.filter(function (a) { return sbAcik(a) && a.sonraki && a.sonraki.slice(0, 10) < b && (!BEN.kendi || a.sorumlu === BEN.id); });
    if (gec.length >= 3) L.push({ p: 40 + Math.min(15, gec.length), sv: "u", kat: "satis", ik: "sbKisi", t: gec.length + " müşteri işi gecikti", d: "en eskisi " + gunFark(gec.map(function (a) { return a.sonraki.slice(0, 10); }).sort()[0], b) + " gün", h: "#adaylar", key: "sat:gec:" + b + ":" + gec.length, neden: "3 ve üstü" });
    var dol = V.T.filter(function (t) { if (t.durum !== "Gönderildi") return false; var s2 = t.gecerlilik ? String(t.gecerlilik).slice(0, 10) : tkGecSon(t); return s2 >= b && s2 <= gunSonra(2); });
    if (dol.length) L.push({ p: 42, sv: "b", kat: "satis", ik: "sbBelge", t: dol.length + " teklifin süresi 2 gün içinde doluyor", d: dol.slice(0, 2).map(function (t) { return fkE(((V.AM[t.aday] || {}).ad) || t.no); }).join(" · "), h: "#teklifler", key: "tk:dol:" + dol.map(function (t) { return t.id; }).join(","), neden: "süre" }); }
  return L.sort(function (x, y) { return y.p - x.p; });
}
function fkMudSat(x) { return '<a class="fkMs" href="' + x.h + '"><span class="fkIk fkIk-' + x.sv + '">' + fkI(x.ik) + '</span><span class="fkMsT"><b>' + x.t + "</b><small>" + x.d + "</small></span>" + fkI("sbSag", "s") + "</a>"; }
/* ajanda: bana atanmış açık görevler (Satış görevleri; ana görev = müşterinin sıradaki işi) */
function fkAjanda(o) {
  var V = o.sat; if (!V || !V.GV) return { bugun: [], gec: [], ekip: {} };
  var b = o.b, ben = function (g) { return (g.sorumlu || []).indexOf(BEN.id) >= 0; }, ac = V.GV.filter(function (g) { return g.durum === "Açık" && g.tarih; });
  var gec = ac.filter(function (g) { return ben(g) && g.tarih.slice(0, 10) < b; }).sort(function (x, y) { return x.tarih < y.tarih ? -1 : 1; });
  var bu = ac.filter(function (g) { return ben(g) && g.tarih.slice(0, 10) === b; }).sort(function (x, y) { return (x.saatli ? x.tarih : b + " 99") < (y.saatli ? y.tarih : b + " 99") ? -1 : 1; });
  var ekip = {}; if (yon() || yt("ekip")) ac.filter(function (g) { return g.tarih.slice(0, 10) === b; }).forEach(function (g) { (g.sorumlu || []).forEach(function (u) { if (u === BEN.id) return; (ekip[u] = ekip[u] || []).push(g); }); });
  return { bugun: bu, gec: gec, ekip: ekip, hafta: ac.filter(function (g) { return g.tarih.slice(0, 10) > b && g.tarih.slice(0, 10) <= gunSonra(7); }) };
}
function fkGorevSat(g, V, gec) {
  var a = g.aday ? V.AM[g.aday] : null, saat = g.saatli ? String(g.tarih).slice(11, 16) : "", tel = a && a.tel ? String(a.tel).replace(/[^\d+]/g, "") : "";
  return '<div class="fkGv' + (gec ? " gec" : "") + '" data-fkgv="' + g.id + '"><span class="fkGvS">' + (gec ? tarih(g.tarih.slice(0, 10)).slice(0, 5) : saat || "gün içi") + '</span><a class="fkGvA" href="' + (a ? "#aday/" + a.id : "#planlama") + '"><b>' + fkE(g.baslik) + "</b><small>" + fkE([g.tur, a ? a.ad : "", g.adres].filter(Boolean).join(" · ")) + "</small></a>" +
    '<span class="fkGvB">' + (tel ? '<a class="sbIb k" href="tel:' + fkE(tel) + '" aria-label="Ara">' + fkI("sbTel", "s") + "</a>" + sbWaBtn(a, "", "k") : "") + '<button class="sbIb k" data-fker="' + g.id + '" aria-label="Yarına ertele" title="Yarına ertele">' + fkI("sbSaat", "s") + '</button><button class="sbIb k fkOk" data-fktm="' + g.id + '" aria-label="Tamamla" title="Tamamla">' + fkI("sbOk", "s") + "</button></span></div>"; }
/* ---------- BUGÜN ---------- */
function sCeo() {
  var b = bugun(), saat = new Date().getHours(), selam = saat < 6 ? "İyi geceler" : saat < 12 ? "Günaydın" : saat < 18 ? "İyi günler" : "İyi akşamlar", gunAd = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"][new Date().getDay()];
  var m = $("m"); m.className = "genis sbM fkM"; document.body.classList.add("fkBugun");
  m.innerHTML = '<div class="fkBas"><div><h1>' + selam + ", " + fkE((BEN.name || "").split(" ")[0]) + "</h1><p>" + gunAd + ", " + tarih(b) + '</p></div></div><div class="fkIsk"><i></i><i></i><i></i></div>';
  fkVeri().then(function (o) {
    var mob = window.innerWidth < 1000, MU = fkMudahale(o), A = fkAjanda(o), SR = fkKartSira(), fin = o.fin ? fbHesap("hep") : null, P30 = fin ? fbProj(fin, gunSonra(30)) : null, sat = o.sat ? fkSatis(o.sat) : null;
    var bekle = MU.length + A.gec.length + A.bugun.length;
    var ozet = []; if (fin) ozet.push("Nakit " + fbK(fin.kul, { pb: "USD" }).replace(/<[^>]+>/g, "")); if (MU[0] && MU[0].p >= 80) ozet.push(MU[0].t); if (A.bugun.length) ozet.push(A.bugun.length + " görüşme/iş");
    var bas = '<div class="fkBas"><div><h1>' + selam + ", " + fkE((BEN.name || "").split(" ")[0]) + "</h1><p>" + gunAd + ", " + tarih(b) + (bekle ? ' · <b>' + bekle + " önemli iş</b>" : " · bekleyen önemli iş yok") + "</p>" + (ozet.length > 1 ? '<p class="fkOz">' + fkE(ozet.join(" · ")) + "</p>" : "") + '</div><button class="sbIb fkDz" id="fkDz" aria-label="Bugün ekranını düzenle" title="Kartları düzenle">' + fkI("fkKaydir") + "</button></div>";
    // yönetici KPI kartı
    var kp = [];
    if (yt("fin")) kp.push(o.hata.fin ? fkKpiH("Kullanılabilir nakit") : '<a class="fkK1" href="#finans/genel"><small>Kullanılabilir nakit</small><b>' + fbF(fin.kul, { pb: "USD" }) + "</b><span>D Solar " + fbK(fbHesap("D Solar").kul, { pb: "USD" }) + " · DRK " + fbK(fbHesap("DRK").kul, { pb: "USD" }) + "</span></a>");
    if (yt("ges")) kp.push(o.hata.ges ? fkKpiH("Dünkü GES üretimi") : '<a class="fkK1" href="#ges"><small>Dünkü GES üretimi</small><b>' + (o.ges.kwh == null ? '<i class="fkYok">veri yok</i>' : sayi(o.ges.kwh / 1000, 1) + " <u>MWh</u>") + "</b><span>" + (o.ges.kwh != null && o.ges.teorik ? "teoriğin %" + sayi(o.ges.kwh / o.ges.teorik * 100) + "'i · " : "") + tarih(o.ges.dun).slice(0, 5) + "</span></a>");
    if (sat && yt("teklif")) kp.push('<a class="fkK1" href="#satis"><small>' + AY_AD_SB[+b.slice(5, 7) - 1] + " satışı</small><b>" + fkUsd(sat.usd) + "</b><span>" + sat.n + " sözleşme · " + sat.acik + " açık teklif</span></a>",
      '<a class="fkK1" href="#hedefler"><small>Satış hedefi</small><b>%' + sayi(sat.oran * 100) + '</b><span class="fkHd"><i style="width:' + Math.min(100, sat.oran * 100).toFixed(0) + '%"></i></span><span>' + sat.n + " / " + sat.hedef + (sat.varsayilan ? " (varsayılan hedef)" : "") + "</span></a>");
    var kritik = MU.filter(function (x) { return x.sv === "kt" || (x.kat === "finans" && x.p >= 85); })[0];
    var kpi = kp.length ? '<div class="sbPan fkPan"><div class="fkKg fkKg' + kp.length + '">' + kp.join("") + "</div>" + (kritik ? '<a class="fkKr fkKr-' + kritik.sv + '" href="' + kritik.h + '">' + fkI("sbUyari", "s") + "<span>" + kritik.t + "</span>" + fkI("sbSag", "xs") + "</a>" : "") + "</div>" : "";
    var mud = '<section class="fkKart fkMud"><div class="fkKh"><h2>Müdahale merkezi</h2>' + (MU.length ? '<i class="sbCh kt">' + MU.length + "</i>" : "") + (MU.length > 5 ? '<button class="fkKl" id="fkMudT">Tümü' + fkI("sbSag", "xs") + "</button>" : "") + "</div>" +
      (MU.length ? MU.slice(0, 5).map(fkMudSat).join("") + '<p class="fkNot">Sıra: eksi nakit → tampon altı → onaylar → GES üretimi → geciken tahsilat → yaklaşan büyük ödeme → satış takipleri</p>' : '<div class="fkBos">' + fkI("sbOk") + "<b>Kararınızı bekleyen konu yok</b><small>Nakit, onaylar, GES ve tahsilatlar normal.</small></div>") + "</section>";
    var V = o.sat;
    var KART = {
      ajanda: V && V.GV ? '<section class="fkKart"><div class="fkKh"><h2>Bugünkü ajandam</h2><i class="sbCh">' + A.bugun.length + '</i><a class="fkKl" href="#planlama">Planlama' + fkI("sbSag", "xs") + "</a></div>" +
        (A.gec.length ? '<div class="fkGr gec">Geciken ' + A.gec.length + "</div>" + A.gec.slice(0, 4).map(function (g) { return fkGorevSat(g, V, true); }).join("") + (A.gec.length > 4 ? '<a class="fkDaha" href="#planlama">+' + (A.gec.length - 4) + " geciken iş</a>" : "") : "") +
        (A.bugun.length ? (A.gec.length ? '<div class="fkGr">Bugün</div>' : "") + A.bugun.map(function (g) { return fkGorevSat(g, V, false); }).join("") : '<p class="fkBosK">Bugün için size atanmış iş yok.</p>') + "</section>" : "",
      hafta: fkHafta(o, A),
      perf: fkPerf(o, sat, fin, P30),
      ekip: Object.keys(A.ekip).length ? '<section class="fkKart"><div class="fkKh"><h2>Ekibin bugünkü işleri</h2></div>' + Object.keys(A.ekip).map(function (u) { var us = V.UM[u] || {}, L = A.ekip[u];
        return '<a class="fkEk" href="#planlama"><span class="fkAv">' + fkE((us.name || "?").slice(0, 1)) + '</span><span class="fkMsT"><b>' + fkE(us.name || "Ekip") + "</b><small>" + L.slice(0, 3).map(function (g) { return fkE((g.saatli ? String(g.tarih).slice(11, 16) + " " : "") + g.baslik); }).join(" · ") + '</small></span><i class="sbCh">' + L.length + "</i></a>"; }).join("") + "</section>" : "" };
    var kartlar = SR.sira.filter(function (k) { return SR.gizli.indexOf(k) < 0 && KART[k]; }).map(function (k) { return KART[k]; });
    var guncel = '<p class="fkGun">Güncellendi ' + new Date(o.t).toTimeString().slice(0, 5) + (Object.keys(o.hata).length ? ' · <b class="fbKt">bazı bölümler yüklenemedi, eski veri gösterilmiyor</b>' : "") + ' · <button class="fkLnk" id="fkYen">Yenile</button></p>';
    m.innerHTML = bas + '<div class="fkIz"><div class="fkSol">' + kpi + mud + (mob ? kartlar.join("") : kartlar.filter(function (_, i) { return i % 2 === 0; }).join("")) + "</div>" + (mob ? "" : '<div class="fkSag">' + kartlar.filter(function (_, i) { return i % 2 === 1; }).join("") + "</div>") + "</div>" + guncel;
    $("fkYen").onclick = function () { FK.c = null; if (FB) FB.v = null; SB.c = null; sCeo(); };
    $("fkDz").onclick = fkDuzenle; if ($("fkMudT")) $("fkMudT").onclick = function () { fkBildirimAc(); };
    bagT("[data-fktm]", function (e) { var g = V.GV.filter(function (x) { return x.id === e.dataset.fktm; })[0]; if (!g) return; e.disabled = true;
      sbGorevTamam(g, function () { FK.c = null; SB.c = null; sCeo(); }); });
    bagT("[data-fker]", function (e) { var g = V.GV.filter(function (x) { return x.id === e.dataset.fker; })[0]; if (!g) return; e.disabled = true;
      var t = gunSonra(1) + (g.saatli ? String(g.tarih).slice(10) : " 09:00:00.000Z");
      api("/api/collections/gorevler/records/" + g.id, { method: "PATCH", body: { tarih: t } }).then(function () { toast("Yarına ertelendi"); FK.c = null; SB.c = null; sCeo(); }).catch(function (x) { e.disabled = false; hata(x); }); });
    fkBildirimSay(o);
  }).catch(function (e) { m.innerHTML = '<div class="fkBos">' + fkI("sbUyari") + "<b>Bugün ekranı yüklenemedi</b><small>" + fkE(e.message || "") + '</small><button class="sbBtn" onclick="sCeo()">Tekrar dene</button></div>'; });
}
function fkKpiH(ad) { return '<div class="fkK1"><small>' + ad + '</small><b>—</b><span>yüklenemedi</span></div>'; }
function fkUsd(v) { return sayi(v) + " <u>$</u>"; }
function fkHafta(o, A) {
  var b = o.b, G = []; for (var i = 1; i <= 7; i++) G.push(gunSonra(i));
  var X = {}; G.forEach(function (d) { X[d] = { gv: [], gir: 0, cik: 0, onem: [] }; });
  (A.hafta || []).forEach(function (g) { var d = g.tarih.slice(0, 10); if (X[d]) X[d].gv.push(g); });
  if (o.fin) fbHesap("hep").IT.forEach(function (k) { if (!X[k.t] || k.st === "gec") return; if (k.yon === "Giriş") X[k.t].gir += k.usd; else X[k.t].cik += k.usd; if (k.st === "kes" && k.usd >= 10000) X[k.t].onem.push(k); });
  var dolu = G.filter(function (d) { var x = X[d]; return x.gv.length || x.gir > 0.5 || x.cik > 0.5; });
  if (!dolu.length) return '<section class="fkKart fkKartK"><div class="fkKh"><h2>Önümüzdeki 7 gün</h2><small class="fkKs">planlı kayıt yok</small></div></section>';
  return '<section class="fkKart"><div class="fkKh"><h2>Önümüzdeki 7 gün</h2></div><div class="fkHf">' + dolu.map(function (d) { var x = X[d], gn = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][new Date(d + "T12:00:00").getDay()];
    return '<div class="fkHg"><span class="fkHgT"><b>' + gn + "</b>" + tarih(d).slice(0, 5) + '</span><span class="fkHgI">' + (x.gv.length ? '<a href="#planlama" class="sbCh">' + fkI("sbTakvim", "xs") + x.gv.length + " görüşme/iş</a>" : "") +
      (x.gir > 0.5 ? '<a href="#finans/akis/giris" class="sbCh ok">+' + fbK(x.gir, { pb: "USD" }).replace(/<[^>]+>/g, "") + "</a>" : "") + (x.cik > 0.5 ? '<a href="#finans/akis/cikis" class="sbCh kt">−' + fbK(x.cik, { pb: "USD" }).replace(/<[^>]+>/g, "") + "</a>" : "") +
      x.onem.slice(0, 2).map(function (k) { return '<span class="sbCh u">' + fkE(k.ad.split(" · ")[0]).slice(0, 26) + "</span>"; }).join("") + "</span></div>"; }).join("") + "</div></section>";
}
function fkPerf(o, sat, fin, P) {
  var K = [];
  if (sat) K.push('<a class="fkPf" href="#satis"><span class="fkPfB" style="--c:#7c3aed">' + fkI("sbGrid", "s") + 'Satış</span><div class="sbKv"><span>Bu ay</span><b>' + sat.n + " / " + sat.hedef + '</b></div><div class="sbKv"><span>Açık teklif</span><b>' + sat.acik + " · " + sayi(sat.acikUsd) + ' $</b></div><div class="sbKv"><span>Sıcak fırsat</span><b>' + sat.sicak.length + "</b></div></a>");
  if (fin) { var gec = fin.AL.filter(function (a) { return a.gun > 0; }).length;
    K.push('<a class="fkPf" href="#finans/genel"><span class="fkPfB" style="--c:#059669">' + fkI("fbCuzdan", "s") + 'Finans</span><div class="sbKv"><span>Ödeme · 30 gün</span><b>' + fbK(P.T.cik, { pb: "USD" }) + '</b></div><div class="sbKv"><span>Tahsilat · 30 gün</span><b>' + fbK(P.T.gir, { pb: "USD" }) + '</b></div><div class="sbKv"><span>Nakit riski</span><b class="' + (P.eksi ? "fbKt" : P.alt ? "fbUy" : "fbGir") + '">' + (P.eksi ? "eksi · " + tarih(P.eksi).slice(0, 5) : P.alt ? "tampon altı · " + tarih(P.alt).slice(0, 5) : "yok") + "</b></div>" + (gec ? '<div class="sbKv"><span>Geciken tahsilat</span><b class="fbUy">' + gec + "</b></div>" : "") + "</a>"); }
  if (o.ges) { var g = o.ges, gI = fin ? fin.IT.filter(function (k) { return k.ges || /kira geliri|ges/i.test((k.m && k.m.kategori) || ""); }) : [], gk = gI.filter(function (k) { return k.yon === "Giriş" && k.st === "kes"; }).reduce(function (t, k) { return t + k.usd; }, 0), gt = gI.filter(function (k) { return k.yon === "Giriş" && k.st !== "kes"; }).reduce(function (t, k) { return t + k.usd; }, 0);
    K.push('<a class="fkPf" href="#ges"><span class="fkPfB" style="--c:#f59e0b">' + fkI("fkGunes", "s") + 'GES</span><div class="sbKv"><span>Dün</span><b>' + (g.kwh == null ? "veri yok" : sayi(g.kwh / 1000, 1) + " MWh" + (g.teorik ? " · %" + sayi(g.kwh / g.teorik * 100) : "")) + '</b></div><div class="sbKv"><span>Açık iş emri</span><b class="' + (g.ie.length ? "fbUy" : "") + '">' + g.ie.length + "</b></div>" +
      (fin ? '<div class="sbKv"><span>Gelir · kesin / beklenen</span><b>' + fbK(gk, { pb: "USD" }) + " / " + fbK(gt, { pb: "USD" }) + "</b></div>" : "") + "</a>"); }
  return K.length ? '<section class="fkKart"><div class="fkKh"><h2>Şirket performansı</h2></div><div class="fkPfG">' + K.join("") + "</div></section>" : "";
}
/* kartları sırala / gizle (kritik KPI ve müdahale merkezi gizlenemez) */
function fkDuzenle() {
  var S = fkKartSira(), ciz = function () { return S.sira.map(function (k, i) { var ad = FK_KART.filter(function (x) { return x[0] === k; })[0][1], giz = S.gizli.indexOf(k) >= 0;
    return '<div class="fkDzS"><span>' + ad + '</span><button class="sbIb k" data-fkdy="' + i + '" aria-label="Yukarı"' + (i ? "" : " disabled") + ">" + fkI("fkYukari", "s") + '</button><button class="fkTg' + (giz ? "" : " on") + '" data-fkdg="' + k + '" aria-pressed="' + !giz + '"><i></i>' + (giz ? "Gizli" : "Açık") + "</button></div>"; }).join(""); };
  var k = panelAc('<div class="fkPnB"><b>Bugün ekranını düzenle</b><small>Kullanılabilir nakit, kritik uyarılar ve müdahale merkezi her zaman görünür</small></div><div id="fkDzL">' + ciz() + '</div><button class="sbBtn pri fkTam" id="fkDzK">Kaydet</button>', "alt fkPnl");
  var bag = function () { bagT("[data-fkdy]", function (e) { var i = +e.dataset.fkdy, x = S.sira.splice(i, 1)[0]; S.sira.splice(i - 1, 0, x); $("fkDzL").innerHTML = ciz(); bag(); });
    bagT("[data-fkdg]", function (e) { var x = e.dataset.fkdg, i = S.gizli.indexOf(x); if (i >= 0) S.gizli.splice(i, 1); else S.gizli.push(x); $("fkDzL").innerHTML = ciz(); bag(); }); }; bag();
  $("fkDzK").onclick = function () { fkTKaydet(function (t) { t.bugun = { sira: S.sira, gizli: S.gizli }; }).then(function () { panelKapat(); toast("Bugün ekranı kaydedildi · bütün cihazlarınızda geçerli"); sCeo(); }); };
}
/* yönlendirme: #bugun yeni CEO ekranı; Satış B+ yönlendirmesi (satis, hedefler, planlama, sdiger) aynen korunur */
(function () { var b0 = sBugun; sBugun = function () { var s = (location.hash.replace(/^#/, "").split("/")[0]) || ""; if ((s === "" || s === "bugun") && rol() !== "ortak") return sCeo(); document.body.classList.remove("fkBugun"); return b0.apply(this, arguments); }; })();
window.addEventListener("hashchange", function () { var s = (location.hash.replace(/^#/, "").split("/")[0]) || ""; if (s && s !== "bugun") document.body.classList.remove("fkBugun"); });
