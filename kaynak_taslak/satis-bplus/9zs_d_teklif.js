/* v91 · Satış B+ — Teklifler panosu ve 5 adımlı teklif sihirbazı (Sistem → Ekipman → Fiyat → Ödeme → Önizleme).
   Hesap, katalog, revizyon, onay ve PDF mevcut koddan gelir; burada yalnız düzen, ara kayıt ve ödeme seçenekleri eklenir. */
var SB_ODEME = [["pesin", "Peşin", "tamamı sözleşmede"], ["yariyari", "%50 sözleşme · %50 montaj", "mevcut ödeme planı"], ["uc", "3 eşit taksit (firma içi)", "sözleşme · montaj · kabul"]];
function sTekliflerB() {
  sbNav(); var m = $("m");
  if (TF.sek === "eski") { m.className = ""; SB_TEKLIFLER0(); sbBekle(function () { return $("m").querySelector("[data-tfs]") ? 1 : null; }, function () { m.classList.add("sbEskiT"); }); return; }
  m.className = "sbM"; if (!m.querySelector(".sbTkS")) m.innerHTML = sbIskelet();
  Promise.all([liste("teklifler", "", "-created", "aday,hazirlayan"), sbVeri().catch(function () { return null; })]).then(function (R) {
    var T = R[0], V = R[1], b = bugun(), g = function (d) { return T.filter(function (t) { return d.indexOf(t.durum) >= 0; }); }, top = function (L) { return L.reduce(function (s, t) { return s + (+t.fiyatUSD || 0); }, 0); };
    var son = {}; T.forEach(function (t) { if (!son[t.aday] || t.created > son[t.aday].created) son[t.aday] = t; });
    var guncel = function (t) { return son[t.aday] === t; }, gecS = function (t) { return t.gecerlilik ? String(t.gecerlilik).slice(0, 10) : tkGecSon(t); };
    var onb = g(["Onay bekliyor", "Taslak"]).filter(guncel), gon = g(["Gönderildi"]).filter(guncel), gonG = gon.filter(function (t) { return gecS(t) >= b; }), anl = g(["Anlaşıldı"]), kay = g(["Kaybedildi"]), ay = b.slice(0, 7);
    var anlAy = anl.filter(function (t) { return String(t.updated || t.created).slice(0, 7) === ay; }), son30 = anl.concat(kay).filter(function (t) { return String(t.updated).slice(0, 10) >= sbGunEkle(b, -90); });
    var kart = function (t) { var a = (t.expand || {}).aday || {}, hz = (t.expand || {}).hazirlayan || {}, gs = gecS(t), kal = gunFark(b, gs), G = t.gonderimler || [];
      var dur = t.durum === "Gönderildi" ? (kal < 0 ? '<span class="sbCh kt">süresi doldu</span>' : kal <= 2 ? '<span class="sbCh u">' + (kal ? kal + " gün kaldı" : "bugün bitiyor") + "</span>" : '<span class="sbCh">' + tarih(gs).slice(0, 5) + "’e kadar</span>") + (G.length ? '<span class="sbCh ok">gönderildi · ' + sbEsc(G[G.length - 1].kanal) + "</span>" : '<span class="sbCh">gönderim işaretlenmedi</span>') :
        t.durum === "Anlaşıldı" ? '<span class="sbCh ok">Anlaşıldı</span>' : t.durum === "Kaybedildi" ? '<span class="sbCh kt">Kaybedildi</span>' : '<span class="sbCh o">' + sbEsc(t.durum) + "</span>";
      return '<div class="sbTk" data-sbgit="' + t.aday + '"><div class="sbTkU"><b>' + sbEsc(a.ad || "—") + '</b><b class="n">' + sayi(t.fiyatUSD) + ' $</b></div><small>' + sbEsc([t.no, sayi(t.kwp, 1) + " kWp", t.tip, tarih(t.created), hz.name ? hz.name.split(" ")[0] : ""].filter(Boolean).join(" · ")) + (t.onceki ? " · rev." : "") + '</small><div class="sbTkC">' + dur + "</div>" + '<div class="cB sbTkA">' + tkButon(t) + "</div></div>"; };
    var kol = function (k, bas, L) { return '<section class="sbK sbTkKol" data-sbtkk="' + k + '"><div class="sbKh"><h2>' + bas + ' <span class="sbSay">' + L.length + '</span></h2><span class="sbKs">' + sayi(top(L)) + " $</span></div>" + (L.map(kart).join("") || sbBos("sbBelge", "Teklif yok", "")) + "</section>"; };
    var sek = SB.tkSek || (onb.length && yon() ? "onay" : "musteride");
    var ust = sbBas("Teklifler", (onb.length ? onb.length + " onay bekliyor · " : "") + gonG.length + " müşteride", (satisci() ? '<a class="btn sbBtn sbMas" href="#katalog">' + sbI("sbKutu", "s") + "Katalog</a>" : "")) +
      '<div class="sbSeg" style="margin-bottom:10px"><button data-tfs="app" aria-pressed="true">Uygulama teklifleri</button><button data-tfs="eski" aria-pressed="false">Eski teklifler (Beacon)</button></div>';
    var kp = '<div class="sbKp">' + sbKpi("sbBelge", "Onay bekleyen", onb.length, sayi(top(onb)) + " $", "#teklifler", null, onb.length && yon() ? "kt" : "") + sbKpi("sbGonder", "Müşteride (geçerli)", gonG.length, sayi(top(gonG)) + " $ · " + (gon.length - gonG.length) + " süresi dolmuş", "#teklifler", null) +
      sbKpi("sbOk", "Bu ay anlaşılan", anlAy.length, sayi(top(anlAy)) + " $", "#teklifler", null) + sbKpi("sbTrend", "Kazanma oranı", son30.length ? "%" + sayi(son30.filter(function (t) { return t.durum === "Anlaşıldı"; }).length / son30.length * 100) : "—", "son 90 gün · " + son30.length + " sonuçlanan", "#teklifler", null) + "</div>";
    var mseg = '<div class="sbSeg w sbMob" role="tablist">' + [["onay", "Onay", onb.length], ["musteride", "Müşteride", gon.length], ["sonuc", "Sonuçlanan", anl.length + kay.length]].map(function (x) { return '<button role="tab" data-sbtks="' + x[0] + '" aria-selected="' + (sek === x[0]) + '">' + x[1] + ' <span class="sbSay">' + x[2] + "</span></button>"; }).join("") + "</div>";
    m.innerHTML = '<div class="sbSayfa sbTkS">' + ust + kp + mseg + '<div class="sbTkP" data-sbsek="' + sek + '">' + kol("onay", "Onay bekleyen", onb) + kol("musteride", "Müşteride", gon) + kol("sonuc", "Sonuçlanan", g(["Anlaşıldı", "Kaybedildi"]).slice(0, 60)) + "</div></div>";
    bagT("[data-tfs]", function (e) { TF.sek = e.dataset.tfs; sTeklifler(); });
    bagT("[data-sbtks]", function (e) { SB.tkSek = e.dataset.sbtks; document.querySelector(".sbTkP").dataset.sbsek = SB.tkSek; Array.prototype.forEach.call(document.querySelectorAll("[data-sbtks]"), function (x) { x.setAttribute("aria-selected", x === e); }); });
    teklifBagla(function () { sbSifirla(); sTeklifler(); }); sbGitBagla2();
  }).catch(function (e) { m.innerHTML = '<div class="sbSayfa">' + sbBos("sbUyari", "Teklifler yüklenemedi", sbEsc(e.message || "")) + "</div>"; });
}
/* ---- sihirbaz ---- */
function sbTkAnahtar(arg) { return "sbTk:" + String(arg || ""); }
function sbTkTaslakOku(arg) { try { var s = JSON.parse(localStorage.getItem(sbTkAnahtar(arg)) || "null"); if (s && s.t > Date.now() - 14 * 864e5) return s; } catch (e) {} return null; }
function sbTkTaslakYaz(arg, adim) { try { if (!TK) return; localStorage.setItem(sbTkAnahtar(arg), JSON.stringify({ t: Date.now(), tk: TK, adim: adim || 1, odeme: SB.tkOdeme[arg] || null })); } catch (e) {} }
function sbTkTaslakSil(arg) { try { localStorage.removeItem(sbTkAnahtar(arg)); } catch (e) {} }
SB.tkOdeme = {};
function sTeklifB(arg) {
  sbNav(); var m = $("m"); m.className = "sbM";
  var p = String(arg || "").split(","), ilk = !TK || TK.adayId !== p[0] || (TK.tId || undefined) !== (p[1] || undefined), tas = ilk ? sbTkTaslakOku(arg) : null;
  if (!m.querySelector("#kKay")) m.innerHTML = sbIskelet();
  SB_TEKLIF0(arg);
  sbBekle(function () { return $("kKay") ? 1 : null; }, function () { Promise.all([sbVeri().catch(function () { return null; }), api("/api/collections/adaylar/records/" + p[0]).catch(function () { return {}; }), p[1] ? api("/api/collections/teklifler/records/" + p[1]).catch(function () { return null; }) : Promise.resolve(null)]).then(function (R) { sbSihirbaz(arg, R[0], R[1], R[2], tas); }); });
}
function sbSihirbaz(arg, V, a, eski, tas) {
  var m = $("m"); if (!m || m.querySelector(".sbWz") || !$("kKay")) return;
  var kartlar = Array.prototype.slice.call(m.querySelectorAll(".card")), uy = m.querySelector(".uyari"), k1 = kartlar.filter(function (k) { return k.querySelector("#kTip"); })[0], k2 = kartlar.filter(function (k) { return k.querySelector("#kEk"); })[0], k3 = kartlar.filter(function (k) { return k.querySelector("#kKay"); })[0];
  if (!k1 || !k2 || !k3) return;
  var adim = SB.tkAdim[arg] || (tas && tas.adim) || 1; SB.tkAdim[arg] = adim;
  if (SB.tkOdeme[arg] == null) SB.tkOdeme[arg] = (tas && tas.odeme) || (eski && eski.odeme && eski.odeme.secenek) || ["yariyari"];
  var H = (V && V.H) || {}, Tz = typeof tkAyar === "function" ? tkAyar((V && V.TA) || {}, H) : {}, S = null; try { S = tkHesap(TK, H, Tz); } catch (e) { S = null; }
  var fiyatYet = !!yt("fiyat"), kdv = +(H.kdv == null ? 0.2 : H.kdv), kur = (TK && TK.kur) || H.kur || 0;
  /* üst bilgi + adımlar */
  var A = ["Sistem", "Ekipman", "Fiyat", "Ödeme", "Önizleme"], rev = eski && (eski.durum === "Gönderildi" || eski.durum === "Anlaşıldı");
  var w = document.createElement("div"); w.className = "sbSayfa sbWz";
  w.innerHTML = sbBas(eski ? (rev ? "Revizyon · " : "Teklifi düzenle · ") + sbEsc(eski.no || "") : "Yeni teklif", sbEsc([a.ad, a.ilce, a.aylikFatura > 0 ? "fatura " + sayi(a.aylikFatura) + " ₺/ay" : a.yillikKwh > 0 ? sayi(a.yillikKwh) + " kWh/yıl" : ""].filter(Boolean).join(" · ")) + ' <span class="sbCh ok" id="sbTkTs">' + sbI("sbKaydet", "xs") + "Ara kayıt bu cihazda</span>", "", "#aday/" + String(arg).split(",")[0]) +
    (tas ? '<div class="sbUy" id="sbTkDv">' + sbI("sbGecmis", "s") + "<span><b>Yarım kalan teklif var</b> · " + new Date(tas.t).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) + ' · ' + (tas.tk.kalemler || []).length + ' kalem</span><button class="btn sbBtn k pri" id="sbTkDvE">Kaldığım yerden devam</button><button class="btn sbBtn k" id="sbTkDvH">Yeniden başla</button></div>' : "") +
    (rev ? '<div class="sbUy">' + sbI("sbKilit", "s") + "<span>Bu teklif onaylı. Kaydettiğinizde <b>yeni revizyon</b> açılır; mevcut teklifin fiyatı değişmez.</span></div>" : "") +
    '<ol class="sbWzA">' + A.map(function (x, i) { return '<li><button data-sbadim="' + (i + 1) + '" class="' + (i + 1 < adim ? "d" : i + 1 === adim ? "s" : "") + '"' + (i + 1 === adim ? ' aria-current="step"' : "") + "><i>" + (i + 1 < adim ? "✓" : i + 1) + "</i><span>" + x + "</span></button></li>"; }).join("") + "</ol>";
  var gov = document.createElement("div"); gov.className = "sbWzG"; var sol = document.createElement("div"); sol.className = "sbWzS"; var sag = document.createElement("aside"); sag.className = "sbWzO"; gov.appendChild(sol); gov.appendChild(sag); w.appendChild(gov);
  var pane = {}; [1, 2, 3, 4, 5].forEach(function (i) { var d = document.createElement("div"); d.className = "sbPane"; d.dataset.sbadimp = i; d.hidden = i !== adim; pane[i] = d; sol.appendChild(d); });
  /* 1 · sistem */
  k1.classList.add("sbWzK"); var h1 = k1.querySelector("h3"); if (h1) h1.textContent = "Sistem seçimi"; pane[1].appendChild(k1);
  pane[1].insertAdjacentHTML("beforeend", S ? sbKart("Önerilen sistem", '<div class="sbKv"><span>Güç</span><b>' + sayi(S.kwp, 2) + " kWp · " + (S.panelAdet || "") + ' panel</b></div><div class="sbKv"><span>Yıllık üretim (tahmini)</span><b>' + sayi(S.uretim) + " kWh</b></div>" + (a.yillikKwh > 0 || a.aylikFatura > 0 ? '<div class="sbKv"><span>Müşteri tüketimi</span><b>' + (a.yillikKwh > 0 ? sayi(a.yillikKwh) + " kWh/yıl" : sayi(a.aylikFatura) + " ₺/ay fatura") + "</b></div>" : "")) : "");
  /* 2 · ekipman */
  var h2 = k2.querySelector("h3"); if (h2) h2.firstChild.textContent = "Ekipman "; if (!fiyatYet) { var sm = h2 && h2.querySelector("small"); if (sm) sm.hidden = true; } pane[2].appendChild(k2); if (uy) { uy.classList.add("sbUy"); pane[2].appendChild(uy); }
  /* 3 · fiyat */
  var kv = k3.querySelector(".kv"), f3 = k3.querySelector(".f"), not = $("kNot"), kay = $("kKay"), marj = $("kMarj");
  var c3 = document.createElement("section"); c3.className = "sbK"; c3.innerHTML = '<div class="sbKh"><h2>Fiyatlandırma</h2><span class="sbKs">mevcut hesap · ' + (kur ? "1 $ = " + sayi(kur, 2) + " ₺" : "") + "</span></div>";
  if (kv) { if (!fiyatYet) { var ilkD = kv.firstElementChild; if (ilkD && /Maliyet/.test(ilkD.textContent)) ilkD.hidden = true; } c3.appendChild(kv); }
  if (marj) { var lb = marj.closest("label"); if (lb) { lb.classList.add("sbMarj"); lb.insertAdjacentHTML("afterbegin", '<i class="sbEtN">yalnız yetkili</i> '); c3.appendChild(lb); } }
  c3.insertAdjacentHTML("beforeend", S ? '<div class="sbFyT"><div><small>Teklif · KDV hariç</small><b>' + sayi(S.fiyat) + " $</b></div><div><small>≈ TL · KDV dahil</small><b>" + (kur ? sayi(Math.round(S.fiyat * kur * (1 + kdv) / 100) * 100) + " ₺" : "—") + "</b></div></div>" : "");
  c3.insertAdjacentHTML("beforeend", '<div class="sbKil">' + sbI("sbKilit", "s") + (fiyatYet ? "Maliyet ve kâr payı yalnız fiyat yetkisi olanlara görünür." : "Maliyet ve kâr payı bu hesapta gösterilmez; fiyat mevcut kurallarla hesaplanır.") + "</div>");
  pane[3].appendChild(c3);
  /* 4 · ödeme */
  var sec = SB.tkOdeme[arg];
  pane[4].innerHTML = sbKart("Ödeme seçenekleri", '<div class="sbSc">' + SB_ODEME.map(function (o) { var on = sec.indexOf(o[0]) >= 0; return '<button type="button" class="sbSo" data-sbod="' + o[0] + '" aria-pressed="' + on + '"><span class="sbIk sbIk-p">' + sbI(o[0] === "pesin" ? "sbNakit" : o[0] === "uc" ? "sbTakvim" : "sbNakit") + '</span><span class="sbSoT"><b>' + o[1] + "</b><small>" + o[2] + (S && kur ? " · " + (o[0] === "pesin" ? sayi(S.fiyat) + " $" : o[0] === "yariyari" ? "2 × " + sayi(S.fiyat / 2) + " $" : "3 × " + sayi(S.fiyat / 3) + " $") : "") + '</small></span><span class="sbCb' + (on ? " on" : "") + '">' + (on ? sbI("sbOk", "xs") : "") + "</span></button>"; }).join("") +
    '<div class="sbSo dis" aria-disabled="true"><span class="sbIk">' + sbI("sbBanka") + '</span><span class="sbSoT"><b>Banka finansmanı</b><small>Bağlı banka anlaşması yok · gerçek koşullar girilmeden teklife eklenmez</small></span><span class="sbCh">yakında</span></div></div><small class="sbNot">Seçenekler teklif kaydına yazılır ve müşteri sayfasında görünür; PDF tasarımı değişmez.</small>', { ks: "teklifte konuşulacaklar" });
  /* 5 · önizleme */
  var pnl = TK && TK.kalemler ? TK.kalemler.filter(function (k) { return k.kat === "panel"; })[0] : null, inv = TK && TK.kalemler ? TK.kalemler.filter(function (k) { return k.kat === "inverter"; })[0] : null, aku = TK && TK.kalemler ? TK.kalemler.filter(function (k) { return k.kat === "aku"; })[0] : null;
  var c5 = document.createElement("section"); c5.className = "sbK";
  c5.innerHTML = '<div class="sbKh"><h2>Önizleme ve onay</h2></div><div class="sbKv"><span>Müşteri</span><b>' + sbEsc(a.ad || "") + '</b></div><div class="sbKv"><span>Sistem</span><b>' + sbEsc((TK && TK.tip) || "") + (S ? " · " + sayi(S.kwp, 2) + " kWp" : "") + "</b></div>" +
    (pnl ? '<div class="sbKv"><span>Panel</span><b>' + sayi(pnl.adet) + " × " + sbEsc(pnl.ad) + "</b></div>" : "") + (inv ? '<div class="sbKv"><span>İnverter</span><b>' + sbEsc(inv.ad) + "</b></div>" : "") + (aku ? '<div class="sbKv"><span>Batarya</span><b>' + sayi(aku.adet) + " × " + sbEsc(aku.ad) + "</b></div>" : "") +
    '<div class="sbKv"><span>Kalem</span><b>' + ((TK && TK.kalemler) || []).length + '</b></div><div class="sbKv sbKvT"><span>Teklif · KDV hariç</span><b>' + (S ? sayi(S.fiyat) + " $" : "—") + '</b></div><div class="sbKv"><span>Ödeme</span><b>' + sec.map(function (k) { return (SB_ODEME.filter(function (o) { return o[0] === k; })[0] || ["", k])[1]; }).join("<br>") + "</b></div>";
  if (not) { var nl = not.closest("label"); if (nl) c5.appendChild(nl); }
  var kd = document.createElement("div"); kd.className = "sbKayD"; kd.appendChild(kay); var nt = kay.nextElementSibling; c5.appendChild(kd);
  c5.insertAdjacentHTML("beforeend", '<div class="sbKil">' + sbI("sbKilit", "s") + (yon() ? "Kaydedince PDF açılır; kısa ve uzun PDF aynen korunur." : "Kaydedince yönetici onayına düşer; onaylanana kadar PDF'te “onay bekliyor” yazar.") + " Müşteriye otomatik hiçbir şey gönderilmez.</div>");
  pane[5].appendChild(c5); void nt; if (f3) f3.hidden = true;
  /* canlı özet (masaüstü) */
  sag.innerHTML = sbKart("Teklif özeti", '<div class="sbKv"><span>Sistem</span><b>' + sbEsc((TK && TK.tip) || "—") + "</b></div>" + (S ? '<div class="sbKv"><span>Güç</span><b>' + sayi(S.kwp, 2) + " kWp</b></div><div class=\"sbKv\"><span>Panel</span><b>" + (S.panelAdet || "—") + '</b></div><div class="sbKv"><span>Yıllık üretim</span><b>' + sayi(S.uretim) + " kWh</b></div>" : "") +
    (inv ? '<div class="sbKv"><span>İnverter</span><b>' + sbEsc(inv.ad) + "</b></div>" : "") + '<div class="sbKv sbKvT"><span>Fiyat · KDV hariç</span><b>' + (S ? sayi(S.fiyat) + " $" : "—") + "</b></div>" + (S && kur ? '<div class="sbKv"><span>≈ KDV dahil</span><b>' + sayi(Math.round(S.fiyat * kur * (1 + kdv) / 100) * 100) + " ₺</b></div>" : "") +
    '<div class="sbKil">' + sbI("sbKilit", "s") + "Maliyet ve marj yalnız yetkili kişilere görünür.</div>", { ks: "canlı" });
  /* alt çubuk */
  var alt = document.createElement("div"); alt.className = "sbWzAlt";
  alt.innerHTML = '<button class="btn sbBtn" id="sbWzG">' + (adim > 1 ? "Geri" : "Vazgeç") + '</button><div class="sbWzF"><small>' + (adim >= 3 ? "Teklif · KDV hariç" : "Taslak bu cihazda saklanır") + "</small><b>" + (adim >= 3 && S ? sayi(S.fiyat) + " $" : S ? sayi(S.kwp, 2) + " kWp " + sbEsc((TK && TK.tip) || "") : "") + "</b></div>" + (adim < 5 ? '<button class="btn sbBtn or" id="sbWzI">' + ["", "Ekipmana geç", "Fiyata geç", "Ödemeye geç", "Önizle"][adim] + "</button>" : '<button class="btn sbBtn or" id="sbWzK">' + sbEsc(kay.textContent) + "</button>");
  /* yerleştir */
  var gr = m.querySelector("a[href^='#aday/']"); if (gr && gr.parentNode === m) gr.remove();
  Array.prototype.slice.call(m.children).forEach(function (c) { if (c !== w) c.remove(); });
  m.appendChild(w); m.appendChild(alt); document.body.classList.add("sbWzV");
  var git = function (n) { n = Math.max(1, Math.min(5, n)); SB.tkAdim[arg] = n; sbTkTaslakYaz(arg, n); m.innerHTML = ""; sTeklif(arg); window.scrollTo(0, 0); };
  bagT("[data-sbadim]", function (e) { git(+e.dataset.sbadim); });
  $("sbWzG").onclick = function () { if (adim > 1) git(adim - 1); else location.hash = "#aday/" + String(arg).split(",")[0]; };
  if ($("sbWzI")) $("sbWzI").onclick = function () { if (adim === 2 && TK && !TK.kalemler.some(function (k) { return k.kat === "inverter"; })) { toast("İnvertör seçilmedi"); return; } git(adim + 1); };
  kay.addEventListener("click", function () { SB.tkKaydet = { arg: arg, odeme: sec.slice() }; }, true);
  if ($("sbWzK")) $("sbWzK").onclick = function () { kay.click(); };
  bagT("[data-sbod]", function (e) { var k = e.dataset.sbod, i = sec.indexOf(k); if (i >= 0) sec.splice(i, 1); else sec.push(k); SB.tkOdeme[arg] = sec; sbTkTaslakYaz(arg, adim); git(adim); });
  if ($("sbTkDvE")) $("sbTkDvE").onclick = function () { TK = tas.tk; SB.tkAdim[arg] = tas.adim || 1; SB.tkOdeme[arg] = tas.odeme || SB.tkOdeme[arg]; m.innerHTML = ""; sTeklif(arg); };
  if ($("sbTkDvH")) $("sbTkDvH").onclick = function () { sbTkTaslakSil(arg); var d = $("sbTkDv"); if (d) d.remove(); };
  /* her değişiklikte ara kayıt (mevcut hesap her girişte sayfayı yeniden çizer) */
  if (!tas) sbTkTaslakYaz(arg, adim);
  var ts = $("sbTkTs"); if (ts && !tas) ts.lastChild.textContent = "Ara kayıt " + new Date().toTimeString().slice(0, 5);
  if (not) not.addEventListener("input", function () { sbTkTaslakYaz(arg, adim); });
}
/* kayıt sonrası: taslağı sil, ödeme seçeneklerini teklif kaydına yaz */
window.addEventListener("hashchange", function (e) {
  if (!/#teklif\//.test(location.hash)) document.body.classList.remove("sbWzV");
  var k = SB.tkKaydet; if (!k || !/^#tpdf\//.test(location.hash)) return; SB.tkKaydet = null; sbTkTaslakSil(k.arg); delete SB.tkAdim[k.arg];
  var id = location.hash.split("/")[1]; api("/api/collections/teklifler/records/" + id, { method: "PATCH", body: { odeme: { secenek: k.odeme, finansman: false } } }).catch(function () {}); void e;
});
