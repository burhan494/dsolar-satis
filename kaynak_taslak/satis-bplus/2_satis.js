/* ---------- v46 satış: Bugün, Müşteriler, teklif/proje eklemeleri ---------- */
ICO.ok = '<path d="M5 12.5l4.5 4.5L19 7.5"/>';
function waNo(t) { t = telNorm(t); return t.length === 11 ? "90" + t.slice(1) : ""; }
function waLink(t, metin) { var n = waNo(t); return n ? "https://wa.me/" + n + (metin ? "?text=" + encodeURIComponent(metin) : "") : ""; }
function waBtn(t, metin, sinif) { var l = waLink(t, metin); return l ? '<a class="btn sm waB ' + (sinif || "") + '" href="' + l + '" target="_blank" rel="noopener" title="WhatsApp" onclick="event.stopPropagation()">' + ikon("wa", "#16a34a", "kucuk") + "</a>" : ""; }
function telA(t) { return t ? '<a class="btn sm waB" href="tel:' + esc(String(t).replace(/[^\d+]/g, "")) + '" title="Ara" onclick="event.stopPropagation()">' + ikon("tel", "#2563eb", "kucuk") + "</a>" : ""; }
function gunSonraIs(n) { var d = new Date(bugun() + "T12:00:00"), k = 0; while (k < n) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) k++; } return d.toISOString().slice(0, 10); }
/* "Yapıldı": görüşme notu + sıradaki iş tek ekranda */
function isBitti(a, sonra) {
  var oner = { Aday: ["Faturayı iste", "Tekrar ara", "Keşif randevusu"], Nitelikli: ["Keşif randevusu", "Teklif hazırla"], "Keşif": ["Teklif hazırla", "Keşif raporu"], Teklif: ["Teklif cevabını sor", "Revize teklif", "Sözleşme randevusu"], "Sözleşme": ["Peşinat takibi", "Sözleşme imzası"] }[a.asama || "Aday"] || ["Tekrar ara"];
  var k = panelAc('<div class="pnlB"><b>' + esc(a.ad) + '</b><small>' + esc(a.sonrakiIs || "iş") + " · yapıldı</small></div><div class=\"f\"><label>Ne oldu? (görüşme notu)<textarea id=\"ybN\" placeholder=\"ör. faturayı WhatsApp'tan gönderecek\"></textarea></label>" +
    '<div class="arG" style="padding:4px 0 0">Sıradaki iş</div><div class="chips" style="flex-wrap:wrap;padding:0">' + oner.map(function (x) { return '<button data-ybi="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + '</div><input id="ybI" placeholder="Sıradaki iş" value="">' +
    '<div class="chips" style="flex-wrap:wrap;padding:0">' + [["1", "Yarın"], ["2", "2 gün"], ["5", "1 hafta"], ["10", "2 hafta"]].map(function (x) { return '<button data-ybt="' + x[0] + '">' + x[1] + "</button>"; }).join("") + '</div><input id="ybT" type="date" value="' + gunSonraIs(2) + '">' +
    '<label class="ekK" style="font-size:13px"><input type="checkbox" id="ybY"> Sıradaki iş yok (takip bitti)</label><button class="btn pri" id="ybK">Kaydet</button></div>', "alt");
  setTimeout(function () { $("ybN").focus(); }, 30);
  bagT("[data-ybi]", function (e) { $("ybI").value = e.dataset.ybi; Array.prototype.forEach.call(document.querySelectorAll("[data-ybi]"), function (b) { b.classList.toggle("on", b === e); }); });
  bagT("[data-ybt]", function (e) { $("ybT").value = gunSonraIs(+e.dataset.ybt); Array.prototype.forEach.call(document.querySelectorAll("[data-ybt]"), function (b) { b.classList.toggle("on", b === e); }); });
  $("ybK").onclick = function () { var n = $("ybN").value.trim(), yok = $("ybY").checked, is = $("ybI").value.trim(), t = $("ybT").value; if (!yok && !is) { toast("Sıradaki işi yazın ya da “sıradaki iş yok” deyin"); return; } this.disabled = true; var b = this;
    var metin = "✓ " + (a.sonrakiIs || "İş") + " yapıldı" + (n ? ": " + n : "");
    api("/api/collections/gorusmeler/records", { method: "POST", body: { aday: a.id, metin: metin, yazan: BEN.id } })
      .then(function () { return api("/api/collections/adaylar/records/" + a.id, { method: "PATCH", body: yok ? { sonraki: "", sonrakiIs: "" } : { sonrakiIs: is, sonraki: (t || gunSonraIs(1)) + " 09:00:00.000Z" } }); })
      .then(function () { panelKapat(); toast("Kaydedildi"); ROZ.t = 0; (sonra || function () {})(); }).catch(function (e) { b.disabled = false; hata(e); }); };
}
function ertele(a, gun, sonra) { var t = gunSonraIs(gun || 1); return api("/api/collections/adaylar/records/" + a.id, { method: "PATCH", body: { sonraki: t + " 09:00:00.000Z" } }).then(function () { geriAlToast((a.sonrakiIs || "İş") + " " + tarih(t) + " tarihine ertelendi", function () { return api("/api/collections/adaylar/records/" + a.id, { method: "PATCH", body: { sonraki: a.sonraki || "" } }).then(sonra); }); ROZ.t = 0; (sonra || function () {})(); }).catch(hata); }
/* geri al çubuğu */
function geriAlToast(m, geri) { var e = document.createElement("div"); e.className = "toast gAl"; e.innerHTML = "<span>" + esc(m) + '</span><button>Geri al</button>'; document.body.appendChild(e);
  var bit = setTimeout(function () { e.remove(); }, 5000); e.querySelector("button").onclick = function () { clearTimeout(bit); e.remove(); Promise.resolve(geri()).then(function () { toast("Geri alındı"); }).catch(hata); }; }
/* kaydırma: sola → yapıldı, sağa → ertele */
function kaydirBagla(sel, bul, sonra) {
  Array.prototype.forEach.call(document.querySelectorAll(sel), function (r) { var x0 = null, y0 = 0, dx = 0;
    r.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = 0; r.style.transition = "none"; }, { passive: true });
    r.addEventListener("touchmove", function (e) { if (x0 == null) return; dx = e.touches[0].clientX - x0; if (Math.abs(e.touches[0].clientY - y0) > 30 && Math.abs(dx) < 30) { x0 = null; r.style.transform = ""; return; } if (Math.abs(dx) > 12) r.style.transform = "translateX(" + Math.max(-110, Math.min(110, dx)) + "px)"; r.classList.toggle("kSol", dx < -60); r.classList.toggle("kSag", dx > 60); }, { passive: true });
    r.addEventListener("touchend", function () { if (x0 == null) return; r.style.transition = "transform .15s"; r.style.transform = ""; r.classList.remove("kSol", "kSag"); var a = bul(r); x0 = null; if (!a) return;
      if (dx < -70) { r.dataset.kay = "1"; isBitti(a, sonra); } else if (dx > 70) { r.dataset.kay = "1"; ertele(a, 1, sonra); } setTimeout(function () { delete r.dataset.kay; }, 400); }); });
}
function bugunSatir(a, b) { var g = a.sonraki && a.sonraki.slice(0, 10) < b, gf = g ? gunFark(a.sonraki, b) : 0;
  return '<div class="row bR2" data-adg="' + a.id + '">' + avatar(a.ad, ASAMA_RENK[a.asama], true) + '<div class="t"><b class="w">' + esc(a.ad) + ' <span class="pill p-' + esc(a.asama || "Aday") + '" style="font-size:10.5px;padding:1px 6px">' + esc(a.asama || "Aday") + "</span></b><small" + (g ? ' style="color:var(--bad)"' : "") + ">" + esc(a.sonrakiIs || "sıradaki iş yazılmamış") + (g ? " · " + gf + " gün gecikti" : a.sonraki && a.sonraki.slice(0, 10) > b ? " · " + tarih(a.sonraki) : "") + (a.ilce ? '<span class="mT"> · ' + esc(a.ilce) + "</span>" : "") + "</small></div>" +
    '<div class="rDg">' + telA(a.tel) + waBtn(a.tel) + (satisci() ? '<button class="btn sm waB" data-ybt2="' + a.id + '" title="Yapıldı">' + ikon("ok", "#475569", "kucuk") + "</button>" : "") + "</div></div>"; }
