/* v92 · Finans B+ Premium — yönlendirme, Finans Genel, Mali durum ve yatırımlar */
function sFinans(alt) {
  if (!finansci()) { location.hash = "#bugun"; return; }
  var h = location.hash.replace(/^#/, "").split("/"); alt = h[1] || alt || ""; var alt2 = h[2] || "";
  if (!alt) alt = yt("fin") ? "genel" : "odeme";
  if (!yt("fin") && alt !== "odeme") alt = "odeme";
  if ((alt === "ortak" || alt === "varlik" || alt === "personel" || alt === "senaryo") && !yt("ortak")) alt = yt("fin") ? "genel" : "odeme";
  if (alt === "ozet") alt = "genel"; if (alt !== "odeme") { OD.liste = ""; OD.yeni = null; }
  FB.aktif = true; FB.alt = alt; FB.alt2 = alt2; if (BEN.y_sirket) FB.s = BEN.y_sirket;
  var m = $("m"); m.classList.add("genis", "sbM", "fbM"); fbNav(alt);
  m.innerHTML = '<div id="fbUst"></div><div id="fm"><div class="sbBos">' + fbI("fbCuzdan") + "<b>Yükleniyor…</b></div></div>";
  if (HIZLI.fin && alt === "plan") { FP.ekle = true; }
  var YENI = { genel: fbGenel, mali: fbMali, kasa: fbHesaplar, akis: fbAkis, borc: fbBorc, diger: fbDiger, ayar: fbAyar, gecmis: fbGecmisE, odeme: fbOdeme };
  var ESKI = { nakit: fNakit, plan: fPlan, senaryo: fSenaryo, hareket: fHareket, hesap: fHesap, kredi: fKredi, cek: fCek, sabit: fSabit, soru: fSoru, ortak: fOrtak, varlik: fVarlik, personel: fPersonel, rapor: fRapor };
  prsSabitHazirla().then(function () {
    if (YENI[alt]) return YENI[alt](alt2);
    fbEskiUst(alt); (ESKI[alt] || fbGenel)(); fbGizUygula();
  });
  if (HIZLI.fin) { var hz = HIZLI.fin; HIZLI.fin = ""; var n = 0, iv = setInterval(function () { var s = $("pT"); if (++n > 40) clearInterval(iv); if (!s) return; clearInterval(iv);
    s.value = hz === "tahsilat" ? "Cari alacak (müşteri)" : "Cari ödeme (tedarikçi)"; s.dispatchEvent(new Event("change")); s.closest("details").open = true; s.scrollIntoView({ behavior: "smooth", block: "center" }); }, 150); }
}
/* eski (korunan) alt sayfaların üstüne B+ başlık, şirket seçici ve bölüm sekmeleri */
var FB_ESKI_AD = { nakit: ["Nakit akışı", "6 ve 12 aylık görünüm · ortak girişi ve karar paneli"], plan: ["Gelecek / Gidecek", "Planlanan tahsilat ve ödemeler"], senaryo: ["5 yıllık senaryo", "Kötü · baz · iyi · varsayımlar gerçek kayıtları değiştirmez"],
  hareket: ["Hesap hareketleri", "Gerçekleşen ve planlanan bütün kayıtlar"], hesap: ["Hesap yönetimi", "Hesap ekle, kapat, kasa tablosundan yeniden kur"], kredi: ["Krediler, kartlar, limit ve teminat", "Mevcut kredi formülleri korunur"],
  cek: ["Çekler", "Verilen ve alınan çekler"], sabit: ["Sabit giderler", "Her ay nakit akışına otomatik düşer"], soru: ["Finans soruları", "Finans ekibiyle soru-cevap"], ortak: ["Ortak cari hesapları", "Ortak hareketleri ve sermaye dengesi (60/40)"],
  varlik: ["Varlıklar", "Şirket ve ortak varlıkları, satış durumu"], personel: ["Personel", "Kartlar, kıdem/ihbar/izin, işten çıkış"], rapor: ["Finansal raporlar", "Nakit raporu ve kontroller · gelir tablosu değildir"] };
function fbEskiUst(alt) {
  var g = FB_GRUP[alt], a = FB_ESKI_AD[alt] || ["Finans", ""], sek = "";
  if (g === "akis") sek = fbAltNav([["akis", "Kısa vade"], ["nakit", "6–12 ay"], ["plan", "Plan"]].concat(yt("ortak") ? [["senaryo", "5 yıl"]] : []), alt);
  if (g === "borc") sek = fbAltNav([["borc", "Bakış"], ["kredi", "Krediler"], ["cek", "Çekler"]], alt);
  if (g === "kasa") sek = fbAltNav([["kasa", "Hesaplar"], ["hareket", "Hareketler"], ["hesap", "Yönetim"]], alt);
  var geri = g === "diger" ? "#finans/diger" : "";
  $("fbUst").innerHTML = fbBaslik(a[0], fbEsc(a[1]), "", geri) + '<div class="fbSecS">' + fbSecici({ pb: false }) + (alt === "plan" || alt === "sabit" || alt === "cek" || alt === "hareket" ? fbYeniNot() : "") + "</div>" + sek +
    (FB.s !== "hep" ? "" : alt === "rapor" ? '<div class="sbUy"><span>Birlikte görünüm: iki şirketin kayıtları birlikte. Şirketler arası transferler (bağlı iki bacak) nakit raporunda birbirini götürür.</span></div>' : "");
  fbSeciciBagla(function () { sFinans(alt); }); fbVeri();
}
/* ---------- grafik: gün bazlı nakit çizgisi, tampon çizgisi, en düşük nokta ---------- */
function fbGrafik(P, W, H, koyu, gun) {
  var S = P.seri.slice(), b = FB.v.b; if (S[S.length - 1].t < P.bitis) S.push({ t: P.bitis, v: S[S.length - 1].v });
  var d = function (t) { return Math.max(0, gunFark(b, t)); }, top = Math.max(1, d(P.bitis)), vs = S.map(function (x) { return x.v; }).concat([P.tampon || 0, 0]);
  var mx = Math.max.apply(null, vs), mn = Math.min.apply(null, vs), pd = (mx - mn) * 0.12 || 1; mx += pd; mn -= pd;
  var x = function (t) { return 8 + d(t) / top * (W - 16); }, y = function (v) { return 10 + (mx - v) / (mx - mn) * (H - 34); };
  var p = "M" + x(S[0].t).toFixed(1) + " " + y(S[0].v).toFixed(1); for (var i = 1; i < S.length; i++) p += " H" + x(S[i].t).toFixed(1) + " V" + y(S[i].v).toFixed(1);
  var c = koyu ? "#9fb0c4" : "#64748b", cz = koyu ? "#34d399" : "#059669", ad = koyu ? "rgba(16,185,129,.16)" : "rgba(5,150,105,.10)";
  var s = '<svg class="fbGr" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Nakit projeksiyonu">' +
    (mn < 0 ? '<line x1="8" x2="' + (W - 8) + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '" stroke="' + (koyu ? "rgba(252,165,165,.6)" : "#fca5a5") + '"/>' : "") +
    (P.tampon ? '<line x1="8" x2="' + (W - 8) + '" y1="' + y(P.tampon).toFixed(1) + '" y2="' + y(P.tampon).toFixed(1) + '" stroke="' + (koyu ? "rgba(255,255,255,.38)" : "#cbd5e1") + '" stroke-dasharray="4 4"/><text x="' + (W - 8) + '" y="' + (y(P.tampon) + 12).toFixed(1) + '" fill="' + c + '" font-size="10" text-anchor="end">tampon ' + fbK(P.tampon).replace(/<[^>]+>/g, "") + "</text>" : "") +
    '<path d="' + p + " V" + (H - 24) + " H" + x(S[0].t).toFixed(1) + 'Z" fill="' + ad + '"/><path d="' + p + '" fill="none" stroke="' + cz + '" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<circle cx="' + x(P.min.t).toFixed(1) + '" cy="' + y(P.min.v).toFixed(1) + '" r="4.5" fill="#ed7d31" stroke="#fff" stroke-width="2"/>' +
    '<text x="' + Math.min(W - 70, Math.max(70, x(P.min.t))).toFixed(1) + '" y="' + Math.max(12, y(P.min.v) - 9).toFixed(1) + '" fill="' + (koyu ? "#fdba74" : "#c2410c") + '" font-size="10.5" font-weight="700" text-anchor="middle" stroke="' + (koyu ? "#1d3557" : "#fff") + '" stroke-width="3" paint-order="stroke">en düşük ' + fbK(P.min.v).replace(/<[^>]+>/g, "") + " · " + tarih(P.min.t).slice(0, 5) + "</text>" +
    '<text x="8" y="' + (H - 6) + '" fill="' + c + '" font-size="10">bugün</text><text x="' + (W / 2) + '" y="' + (H - 6) + '" fill="' + c + '" font-size="10" text-anchor="middle">' + tarih(gunSonra(Math.round(top / 2))).slice(0, 5) + '</text><text x="' + (W - 8) + '" y="' + (H - 6) + '" fill="' + c + '" font-size="10" text-anchor="end">' + tarih(P.bitis).slice(0, 5) + "</text></svg>";
  return s;
}
function fbKpi(ik, ad, deger, alt, h, cls) { return '<a class="sbKpi fbKpi' + (cls ? " " + cls : "") + '" href="' + h + '"><span class="sbKpT">' + fbI(ik) + ad + '</span><span class="sbKpV">' + deger + '</span><span class="sbKpD">' + alt + '</span><span class="sbKpO">' + fbI("sbSag", "s") + "</span></a>"; }
function fbStEt(st) { return '<i class="fbSt fbSt-' + st + '">' + { ger: "Gerçekleşti", kes: "Kesin", pla: "Planlı", tah: "Tahmini", gec: "Gecikmiş", bel: "Tarihsiz" }[st] + "</i>"; }
function fbHarSat(k) { var g = k.yon === "Giriş"; return '<div class="sbKv fbHs"><span><b class="fbHsA">' + fbEsc(k.ad) + '</b><small>' + tarih(k.t) + " · " + fbStEt(k.st) + (k.pb && k.pb !== "USD" ? " · " + fbOrj(k.tutar, k.pb) : "") + '</small></span><b class="' + (g ? "fbGir" : "fbCik") + '">' + fbF((g ? 1 : -1) * k.usd, { isaret: true }) + "</b></div>"; }
/* ---------- FİNANS GENEL ---------- */
function fbGenel() {
  fbVeri().then(function () {
    var R = fbHesap(FB.s), V = FB.v, b = V.b, s30 = gunSonra(30), P = fbProj(R, s30), RS = fbRiskler(s30), mob = window.innerWidth < 1000;
    var kr = RS.filter(function (x) { return x.sv === "kt" || x.sv === "u"; })[0];
    var dag = FB.s === "hep" ? FB_SIRKETLER.map(function (s) { var r = fbHesap(s); return "<div><b>" + fbF(r.kul) + "</b><span>" + s + (s === "DRK" ? " · ayrı şirket" : "") + "</span></div>"; }).join("")
      : ["TRY", "USD", "EUR"].filter(function (p) { return R.pbD[p]; }).map(function (p) { return "<div><b>" + fbOrj(R.pbD[p], p) + "</b><span>" + PB_AD[p] + " hesapları</span></div>"; }).join("");
    var pan = '<div class="sbPan fbPan"><div class="fbPanU"><div class="fbPanA"><div class="fbLb">Kullanılabilir nakit · ' + fbSirketAd(FB.s) + '</div><div class="fbBig">' + fbF(R.kul) + "</div>" +
      (R.vadeli ? '<div class="fbPanS">vadeli ' + fbF(R.vadeli) + " ayrı" + (R.kmh ? " · KMH kullanımı " + fbF(R.kmh) + " düşüldü" : "") + "</div>" : R.kmh ? '<div class="fbPanS">KMH kullanımı ' + fbF(R.kmh) + " düşüldü</div>" : "") + "</div></div>" +
      '<div class="fbKy fbKy2">' + dag + "</div>" + fbGrafik(P, mob ? 340 : 640, mob ? 118 : 150, true) +
      '<div class="fbKy fbKy2"><div><b>' + fbF(P.son) + "</b><span>30 gün sonra · " + tarih(s30).slice(0, 5) + '</span></div><div><b class="' + (P.eksi ? "fbKt" : P.alt ? "fbUy" : "") + '">' + fbF(P.min.v) + "</b><span>en düşük · " + tarih(P.min.t) + "</span></div></div></div>";
    var gc = R.AL.filter(function (a) { return a.gun > 0; }), gcT = gc.reduce(function (t, a) { return t + a.usd; }, 0);
    var ob = V.M.filter(function (m) { return m.onay === "Onay bekliyor" && m.durum !== "Gerçekleşti" && (FB.s === "hep" || m.sirket === FB.s); });
    var kp = '<div class="sbKp fbKp">' + fbKpi("fbAsagiOk", "Kesin alacak", fbK(R.kesA), "sözleşme, çek, faturalı kira · planlı " + fbK(R.plaA), "#finans/borc/alacak") +
      fbKpi("fbYukariOk", "Toplam borç", fbK(R.borcTop), "kredi " + fbK(R.BG.kredi) + " · diğer " + fbK(R.borcTop - R.BG.kredi), "#finans/borc/borc") +
      fbKpi("sbNakit", "Tahsilat · 30 gün", fbK(P.T.gir), (P.T.tah ? "tahmini " + fbK(P.T.tah) + " dahil" : "kesin + planlı") + (P.T.gecG ? " · geciken hariç" : ""), "#finans/akis/giris") +
      fbKpi("fbCuzdan", "Ödeme · 30 gün", fbK(P.T.cik), P.T.gecC ? "geciken " + fbK(P.T.gecC) + " dahil" : "kesin + planlı", "#finans/akis/cikis") +
      (mob ? "" : fbKpi("fbOdeme", "Onay bekleyen", "<span>" + ob.length + "</span>", ob.length ? fbK(ob.reduce(function (t, m) { return t + usdKarsilik(+m.tutar || 0, m.pb || "TRY", V.KU); }, 0)) : "bekleyen yok", "#finans/odeme") +
        fbKpi("sbSaat", "Geciken tahsilat", fbK(gcT), gc.length ? gc.length + " kalem · nakde sayılmadı" : "geciken yok", "#finans/borc/gecikme", gc.length ? "kt" : "") +
        fbKpi("fbPasta", "Para birimi", fbParaDag(R), "kasa kuruyla USD karşılığı", "#finans/kasa") +
        '<div class="sbKpi fbKpi fbHazirD"><span class="sbKpT">' + fbI("sbTrend") + 'Faaliyet kârı</span><span class="sbKpV fbMut">hazır değil</span><span class="sbKpD">KDV, fatura ve gider ayrımı (3. aşama) olmadan nakitten kâr hesaplanmaz</span></div>') + "</div>";
    var mud = RS.slice(0, 3), mudH = '<div class="sbPane fbK"><div class="sbKh"><h2>Müdahale gereken' + (RS.length ? ' <i class="sbCh kt">' + RS.length + "</i>" : "") + "</h2></div>" + (mud.length ? mud.map(fbRiskSat).join("") : '<div class="sbBos">' + fbI("sbOk") + "<b>Müdahale gerektiren konu yok</b><small>Nakit tamponu korunuyor, geciken tahsilat ve bekleyen onay yok.</small></div>") + "</div>";
    var s7 = gunSonra(7), L7 = R.IT.filter(function (k) { return k.st !== "gec" && k.t >= b && k.t <= s7 && k.usd >= 0.5; }).sort(function (x, y) { return y.usd - x.usd; }).slice(0, mob ? 4 : 6).sort(function (x, y) { return x.t < y.t ? -1 : 1; });
    var yedi = '<div class="sbPane fbK"><div class="sbKh"><h2>Önümüzdeki 7 gün</h2><a class="fbKl" href="#finans/akis">Nakit akışı' + fbI("sbSag", "xs") + "</a></div>" + (L7.length ? L7.map(fbHarSat).join("") : '<div class="sbBosK">7 gün içinde planlı hareket yok.</div>') + "</div>";
    var tab = mob ? "" : '<div class="sbPane fbK"><div class="sbKh"><h2>Şirket dağılımı</h2><small class="fbKs">USD karşılığı · şirketler ayrı hesaplanır</small></div><table class="sbTb fbTb"><tr><th></th><th class="r">Nakit</th><th class="r">Kesin alacak</th><th class="r">Borç</th><th class="r">30 gün en düşük</th></tr>' +
      FB_SIRKETLER.map(function (s) { var r = fbHesap(s), p = fbProj(r, s30); return "<tr><td><b>" + s + '</b></td><td class="r n">' + fbF(r.kul) + '</td><td class="r n">' + fbF(r.kesA) + '</td><td class="r n">' + fbF(r.borcTop) + '</td><td class="r n ' + (p.eksi ? "fbKt" : p.alt ? "fbUy" : "") + '">' + fbF(p.min.v) + "</td></tr>"; }).join("") + "</table>" +
      (R.transferSay ? '<div class="fbSrc"><i></i>' + R.transferSay + " şirketler arası transfer (karşılıklı, bağlı kayıt) Birlikte toplamda birbirini götürdü</div>" : "") + "</div>";
    var mali = '<a class="sbPane fbK fbMaliL" href="#finans/mali"><span class="sbIk sbIk-n">' + fbI("fbBina") + '</span><span class="sbIsT"><b>Mali durum ve yatırımlar</b><small>Net finansal pozisyon, kredi yükü, 5 yıl, ortaklar, varlıklar</small></span>' + fbI("sbSag", "s") + "</a>";
    var uyari = kr ? '<a class="fbKrit fbKrit-' + kr.sv + '" href="' + kr.h + '">' + fbI("sbUyari", "s") + "<span>" + kr.t + "</span>" + fbI("sbSag", "xs") + "</a>" : "";
    $("fbUst").innerHTML = fbBaslik("Finans", fbKurEt(), yd("fin") ? '<a class="sbBtn or yalnizD" href="#finans/plan">' + fbI("sbArti", "s") + "İşlem</a>" : "") + '<div class="fbSecS">' + fbSecici() + "</div>" + uyari;
    $("fm").innerHTML = '<div class="fbIz"><div class="fbSol">' + pan + kp + (mob ? mudH + yedi + mali : "") + "</div>" + (mob ? "" : '<div class="fbSag">' + mudH + yedi + tab + mali + "</div>") + "</div>";
    fbSeciciBagla(fbGenel); fbGizUygula(); fbKonumGeri();
  }).catch(hata);
}
function fbParaDag(R) { var K = FB.v.KU, T = 0, P = {}; ["TRY", "USD", "EUR"].forEach(function (p) { var u = usdKarsilik(R.pbD[p] || 0, p, K); P[p] = u; T += Math.max(0, u); });
  if (!T) return "–"; return ["USD", "TRY", "EUR"].filter(function (p) { return P[p] > 0; }).map(function (p) { return '<small class="fbPd">' + PB_AD[p] + " %" + sayi(P[p] / T * 100) + "</small>"; }).join(" "); }
/* ---------- MALİ DURUM VE YATIRIMLAR ---------- */
function fbMali() {
  fbVeri().then(function () {
    var V = FB.v, R = fbHesap(FB.s), KU = V.KU, net = R.kul + R.vadeli + R.kesA - R.borcTop, mob = window.innerWidth < 1000;
    var pan = '<div class="sbPan fbPan"><div class="fbLb">Net finansal pozisyon · ' + fbSirketAd(FB.s) + '</div><div class="fbBig ' + (net < 0 ? "fbBigK" : "") + '">' + fbF(net) + "</div>" +
      '<div class="fbPanS">nakit + vadeli + kesin alacak − bilinen yükümlülükler</div><div class="fbKy fbKy4"><div><b>' + fbK(R.kul) + "</b><span>nakit</span></div><div><b>" + fbK(R.vadeli) + "</b><span>vadeli</span></div><div><b>" + fbK(R.kesA) + "</b><span>kesin alacak</span></div><div><b>" + fbK(R.borcTop) + "</b><span>yükümlülük</span></div></div>" +
      '<div class="fbPanNot">Şirket değeri veya özkaynak değildir. Varlıklar, stok, sabit kıymet ve muhasebe cari bakiyeleri dahil değil. KMH eksi bakiyesi nakitten düşüldüğü için yükümlülüklere ikinci kez eklenmedi.</div></div>';
    var sk = '<div class="sbPane fbK"><div class="sbKh"><h2>Şirket bazlı mali durum</h2><small class="fbKs">ayrı tutulur</small></div><div class="fbSk">' + FB_SIRKETLER.map(function (s) { var r = fbHesap(s), n = r.kul + r.vadeli + r.kesA - r.borcTop;
      return '<div class="fbSkK"><b>' + s + '</b><div class="sbKv"><span>Nakit</span><b>' + fbF(r.kul) + '</b></div><div class="sbKv"><span>Vadeli</span><b>' + fbF(r.vadeli) + '</b></div><div class="sbKv"><span>Kesin alacak</span><b>' + fbF(r.kesA) + '</b></div><div class="sbKv"><span>Yükümlülük</span><b>' + fbF(r.borcTop) + '</b></div><div class="sbKv fbNetS"><span>Net</span><b class="' + (n < 0 ? "fbKt" : "") + '">' + fbF(n) + "</b></div></div>"; }).join("") + "</div></div>";
    var fv = '<div class="sbPane fbK"><div class="sbKh"><h2>Toplam finansal varlıklar</h2><b class="fbKsag">' + fbF(R.kul + R.vadeli) + '</b></div><div class="sbKv"><span>Kullanılabilir nakit</span><b>' + fbF(R.kul) + '</b></div><div class="sbKv"><span>Vadeli mevduat</span><b>' + fbF(R.vadeli) + "</b></div>" + (R.kmh ? '<div class="sbKv"><span>KMH kullanımı (nakitten düşüldü)</span><b class="fbKt">' + fbF(R.kmh) + "</b></div>" : "") + "</div>";
    var yk = '<div class="sbPane fbK"><div class="sbKh"><h2>Toplam yükümlülükler</h2><b class="fbKsag">' + fbF(R.borcTop) + "</b></div>" + fbBorcSat(R) + '<div class="fbSrc u"><i></i>Kayıtlardan derlenir; muhasebe cari bakiyesi değildir (cari hesap 3. aşamada)</div></div>';
    // 12 aylık kredi yükü
    var b = V.b, ay = []; for (var i = 0; i < 12; i++) ay.push(ayEkle(b, i)); var KY = {}; ay.forEach(function (a) { KY[a] = 0; });
    R.KRD.forEach(function (x) { if (x.kmh) return; x.pl.forEach(function (m) { var a = m.tarih.slice(0, 7); if (a < ay[0]) a = ay[0]; if (KY[a] != null) KY[a] += usdKarsilik(+m.tutar || 0, x.pb, KU); }); });
    var mx = Math.max.apply(null, ay.map(function (a) { return KY[a]; }).concat([1])), son = R.KRD.reduce(function (t, x) { var s2 = x.pl.length ? x.pl[x.pl.length - 1].tarih.slice(0, 10) : ""; return s2 > t ? s2 : t; }, "");
    var kry = '<div class="sbPane fbK"><div class="sbKh"><h2>12 aylık kredi yükü</h2><small class="fbKs">aylık taksit · USD karşılığı</small></div><div class="fbBar">' + ay.map(function (a, i) { return '<div title="' + ayAd(a) + '"><i style="height:' + Math.max(2, KY[a] / mx * 100).toFixed(0) + "%" + (i === 0 ? ";background:#ed7d31" : "") + '"></i></div>'; }).join("") + '</div><div class="fbBarL"><span>' + ayAd(ay[0]) + "</span><span>" + ayAd(ay[11]) + '</span></div><div class="sbKv"><span>12 ay toplamı</span><b>' + fbF(ay.reduce(function (t, a) { return t + KY[a]; }, 0)) + '</b></div><div class="sbKv"><span>Kalan toplam ödeme (taksitler)</span><b>' + fbF(R.BG.kredi) + "</b></div>" + (son ? '<div class="sbKv"><span>Son taksit</span><b>' + tarih(son) + "</b></div>" : "") + '<a class="fbKl" href="#finans/kredi">Krediler' + fbI("sbSag", "xs") + "</a></div>";
    // 5 yıllık senaryo özeti (mevcut senaryo motoru, kayıtları değiştirmez)
    var sen = "";
    if (yt("ortak") && typeof scHesap === "function") { try {
      var D = { M: V.M, S: V.S, G: V.G, AY: V.AY, KU: KU, OC: V.OC, V: V.VR, P: V.PS, PA: prsAyar(V.AY), kasa0: fbHesap("hep").kul, tampon: fbTampon(V, "hep") }, S5 = scBirles(scVarsayilan(V.VR, V.AY), V.AY.senaryo5 || {});
      var Rb = scHesap(D, S5, { uretim: 0, varlik: true, erken: false }), Rk = scHesap(D, S5, { uretim: S5.kotu, varlik: false, erken: false }), Ri = scHesap(D, S5, { uretim: S5.iyi, varlik: true, erken: false });
      sen = '<div class="sbPane fbK"><div class="sbKh"><h2>5 yıllık senaryo</h2><i class="sbEt">varsayım</i><small class="fbKs">Birlikte · kayıtları değiştirmez</small></div><table class="sbTb fbTb"><tr><th></th><th class="r">Kötü</th><th class="r">Baz</th><th class="r">İyi</th></tr>' +
        '<tr><td>Dönem sonu nakit</td><td class="r n">' + fbK(Rk.son) + '</td><td class="r n">' + fbK(Rb.son) + '</td><td class="r n">' + fbK(Ri.son) + "</td></tr>" +
        '<tr><td>En düşük</td><td class="r n">' + fbK(Rk.enD ? Rk.enD.v : 0) + '</td><td class="r n">' + fbK(Rb.enD ? Rb.enD.v : 0) + '</td><td class="r n">' + fbK(Ri.enD ? Ri.enD.v : 0) + "</td></tr>" +
        '<tr><td>Ortak girişi ihtiyacı</td><td class="r n">' + fbK(Rk.top) + '</td><td class="r n">' + fbK(Rb.top) + '</td><td class="r n">' + fbK(Ri.top) + "</td></tr></table>" +
        '<a class="fbKl" href="#finans/senaryo">Senaryo, erken kapama, çıkış ve PDF' + fbI("sbSag", "xs") + "</a></div>"; } catch (e) { sen = '<div class="sbPane fbK"><div class="sbKh"><h2>5 yıllık senaryo</h2></div><div class="sbBosK">Özet hesaplanamadı: ' + fbEsc(e.message) + '</div><a class="fbKl" href="#finans/senaryo">Senaryoyu aç</a></div>'; } }
    // ortaklar, sermaye girişleri, varlıklar
    var ort = "";
    if (yt("ortak")) { var OCs = V.OC.filter(function (c) { return FB.s === "hep" || (c.sirket || "D Solar") === FB.s; }), b12 = gunSonra(-365);
      var koy = OCs.filter(function (c) { return c.yon === "Koydu"; }), koy12 = koy.filter(function (c) { return c.tarih.slice(0, 10) >= b12; });
      ort = '<div class="sbPane fbK"><div class="sbKh"><h2>Ortak cari hesapları</h2><small class="fbKs">net = aldığı − koyduğu</small></div>' + Object.keys(R.ON).map(function (o) { var n = R.ON[o]; return '<div class="sbKv"><span>' + fbEsc(o) + '</span><b class="' + (n < 0 ? "" : "fbUy") + '">' + fbF(Math.abs(n)) + " " + (n < 0 ? "şirket borçlu" : n > 0 ? "ortak borçlu" : "") + "</b></div>"; }).join("") +
        '<div class="sbKv"><span>Sermaye girişi · son 12 ay</span><b>' + fbF(koy12.reduce(function (t, c) { return t + (+c.tutarUsd || 0); }, 0)) + " · " + koy12.length + ' kayıt</b></div><div class="sbKv"><span>Sermaye girişi · toplam</span><b>' + fbF(koy.reduce(function (t, c) { return t + (+c.tutarUsd || 0); }, 0)) + '</b></div><a class="fbKl" href="#finans/ortak">Ortak cari ve 60/40 dengesi' + fbI("sbSag", "xs") + "</a></div>";
      var VR = V.VR.filter(function (v) { return FB.s === "hep" || (v.sirket || "D Solar") === FB.s; }), vd = function (v) { return +v.tahminiUsd || (v.deger ? usdKarsilik(+v.deger, v.pb || "TRY", KU) : 0); };
      ort += '<div class="sbPane fbK"><div class="sbKh"><h2>Şirket varlıkları</h2><small class="fbKs">tahmini değer · net pozisyona dahil değil</small></div>' + (VR.length ? VR.map(function (v) { var d = vd(v); return '<div class="sbKv"><span><b class="fbHsA">' + fbEsc(v.ad) + "</b><small>" + fbEsc([v.tur, v.sahip, v.satisaUygun === "Evet" ? "satışa uygun" : "", v.rehin ? "rehinli" : "", v.durum].filter(Boolean).join(" · ")) + "</small></span><b>" + (d ? fbF(d) : '<span class="fbMut">değer girilmemiş</span>') + "</b></div>"; }).join("") : '<div class="sbBosK">Varlık kaydı yok.</div>') +
        (VR.some(function (v) { return !vd(v); }) ? '<div class="fbSrc u"><i></i>Değeri girilmemiş varlık var; toplam eksik</div>' : "") + '<a class="fbKl" href="#finans/varlik">Varlıklar' + fbI("sbSag", "xs") + "</a></div>"; }
    var yat = '<div class="sbPane fbK"><div class="sbKh"><h2>Yatırım değerlendirmeleri</h2><i class="sbEtN">veri yok</i></div><div class="fbHazir">' + fbI("fbPusula") + "<span><b>Henüz kayıt tutulmuyor</b>Yatırım getirisi (GES, araç, gayrimenkul) için yatırım tutarı, tarih ve gelir eşleştirmesi gerekir. Fatura, KDV ve gelir tablosu ile 3. aşamada eklenecek; şimdiden tahmini oran gösterilmez.</span></div></div>";
    $("fbUst").innerHTML = fbBaslik("Mali durum", fbKurEt(), "", "#finans/genel") + '<div class="fbSecS">' + fbSecici() + "</div>";
    $("fm").innerHTML = '<div class="fbIz"><div class="fbSol">' + pan + sk + fv + yk + "</div><div class=\"fbSag\">" + kry + sen + ort + yat + "</div></div>";
    fbSeciciBagla(fbMali); fbGizUygula();
  }).catch(hata);
}
function fbBorcSat(R) { var G = [["kredi", "Banka kredileri", "kalan taksitler toplamı (faiz dahil)", "#finans/kredi"], ["kart", "Kredi kartları", "kart borcu", "#finans/kredi"], ["ted", "Tedarikçi borçları", "planlı cari ödemeler", "#finans/borc/borc"], ["cek", "Verilen çekler", "vadesi gelmemiş", "#finans/cek"], ["prs", "Personel yükümlülükleri", "kıdem + ihbar · bugün çıkarsa", "#finans/personel"], ["ort", "Ortaklara borçlar", "ortak cari", "#finans/ortak"], ["dig", "Diğer planlı ödemeler", "vergi, maaş, SGK, diğer", "#finans/plan"]];
  var mx = Math.max.apply(null, G.map(function (g) { return R.BG[g[0]]; }).concat([1]));
  return G.filter(function (g) { return R.BG[g[0]] > 0.5; }).map(function (g) { return '<a class="sbKv fbBs" href="' + g[3] + '"><span><b class="fbHsA">' + g[1] + "</b><small>" + g[2] + '</small><i class="fbBsB"><i style="width:' + (R.BG[g[0]] / mx * 100).toFixed(0) + '%"></i></i></span><b>' + fbF(R.BG[g[0]]) + "</b></a>"; }).join("") || '<div class="sbBosK">Kayıtlı yükümlülük yok.</div>'; }
