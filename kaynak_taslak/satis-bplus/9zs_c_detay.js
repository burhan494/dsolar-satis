/* v91 · Satış B+ — Müşteri detayı: kimlik + hızlı işlemler + sıradaki işlem + Özet / Geçmiş / Teklifler / Belgeler / Proje.
   Mevcut sayfa (sAday) aynen çalışır; düğmeler ve olaylar korunarak yeni düzene taşınır. */
SB.detSek = {};
var SB_TUR = ["Arama", "Görüşme", "Keşif", "Teklif", "Montaj", "Resmî işlem", "Diğer"];
function sbBekle(kosul, f, ms) { var m = $("m"), bitti = false; if (!m) return; var dene = function () { if (bitti) return; var x = kosul(); if (x) { bitti = true; ob.disconnect(); clearTimeout(z); f(x); } };
  var ob = new MutationObserver(dene), z = setTimeout(function () { bitti = true; ob.disconnect(); }, ms || 20000); ob.observe(m, { childList: true, subtree: false }); dene(); }
function sAdayB(id) {
  sbNav(); var m = $("m"); m.className = "sbM";
  if (!m.querySelector(".adU")) m.innerHTML = sbIskelet();
  var ek = Promise.all([api("/api/collections/adaylar/records/" + id + "?expand=sorumlu,kesifci,ortak"), liste("gorevler", "aday = " + q(id), "tarih", "sorumlu").catch(function () { return null; }),
    yt("teklif") ? liste("teklifler", "aday = " + q(id), "-created").catch(function () { return []; }) : Promise.resolve([]), liste("kesif_foto", "aday = " + q(id)).catch(function () { return []; }),
    liste("asama_gecmis", "aday = " + q(id), "created", "kim").catch(function () { return []; }), liste("gorusmeler", "aday = " + q(id), "-created").catch(function () { return []; }), sbVeri().catch(function () { return null; })]);
  SB_ADAY0(id);
  sbBekle(function () { var x = $("m"); return x && x.querySelector(".adU") ? x : null; }, function () { ek.then(function (R) { if (!/^#aday\//.test(location.hash) || location.hash.split("/")[1] !== id) return; sbDetay(id, { a: R[0], GV: R[1], T: R[2], F: R[3], AG: R[4], G: R[5], V: R[6] }); }).catch(function (e) { hata(e); }); });
}
function sbDetay(id, X) {
  var m = $("m"), a = X.a, x = a.expand || {}, b = bugun(), duz = satisci(); if (!m || m.querySelector(".sbDet")) return;
  var adU = m.querySelector(".adU"), asS = adU.querySelector(".asS"), adS = adU.querySelector(".adS"), adSol = m.querySelector(".adSol"), adSag = m.querySelector(".adSag"), bar = m.querySelector(".adBar");
  var h3 = function (k) { var e = k.querySelector("h3"); return e ? e.textContent.trim() : ""; };
  var kartlar = function (k) { return k ? Array.prototype.slice.call(k.children) : []; };
  var Y = null, tk = null, on = null, PRJ = [], gec = null, bil = null, sil = null;
  kartlar(adSol).forEach(function (k) { if (k.classList.contains("adY")) Y = k; else if (/^Teklifler/.test(h3(k))) tk = k; else if (/^Ön hesap/.test(h3(k))) on = k; else PRJ.push(k); });
  kartlar(adSag).forEach(function (k) { if (k.classList.contains("bilK")) bil = k; else if (/^Geçmiş/.test(h3(k))) gec = k; else if (k.querySelector("#aSil")) sil = k; });
  var P = PRJ.some(function (k) { return k.id === "prjKart"; }), Tn = (X.T || []).length, Fn = (X.F || []).length + (X.T || []).filter(function (t) { return t.kalemler && t.kalemler.length; }).length + ((a.eskiTeklifler || []).length ? 1 : 0);
  var sek = SB.detSek[id] || (P ? "proje" : "ozet");
  /* kimlik başlığı */
  var sor = x.sorumlu, kes = x.kesifci, ort = x.ortak, tel = String(a.tel || "");
  var bil1 = [[sbI("sbKonum", "xs"), [a.adres, a.ilce, a.sehir].filter(Boolean).join(", ")], [sbI("sbTel", "xs"), tel ? '<a href="tel:' + sbEsc(tel.replace(/[^\d+]/g, "")) + '">' + sbEsc(tel) + "</a>" : ""], [sbI("sbHoparlor", "xs"), sbEsc(a.kaynak || "")],
    [sbI("sbTek", "xs"), sor ? "Sorumlu: " + sbEsc((sor.name || sor.email).split(" ")[0]) : '<span class="kt">Sorumlu atanmadı</span>'], [sbI("sbKonum", "xs"), kes ? "Keşif: " + sbEsc((kes.name || kes.email).split(" ")[0]) : ""], [sbI("sbEl", "xs"), ort ? "Ortak: " + sbEsc(ort.name || "") : ""]].filter(function (r) { return r[1]; });
  var cip = [a.aylikFatura > 0 ? sayi(a.aylikFatura) + " ₺/ay fatura" : "", a.yillikKwh > 0 ? sayi(a.yillikKwh) + " kWh/yıl" : "", a.sozlesmeGucu > 0 ? sayi(a.sozlesmeGucu, 1) + " kW sözleşme gücü" : "", a.iys === "İzinli" ? "İYS izinli" : ""].filter(Boolean);
  var dh = document.createElement("section"); dh.className = "sbDh";
  dh.innerHTML = '<div class="sbDhU">' + sbAv(a.ad, SB_ASR[a.asama || "Aday"], 54) + '<div class="sbDhA"><h1>' + sbEsc(a.ad) + (a.oncelik === "Yüksek" ? ' <i class="sbYuk" title="Yüksek öncelik">!</i>' : "") + '</h1><div class="sbDhB">' + bil1.map(function (r) { return "<span>" + r[0] + r[1] + "</span>"; }).join("") + "</div>" +
    (cip.length || a.iys !== "İzinli" ? '<div class="sbDhC">' + cip.map(function (c) { return "<span>" + sbEsc(c) + "</span>"; }).join("") + (a.iys !== "İzinli" ? '<span class="u">İYS ' + sbEsc((a.iys || "sorulacak").toLocaleLowerCase("tr")) + "</span>" : "") + "</div>" : "") + "</div>" +
    (duz ? '<button class="btn sbBtn sbMas" data-sbdz="1">' + sbI("sbKalem", "s") + "Düzenle</button>" : "") + "</div>";
  if (asS) { asS.classList.add("sbAsS"); dh.appendChild(asS); }
  var qa = document.createElement("div"); qa.className = "sbQa";
  qa.innerHTML = (tel ? '<a class="sbQaT" href="tel:' + sbEsc(tel.replace(/[^\d+]/g, "")) + '">' + sbI("sbTel") + "<span>Ara</span></a>" : "") + (waLink(a.tel) ? '<a class="sbQaW" href="' + waLink(a.tel) + '" target="_blank" rel="noopener">' + sbI("sbWa") + "<span>WhatsApp</span></a>" : "") +
    (duz ? '<button data-sbqa="kayit">' + sbI("sbNot") + "<span>Not</span></button>" : "") + (duz || yd("proje") ? '<button data-sbqa="gorev">' + sbI("sbGorev") + "<span>Görev</span></button>" : "") + (bar || duz ? '<button data-sbqa="dig" aria-label="Diğer işlemler">' + sbI("sbNokta") + '<span class="sbMas">Diğer</span></button>' : "");
  dh.appendChild(qa);
  /* sıradaki işlem */
  if (adS) { adS.classList.add("sbNx"); var gec2 = a.sonraki && a.sonraki.slice(0, 10) < b, saat = String(a.sonraki || "").slice(11, 16);
    var t0 = adS.querySelector(".t small"); if (t0 && saat && saat !== "09:00" && a.sonraki.slice(0, 10) >= b) t0.textContent = t0.textContent + " · " + saat;
    if (gec2) adS.classList.add("gec"); var ac = (X.GV || []).filter(function (g) { return g.durum === "Açık" && !g.ana; }).length; if (ac) adS.insertAdjacentHTML("beforeend", '<button class="sbNxE" data-sbsek="gecmis">+' + ac + " açık görev</button>"); }
  /* sekmeler */
  var S = [["ozet", "Özet"], ["gecmis", "Geçmiş", (X.G || []).length + (X.GV || []).length], ["teklif", "Teklifler", Tn], ["belge", "Belgeler", Fn], ["proje", "Proje", P ? "" : ""]];
  var dt = document.createElement("nav"); dt.className = "sbDt"; dt.setAttribute("role", "tablist");
  dt.innerHTML = S.map(function (s) { return '<button role="tab" data-sbsek="' + s[0] + '" aria-selected="' + (s[0] === sek) + '">' + s[1] + (s[2] ? "<em>" + s[2] + "</em>" : "") + "</button>"; }).join("");
  var pane = {}; S.forEach(function (s) { var d = document.createElement("div"); d.className = "sbPane"; d.dataset.sbpane = s[0]; d.hidden = s[0] !== sek; pane[s[0]] = d; });
  /* Özet */
  var oz = pane.ozet, ozS = document.createElement("div"), ozG = document.createElement("div"); ozS.className = "sbSut"; ozG.className = "sbSut"; var iki = document.createElement("div"); iki.className = "sbIki"; iki.appendChild(ozS); iki.appendChild(ozG); oz.appendChild(iki);
  if (Y) ozS.appendChild(Y); if (on) ozS.appendChild(on);
  var sonG = (X.G || [])[0]; ozG.insertAdjacentHTML("beforeend", sbKart("Son görüşme", sonG ? '<div class="sbTl"><div class="sbTe"><b>' + sbEsc(String(sonG.metin || "").slice(0, 300)) + '</b><small>' + tarih(sonG.created) + " " + String(sonG.created).slice(11, 16) + "</small></div></div>" : sbBos("sbNot", "Henüz görüşme kaydı yok", "Ara ya da WhatsApp'tan yazdıktan sonra Not ile kaydedin."), { sag: '<button class="sbKl" data-sbsek="gecmis">Geçmiş' + sbI("sbSag", "s") + "</button>" }));
  if (bil) { bil.open = true; ozG.appendChild(bil); }
  if (sil) { sil.classList.add("sbSil"); ozG.appendChild(sil); }
  /* Geçmiş: tek kayıt formu + görevler + zaman çizelgesi */
  var gp = pane.gecmis; if (duz) gp.insertAdjacentHTML("beforeend", sbKayitForm(a, X));
  gp.insertAdjacentHTML("beforeend", sbGorevKart(a, X)); if (gec) { var gf = gec.querySelector(".f"); if (gf && duz) gf.hidden = true; gp.appendChild(gec); sbGecmisZengin(gec, X); }
  /* Teklifler */
  var tp = pane.teklif; tp.insertAdjacentHTML("beforeend", sbTeklifOzet(a, X));
  if (tk) tp.appendChild(tk); else tp.insertAdjacentHTML("beforeend", sbKart("Teklifler", sbBos("sbBelge", "Henüz teklif yok", teklifci() ? "5 adımlı sihirbazla hazırlayın." : "")));
  if (teklifci() && !P) tp.insertAdjacentHTML("beforeend", '<a class="btn sbBtn or sbTam" href="#teklif/' + id + '">' + sbI("sbArti", "s") + "Yeni teklif hazırla</a>");
  /* Belgeler */
  pane.belge.insertAdjacentHTML("beforeend", sbBelgeler(a, X, PRJ));
  /* Proje */
  var pp = pane.proje; if (PRJ.length) PRJ.forEach(function (k) { pp.appendChild(k); }); else pp.insertAdjacentHTML("beforeend", sbKart("Proje", sbBos("sbPanel", "Proje henüz başlamadı", a.asama === "Sözleşme" ? "Sözleşme bedeli ve ödeme planıyla başlatılır." : "Müşteri Sözleşme aşamasına geçince burada başlatılır.")));
  if (P) pp.insertBefore(sbProjeOzet(X), pp.firstChild);
  /* yerleştir */
  var w = document.createElement("div"); w.className = "sbSayfa sbDet";
  w.innerHTML = '<a class="sbGeriL" href="#adaylar">' + sbI("sbSol", "s") + "Müşteriler</a>";
  w.appendChild(dh); if (adS) w.appendChild(adS); w.appendChild(dt); S.forEach(function (s) { w.appendChild(pane[s[0]]); });
  var eski = Array.prototype.slice.call(m.children); m.insertBefore(w, m.firstChild);
  eski.forEach(function (e) { if (e === bar) { e.hidden = true; e.classList.add("sbGizli"); return; } if (e.classList && (e.classList.contains("adU") || e.classList.contains("adIz") || e.classList.contains("geriL"))) e.remove(); });
  document.body.classList.remove("adBarV");
  /* olaylar */
  var git = function (s) { SB.detSek[id] = s; Array.prototype.forEach.call(w.querySelectorAll("[role=tab][data-sbsek]"), function (t) { t.setAttribute("aria-selected", t.dataset.sbsek === s); }); Array.prototype.forEach.call(w.querySelectorAll("[data-sbpane]"), function (p) { p.hidden = p.dataset.sbpane !== s; }); };
  Array.prototype.forEach.call(w.querySelectorAll("[data-sbsek]"), function (t) { t.addEventListener("click", function (e) { e.preventDefault(); git(t.dataset.sbsek); if (!t.matches("[role=tab]")) dt.scrollIntoView({ block: "start", behavior: "smooth" }); }); });
  var dz = w.querySelector("[data-sbdz]"); if (dz) dz.onclick = function () { git("ozet"); var b2 = $("bDz"); if (b2) b2.click(); var bl = document.querySelector(".bilK"); if (bl) bl.scrollIntoView({ block: "start", behavior: "smooth" }); };
  var yen = function () { sbSifirla(); sAday(id); };
  bagT("[data-sbqa]", function (e) { var t = e.dataset.sbqa;
    if (t === "kayit") { git("gecmis"); setTimeout(function () { var k = $("sbKyM"); if (k) { k.focus(); k.scrollIntoView({ block: "center", behavior: "smooth" }); } }, 60); }
    else if (t === "gorev") { if (X.GV) sbGorevPanel(a, null, yen); else adHatirlat(a, yen); }
    else if (t === "dig") { var d = bar && bar.querySelector("[data-ady=dig]"); if (d) d.click(); else { var k2 = document.querySelector("[data-msjk=aday]"); if (k2) k2.click(); } } });
  sbKayitBagla(a, X, yen); sbGorevBagla(a, X, yen); sbTeklifGonderBagla(a, X, yen); sbBelgeBagla(a, X, yen);
}
/* tek kayıt formu: görüşme + mevcut işin durumu + sıradaki iş */
function sbKayitForm(a, X) {
  var oner = { Aday: ["Faturayı iste", "Tekrar ara", "Keşif randevusu"], Nitelikli: ["Keşif randevusu", "Teklif hazırla"], "Keşif": ["Teklif hazırla", "Keşif raporu"], Teklif: ["Teklif cevabını sor", "Revize teklif", "Sözleşme randevusu"], "Sözleşme": ["Peşinat takibi", "Sözleşme imzası"] }[a.asama || "Aday"] || ["Tekrar ara"];
  return sbKart("Görüşme kaydet", '<div class="sbKy"><div class="sbOp" role="radiogroup" aria-label="Görüşme türü">' + ["Telefon", "WhatsApp", "Yüz yüze", "Not"].map(function (t, i) { return '<button type="button" data-sbkt="' + t + '" aria-pressed="' + !i + '">' + t + "</button>"; }).join("") + "</div>" +
    '<label class="sbLbl">Ne konuşuldu?<textarea id="sbKyM" rows="3" placeholder="ör. eşiyle konuşup cuma dönecek; faturayı WhatsApp\'tan atacak"></textarea></label>' +
    (a.sonrakiIs ? '<div class="sbKyIs"><span>Mevcut iş: <b>' + sbEsc(a.sonrakiIs) + "</b>" + (a.sonraki ? " · " + tarih(a.sonraki) : "") + '</span><div class="sbSeg k" role="radiogroup" aria-label="Mevcut işin durumu"><button type="button" data-sbkd="acik" aria-pressed="true">Açık kalsın</button><button type="button" data-sbkd="tamam" aria-pressed="false">Tamamlandı</button></div></div>' : "") +
    '<div class="sbLbl">Sıradaki iş <small>' + (a.sonrakiIs ? (X.GV ? "isteğe bağlı · mevcut iş açık kalırsa ek görev olarak açılır" : "mevcut işi tamamlayınca yazılır") : "isteğe bağlı") + '</small></div><div class="sbOp">' + oner.map(function (o) { return '<button type="button" data-sbko="' + sbEsc(o) + '">' + sbEsc(o) + "</button>"; }).join("") + "</div>" +
    '<div class="sbKyR"><input id="sbKyI" placeholder="Sıradaki iş" autocomplete="off"><input id="sbKyT" type="date" value="' + gunSonraIs(2) + '" aria-label="Tarih"><input id="sbKySa" type="time" aria-label="Saat (isteğe bağlı)"></div>' +
    '<button class="btn pri sbTam" id="sbKyK">Kaydet</button></div>', { c: "sbKyK" });
}
function sbKayitBagla(a, X, yen) {
  var k = $("sbKyK"); if (!k) return; var tur = "Telefon", durum = "acik";
  bagT("[data-sbkt]", function (e) { tur = e.dataset.sbkt; Array.prototype.forEach.call(document.querySelectorAll("[data-sbkt]"), function (b) { b.setAttribute("aria-pressed", b === e); }); });
  bagT("[data-sbkd]", function (e) { durum = e.dataset.sbkd; Array.prototype.forEach.call(document.querySelectorAll("[data-sbkd]"), function (b) { b.setAttribute("aria-pressed", b === e); }); });
  bagT("[data-sbko]", function (e) { $("sbKyI").value = e.dataset.sbko; });
  k.onclick = function () {
    var n = $("sbKyM").value.trim(), is = $("sbKyI").value.trim(), t = $("sbKyT").value, sa = $("sbKySa").value;
    if (!n && !is && !(a.sonrakiIs && durum === "tamam")) { toast("Görüşme notu ya da sıradaki iş yazın"); return; }
    if (is && !t) { toast("Sıradaki iş için tarih seçin"); return; }
    if (is && a.sonrakiIs && durum === "acik" && !X.GV) { toast("Önce mevcut işi tamamlayın ya da tarihini erteleyin"); return; }
    var zaman = is ? t + " " + (sa || "09:00") + ":00.000Z" : "";
    k.disabled = true;
    var metin = (a.sonrakiIs && durum === "tamam" ? "✓ " + a.sonrakiIs + " yapıldı" + (n ? " · " + tur + ": " + n : "") : (tur === "Not" ? "" : tur + ": ") + n);
    var is1 = n || (a.sonrakiIs && durum === "tamam") ? api("/api/collections/gorusmeler/records", { method: "POST", body: { aday: a.id, metin: metin, yazan: BEN.id } }) : Promise.resolve();
    var ana = (X.GV || []).filter(function (g) { return g.ana && g.durum === "Açık"; })[0];
    var yeniG = function (anaMi) { return api("/api/collections/gorevler/records", { method: "POST", body: { aday: a.id, tur: sbTurTahmin(is), baslik: is, tarih: zaman, saatli: !!sa, sorumlu: a.sorumlu ? [a.sorumlu] : [BEN.id], durum: "Açık", ana: !!anaMi, adres: [a.adres, a.ilce].filter(Boolean).join(", ").slice(0, 300) } }); };
    is1.then(function () {
      if (a.sonrakiIs && durum === "tamam") {
        if (ana) return api("/api/collections/gorevler/records/" + ana.id, { method: "PATCH", body: { durum: "Tamamlandı", tamamNot: n.slice(0, 1000) } }).then(function () { return is ? yeniG(true) : null; });
        return api("/api/collections/adaylar/records/" + a.id, { method: "PATCH", body: is ? { sonrakiIs: is, sonraki: zaman } : { sonrakiIs: "", sonraki: "" } });
      }
      if (is && !a.sonrakiIs) return X.GV ? yeniG(true) : api("/api/collections/adaylar/records/" + a.id, { method: "PATCH", body: { sonrakiIs: is, sonraki: zaman } });
      if (is) return yeniG(false);
    }).then(function () { toast("Kaydedildi" + (a.sonrakiIs && durum === "acik" ? " · mevcut iş açık" : "")); ROZ.t = 0; SB.detSek[a.id] = "gecmis"; yen(); }).catch(function (e) { k.disabled = false; hata(e); });
  };
}
function sbTurTahmin(s) { s = String(s || ""); return /keşif|kesif/i.test(s) ? "Keşif" : /teklif/i.test(s) ? "Teklif" : /montaj|kurulum/i.test(s) ? "Montaj" : /\bara\b|arama|^ara/i.test(s) ? "Arama" : "Görüşme"; }
/* görevler kartı (müşteri) */
function sbGorevKart(a, X) {
  if (!X.GV) return "";
  var A = X.GV.filter(function (g) { return g.durum === "Açık"; }), K = X.GV.filter(function (g) { return g.durum !== "Açık"; }).slice(-5).reverse();
  return sbKart("Görevler" + (A.length ? ' <span class="sbSay">' + A.length + "</span>" : ""), (A.length ? A.map(function (g) { return sbGorevSat(g, true); }).join("") : sbBos("sbGorev", "Açık görev yok", "")) + (K.length ? '<details class="sbKap"><summary>Tamamlanan ve iptal (' + K.length + ")</summary>" + K.map(function (g) { return sbGorevSat(g, false); }).join("") + "</details>" : ""),
    { sag: satisci() || yd("proje") ? '<button class="sbKl" data-sbgy="1">' + sbI("sbArti", "s") + "Görev</button>" : "" });
}
function sbGorevSat(g, ac) {
  var b = bugun(), t = String(g.tarih || ""), gec = ac && t && t.slice(0, 10) < b, S = ((g.expand || {}).sorumlu || []).map(function (u) { return u.name || u.email; });
  return '<div class="sbGv' + (gec ? " gec" : "") + (ac ? "" : " bit") + '"><span class="sbGvT">' + sbEsc(g.tur || "") + '</span><div class="sbGvA"><b>' + sbEsc(g.baslik) + (g.ana ? ' <i class="sbEtN">sıradaki iş</i>' : "") + (g.oncelik === "Yüksek" ? ' <i class="sbYuk">!</i>' : "") + "</b><small>" +
    sbEsc([t ? tarih(t) + (g.saatli ? " " + t.slice(11, 16) : "") + (gec ? " · " + gunFark(t, b) + " gün gecikti" : "") : "tarih yok", S.map(function (x) { return x.split(" ")[0]; }).join(" + "), g.adres].filter(Boolean).join(" · ")) + (!ac ? " · " + sbEsc(g.durum + (g.tamamNot ? ": " + g.tamamNot : "")) : "") + "</small></div>" +
    (ac && (satisci() || yd("proje")) ? '<span class="sbGvB"><button class="sbIb k" data-sbgt="' + g.id + '" aria-label="Tamamlandı">' + sbI("sbOk") + '</button><button class="sbIb k" data-sbge="' + g.id + '" aria-label="Düzenle">' + sbI("sbKalem") + "</button></span>" : "") + "</div>";
}
function sbGorevBagla(a, X, yen) {
  if (!X.GV) return; var bul = function (i) { return X.GV.filter(function (g) { return g.id === i; })[0]; };
  bagT("[data-sbgy]", function () { sbGorevPanel(a, null, yen); });
  bagT("[data-sbge]", function (e) { sbGorevPanel(a, bul(e.dataset.sbge), yen); });
  bagT("[data-sbgt]", function (e) { sbGorevTamam(bul(e.dataset.sbgt), yen); });
}
function sbGorevTamam(g, sonra) {
  panelAc('<div class="pnlB"><b>Görev tamamlandı</b><small>' + sbEsc(g.baslik) + '</small></div><div class="f"><label>Sonuç / not<textarea id="sbGtN" placeholder="ör. keşif yapıldı, çatı uygun"></textarea></label><div class="sbSeg w"><button data-sbgtd="Tamamlandı" aria-pressed="true">Tamamlandı</button><button data-sbgtd="İptal" aria-pressed="false">İptal</button></div><button class="btn pri" id="sbGtK">Kaydet</button></div>', "alt");
  var d = "Tamamlandı"; bagT("[data-sbgtd]", function (e) { d = e.dataset.sbgtd; Array.prototype.forEach.call(document.querySelectorAll("[data-sbgtd]"), function (b) { b.setAttribute("aria-pressed", b === e); }); });
  $("sbGtK").onclick = function () { var n = $("sbGtN").value.trim(), bt = this; bt.disabled = true;
    api("/api/collections/gorevler/records/" + g.id, { method: "PATCH", body: { durum: d, tamamNot: n } })
      .then(function () { return g.aday && d === "Tamamlandı" ? api("/api/collections/gorusmeler/records", { method: "POST", body: { aday: g.aday, metin: "✓ " + g.baslik + " yapıldı" + (n ? ": " + n : ""), yazan: BEN.id } }) : null; })
      .then(function () { panelKapat(); toast(d === "İptal" ? "Görev iptal edildi" : "Görev tamamlandı"); ROZ.t = 0; sbSifirla(); sonra(); }).catch(function (e) { bt.disabled = false; hata(e); }); };
}
function sbGorevPanel(a, g, sonra, o) {
  if (!SB.c) { sbVeri().then(function () { sbGorevPanel(a, g, sonra, o); }).catch(hata); return; }
  o = o || {}; var V = SB.c, U = V ? sbEkip(V) : [], sec = g ? g.sorumlu || [] : o.sorumlu || (a && a.sorumlu && U.some(function (u) { return u.id === a.sorumlu; }) ? [a.sorumlu] : [BEN.id]), t = String((g && g.tarih) || o.tarih || "");
  panelAc('<div class="pnlB"><b>' + (g ? "Görevi düzenle" : "Yeni görev") + "</b><small>" + sbEsc(a ? a.ad : "Müşterisiz görev") + '</small></div><div class="f">' +
    '<div class="sbOp">' + SB_TUR.map(function (x) { return '<button type="button" data-sbgtu="' + x + '" aria-pressed="' + (x === ((g && g.tur) || o.tur || "Görüşme")) + '">' + x + "</button>"; }).join("") + "</div>" +
    '<label>Başlık<input id="sbGyB" value="' + sbEsc((g && g.baslik) || o.baslik || "") + '" placeholder="ör. Keşif randevusu"></label><div class="f2"><label>Tarih<input id="sbGyT" type="date" value="' + (t.slice(0, 10) || gunSonraIs(1)) + '"></label><label>Saat (isteğe bağlı)<input id="sbGyS" type="time" value="' + (g && g.saatli ? t.slice(11, 16) : "") + '"></label></div>' +
    (U.length ? '<div class="sbLbl">Sorumlu (birden çok seçilebilir)</div><div class="sbOp">' + U.map(function (u) { return '<button type="button" data-sbgs="' + u.id + '" aria-pressed="' + (sec.indexOf(u.id) >= 0) + '">' + sbEsc(u.name || u.email) + "</button>"; }).join("") + "</div>" : "") +
    '<label>Adres / konum<input id="sbGyA" value="' + sbEsc((g && g.adres) || o.adres || (a ? [a.adres, a.ilce].filter(Boolean).join(", ") : "")) + '"></label><div class="f2"><label>Öncelik<select id="sbGyO">' + sec2(["Normal", "Yüksek", "Düşük"], (g && g.oncelik) || "Normal") + '</select></label><label>Süre (dk)<input id="sbGyD" inputmode="numeric" value="' + ((g && g.sure) || "") + '"></label></div>' +
    '<button class="btn pri" id="sbGyK">' + (g ? "Kaydet" : "Görevi aç") + "</button>" + (g ? '<button class="btn" id="sbGyX" style="color:var(--bad)">Görevi iptal et</button>' : "") + "</div>", "alt");
  var tur = (g && g.tur) || o.tur || "Görüşme";
  bagT("[data-sbgtu]", function (e) { tur = e.dataset.sbgtu; Array.prototype.forEach.call(document.querySelectorAll("[data-sbgtu]"), function (b) { b.setAttribute("aria-pressed", b === e); }); if (!$("sbGyB").value) $("sbGyB").value = { Keşif: "Keşif randevusu", Montaj: "Montaj", Arama: "Ara", Teklif: "Teklif hazırla" }[tur] || ""; });
  bagT("[data-sbgs]", function (e) { var on = e.getAttribute("aria-pressed") !== "true"; e.setAttribute("aria-pressed", on); });
  $("sbGyK").onclick = function () { var bs = $("sbGyB").value.trim(), td = $("sbGyT").value, sa = $("sbGyS").value; if (!bs) { toast("Başlık gerekli"); return; } if (!td) { toast("Tarih gerekli"); return; }
    var S = Array.prototype.filter.call(document.querySelectorAll("[data-sbgs]"), function (x) { return x.getAttribute("aria-pressed") === "true"; }).map(function (x) { return x.dataset.sbgs; });
    if (U.length && !S.length) { toast("En az bir sorumlu seçin"); return; }
    var v = { tur: tur, baslik: bs, tarih: td + " " + (sa || "09:00") + ":00.000Z", saatli: !!sa, sorumlu: S.length ? S : [BEN.id], adres: $("sbGyA").value.trim(), oncelik: $("sbGyO").value, sure: parseInt($("sbGyD").value, 10) || null };
    if (!g) { v.durum = "Açık"; if (a) v.aday = a.id; if (o.proje) v.proje = o.proje; }
    var bt = this; bt.disabled = true;
    api("/api/collections/gorevler/records" + (g ? "/" + g.id : ""), { method: g ? "PATCH" : "POST", body: v }).then(function () { panelKapat(); toast(g ? "Görev güncellendi" : "Görev açıldı"); ROZ.t = 0; sbSifirla(); sonra(); }).catch(function (e) { bt.disabled = false; hata(e); }); };
  if ($("sbGyX")) $("sbGyX").onclick = function () { if (!confirm("Görev iptal edilsin mi?")) return; api("/api/collections/gorevler/records/" + g.id, { method: "PATCH", body: { durum: "İptal" } }).then(function () { panelKapat(); toast("Görev iptal edildi"); sbSifirla(); sonra(); }).catch(hata); };
}
function sec2(L, s) { return L.map(function (x) { return '<option' + (x === s ? " selected" : "") + ">" + x + "</option>"; }).join(""); }
/* geçmişe aşama değişikliklerini ve tamamlanan görevleri ekle */
function sbGecmisZengin(gec, X) {
  var L = gec.querySelector(".gcL"); if (!L) return; var ek = [];
  (X.AG || []).forEach(function (g) { if (!g.eski) return; ek.push({ t: g.created, h: '<div class="gcR sbAsg">' + ikon("asagi", "#7c3aed", "kucuk") + "<div><b>Aşama: " + sbEsc(g.eski) + " → " + sbEsc(g.yeni) + "</b><small>" + tarih(g.created) + " " + String(g.created).slice(11, 16) + ((g.expand || {}).kim ? " · " + sbEsc((g.expand.kim.name || "").split(" ")[0]) : "") + "</small></div></div>" }); });
  if (!ek.length) return; var R = Array.prototype.slice.call(L.children), tl = function (r) { var s = r.querySelector("small"); var m2 = s && s.textContent.match(/(\d\d)\.(\d\d)\.(\d{4}) (\d\d:\d\d)/); return m2 ? m2[3] + "-" + m2[2] + "-" + m2[1] + " " + m2[4] : ""; };
  ek.forEach(function (e) { var t = String(e.t).slice(0, 16).replace("T", " "), yer = null; for (var i = 0; i < R.length; i++) { if (tl(R[i]) && tl(R[i]) < t) { yer = R[i]; break; } } var d = document.createElement("div"); d.innerHTML = e.h; var n = d.firstChild; if (yer) L.insertBefore(n, yer); else L.appendChild(n); R = Array.prototype.slice.call(L.children); });
}
/* teklif özeti: geçerlilik, takip, gerçek gönderim kaydı */
function sbTeklifOzet(a, X) {
  var T = (X.T || []).filter(function (t) { return t.durum === "Gönderildi" || t.durum === "Anlaşıldı"; })[0]; if (!T) return "";
  var b = bugun(), gc = T.gecerlilik ? String(T.gecerlilik).slice(0, 10) : tkGecSon(T), kal = gunFark(b, gc), G = T.gonderimler || [], tk = T.takipTarihi ? String(T.takipTarihi).slice(0, 10) : "";
  var gon = G.length ? G.map(function (g) { var u = SB.c && SB.c.UM[g.kim]; return sbEsc(g.kanal) + " · " + tarih(g.zaman) + " " + String(g.zaman).slice(11, 16) + (u ? " · " + sbEsc((u.name || "").split(" ")[0]) : ""); }).join("<br>") : '<span class="u">Gönderim işaretlenmedi</span>';
  return sbKart("Güncel teklif · " + sbEsc(T.no || ""), '<div class="sbTo"><div class="sbToF"><b>' + (yt("teklif") ? sayi(T.fiyatUSD) + " $" : "—") + "</b><small>KDV hariç · " + sayi(T.kwp, 1) + " kWp" + (T.onceki ? " · revizyon (önceki " + sbEsc(T.onceki) + ")" : "") + "</small></div>" + '<span class="sbCh ' + (T.durum === "Anlaşıldı" ? "ok" : "o") + '">' + sbEsc(T.durum === "Gönderildi" ? "Onaylı · müşteride" : T.durum) + "</span></div>" +
    '<div class="sbKv"><span>Gerçek gönderim</span><b>' + gon + "</b></div>" + '<div class="sbKv"><span>Geçerlilik</span><b class="' + (T.durum === "Gönderildi" ? (kal < 0 ? "kt" : kal <= 2 ? "u" : "") : "") + '">' + tarih(gc) + (T.durum === "Gönderildi" ? (kal < 0 ? " · süresi doldu" : " · " + kal + " gün") : "") + "</b></div>" +
    (tk ? '<div class="sbKv"><span>Takip tarihi</span><b class="' + (tk < b && T.durum === "Gönderildi" ? "kt" : "") + '">' + tarih(tk) + "</b></div>" : "") + '<div class="sbKv"><span>Müşteri görüntüledi</span><b class="mut">bilinmiyor · izlenen bağlantı yok</b></div>' +
    (T.durum === "Gönderildi" && teklifci() ? '<div class="sbTkB">' + (waLink(a.tel) ? '<a class="btn sbBtn" href="' + waLink(a.tel, "Merhaba " + String(a.ad || "").split(" ")[0] + ", güneş enerjisi teklifimizi ekte iletiyoruz. Sorularınız için buradayız. D Solar") + '" target="_blank" rel="noopener">' + sbI("sbWa", "s") + "WhatsApp'ı aç</a>" : "") + '<button class="btn sbBtn pri" data-sbgon="' + T.id + '">' + sbI("sbGonder", "s") + "Gönderdim, kaydet</button></div><small class=\"sbNot\">WhatsApp'ı açmak gönderim sayılmaz. Teklifi gerçekten ilettikten sonra “Gönderdim” ile kaydedin.</small>" : ""), { c: "sbTo" });
}
function sbTeklifGonderBagla(a, X, yen) {
  bagT("[data-sbgon]", function (e) { var T = (X.T || []).filter(function (t) { return t.id === e.dataset.sbgon; })[0]; if (!T) return;
    panelAc('<div class="pnlB"><b>Gönderim kaydı</b><small>' + sbEsc(T.no || "") + '</small></div><div class="f"><div class="sbOp">' + ["WhatsApp", "E-posta", "Elden", "Diğer"].map(function (k, i) { return '<button type="button" data-sbgk="' + k + '" aria-pressed="' + !i + '">' + k + "</button>"; }).join("") + '</div><div class="f2"><label>Tarih<input id="sbGnT" type="date" value="' + bugun() + '"></label><label>Saat<input id="sbGnS" type="time" value="' + new Date().toTimeString().slice(0, 5) + '"></label></div><label>Takip tarihi<input id="sbGnK" type="date" value="' + (T.takipTarihi ? String(T.takipTarihi).slice(0, 10) : gunSonraIs(3)) + '"></label><button class="btn pri" id="sbGnB">Kaydet</button></div>', "alt");
    var k = "WhatsApp"; bagT("[data-sbgk]", function (x) { k = x.dataset.sbgk; Array.prototype.forEach.call(document.querySelectorAll("[data-sbgk]"), function (b) { b.setAttribute("aria-pressed", b === x); }); });
    $("sbGnB").onclick = function () { var z = $("sbGnT").value + " " + ($("sbGnS").value || "12:00") + ":00.000Z", L = (T.gonderimler || []).concat([{ kanal: k, kim: BEN.id, zaman: z, tur: "elle işaretlendi" }]), tk = $("sbGnK").value, bt = this; bt.disabled = true;
      api("/api/collections/teklifler/records/" + T.id, { method: "PATCH", body: { gonderimler: L, gonderildi: T.gonderildi || z, takipTarihi: tk ? tk + " 12:00:00.000Z" : null } })
        .then(function () { return api("/api/collections/gorusmeler/records", { method: "POST", body: { aday: a.id, metin: "Teklif " + (T.no || "") + " gönderildi · " + k, yazan: BEN.id } }); })
        .then(function () { return !a.sonrakiIs && tk ? api("/api/collections/adaylar/records/" + a.id, { method: "PATCH", body: { sonrakiIs: "Teklif cevabını sor", sonraki: tk + " 09:00:00.000Z" } }) : null; })
        .then(function () { panelKapat(); toast("Gönderim kaydedildi"); SB.detSek[a.id] = "teklif"; yen(); }).catch(function (e2) { bt.disabled = false; hata(e2); }); }; });
}
/* belgeler: teklif PDF'leri, keşif fotoğrafları, eski teklifler */
function sbBelgeler(a, X, PRJ) {
  var T = (X.T || []).filter(function (t) { return t.kalemler && t.kalemler.length; }), F = X.F || [], E = a.eskiTeklifler || [];
  var tk = T.length ? T.map(function (t) { return '<a class="sbBl" href="#tpdf/' + t.id + '">' + sbI("sbBelge") + "<span><b>Teklif " + sbEsc(t.no || "") + "</b><small>" + tarih(t.created) + " · " + sbEsc(t.durum) + " · kısa ve uzun PDF</small></span>" + sbI("sbSag", "s") + "</a>"; }).join("") : "";
  var sz = PRJ.some(function (k) { return k.id === "szK"; }) ? '<button class="sbBl" data-sbsek="proje">' + sbI("sbKalem") + "<span><b>Sözleşme</b><small>Proje sekmesinde · bilgiler ve çıktı</small></span>" + sbI("sbSag", "s") + "</button>" : "";
  var ft = '<div class="sbFoto" id="sbFoto">' + (F.length ? F.map(function (f) { return '<a class="sbFt" data-sbft="' + f.id + '" data-sbfd="' + sbEsc(f.dosya) + '" href="#" aria-label="Keşif fotoğrafı"></a>'; }).join("") : "") + "</div>";
  var yuk = yd("musteri") || yd("proje") ? '<label class="btn sbBtn sbYuk2">' + sbI("sbArti", "s") + 'Fotoğraf ekle<input type="file" id="sbFtY" accept="image/jpeg,image/png,image/heic" multiple hidden></label>' : "";
  var es = E.length ? '<div class="sbKv"><span>Eski teklifler (Beacon)</span><b>' + E.map(function (t) { return sbEsc([t.no, t.tarih ? tarih(t.tarih) : "", t.fiyatUSD ? sayi(t.fiyatUSD) + " $" : "", t.durum].filter(Boolean).join(" · ")); }).join("<br>") + "</b></div>" : "";
  return sbKart("Teklif ve sözleşme", tk || sz ? tk + sz : sbBos("sbBelge", "Henüz belge yok", "Teklif hazırlanınca PDF'i burada görünür.")) + sbKart("Keşif fotoğrafları", (F.length ? ft : sbBos("sbKonum", "Fotoğraf yok", "Keşifte çekilen çatı, pano ve sayaç fotoğraflarını ekleyin.") + ft) + yuk, { ks: F.length ? F.length + " fotoğraf" : "" }) + (es ? sbKart("Eski kayıtlar", es) : "");
}
function sbBelgeBagla(a, X, yen) {
  var F = document.querySelectorAll("[data-sbft]");
  if (F.length) api("/api/files/token", { method: "POST" }).then(function (j) { Array.prototype.forEach.call(F, function (e) { var u = "/api/files/kesif_foto/" + e.dataset.sbft + "/" + encodeURIComponent(e.dataset.sbfd) + "?token=" + j.token; e.style.backgroundImage = "url('" + u + "&thumb=300x300')"; e.href = u; e.target = "_blank"; e.onclick = null; }); }).catch(function () {});
  var y = $("sbFtY"); if (y) y.onchange = function () { var L = Array.prototype.slice.call(y.files || []); if (!L.length) return; toast(L.length + " fotoğraf yükleniyor…");
    sirali(L, function (f) { var fd = new FormData(); fd.append("aday", a.id); fd.append("dosya", f); return fetch("/api/collections/kesif_foto/records", { method: "POST", headers: { Authorization: TOK }, body: fd }).then(function (r) { if (!r.ok) return r.json().then(function (j) { throw new Error(j.message || "Yüklenemedi"); }); }); })
      .then(function () { toast("Fotoğraflar eklendi"); SB.detSek[a.id] = "belge"; yen(); }).catch(hata); };
}
function sbProjeOzet(X) {
  var d = document.createElement("div"), V = X.V, P = V && V.PM[X.a.id]; if (!P) return d;
  var D = prjDurum(P), yuz = D.top ? Math.round(D.tamam / D.top * 100) : 0, kur = (V && V.kur) || 0, tah = V && V.F ? V.F.filter(function (h) { return h.aday === X.a.id && h.durum === "Gerçekleşti"; }).reduce(function (s, h) { return s + (h.pb === "TRY" ? +h.tutar : (+h.tutar || 0) * ((+h.kur) || kur)); }, 0) : null;
  var son = D.sonraki[0];
  d.innerHTML = '<div class="sbPan sbPanP"><div class="sbPanU2"><div><span class="sbLb">Proje · ' + sbEsc(P.tur || "Anahtar teslim") + '</span><div class="sbBig">%' + yuz + ' <small>tamamlandı</small></div></div><span class="sbCh d">' + sbEsc(P.durum || "Sürüyor") + '</span></div><div class="sbPanB"><b style="width:' + yuz + '%"></b></div>' +
    '<div class="sbPanG"><div><b>' + (P.kwp ? sayi(P.kwp, 1) + " kWp" : "—") + "</b><span>kapasite</span></div><div><b>" + (yt("teklif") || yt("fin") ? sayi(P.bedelUsd) + " $" : "—") + "</b><span>sözleşme bedeli · KDV hariç</span></div><div><b>" + (tah != null ? sbTL(tah) : "—") + "</b><span>" + (tah != null ? "tahsil edildi · Finans" : "tahsilat · Finans yetkisi gerekli") + "</span></div><div><b>" + (son ? sbEsc(son.ad) : "Tamamlandı") + "</b><span>" + (son ? "sıradaki · son tarih " + tarih(son.son) : "tüm adımlar") + "</span></div></div></div>" +
    (D.kirmizi.length ? '<div class="sbUy kt">' + sbI("sbUyari", "s") + "<span><b>Geciken adım:</b> " + sbEsc(D.kirmizi.join(" · ")) + "</span></div>" : "");
  return d;
}