function muhasebeGunu(kutu) {
  if (!yt("fin")) { kutu.innerHTML = ""; return Promise.resolve(); } var b = bugun();
  return Promise.all([kurKartiGetir(), liste("fin_hesaplar", "aktif = true", "ad"), liste("fin_hareketler", "durum != 'Gerçekleşti' && tarih < " + q(b + " 00:00:00") + " && onay != 'Reddedildi'", "tarih"), liste("fin_ayarlar", "anahtar = 'rapor_kontrol'").catch(function () { return []; }), liste("odeme_listeleri", "durum = 'Onaylandı' || durum = 'Kısmen onaylandı'").catch(function () { return []; })]).then(function (R) {
    var KU = R[0], H = R[1].filter(function (h) { return h.tur !== "Kasa"; }), gec = R[2], RK = ((R[3][0] || {}).deger || {})[b] || {}, rk = ["kasa", "akis", "odeme", "ortak"].filter(function (x) { return RK[x]; }).length;
    var esit = H.filter(function (h) { return h.acilisTarihi && h.acilisTarihi.slice(0, 10) === b; }).length, kurOk = isGunuFark(KU.tarih) <= 1;
    var od = gec.filter(function (m) { return m.yon === "Çıkış"; }), th = gec.filter(function (m) { return m.yon === "Giriş"; });
    var M = [[kurOk, "Kur güncel", kurOk ? "USD " + sayi(KU.usd, 2) + " · " + tarih(KU.tarih) : "kur " + tarih(KU.tarih) + " tarihli", "#finans/kasa"],
      [esit > 0, "Banka bakiyeleri eşitlendi", esit ? esit + " hesap bugün eşitlendi" : "bugün henüz eşitlenmedi (hesaba dokunup ekstre bakiyesini girin)", "#finans/kasa"],
      [!od.length, "Geçmiş tarihli ödeme kalmadı", od.length ? od.length + " ödeme “yapıldı” işaretlenmeyi bekliyor" : "hepsi işlendi", "#finans/odeme"],
      [!th.length, "Geçmiş tarihli tahsilat kalmadı", th.length ? th.length + " tahsilat bekliyor ya da ertelenmeli" : "hepsi işlendi", "#finans/plan"],
      [rk >= 4, "4 rapor kontrol edildi", rk + "/4 kontrol edildi", "#finans/rapor"]];
    var n = M.filter(function (x) { return x[0]; }).length;
    kutu.innerHTML = '<div class="card mhG" style="margin:0 0 12px"><h3>' + ikon("liste", n === M.length ? "#16a34a" : "#d97706", "kucuk") + "Muhasebe günü · " + tarih(b) + ' <small style="margin-left:auto;color:var(--muted);font-weight:500">' + n + "/" + M.length + "</small></h3>" +
      M.map(function (x) { return '<a class="row" href="' + x[3] + '"><span class="mhX ' + (x[0] ? "e" : "h") + '">' + (x[0] ? "✓" : "") + '</span><div class="t"><b class="w" style="font-weight:600">' + x[1] + "</b><small>" + esc(x[2]) + "</small></div>" + (x[0] ? "" : '<span class="btn sm">Aç</span>') + "</a>"; }).join("") + "</div>";
  }).catch(function () { kutu.innerHTML = ""; });
}
function gunOzetKarti(kutu) {
  var b = bugun(), dun = gunSonra(-1), is = [], o = {};
  if (yt("fin")) is.push(Promise.all([liste("fin_hesaplar", "", "sirket,ad"), liste("fin_hareketler", "durum = 'Gerçekleşti' && hesap != ''", "tarih"), kurKartiGetir()]).then(function (R) { var B = bakiyeler(R[0], R[1]), K = kasaHesap(R[0], B, R[2]); o.kasa = K.T.kul; }).catch(function () {}));
  if (yt("ges")) is.push(liste("ges_aylik", "donem = " + q(dun.slice(0, 7))).then(function (G) { var g = G[0] || {}, d = String(+dun.slice(8, 10)), v = +((g.iscGun || {})[d] || (g.iscGun || {})[dun.slice(8, 10)] || 0), t = +((g.iscT || {})[d] || (g.iscT || {})[dun.slice(8, 10)] || 0); o.ges = v; o.gesT = t; }).catch(function () {}));
  if (yt("teklif")) is.push(liste("teklifler", "durum = 'Anlaşıldı' || durum = 'Gönderildi'", "-created").then(function (T) { var ay = b.slice(0, 7), an = T.filter(function (t) { return t.durum === "Anlaşıldı" && (t.updated || t.created).slice(0, 7) === ay; }); o.anl = an.length; o.anlUsd = an.reduce(function (s, t) { return s + (+t.fiyatUSD || 0); }, 0); o.acik = T.filter(function (t) { return t.durum === "Gönderildi"; }).length; }).catch(function () {}));
  if (!is.length) { kutu.innerHTML = ""; return; }
  Promise.all(is).then(function () { var K = [];
    if (o.kasa != null) K.push(["Kasa (kullanılabilir)", sayi(o.kasa) + " $", "Finans › Kasa", "#finans/kasa"]);
    if (o.ges != null) K.push(["GES dün", sayi(o.ges / 1000, 1) + " MWh", o.gesT ? "teorik üretimin %" + sayi(o.ges / o.gesT * 100) + "'i" : "iSolarCloud", "#ges"]);
    if (o.anl != null) K.push([AYLAR[+b.slice(5, 7) - 1] + " satış", o.anl + " · " + sayi(o.anlUsd) + " $", o.acik + " teklif müşteride", "#teklifler"]);
    kutu.innerHTML = '<div class="card hero gOz" style="margin:0 0 12px"><h3>Günün özeti</h3><div class="kv">' + K.map(function (x) { return '<a href="' + x[3] + '"><small>' + x[0] + "</small><b>" + x[1] + "</b><small>" + esc(x[2]) + "</small></a>"; }).join("") + "</div></div>"; });
}
function sBugun() {
  var b = bugun();
  var saat = new Date().getHours(), selam = saat < 12 ? "Günaydın" : saat < 18 ? "İyi günler" : "İyi akşamlar", gunAd = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"][new Date().getDay()];
  var bas = '<div class="bUst"><div><div style="font-size:22px;font-weight:800">' + selam + ", " + esc((BEN.name || "").split(" ")[0]) + '</div><small style="color:var(--muted)" id="bgAlt">' + gunAd + ", " + tarih(b) + "</small></div></div>";
  $("m").classList.add("genis");
  if (!yt("musteri")) {
    $("m").innerHTML = bas + '<div class="izgara krIz"><div style="display:grid;gap:0;align-content:start"><div id="odBk"></div><div id="mhK"></div><div id="gsK"></div></div><div style="display:grid;gap:0;align-content:start"><div id="ozK"></div>' + (!finansci() && !yt("ges") ? '<div class="card"><div class="bilgi" style="margin:12px">Yetkili olduğunuz bölümler menüde.</div></div>' : "") + "</div></div>";
    odemeBugunKarti().then(function (h) { var k = $("odBk"); if (k) k.innerHTML = h; }); muhasebeGunu($("mhK")); gunOzetKarti($("ozK")); if (yt("ges")) gesBugunMini($("gsK")); return;
  }
  var f = kendiF();
  Promise.all([liste("adaylar", f, "sonraki"), yt("teklif") ? liste("teklifler", "", "-created", "aday").catch(function () { return []; }) : Promise.resolve([])]).then(function (R) {
    var A = R[0], T = R[1], acik = A.filter(function (a) { return a.asama !== "Sözleşme" && a.asama !== "Kaybedildi"; });
    if (rol() === "saha") acik = acik.filter(function (a) { return a.asama === "Keşif"; });
    var vade = acik.filter(function (a) { return a.sonraki && a.sonraki.slice(0, 10) <= b; }), gec = vade.filter(function (a) { return a.sonraki.slice(0, 10) < b; }), bu = vade.filter(function (a) { return a.sonraki.slice(0, 10) === b; });
    var yakin = acik.filter(function (a) { return a.sonraki && a.sonraki.slice(0, 10) > b && a.sonraki.slice(0, 10) <= gunSonra(7); }), plansiz = acik.filter(function (a) { return !a.sonraki; });
    var onb = T.filter(function (t) { return t.durum === "Onay bekliyor" || t.durum === "Taslak"; }), gon = T.filter(function (t) { return t.durum === "Gönderildi"; });
    var sure = gon.filter(function (t) { return tkSuresiDoldu(t); });
    var blok = function (bs, renk, L, n) { return L.length ? '<div class="bB"><div class="bBb" style="color:' + renk + '">' + bs + " · " + L.length + "</div>" + L.slice(0, n || 50).map(function (a) { return bugunSatir(a, b); }).join("") + (L.length > (n || 50) ? '<a class="row" href="#adaylar" style="justify-content:center;color:var(--blue2);font-weight:700">+' + (L.length - n) + " kişi daha</a>" : "") + "</div>" : ""; };
    var huni = ["Aday", "Nitelikli", "Keşif", "Teklif", "Sözleşme"].map(function (s) { return { s: s, n: A.filter(function (a) { return a.asama === s; }).length }; }), mx = Math.max.apply(null, huni.map(function (h) { return h.n; }).concat([1]));
    var html = bas + '<div class="izgara krIz"><div style="display:grid;gap:12px;align-content:start">' + (yon() ? '<div id="ozK" style="margin-bottom:-12px"></div>' : "") +
      '<div id="onK"></div><div class="card" style="margin:0"><h3>' + ikon("liste", "#2563eb", "kucuk") + 'Yapılacaklar <small style="margin-left:auto;color:var(--muted);font-weight:500">' + vade.length + (gec.length ? " · " + gec.length + " gecikmiş" : "") + "</small></h3>" +
      blok("Gecikmiş", "var(--bad)", gec) + blok("Bugün", "var(--blue2)", bu) + blok("Bu hafta", "var(--muted)", yakin, 12) + (!vade.length && !yakin.length ? '<div class="bos">Bugün ve bu hafta planlı iş yok.</div>' : "") +
      (sure.length ? '<div class="bB"><div class="bBb" style="color:var(--warn)">Teklif süresi doldu · ' + sure.length + "</div>" + sure.slice(0, 6).map(function (t) { var a = (t.expand || {}).aday || {}; return '<a class="row bR2" href="#aday/' + t.aday + '">' + ikon("belge", "#d97706", "kucuk") + '<div class="t"><b class="w">' + esc(a.ad || "") + "</b><small>" + esc(t.no + " · " + sayi(t.fiyatUSD) + " $ · " + gunFark(t.created, b) + " gün önce gönderildi") + '</small></div><div class="rDg">' + waBtn(a.tel, tkHatirlatMetin(t, a)) + "</div></a>"; }).join("") + "</div>" : "") +
      '<div id="gsY"></div></div>' +
      (plansiz.length ? '<a class="card row" href="#adaylar" onclick="LF.asama=\'Planı yok\'" style="margin:0;border-radius:16px">' + ikon("saat", "#64748b") + '<div class="t" style="margin-left:6px"><b class="w">' + plansiz.length + ' müşteride sıradaki iş yok</b><small>Listeyi açıp toplu “sıradaki iş” verebilirsiniz</small></div><span style="color:var(--blue2);font-weight:800">›</span></a>' : "") + "</div>" +
      '<div style="display:grid;gap:12px;align-content:start"><div id="yonK"></div><div id="odBk"></div><div id="mhK"></div>' +
      '<div class="card" style="margin:0"><h3>' + ikon("grafik", "#4f46e5", "kucuk") + "Satış hunisi</h3>" + huni.map(function (h) { return '<a class="row hR" href="#adaylar" onclick="LF.asama=\'' + h.s + '\'"><span style="width:84px;flex:none;font-size:13px;font-weight:600">' + h.s + '</span><div class="krBar" style="flex:1;margin:0 10px;height:10px"><i style="width:' + (h.n / mx * 100).toFixed(1) + "%;background:" + ASAMA_RENK[h.s] + '"></i></div><b style="width:38px;text-align:right">' + h.n + "</b></a>"; }).join("") + "</div></div></div>";
    $("m").innerHTML = html;
    var alt = $("bgAlt"); if (alt) alt.textContent += " · " + (vade.length ? vade.length + " iş bekliyor" : "bugün planlı iş yok");
    var bul = function (r) { return A.filter(function (a) { return a.id === r.dataset.adg; })[0]; };
    Array.prototype.forEach.call(document.querySelectorAll("[data-adg]"), function (r) { r.onclick = function (e) { if (e.target.closest("a,button") || r.dataset.kay) return; location.hash = "#aday/" + r.dataset.adg; }; });
    bagT("[data-ybt2]", function (e) { isBitti(A.filter(function (a) { return a.id === e.dataset.ybt2; })[0], sBugun); });
    if (satisci()) kaydirBagla("[data-adg]", bul, sBugun);
    if (yon()) { gunOzetKarti($("ozK")); onayTara().then(function () { return onayKarti($("onK"), onb); }); } else odemeBugunKarti().then(function (h) { var k = $("odBk"); if (k) k.innerHTML = h; });
    if (!yon() && yt("fin")) muhasebeGunu($("mhK"));
    if (yt("ges")) gesYapilacak($("gsY"));
    if (satisci()) Promise.all([liste("yonlendirmeler", "durum = 'Yeni'", "-created", "ortak"), liste("adaylar", "tel != ''", "-updated")]).then(function (R2) { var k = $("yonK"); if (!k || !R2[0].length) return;
      k.innerHTML = yonlendirmeKarti(R2[0], R2[1], false).replace('<div class="card">', '<div class="card" style="margin:0">'); yonlendirmeBagla(R2[0], sBugun); }).catch(function () {});
  }).catch(hata);
}
function onayKarti(kutu, onb) {
  if (!kutu) return; return liste("odeme_listeleri", "durum = 'Onayda'", "-created").catch(function () { return []; }).then(function (L) {
    var n = L.length + onb.length; if (!n) { kutu.innerHTML = ""; return; }
    kutu.innerHTML = '<div class="card onK" style="margin:0"><h3 style="color:var(--warn)">' + ikon("onay", "#d97706", "kucuk") + 'Onayınızı bekleyen <small style="margin-left:auto;color:var(--warn)">' + n + "</small></h3>" +
      L.map(function (l) { return '<a class="row" href="#finans/odeme"><div class="t"><b class="w">Ödeme listesi · ' + esc(l.ad) + "</b><small>" + esc((l.tur || "") + " · hazırlandı " + tarih(l.created)) + '</small></div><span class="btn sm pri">Onayla</span></a>'; }).join("") +
      onb.slice(0, 6).map(function (t) { var a = (t.expand || {}).aday || {}; return '<a class="row" href="#aday/' + t.aday + '"><div class="t"><b class="w">Teklif ' + esc(t.no || "") + "</b><small>" + esc((a.ad || "") + " · " + sayi(t.kwp, 1) + " kWp · " + sayi(t.fiyatUSD) + " $") + '</small></div><span class="btn sm">Bak</span></a>'; }).join("") + "</div>"; });
}
function tkGecSon(t) { var d = new Date(String(t.created).slice(0, 10) + "T12:00:00"), n = 0; while (n < 7) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n++; } return d.toISOString().slice(0, 10); }
function tkSuresiDoldu(t) { return t.durum === "Gönderildi" && tkGecSon(t) < bugun(); }
function tkHatirlatMetin(t, a) { return "Merhaba " + String((a && a.ad) || "").split(" ")[0] + ", " + tarih(t.created) + " tarihli güneş enerjisi teklifimizle (" + (t.no || "") + ") ilgili sorunuz olursa yardımcı olmak isteriz. Güncel fiyatla teklifi yenileyebiliriz. D Solar"; }
function tkButon(t) {
  var bt = "", a = (t.expand || {}).aday || {};
  if (yon() && (t.durum === "Onay bekliyor" || t.durum === "Taslak")) bt = '<button class="btn sm pri" data-t="' + t.id + '" data-d="Gönderildi">Onayla</button>';
  else if (teklifci() && t.durum === "Gönderildi") bt = '<button class="btn sm" data-t="' + t.id + '" data-ad="' + t.aday + '" data-d="Anlaşıldı">Anlaşıldı</button><button class="btn sm" data-t="' + t.id + '" data-ad="' + t.aday + '" data-d="Kaybedildi">Kaybedildi</button>';
  if (t.kalemler && t.kalemler.length) bt = '<a class="btn sm" href="#tpdf/' + t.id + '">PDF</a>' + (teklifci() && t.durum !== "Kaybedildi" ? '<a class="btn sm" href="#teklif/' + t.aday + "," + t.id + '">' + (t.durum === "Gönderildi" || t.durum === "Anlaşıldı" ? "Revize" : "Düzenle") + "</a>" : "") + bt;
  if (tkSuresiDoldu(t)) bt = '<span class="pill" style="background:var(--warnbg);color:var(--warn)">süresi doldu</span>' + (a.tel ? '<a class="btn sm" href="' + waLink(a.tel, tkHatirlatMetin(t, a)) + '" target="_blank" rel="noopener">Hatırlat</a>' : "") + bt;
  return bt;
}
var KAYIP_NEDEN = ["Fiyat yüksek", "Rakibe gitti", "Vazgeçti / erteledi", "Ulaşılamadı", "Çatı / teknik uygun değil", "Diğer"];
function kayipSor(adayAd, f) {
  panelAc('<div class="pnlB"><b>Neden kaybedildi?</b><small>' + esc(adayAd || "") + '</small></div><div class="f"><div class="chips" style="flex-wrap:wrap;padding:0">' + KAYIP_NEDEN.map(function (x) { return '<button data-kn="' + x + '">' + x + "</button>"; }).join("") + '</div><input id="knA" placeholder="Açıklama (isteğe bağlı) ör. rakip 9.500 $ verdi"><button class="btn pri" id="knK">Kaybedildi olarak kaydet</button></div>', "alt");
  var s = ""; bagT("[data-kn]", function (e) { s = e.dataset.kn; Array.prototype.forEach.call(document.querySelectorAll("[data-kn]"), function (b) { b.classList.toggle("on", b === e); }); });
  $("knK").onclick = function () { if (!s) { toast("Bir neden seçin"); return; } var ac = $("knA").value.trim(); panelKapat(); f(s + (ac ? ": " + ac : "")); };
}
function teklifBagla(sonra) {
  Array.prototype.forEach.call(document.querySelectorAll("[data-t]"), function (b) { b.onclick = function (ev) { ev.stopPropagation();
    var d = b.dataset.d;
    if (d === "Gönderildi" && !confirm("Teklif onaylansın mı? Uygulama müşteriye bir şey göndermez; teklifi ekip kendisi iletir.")) return;
    var yap = function (neden) {
      api("/api/collections/teklifler/records/" + b.dataset.t, { method: "PATCH", body: neden ? { durum: d, not: "Kayıp nedeni: " + neden } : { durum: d } })
        .then(function () { return d === "Anlaşıldı" && b.dataset.ad ? api("/api/collections/adaylar/records/" + b.dataset.ad, { method: "PATCH", body: { asama: "Sözleşme" } }) : d === "Kaybedildi" && b.dataset.ad ? api("/api/collections/adaylar/records/" + b.dataset.ad, { method: "PATCH", body: { asama: "Kaybedildi", kayipNedeni: neden, sonraki: "", sonrakiIs: "" } }) : null; })
        .then(function () { toast(d === "Anlaşıldı" ? "Anlaşıldı; müşteri Sözleşme aşamasına alındı" : d === "Kaybedildi" ? "Kaybedildi; nedeni kaydedildi" : "Güncellendi"); ROZ.t = 0; sonra(); }).catch(hata); };
    if (d === "Kaybedildi") kayipSor("", yap); else yap(); }; });
}
/* Müşteriler */
var LF = { asama: "Açık", ara: "", sira: "guncel", n: 60, sec: {} };
function sAdaylar() {
  $("m").classList.add("genis");
  var f = kendiF();
  Promise.all([liste("adaylar", f, "-updated", "kesifci,sorumlu"), yt("teklif") ? liste("teklifler", "", "-created").catch(function () { return []; }) : Promise.resolve([]), satisci() && !BEN.kendi ? liste("users", "aktif = true", "name").catch(function () { return []; }) : Promise.resolve([])]).then(function (R) {
    var A = R[0], ST = sonTeklifMap(R[1]), U = R[2].filter(function (u) { return u.rol !== "ortak" && (u.rol === "yonetici" || u.y_musteri); }), b = bugun(), h7 = gunSonra(7);
    var acik = function (a) { return a.asama !== "Sözleşme" && a.asama !== "Kaybedildi"; };
    var FL = { "Bana atanan": function (a) { return acik(a) && (a.sorumlu === BEN.id || a.kesifci === BEN.id); }, "Bu hafta": function (a) { return acik(a) && a.sonraki && a.sonraki.slice(0, 10) <= h7; },
      "Teklif süresi doldu": function (a) { var t = ST[a.id]; return acik(a) && t && tkSuresiDoldu(t); }, "Açık": acik, "Planı yok": function (a) { return acik(a) && !a.sonraki; }, "Tümü": function () { return true; } };
    ASAMA.forEach(function (s) { FL[s] = function (a) { return (a.asama || "Aday") === s; }; });
    var ch = ["Bana atanan", "Bu hafta", "Teklif süresi doldu", "Açık"].concat(ASAMA).concat(["Planı yok", "Tümü"]);
    var sayac = {}; ch.forEach(function (c) { sayac[c] = A.filter(FL[c]).length; });
    if (!FL[LF.asama]) LF.asama = "Açık";
    var goster = function () {
      var s = LF.ara.toLocaleLowerCase("tr"), sr = s.replace(/\D/g, "");
      var L = A.filter(function (a) { return FL[LF.asama](a) && (!s || [a.ad, a.ilce, a.email, a.sehir, a.sonrakiIs].join(" ").toLocaleLowerCase("tr").indexOf(s) >= 0 || (sr.length >= 4 && telNorm(a.tel).indexOf(sr.replace(/^0/, "")) >= 0)); });
      var srt = { guncel: function (x, y) { return (y.updated || "") < (x.updated || "") ? -1 : 1; }, sonraki: function (x, y) { return (x.sonraki || "9") < (y.sonraki || "9") ? -1 : 1; }, ad: function (x, y) { return String(x.ad).localeCompare(String(y.ad), "tr"); },
        teklif: function (x, y) { var p = adayTeklifUsd(x, ST), r = adayTeklifUsd(y, ST); return ((r && r.usd) || 0) - ((p && p.usd) || 0); }, oncelik: function (x, y) { return (x.oncelik || "Z") < (y.oncelik || "Z") ? -1 : (x.oncelik || "Z") > (y.oncelik || "Z") ? 1 : 0; } };
      L.sort(srt[LF.sira] || srt.guncel);
      var G = L.slice(0, LF.n), toplu = satisci();
      $("lst").innerHTML = '<table class="musT"><thead><tr>' + (toplu ? '<th class="cbT"><input type="checkbox" id="lsT"></th>' : "") + '<th>Müşteri</th><th>Aşama</th><th>İlçe</th><th>Sıradaki iş</th><th style="text-align:right">Değer</th><th>Son temas</th><th>Sorumlu</th><th></th></tr></thead><tbody>' + G.map(function (a) {
        var g = a.sonraki && a.sonraki.slice(0, 10) < b && acik(a), tk = adayTeklifUsd(a, ST), sr2 = ((a.expand || {}).sorumlu || {}).name || "", tsd = ST[a.id] && tkSuresiDoldu(ST[a.id]);
        var sir = a.sonraki ? (a.sonrakiIs ? esc(a.sonrakiIs) + " · " : "") + tarih(a.sonraki) + (g ? " · " + gunFark(a.sonraki, b) + " gün gecikti" : "") : acik(a) ? "sıradaki iş yok" : "";
        return '<tr data-git="' + a.id + '" class="' + (LF.sec[a.id] ? "sec" : "") + '">' + (toplu ? '<td class="cbT"><input type="checkbox" data-cb="' + a.id + '"' + (LF.sec[a.id] ? " checked" : "") + "></td>" : "") +
          '<td><div style="display:flex;align-items:center;gap:10px">' + avatar(a.ad, ASAMA_RENK[a.asama], true) + '<div style="min-width:0;flex:1"><b class="w">' + esc(a.ad) + (a.oncelik ? ' <span class="pill" style="font-size:10.5px">' + esc(a.oncelik) + "</span>" : "") + '<span class="mMi"> ' + asamaPill(a.asama) + '</span></b><small class="mT">' + esc(a.tel || a.email || "") + '</small><small class="mM">' + esc([a.ilce, tk ? sayi(tk.usd) + " $" : "", a.updated ? "son temas " + gunFark(a.updated, b) + " gün" : ""].filter(Boolean).join(" · ")) + "</small>" +
          '<small class="mM" style="' + (g ? "color:var(--bad)" : !a.sonraki && acik(a) ? "color:var(--warn)" : "color:#475569") + '">' + (sir ? "▸ " + sir : "") + (tsd ? ' <b style="color:var(--warn)">· teklif süresi doldu</b>' : "") + '</small></div><span class="mM rDg">' + waBtn(a.tel) + "</span></div></td>" +
          "<td>" + asamaPill(a.asama) + "</td><td>" + esc(a.ilce || a.sehir || "") + "</td><td" + (g ? ' style="color:var(--bad)"' : !a.sonraki && acik(a) ? ' style="color:var(--warn)"' : "") + ">" + (a.sonraki ? "<b>" + (a.sonrakiIs ? esc(a.sonrakiIs) : "—") + "</b><br><small>" + tarih(a.sonraki) + (g ? " · " + gunFark(a.sonraki, b) + " gün gecikti" : "") + "</small>" : '<small>' + (acik(a) ? "yok" : "") + "</small>") + (tsd ? '<small style="color:var(--warn)">teklif süresi doldu</small>' : "") + "</td>" +
          '<td style="text-align:right;white-space:nowrap">' + (tk ? "<b>" + sayi(tk.usd) + " $</b><br><small style=\"color:var(--muted)\">" + esc(tk.eski ? "eski teklif" : tk.ne) + "</small>" : '<small style="color:var(--muted)">—</small>') + '</td><td><small style="color:var(--muted)">' + (a.updated ? gunFark(a.updated, b) + " gün" : "") + "</small></td><td><small>" + esc(sr2.split(" ")[0]) + '</small></td><td class="rDgT">' + telA(a.tel) + waBtn(a.tel) + "</td></tr>"; }).join("") + "</tbody></table>" +
        (!L.length ? '<div class="bos">Kayıt yok.</div>' : "") + (L.length > G.length ? '<button class="btn" id="lfN" style="margin:10px 14px 14px">Daha fazla göster (' + (L.length - G.length) + " kişi daha)</button>" : "") +
        (satisci() && G.length ? '<div class="kyIp">Telefonda: sola kaydır → Yapıldı · sağa kaydır → yarına ertele</div>' : "");
      $("lsay").textContent = L.length + " kişi";
      Array.prototype.forEach.call(document.querySelectorAll("[data-git]"), function (r) { r.onclick = function (e) { if (e.target.closest("a,button,input,.cbT") || r.dataset.kay) return; location.hash = "#aday/" + r.dataset.git; }; });
      if ($("lfN")) $("lfN").onclick = function () { LF.n += 100; goster(); };
      Array.prototype.forEach.call(document.querySelectorAll("[data-cb]"), function (c) { c.onchange = function () { if (c.checked) LF.sec[c.dataset.cb] = 1; else delete LF.sec[c.dataset.cb]; c.closest("tr").classList.toggle("sec", c.checked); topluCiz(); }; });
      if ($("lsT")) $("lsT").onchange = function () { var on = this.checked; G.forEach(function (a) { if (on) LF.sec[a.id] = 1; else delete LF.sec[a.id]; }); goster(); };
      if (satisci()) kaydirBagla("tr[data-git]", function (r) { return A.filter(function (a) { return a.id === r.dataset.git; })[0]; }, sAdaylar);
      topluCiz();
    };
    var topluCiz = function () { var ids = Object.keys(LF.sec).filter(function (i) { return A.some(function (a) { return a.id === i; }); }), k = $("tpl"); if (!k) return;
      k.style.display = ids.length ? "" : "none"; if (!ids.length) return;
      k.innerHTML = "<b>" + ids.length + " seçili</b>" + (U.length ? '<button data-tp="sor">Sorumlu ata</button>' : "") + '<button data-tp="is">Sıradaki iş ver</button><button data-tp="as">Aşama değiştir</button><button data-tp="xl">Excel</button><button data-tp="x" title="Seçimi kaldır">✕</button>';
      bagT("[data-tp]", function (e) { topluIs(e.dataset.tp, ids.map(function (i) { return A.filter(function (a) { return a.id === i; })[0]; }), U, ST); }); };
    $("m").innerHTML = '<div class="bUst"><div><div style="font-size:22px;font-weight:800">Müşteriler</div><small id="lsay" style="color:var(--muted)"></small></div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;flex:1;justify-content:flex-end"><input id="ara" placeholder="Bu listede ara: ad, ilçe, telefon" value="' + esc(LF.ara) + '" style="max-width:320px;min-height:40px">' +
      '<select id="lfS" style="width:auto;min-height:40px">' + sec([["guncel", "Son güncellenen"], ["sonraki", "Sıradaki tarih"], ["teklif", "Teklif tutarı"], ["oncelik", "Öncelik"], ["ad", "Ad"]], LF.sira) + "</select></div></div>" +
      '<div class="chips">' + ch.map(function (c, i) { return (i === 3 ? '<span class="chAy"></span>' : "") + '<button data-c="' + c + '" class="' + (LF.asama === c ? "on" : "") + '">' + (ASAMA_RENK[c] ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + ASAMA_RENK[c] + ';margin-right:6px"></span>' : "") + c + ' <small style="opacity:.7">' + (sayac[c] || 0) + "</small></button>"; }).join("") + '</div><div class="card" id="lst" style="overflow:hidden"></div><div class="tpl" id="tpl" style="display:none"></div>';
    $("ara").oninput = function () { LF.ara = this.value; LF.n = 60; goster(); };
    $("lfS").onchange = function () { LF.sira = this.value; goster(); };
    Array.prototype.forEach.call(document.querySelectorAll("[data-c]"), function (x) { x.onclick = function () { LF.asama = x.dataset.c; LF.n = 60; Array.prototype.forEach.call(document.querySelectorAll("[data-c]"), function (y) { y.classList.toggle("on", y === x); }); goster(); }; });
    goster();
  }).catch(hata);
}
function topluIs(tur, L, U, ST) {
  var yaz = function (veri, ad) { var n = 0; sirali(L, function (a) { return api("/api/collections/adaylar/records/" + a.id, { method: "PATCH", body: typeof veri === "function" ? veri(a) : veri }).then(function () { n++; }); })
    .then(function () { panelKapat(); LF.sec = {}; toast(n + " müşteri güncellendi" + (ad ? " · " + ad : "")); ROZ.t = 0; sAdaylar(); }).catch(function (e) { hata(e); sAdaylar(); }); };
  if (tur === "x") { LF.sec = {}; sAdaylar(); return; }
  if (tur === "xl") { xlsxYukle().then(function () { var X = window.XLSX, R = [["Ad", "Telefon", "İlçe", "Aşama", "Sıradaki iş", "Tarih", "Teklif $", "Kaynak", "Not"]].concat(L.map(function (a) { var t = adayTeklifUsd(a, ST); return [a.ad, a.tel || "", a.ilce || "", a.asama || "", a.sonrakiIs || "", a.sonraki ? tarih(a.sonraki) : "", t ? t.usd : "", a.kaynak || "", a.not || ""]; }));
    var ws = X.utils.aoa_to_sheet(R), wb = X.utils.book_new(); ws["!cols"] = [{ wch: 26 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 24 }, { wch: 11 }, { wch: 10 }, { wch: 12 }, { wch: 40 }]; X.utils.book_append_sheet(wb, ws, "Müşteriler"); X.writeFile(wb, "Musteriler-" + bugun() + ".xlsx"); }).catch(hata); return; }
  if (tur === "sor") { panelAc('<div class="pnlB"><b>Sorumlu ata</b><small>' + L.length + ' müşteri</small></div><div class="f"><select id="tpS">' + U.map(function (u) { return '<option value="' + u.id + '">' + esc(u.name || u.email) + "</option>"; }).join("") + '</select><button class="btn pri" id="tpK">Ata</button></div>', "alt");
    $("tpK").onclick = function () { var s = $("tpS"); yaz({ sorumlu: s.value }, s.options[s.selectedIndex].text); }; return; }
  if (tur === "as") { panelAc('<div class="pnlB"><b>Aşama değiştir</b><small>' + L.length + ' müşteri</small></div><div class="f"><select id="tpA">' + sec(ASAMA, "Nitelikli") + '</select><button class="btn pri" id="tpK">Değiştir</button></div>', "alt");
    $("tpK").onclick = function () { var v = $("tpA").value; if (v === "Kaybedildi") { kayipSor(L.length + " müşteri", function (n) { yaz({ asama: v, kayipNedeni: n, sonraki: "", sonrakiIs: "" }, v); }); return; } yaz({ asama: v }, v); }; return; }
  if (tur === "is") { panelAc('<div class="pnlB"><b>Sıradaki iş ver</b><small>' + L.length + ' müşteri</small></div><div class="f"><div class="chips" style="flex-wrap:wrap;padding:0">' + ["Ara", "Faturayı iste", "Kampanya araması", "Teklif cevabını sor"].map(function (x) { return '<button data-tpi="' + x + '">' + x + "</button>"; }).join("") + '</div><input id="tpI" placeholder="Sıradaki iş"><input id="tpT" type="date" value="' + gunSonraIs(1) + '"><label class="ekK" style="font-size:13px"><input type="checkbox" id="tpY" checked> Tarihleri günlere yay (günde 10 kişi)</label><button class="btn pri" id="tpK">Kaydet</button></div>', "alt");
    bagT("[data-tpi]", function (e) { $("tpI").value = e.dataset.tpi; });
    $("tpK").onclick = function () { var is = $("tpI").value.trim(), t0 = $("tpT").value || gunSonraIs(1), yay = $("tpY").checked, i = 0; if (!is) { toast("İşi yazın"); return; }
      yaz(function () { var t = t0; if (yay) { var k = Math.floor(i / 10), d = new Date(t0 + "T12:00:00"), n = 0; while (n < k) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n++; } t = d.toISOString().slice(0, 10); } i++; return { sonrakiIs: is, sonraki: t + " 09:00:00.000Z" }; }, is); }; }
}
/* yeni müşteri: önce 4 alan, gerisi "daha fazla bilgi"de */
function sYeni() {
  if (!satisci()) { location.hash = "#bugun"; return; }
  $("m").innerHTML = '<div class="card" style="max-width:640px;margin:0 auto 12px"><h3>Yeni müşteri</h3><div class="f">' +
    '<label>Ad soyad *<input id="yAd" autocomplete="off"></label><div class="f2"><label>Telefon<input id="yTel" inputmode="tel"></label><label>İlçe<input id="yIlce" list="ilceler"></label></div><div id="yTU"></div>' +
    '<datalist id="ilceler"><option>Urla<option>Çeşme<option>Seferihisar<option>Güzelbahçe<option>Narlıdere<option>Karaburun<option>Menderes<option>Foça</datalist>' +
    '<label>Kaynak</label><div class="chips" style="flex-wrap:wrap;padding:0;margin-top:-6px">' + KAYNAK.map(function (k, i) { return '<button data-yk="' + k + '" class="' + (k === "Instagram" ? "on" : "") + '">' + k + "</button>"; }).join("") + "</div>" +
    '<details class="ekB"><summary>Daha fazla bilgi (fatura, tüketim, e-posta, not)</summary><div class="f" style="padding:10px 0 0"><label>E-posta<input id="yEm" type="email"></label><div class="f2"><label>Aylık fatura (TL)<input id="yFat" inputmode="decimal"></label><label>Yıllık tüketim (kWh)<input id="yKwh" inputmode="decimal"></label></div>' +
    '<div class="f2"><label>Sözleşme gücü (kW)<input id="ySoz" inputmode="decimal"></label><label>İYS izni<select id="yIys"><option>Sorulacak</option><option>İzinli</option><option>İzinsiz</option></select></label></div><label>Not<textarea id="yNot"></textarea></label></div></details>' +
    '<div class="f2"><label>Sıradaki iş<input id="yIs" value="Ara"></label><label>Tarih<input id="ySon" type="date" value="' + bugun() + '"></label></div>' +
    '<div id="yUy"></div><button class="btn or" id="yKay2">Kaydet</button></div></div>';
  var kay = "Instagram", zz = null, cift = null; setTimeout(function () { $("yAd").focus(); }, 30);
  bagT("[data-yk]", function (e) { kay = e.dataset.yk; Array.prototype.forEach.call(document.querySelectorAll("[data-yk]"), function (b) { b.classList.toggle("on", b === e); }); });
  $("yTel").oninput = function () { clearTimeout(zz); var t = telNorm(this.value); cift = null; $("yTU").innerHTML = ""; if (t.length < 11) return;
    zz = setTimeout(function () { api("/api/collections/adaylar/records?perPage=1&filter=" + filtreQ("tel ~ " + q(t.slice(1)))).then(function (j) { var a = (j.items || [])[0]; cift = a || null; $("yTU").innerHTML = a ? '<div class="uyari" style="margin:0">Bu telefon kayıtlı: <a href="#aday/' + a.id + '"><b>' + esc(a.ad) + "</b> (" + esc(a.asama || "") + ") · aç</a></div>" : ""; }).catch(function () {}); }, 300); };
  var kaydet = function (zorla) {
    var ad = $("yAd").value.trim(), tel = telNorm($("yTel").value), em = $("yEm").value.trim().toLowerCase(), ilce = $("yIlce").value.trim();
    if (!ad) { toast("Ad gerekli"); return; }
    if (cift && !zorla) { $("yUy").innerHTML = '<div class="uyari" style="margin:0">Bu telefon zaten kayıtlı: <a href="#aday/' + cift.id + '">' + esc(cift.ad) + '</a>. Aynı kişiyse mevcut kaydı açın. Farklı kişiyse (ör. eşi) <button class="btn sm" id="yZ">yine de kaydet</button></div>'; $("yZ").onclick = function () { kaydet(true); }; return; }
    var kos = []; if (tel.length === 11) kos.push("tel ~ " + q(tel.slice(1))); if (em) kos.push("email = " + q(em)); if (ilce) kos.push("(ad = " + q(ad) + " && ilce = " + q(ilce) + ")");
    var kontrol = !zorla && kos.length ? liste("adaylar", kos.join(" || ")) : Promise.resolve([]);
    kontrol.then(function (V) {
      if (V.length) { $("yUy").innerHTML = '<div class="uyari" style="margin:0">Bu kişi zaten kayıtlı olabilir: ' + V.map(function (a) { return '<a href="#aday/' + a.id + '">' + esc(a.ad) + " (" + esc(a.asama || "") + ")</a>"; }).join(", ") + '. Farklı kişiyse <button class="btn sm" id="yZ">yine de kaydet</button></div>'; $("yZ").onclick = function () { kaydet(true); }; return; }
      var veri = { ad: ad, tel: tel, email: em, ilce: ilce, kaynak: kay, asama: "Aday", iys: $("yIys").value, sorumlu: BEN.id, sonrakiIs: $("yIs").value.trim(), not: $("yNot").value.trim() };
      var fat = num($("yFat").value); if (fat > 0) veri.aylikFatura = fat; var kwh = num($("yKwh").value); if (kwh > 0) veri.yillikKwh = kwh; var sz = num($("ySoz").value); if (sz > 0) veri.sozlesmeGucu = sz;
      if ($("ySon").value) veri.sonraki = $("ySon").value + " 09:00:00.000Z";
      return api("/api/collections/adaylar/records" + (zorla ? "?cift=1" : ""), { method: "POST", body: veri }).then(function (r) { toast("Müşteri eklendi"); location.hash = "#aday/" + r.id; });
    }).catch(hata);
  };
  $("yKay2").onclick = function () { kaydet(false); };
}
