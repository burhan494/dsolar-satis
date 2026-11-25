/* v93 · D Solar — Final Premium Experience: üst menü, hızlı işlem (+), genel arama, bildirim merkezi, profil ve ayarlar.
   Param ekranında bu katman devre dışıdır: Param'ın üst menüsü, hızlı işlemi ve görünümü değişmez. */
function fkParamMi() { return /^#param/.test(location.hash || ""); }
function fkKabukSinif() { document.body.classList.toggle("fkK", !fkParamMi()); var s = (location.hash.replace(/^#/, "").split("/")[0]) || "bugun"; document.body.dataset.fkmod = aktifAna(s) || s; }
window.addEventListener("hashchange", fkKabukSinif);
/* ---------- HIZLI İŞLEM (+) ---------- */
var FK_HZ = [
  ["satis", "Satış", "#7c3aed", [["musteri", "Yeni müşteri", "sbKisi", function () { return yd("musteri"); }], ["teklif", "Yeni teklif", "sbBelge", function () { return yd("teklif"); }], ["gorusme", "Görüşme kaydı", "sbNot", function () { return yd("musteri"); }], ["kesif", "Keşif planla", "sbTakvim", function () { return yd("musteri"); }]]],
  ["finans", "Finans", "#059669", [["gelir", "Gelir kaydı", "fbAsagiOk", function () { return yd("fin"); }], ["tahsilat", "Tahsilat", "sbNakit", function () { return yd("fin"); }], ["gider", "Gider kaydı", "fbYukariOk", function () { return yd("fin") || yd("odeme"); }], ["odeme", "Ödeme", "fbOdeme", function () { return yd("fin") || yd("odeme"); }], ["transfer", "Hesaplar arası transfer", "fbBorc", function () { return yd("fin"); }]]],
  ["genel", "Genel", "#2563eb", [["gorev", "Yeni görev", "sbGorev", fkGorevYetki], ["hatirlatma", "Hatırlatma", "fkZil", fkGorevYetki], ["not", "Not", "sbKalem", function () { return yd("musteri"); }], ["toplanti", "Toplantı", "sbKisi", fkGorevYetki]]],
  ["ges", "GES", "#f59e0b", [["olay", "Arıza / olay kaydı", "fkGunes", function () { return yd("ges"); }]]]];
function fkGorevYetki() { return yd("musteri") || yd("proje"); }
function fkHzListe() { var L = []; FK_HZ.forEach(function (g) { g[3].forEach(function (x) { if (x[3]()) L.push({ id: x[0], ad: x[1], ik: x[2], kat: g[0], katAd: g[1], renk: g[2] }); }); }); return L; }
function fkHizliAc() {
  if (fkParamMi() || rol() === "ortak") return fkHizliAc0();
  var L = fkHzListe(), T = fkT().hizli || {}, fav = T.fav || [], say = T.say || {}, mod = document.body.dataset.fkmod;
  var modKat = mod === "satis" ? "satis" : mod === "finans" ? "finans" : mod === "ges" ? "ges" : "";
  var sik = L.filter(function (x) { return fav.indexOf(x.id) >= 0 || say[x.id] > 0; }).sort(function (a, b) { return (fav.indexOf(b.id) >= 0) - (fav.indexOf(a.id) >= 0) || (say[b.id] || 0) - (say[a.id] || 0); }).slice(0, 4);
  var btn = function (x) { return '<div class="fkHzB"><button class="fkHzA" data-fkhz="' + x.id + '"><span class="fkHzI" style="--c:' + x.renk + '">' + fkI(x.ik) + "</span><span>" + x.ad + '</span></button><button class="fkHzF' + (fav.indexOf(x.id) >= 0 ? " on" : "") + '" data-fkhzf="' + x.id + '" aria-label="Favori" aria-pressed="' + (fav.indexOf(x.id) >= 0) + '">' + fkI("fkYildiz", "xs") + "</button></div>"; };
  var katlar = FK_HZ.map(function (g) { return g[0]; }); if (modKat) katlar = [modKat].concat(katlar.filter(function (k) { return k !== modKat; }));
  var h = '<div class="fkPnB"><b>Hızlı işlem</b><small>' + (modKat ? "Bulunduğunuz bölümün işlemleri üstte" : "Yıldızla favorilere ekleyin") + "</small></div>" + (sik.length ? '<div class="fkHzG"><div class="fkHzK">Sık kullanılanlar</div><div class="fkHzL">' + sik.map(btn).join("") + "</div></div>" : "") +
    katlar.map(function (k) { var X = L.filter(function (x) { return x.kat === k; }); if (!X.length) return ""; return '<div class="fkHzG"><div class="fkHzK">' + X[0].katAd + '</div><div class="fkHzL">' + X.map(btn).join("") + "</div></div>"; }).join("") + '<div id="hzF"></div>';
  panelAc(h, "alt fkPnl fkHzP");
  bagT("[data-fkhzf]", function (e) { var id = e.dataset.fkhzf; fkTKaydet(function (t) { t.hizli = t.hizli || {}; var f = t.hizli.fav = t.hizli.fav || [], i = f.indexOf(id); if (i >= 0) f.splice(i, 1); else f.push(id); }); e.classList.toggle("on"); e.setAttribute("aria-pressed", e.classList.contains("on")); });
  bagT("[data-fkhz]", function (e) { var id = e.dataset.fkhz; fkTKaydet(function (t) { t.hizli = t.hizli || {}; t.hizli.say = t.hizli.say || {}; t.hizli.say[id] = (t.hizli.say[id] || 0) + 1; }); fkHzCalistir(id); });
}
/* mevcut işlem formları kullanılır; aynı kaydın ikinci bir mekanizması yok */
function fkHzCalistir(id) {
  var git = function (h, f) { panelKapat(); if (location.hash === h) { if (f) f(); else ciz(); } else { if (f) { var n = 0, iv = setInterval(function () { if (++n > 40) clearInterval(iv); if (location.hash === h && document.querySelector("#fm,.fkM,.sbM")) { clearInterval(iv); setTimeout(f, 600); } }, 150); } location.hash = h; } };
  if (id === "musteri") { document.querySelector("#hzF").innerHTML = ""; return hizliMusteri($("hzF")); }
  if (id === "teklif" || id === "gorusme" || id === "not") { panelKapat(); HIZLI.sonra = id === "teklif" ? "teklif" : "not"; araAc(); setTimeout(function () { var s = $("fkAraS") || $("arS"); if (s) s.insertAdjacentHTML("afterbegin", '<div class="fkAraIp">' + (id === "teklif" ? "Teklif hazırlanacak" : id === "gorusme" ? "Görüşme kaydı yazılacak" : "Not yazılacak") + " müşteriyi arayın.</div>"); }, 60); return; }
  if (id === "kesif") return git("#planlama");
  if (id === "gelir" || id === "tahsilat") { panelKapat(); HIZLI.fin = "tahsilat"; location.hash = "#finans/plan"; if (location.hash === "#finans/plan") sFinans("plan"); return; }
  if (id === "gider" || id === "odeme") { panelKapat(); HIZLI.fin = "gider"; var h = yt("fin") ? "#finans/plan" : "#finans/odeme"; location.hash = h; if (location.hash === h) sFinans(h.split("/")[1]); return; }
  if (id === "transfer") return git("#finans/kasa", function () { if (typeof fbTransfer === "function" && FB.v) fbTransfer(); });
  if (id === "gorev" || id === "hatirlatma" || id === "toplanti") return fkGorevForm(id);
  if (id === "olay") return hizliOlay($("hzF"));
}
/* genel görev / hatırlatma / toplantı: Satış B+ görev tablosuna (gorevler) yazılır, Bugün ajandasında görünür */
function fkGorevForm(tur) {
  var T = { gorev: ["Yeni görev", "Diğer"], hatirlatma: ["Hatırlatma", "Hatırlatma"], toplanti: ["Toplantı", "Toplantı"] }[tur];
  $("hzF").innerHTML = '<div class="fkFrm"><div class="fkHzK">' + T[0] + '</div><label class="fbLbl">Başlık<input id="fkGB" maxlength="200" placeholder="' + (tur === "toplanti" ? "ör. Banka görüşmesi" : tur === "hatirlatma" ? "ör. Sigorta poliçesini yenile" : "ör. Teklif şablonunu güncelle") + '"></label>' +
    '<div class="fbIki"><label class="fbLbl">Tarih<input id="fkGT" type="date" value="' + bugun() + '"></label><label class="fbLbl">Saat (isteğe bağlı)<input id="fkGS" type="time"></label></div>' + (tur === "toplanti" ? '<label class="fbLbl">Yer<input id="fkGY" maxlength="300" placeholder="ör. Ofis / online"></label>' : "") +
    '<button class="sbBtn or fkTam" id="fkGK">Kaydet</button><small class="fkNot">Size atanır ve Bugün ajandanızda görünür. Hiçbir müşteri kaydını değiştirmez.</small></div>';
  setTimeout(function () { $("fkGB").focus(); }, 30);
  $("fkGK").onclick = function () { var b = $("fkGB").value.trim(), bt = this; if (!b) { toast("Başlık yazın"); return; } var s = $("fkGS").value, t = $("fkGT").value || bugun(); bt.disabled = true;
    api("/api/collections/gorevler/records", { method: "POST", body: { tur: T[1], baslik: b, tarih: t + " " + (s ? s + ":00" : "09:00:00") + ".000Z", saatli: !!s, sorumlu: [BEN.id], durum: "Açık", oncelik: "Normal", adres: $("fkGY") ? $("fkGY").value.trim() : "", olusturan: BEN.id } })
      .then(function () { panelKapat(); toast(T[0] + " kaydedildi"); FK.c = null; if (SB) SB.c = null; if (!location.hash || location.hash === "#bugun") sCeo(); }).catch(function (e) { bt.disabled = false; hata(e); }); };
}
/* ---------- GENEL ARAMA: kategorili, Türkçe karaktere toleranslı, yetkiye bağlı (Param dahil değil) ---------- */
function fkKatla(s) { return String(s || "").toLocaleLowerCase("tr").replace(/[ıi̇]/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c").replace(/â/g, "a").replace(/\s+/g, " ").trim(); }
function fkAraYap(s) {
  var k = fkKatla(s), rk = String(s).replace(/\D/g, ""), G = [];
  return Promise.all([araYap(s), (yt("musteri") || yt("teklif")) && SB.c ? Promise.resolve(SB.c) : Promise.resolve(null)]).then(function (R) {
    var G0 = R[0], V = R[1], var_ = {}; G0.forEach(function (g) { g[1].forEach(function (r) { var_[r[0] + "|" + r[1]] = 1; }); });
    // Türkçe karakter toleransı: önbellekteki müşterilerde ş/s, ı/i, ğ/g… farkı gözetmeden ara
    if (V && k.length >= 2) { var ek = V.A.filter(function (a) { return fkKatla(a.ad + " " + (a.ilce || "")).indexOf(k) >= 0 || (rk.length >= 4 && String(a.tel || "").replace(/\D/g, "").indexOf(rk.replace(/^0/, "")) >= 0); }).slice(0, 8)
        .map(function (a) { return ["#aday/" + a.id, esc(a.ad), esc([a.ilce, a.tel, a.sonrakiIs].filter(Boolean).join(" · ")), avatar(a.ad, ASAMA_RENK[a.asama], true), asamaPill(a.asama)]; }).filter(function (r) { return !var_[r[0] + "|" + r[1]]; });
      if (ek.length) { var mu = G0.filter(function (g) { return g[0] === "Müşteriler"; })[0]; if (mu) mu[1] = mu[1].concat(ek).slice(0, 8); else G0.unshift(["Müşteriler", ek]); }
      if (V.GV) { var gv = V.GV.filter(function (g) { return fkKatla(g.baslik + " " + (g.adres || "")).indexOf(k) >= 0; }).slice(0, 5); if (gv.length) G0.push(["Görevler", gv.map(function (g) { var a = V.AM[g.aday] || {}; return [g.aday ? "#aday/" + g.aday : "#planlama", esc(g.baslik), esc([g.tur, a.ad, g.tarih ? tarih(g.tarih.slice(0, 10)) : "", g.durum].filter(Boolean).join(" · ")), ikon("onay", "#2563eb", "kucuk")]; })]); } }
    if (FB.v && yt("fin")) { var td = {}; FB.v.M.forEach(function (m) { if (m.yon === "Çıkış" && m.karsiTaraf && fkKatla(m.karsiTaraf).indexOf(k) >= 0) { td[m.karsiTaraf] = td[m.karsiTaraf] || { n: 0, son: m }; td[m.karsiTaraf].n++; } });
      var tl = Object.keys(td).slice(0, 5); if (tl.length) G0.push(["Tedarikçiler", tl.map(function (t) { return ["#finans/borc/borc", esc(t), td[t].n + " hareket", ikon("kisiler", "#059669", "kucuk")]; })]); }
    var ex = [];
    if (yt("ortak")) ex.push(liste("personel", "ad ~ " + q(s), "ad").then(function (L) { if (L.length) G0.push(["Personel", L.slice(0, 5).map(function (p) { return ["#finans/personel", esc(p.ad), esc([p.gorev, p.durum].filter(Boolean).join(" · ")), ikon("kisiler", "#475569", "kucuk")]; })]); }).catch(function () {}));
    if (yt("musteri")) ex.push(liste("kesif_foto", "aday.ad ~ " + q(s), "", "aday").then(function (L) { var A2 = {}; L.forEach(function (f) { var a = (f.expand || {}).aday; if (a) A2[a.id] = A2[a.id] || { a: a, n: 0 }; if (a) A2[a.id].n++; }); var x = Object.keys(A2).slice(0, 5);
      if (x.length) G0.push(["Belgeler ve keşif fotoğrafları", x.map(function (id) { return ["#aday/" + id, esc(A2[id].a.ad), A2[id].n + " dosya", ikon("belge", "#64748b", "kucuk")]; })]); }).catch(function () {}));
    return Promise.all(ex).then(function () { return G0; });
  });
}
function araAc(on) {
  var son = (ARA.son || []).slice(0, 6), hz = [["#bugun", "Bugün", "ev"], ["#adaylar", "Müşteriler", "kisiler"], ["#teklifler", "Teklifler", "belge"], ["#finans/odeme", "Ödemeler", "liste"], ["#ges", "GES", "gunes"], ["#mesajlar", "Mesajlar", "mesaj"]].filter(function (x) { return x[0] !== "#adaylar" || yt("musteri"); }).filter(function (x) { return x[0] !== "#teklifler" || yt("teklif"); }).filter(function (x) { return x[0] !== "#finans/odeme" || finansci(); }).filter(function (x) { return x[0] !== "#ges" || yt("ges"); });
  panelAc('<div class="fkAraU"><button class="sbIb k" id="fkAraX" aria-label="Kapat">' + fkI("sbSol") + '</button><label class="fkAraI">' + fkI("sbFiltre", "s") + '<input id="fkAraQ" type="search" enterkeyhint="search" placeholder="Müşteri, telefon, teklif no, proje, ödeme, tedarikçi…" autocomplete="off" value="' + fkE(on || "") + '"></label><kbd class="fkKbd">Esc</kbd></div><div id="fkAraS" class="fkAraS"></div>', "ara fkAraP");
  var inp = $("fkAraQ"), zz = null, s0 = $("fkAraS"); setTimeout(function () { inp.focus(); }, 30); $("fkAraX").onclick = panelKapat;
  if ((yt("musteri") || yt("teklif")) && !SB.c) sbVeri().catch(function () {}); if (yt("fin") && !FB.v) fbVeri().catch(function () {});
  var bos = function () { s0.innerHTML = (son.length ? '<div class="fkAraG">Son aramalar</div><div class="fkAraC">' + son.map(function (x) { return '<button class="sbCh" data-fkars="' + fkE(x) + '">' + fkI("sbSaat", "xs") + fkE(x) + "</button>"; }).join("") + "</div>" : "") +
      '<div class="fkAraG">Hızlı erişim</div><div class="fkAraH">' + hz.map(function (x) { return '<a href="' + x[0] + '">' + ikon(x[2], "#1d3557", "kucuk") + "<span>" + x[1] + "</span></a>"; }).join("") + '</div><p class="fkNot">Ad, telefon, ilçe, teklif no, proje, ödeme açıklaması, tedarikçi, personel ya da GES iş emri. Türkçe karakter yazmasanız da bulur (ör. “sahin” → Şahin). Masaüstünde Ctrl K.</p>';
    bagT("[data-fkars]", function (e) { inp.value = e.dataset.fkars; ara(); }); };
  var ara = function () { var s = inp.value.trim(); if (s.length < 2) { bos(); return; } s0.innerHTML = '<div class="fkAraY">Aranıyor…</div>';
    fkAraYap(s).then(function (G) { if (inp.value.trim() !== s) return;
      s0.innerHTML = G.length ? G.map(function (g) { return '<div class="fkAraG">' + g[0] + " <i>" + g[1].length + "</i></div>" + g[1].map(function (r) { return '<a class="fkAraR" href="' + r[0] + '" data-fkarg="1">' + (r[3] || "") + '<span class="fkMsT"><b>' + r[1] + "</b><small>" + r[2] + "</small></span>" + (r[4] || "") + "</a>"; }).join(""); }).join("") : '<div class="fkBos">' + fkI("sbFiltre") + "<b>“" + fkE(s) + "” için sonuç yok</b><small>Yazımı kontrol edin ya da telefonun son 4 hanesini deneyin.</small></div>";
      Array.prototype.forEach.call(s0.querySelectorAll("[data-fkarg]"), function (a) { a.addEventListener("click", function () { ARA.son = [s].concat((ARA.son || []).filter(function (x) { return x !== s; })).slice(0, 6); try { localStorage.setItem("dsAraSon", JSON.stringify(ARA.son)); } catch (e) {}
        if (HIZLI.sonra && /^#aday\//.test(a.getAttribute("href"))) { var t = HIZLI.sonra; HIZLI.sonra = ""; setTimeout(function () { var b = t === "teklif" ? document.querySelector("[data-sbsek='teklif'],#tkYeni,[href*='#teklif/']") : document.querySelector("#sbKyN,textarea"); if (b && b.focus) { b.click && t === "teklif" ? b.click() : b.focus(); } }, 900); } }); }); }).catch(function () { s0.innerHTML = '<div class="fkBos"><b>Arama yapılamadı</b><small>Bağlantıyı kontrol edin.</small></div>'; }); };
  inp.oninput = function () { clearTimeout(zz); zz = setTimeout(ara, 250); };
  inp.onkeydown = function (e) { if (e.key === "Enter") { var a = s0.querySelector("a.fkAraR"); if (a) a.click(); } };
  if (on) ara(); else bos();
}
/* ---------- BİLDİRİM MERKEZİ: gerçek kayıtlardan, kalıcı okundu bilgisi, kategori ve tercih ---------- */
var FK_BK = [["satis", "Satış", "#7c3aed"], ["finans", "Finans", "#059669"], ["ges", "GES", "#f59e0b"], ["gorev", "Görevler", "#2563eb"], ["onay", "Onaylar", "#ed7d31"], ["sistem", "Sistem", "#64748b"]];
function fkBildirimler(o) {
  var L = fkMudahale(o).map(function (x) { return { key: x.key, kat: x.kat, sv: x.sv, t: x.t, d: x.d, h: x.h, ik: x.ik, p: x.p }; }), A = fkAjanda(o);
  if (A.gec.length) L.push({ key: "gorev:gec:" + A.gec.map(function (g) { return g.id; }).sort().join(","), kat: "gorev", sv: "u", t: A.gec.length + " göreviniz gecikti", d: fkE(A.gec[0].baslik), h: "#bugun", ik: "sbGorev", p: 48 });
  if (A.bugun.length) L.push({ key: "gorev:bugun:" + o.b + ":" + A.bugun.length, kat: "gorev", sv: "b", t: "Bugün " + A.bugun.length + " işiniz var", d: A.bugun.slice(0, 2).map(function (g) { return fkE((g.saatli ? String(g.tarih).slice(11, 16) + " " : "") + g.baslik); }).join(" · "), h: "#bugun", ik: "sbTakvim", p: 30 });
  if (o.fin && isGunuFark(FB.v.KU.tarih) > 2) L.push({ key: "sistem:kur:" + FB.v.KU.tarih, kat: "sistem", sv: "u", t: "Kasa kuru " + isGunuFark(FB.v.KU.tarih) + " iş günü eski", d: "Finans › Ayarlar'dan TCMB kurunu çekin", h: "#finans/ayar", ik: "fbPasta", p: 35 });
  (ROZ.L || []).forEach(function (x) { if (/mesaj/i.test(x[1])) return; var kt = /ödeme/.test(x[1]) ? "onay" : /teklif/.test(x[1]) ? "onay" : /GES/.test(x[1]) ? "ges" : /müşteri|yönlendirme/.test(x[1]) ? "satis" : "sistem";
    var k = "roz:" + x[1].replace(/^\d+\s*/, "") + ":" + x[1].match(/^\d+/); if (L.some(function (y) { return y.kat === kt && /onay|iş emri|gecikti/.test(y.t) && y.t.indexOf(x[1].replace(/^\d+\s*/, "").split(" ")[0]) >= 0; })) return;
    L.push({ key: k, kat: kt, sv: x[0] === "kt" ? "kt" : "u", t: x[1], d: "", h: x[2], ik: "sbUyari", p: x[0] === "kt" ? 58 : 38 }); });
  var T = fkT().bildirim || {}, kap = T.kapali || [], ok = T.okundu || {};
  return L.filter(function (x) { return kap.indexOf(x.kat) < 0; }).map(function (x) { x.ok = !!ok[x.key]; return x; }).sort(function (a, b) { return (a.ok - b.ok) || (b.p - a.p); });
}
function fkBildirimSay(o) { try { var L = fkBildirimler(o), n = L.filter(function (x) { return !x.ok; }).length; ROZ.v = ROZ.v || {}; ROZ.v.zil = n; FK.bL = L; rozetCiz(); } catch (e) {} }
function fkBildirimAc() {
  if (fkParamMi()) return fkZilAc0();
  var filt = FK.bf || "", k = panelAc('<div class="fkPnB"><b>Bildirimler</b><small id="fkBkS">yükleniyor…</small><button class="fkLnk" id="fkBkT">Tümünü okundu yap</button><button class="sbIb k" id="fkBkA" aria-label="Bildirim tercihleri">' + fkI("sbAyar", "s") + '</button></div><div class="fkBkF" id="fkBkF"></div><div id="fkBkL"><div class="fkAraY">Yükleniyor…</div></div>', "sag fkPnl fkBkP");
  var ciz = function (o) { var L = fkBildirimler(o), F = L.filter(function (x) { return !filt || x.kat === filt; }), okm = L.filter(function (x) { return !x.ok; });
    $("fkBkS").textContent = okm.length ? okm.length + " okunmamış" : "hepsi okundu";
    $("fkBkF").innerHTML = '<button class="sbCh' + (filt ? "" : " on") + '" data-fkbf="">Tümü ' + L.length + "</button>" + FK_BK.map(function (c) { var n = L.filter(function (x) { return x.kat === c[0]; }).length; return n ? '<button class="sbCh' + (filt === c[0] ? " on" : "") + '" data-fkbf="' + c[0] + '">' + c[1] + " " + n + "</button>" : ""; }).join("");
    $("fkBkL").innerHTML = F.length ? F.map(function (x) { var c = FK_BK.filter(function (y) { return y[0] === x.kat; })[0] || FK_BK[5];
      return '<a class="fkBk' + (x.ok ? " ok" : "") + (x.sv === "kt" ? " kt" : "") + '" href="' + x.h + '" data-fkbk="' + fkE(x.key) + '"><span class="fkIk fkIk-' + x.sv + '">' + fkI(x.ik) + '</span><span class="fkMsT"><b>' + x.t + "</b><small>" + (x.d ? x.d + " · " : "") + '<i style="color:' + c[2] + '">' + c[1] + "</i>" + (x.sv === "kt" ? ' · <i class="fbKt">kritik</i>' : "") + "</small></span>" + (x.ok ? "" : '<i class="fkNok" aria-label="okunmadı"></i>') + "</a>"; }).join("") : '<div class="fkBos">' + fkI("sbOk") + "<b>Bildirim yok</b><small>Yeni bir olay olduğunda burada görünür.</small></div>";
    bagT("[data-fkbf]", function (e) { filt = FK.bf = e.dataset.fkbf; ciz(o); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-fkbk]"), function (a) { a.addEventListener("click", function () { var key = a.dataset.fkbk; fkTKaydet(function (t) { t.bildirim = t.bildirim || {}; t.bildirim.okundu = t.bildirim.okundu || {}; t.bildirim.okundu[key] = bugun(); fkOkunduBuda(t); }); fkBildirimSay(o); }); });
    $("fkBkT").onclick = function () { fkTKaydet(function (t) { t.bildirim = t.bildirim || {}; t.bildirim.okundu = t.bildirim.okundu || {}; L.forEach(function (x) { t.bildirim.okundu[x.key] = bugun(); }); fkOkunduBuda(t); }).then(function () { fkBildirimSay(o); ciz(o); }); fkBildirimSay(o); ciz(o); };
    $("fkBkA").onclick = function () { fkBildirimTercih(o); };
    fkBildirimSay(o); };
  rozetGuncelle(true).then(function () { return fkVeri(); }).then(ciz).catch(function () { $("fkBkL").innerHTML = '<div class="fkBos"><b>Bildirimler yüklenemedi</b><small>Bağlantıyı kontrol edip tekrar açın.</small></div>'; });
}
function fkOkunduBuda(t) { var o = t.bildirim.okundu, s = gunSonra(-45); Object.keys(o).forEach(function (k) { if (o[k] < s) delete o[k]; }); }
function fkBildirimTercih(o) {
  var kap = ((fkT().bildirim || {}).kapali || []).slice();
  $("fkBkL").innerHTML = '<div class="fkFrm"><div class="fkHzK">Hangi bildirimler gösterilsin?</div>' + FK_BK.map(function (c) { var on = kap.indexOf(c[0]) < 0; return '<div class="fkDzS"><span>' + c[1] + '</span><button class="fkTg' + (on ? " on" : "") + '" data-fkbt="' + c[0] + '" aria-pressed="' + on + '"' + (c[0] === "onay" && yon() ? " disabled" : "") + "><i></i>" + (on ? "Açık" : "Kapalı") + "</button></div>"; }).join("") +
    '<p class="fkNot">Kritik nakit ve onay bildirimleri yönetici için kapatılamaz. Telefon (push) bildirimi bu sürümde yok; bildirimler uygulama açıkken burada ve zil sayacında görünür.</p><button class="sbBtn pri fkTam" id="fkBtK">Kaydet</button></div>';
  bagT("[data-fkbt]", function (e) { var c = e.dataset.fkbt, i = kap.indexOf(c); if (i >= 0) kap.splice(i, 1); else kap.push(c); e.classList.toggle("on"); e.lastChild.textContent = e.classList.contains("on") ? "Açık" : "Kapalı"; });
  $("fkBtK").onclick = function () { fkTKaydet(function (t) { t.bildirim = t.bildirim || {}; t.bildirim.kapali = kap.filter(function (k) { return !(k === "onay" && yon()); }); }).then(function () { toast("Bildirim tercihleri kaydedildi"); fkBildirimAc(); }); };
}
/* zil sayacı: okunmamış bildirim sayısıyla tutarlı */
(function () { var r0 = rozetGuncelle; rozetGuncelle = function (z) { return r0.apply(this, arguments).then(function (R) { if (!fkParamMi() && FK.c) fkBildirimSay(FK.c); return R; }); }; })();
/* ---------- PROFİL VE AYARLAR ---------- */
function fkAvatar(sz) { var u = BEN || {}; return u.avatar ? '<img class="fkAvI" style="width:' + sz + "px;height:" + sz + 'px" src="/api/files/users/' + u.id + "/" + encodeURIComponent(u.avatar) + '?thumb=100x100" alt="">' : avatar(u.name || u.email, "#ed7d31", sz < 40); }
function sProfil() {
  var m = $("m"); m.className = "genis sbM fkM"; var u = BEN, T = fkT(), yetki = [["musteri", "Müşteriler"], ["teklif", "Teklifler"], ["fiyat", "Fiyat"], ["proje", "Projeler"], ["fin", "Finans"], ["odeme", "Ödemeler"], ["ges", "GES"], ["ortak", "Ortaklar"], ["ekip", "Ekip"]];
  m.innerHTML = '<div class="fkBas"><div><h1>Profil ve ayarlar</h1><p>' + fkE(u.email) + '</p></div></div><div class="fkIz"><div class="fkSol">' +
    '<section class="fkKart fkPr"><div class="fkPrU"><label class="fkPrF" title="Fotoğrafı değiştir">' + fkAvatar(64) + '<span>' + fkI("fkKamera", "xs") + '</span><input type="file" id="fkPrFt" accept="image/*" hidden></label><div><b>' + fkE(u.name || u.email) + "</b><small>" + fkE(u.unvan || ROL_AD[rol()]) + (u.y_sirket ? " · yalnız " + fkE(u.y_sirket) : " · D Solar ve DRK") + "</small></div></div>" +
    '<label class="fbLbl">Ad soyad<input id="fkPrA" maxlength="80" value="' + fkE(u.name || "") + '"></label><label class="fbLbl">Telefon<input id="fkPrT" inputmode="tel" maxlength="30" value="' + fkE(u.tel || "") + '"></label><button class="sbBtn pri fkTam" id="fkPrK">Profili kaydet</button></section>' +
    '<section class="fkKart"><div class="fkKh"><h2>Rol ve yetkiler</h2><small class="fkKs">yönetici belirler</small></div><div class="sbKv"><span>Rol</span><b>' + fkE(ROL_AD[rol()] || rol()) + "</b></div>" + (rol() === "yonetici" ? '<div class="sbKv"><span>Yetki</span><b>bütün bölümler</b></div>' : yetki.map(function (y) { var v = u["y_" + y[0]]; return v ? '<div class="sbKv"><span>' + y[1] + "</span><b>" + (v === "d" ? "düzenler" : "görür") + "</b></div>" : ""; }).join("")) +
    (yt("ekip") ? '<a class="fkKl" href="#ekip">Ekip ve yetki yönetimi' + fkI("sbSag", "xs") + "</a>" : "") + "</section>" +
    '<section class="fkKart"><div class="fkKh"><h2>Bildirim ve görünüm</h2></div><a class="fkMs" href="#" id="fkPrB"><span class="fkIk fkIk-b">' + fkI("fkZil") + '</span><span class="fkMsT"><b>Bildirim tercihleri</b><small>' + (((T.bildirim || {}).kapali || []).length ? ((T.bildirim || {}).kapali || []).length + " kategori kapalı" : "bütün kategoriler açık") + "</small></span>" + fkI("sbSag", "s") + '</a><a class="fkMs" href="#bugun" id="fkPrG"><span class="fkIk fkIk-n">' + fkI("fkKaydir") + '</span><span class="fkMsT"><b>Bugün ekranı kartları</b><small>sırala ve gizle · cihazlar arasında korunur</small></span>' + fkI("sbSag", "s") + "</a>" +
    '<div class="fkDzS"><span>Sol menüyü daralt (masaüstü)</span><button class="fkTg' + (localStorage.getItem("yanDar") === "1" ? " on" : "") + '" id="fkPrY"><i></i>' + (localStorage.getItem("yanDar") === "1" ? "Açık" : "Kapalı") + "</button></div></section></div>" +
    '<div class="fkSag"><section class="fkKart"><div class="fkKh"><h2>Güvenlik</h2></div><label class="fbLbl">Mevcut şifre<input id="pE" type="password" autocomplete="current-password"></label><label class="fbLbl">Yeni şifre (en az 10 karakter)<input id="pY" type="password" autocomplete="new-password"></label><label class="fbLbl">Yeni şifre (tekrar)<input id="pT" type="password" autocomplete="new-password"></label><button class="sbBtn fkTam" id="pK">Şifreyi değiştir</button><p class="fkNot">Şifre değişince bütün cihazlardaki oturumlar kapanır; yeniden giriş yaparsınız.</p></section>' +
    '<section class="fkKart"><div class="fkKh"><h2>Oturum</h2></div><div class="sbKv"><span>Son giriş</span><b>' + (u.sonGiris ? tarih(u.sonGiris.slice(0, 10)) + " " + u.sonGiris.slice(11, 16) : "—") + '</b></div><div class="sbKv"><span>Sürüm</span><b id="fkPrS">…</b></div><p class="fkNot">Açık cihaz listesi tutulmuyor; başka cihazlardan çıkmak için şifrenizi değiştirin.</p><button class="sbBtn fkTam fkCik" id="fkPrC">' + fkI("fkCikis", "s") + "Bu cihazdan çıkış yap</button></section></div></div>";
  $("fkPrK").onclick = function () { var a = $("fkPrA").value.trim(), bt = this; if (!a) { toast("Ad gerekli"); return; } bt.disabled = true;
    api("/api/collections/users/records/" + BEN.id, { method: "PATCH", body: { name: a, tel: $("fkPrT").value.trim() } }).then(function (r) { BEN.name = r.name; BEN.tel = r.tel; try { localStorage.setItem("dsBen", JSON.stringify(BEN)); } catch (e) {} toast("Profil kaydedildi"); bt.disabled = false; }).catch(function (e) { bt.disabled = false; hata(e); }); };
  $("fkPrFt").onchange = function () { var f = this.files[0]; if (!f) return; if (f.size > 5e6) { toast("Fotoğraf 5 MB'tan küçük olmalı"); return; } var fd = new FormData(); fd.append("avatar", f);
    fetch("/api/collections/users/records/" + BEN.id, { method: "PATCH", headers: { Authorization: TOK }, body: fd }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.message || "Yüklenemedi"); return j; }); })
      .then(function (r) { BEN.avatar = r.avatar; try { localStorage.setItem("dsBen", JSON.stringify(BEN)); } catch (e) {} toast("Fotoğraf güncellendi"); sProfil(); }).catch(hata); };
  $("fkPrB").onclick = function (e) { e.preventDefault(); fkBildirimAc(); setTimeout(function () { var b = $("fkBkA"); if (b) b.click(); }, 400); };
  $("fkPrG").onclick = function () { setTimeout(fkDuzenle, 1200); };
  $("fkPrY").onclick = function () { var d = localStorage.getItem("yanDar") === "1"; try { localStorage.setItem("yanDar", d ? "0" : "1"); } catch (e) {} if (typeof yanDarUygula === "function") yanDarUygula(); sProfil(); };
  $("fkPrC").onclick = function () { cikis(); };
  $("pK").onclick = function () { var y = $("pY").value; if (y.length < 10) { toast("Yeni şifre en az 10 karakter olmalı"); return; } if (y !== $("pT").value) { toast("Yeni şifreler aynı değil"); return; }
    api("/api/collections/users/records/" + BEN.id, { method: "PATCH", body: { oldPassword: $("pE").value, password: y, passwordConfirm: y } }).then(function () { toast("Şifre değişti, yeniden giriş yapın"); setTimeout(cikis, 1200); }).catch(function () { toast("Mevcut şifre hatalı ya da yeni şifre uygun değil"); }); };
  fetch("/surum.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) { var s = $("fkPrS"); if (s) s.textContent = j.surum; }).catch(function () { var s = $("fkPrS"); if (s) s.textContent = "bilinmiyor"; });
}
function avtMenu() {
  var L = [["#profil", "fkKamera", "Profil ve ayarlar", "fotoğraf, şifre, bildirim tercihleri"]];
  if (yt("ekip")) L.push(["#ekip", "sbKisi", "Ekip ve yetkiler", "yönetici ayarları"]);
  if (yt("teklif") || yt("fiyat")) L.push(["#katalog", "sbKutu", "Ürün kataloğu", ""]);
  if (yt("fin")) L.push(["#finans/ayar", "sbAyar", "Finans ayarları", "nakit tamponu, kur"]);
  panelAc('<div class="fkPrU fkAvB">' + fkAvatar(48) + "<div><b>" + fkE(BEN.name || BEN.email) + "</b><small>" + fkE((BEN.unvan || ROL_AD[rol()]) + " · " + (BEN.email || "")) + "</small></div></div>" + L.map(function (x) { return '<a class="fkMs" href="' + x[0] + '"><span class="fkIk fkIk-n">' + fkI(x[1]) + '</span><span class="fkMsT"><b>' + x[2] + "</b>" + (x[3] ? "<small>" + x[3] + "</small>" : "") + "</span>" + fkI("sbSag", "s") + "</a>"; }).join("") +
    '<a class="fkMs fkCik" href="#" id="avC"><span class="fkIk fkIk-kt">' + fkI("fkCikis") + '</span><span class="fkMsT"><b>Çıkış yap</b></span></a><p class="fkNot" id="avS">Sürüm…</p>', "sag fkPnl");
  $("avC").onclick = function (e) { e.preventDefault(); panelKapat(); cikis(); };
  fetch("/surum.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) { var s = $("avS"); if (s) s.textContent = "D Solar · sürüm " + j.surum; }).catch(function () { var s = $("avS"); if (s) s.textContent = ""; });
}
/* eski sürümler Param ekranı için saklanır; üst menü düğmeleri yeni merkezlere bağlanır */
var fkHizliAc0 = hizliAc, fkZilAc0 = zilAc;
hizliAc = fkHizliAc; zilAc = fkBildirimAc;
(function () { var c0 = ciz; ciz = function () { var r = c0.apply(this, arguments); fkKabukSinif();
  if ($("hZil")) $("hZil").onclick = function () { zilAc(); }; if ($("hzB")) $("hzB").onclick = function (e) { e.preventDefault(); hizliAc(); }; if ($("hHz")) $("hHz").onclick = function () { hizliAc(); };
  return r; }; })();
