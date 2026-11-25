/* v91 · Satış B+ — Müşteriler: Liste, Huni, Bugün (arama kuyruğu), filtre paneli, telefonda toplu işlem */
var LF2 = { gor: "liste", asama: "Açık", takip: "", sor: "", kay: "", tarih: "", ara: "", sira: "akilli", n: 50, secMod: false, huni: "Teklif", kim: "" };
var SB_TAKIP = ["Geciken", "Bugün", "Bu hafta", "Planı yok", "Teklif süresi doldu"];
var SB_TARIH = [["bugun", "Bugün"], ["hafta", "Son 7 gün"], ["ay", "Bu ay"], ["donem", "Seçili dönem"]];
function sbMusFiltre(V, haric) {
  var b = V.b, h7 = sbGunEkle(b, 6), ST = V.ST, D = sbDonem(SB.don), s = LF2.ara.toLocaleLowerCase("tr"), sr = s.replace(/\D/g, "");
  var T = { Geciken: function (a) { return sbAcik(a) && a.sonraki && a.sonraki.slice(0, 10) < b; }, "Bugün": function (a) { return sbAcik(a) && a.sonraki && a.sonraki.slice(0, 10) === b; }, "Bu hafta": function (a) { return sbAcik(a) && a.sonraki && a.sonraki.slice(0, 10) <= h7; },
    "Planı yok": function (a) { return sbAcik(a) && !a.sonraki; }, "Teklif süresi doldu": function (a) { var t = ST[a.id]; return sbAcik(a) && t && tkSuresiDoldu(t); } };
  var tar = { bugun: function (a) { return String(a.created).slice(0, 10) === b; }, hafta: function (a) { return String(a.created).slice(0, 10) >= sbGunEkle(b, -6); }, ay: function (a) { return String(a.created).slice(0, 7) === b.slice(0, 7); }, donem: function (a) { return sbIcinde(a.created, D); } };
  return V.A.filter(function (a) {
    if (haric !== "asama") { var as = a.asama || "Aday"; if (LF2.asama === "Açık" ? !sbAcik(a) : LF2.asama !== "Tümü" && as !== LF2.asama) return false; }
    if (haric !== "takip" && LF2.takip && !(T[LF2.takip] || function () { return true; })(a)) return false;
    if (haric !== "sor" && LF2.sor) { if (LF2.sor === "ben" ? !(a.sorumlu === BEN.id || a.kesifci === BEN.id) : LF2.sor === "yok" ? !!a.sorumlu : a.sorumlu !== LF2.sor) return false; }
    if (haric !== "kay" && LF2.kay && (a.kaynak || "Diğer") !== LF2.kay) return false;
    if (haric !== "tarih" && LF2.tarih && tar[LF2.tarih] && !tar[LF2.tarih](a)) return false;
    if (s && [a.ad, a.ilce, a.email, a.sehir, a.sonrakiIs, a.adres].join(" ").toLocaleLowerCase("tr").indexOf(s) < 0 && !(sr.length >= 4 && telNorm(a.tel).indexOf(sr.replace(/^0/, "")) >= 0)) return false;
    return true;
  });
}
function sbSirala(L, V) {
  var PU = {}; V.q.forEach(function (x) { PU[x.a.id] = x.p; });
  var f = { akilli: function (x, y) { return (PU[y.id] || 0) - (PU[x.id] || 0) || (x.sonraki || "9") < (y.sonraki || "9") ? ((PU[y.id] || 0) - (PU[x.id] || 0) || -1) : 1; },
    sonraki: function (x, y) { return (x.sonraki || "9") < (y.sonraki || "9") ? -1 : 1; }, guncel: function (x, y) { return (y.updated || "") < (x.updated || "") ? -1 : 1; },
    yeni: function (x, y) { return (y.created || "") < (x.created || "") ? -1 : 1; }, ad: function (x, y) { return String(x.ad).localeCompare(String(y.ad), "tr"); },
    teklif: function (x, y) { var p = adayTeklifUsd(x, V.ST), r = adayTeklifUsd(y, V.ST); return ((r && r.usd) || 0) - ((p && p.usd) || 0); } };
  if (LF2.sira === "akilli") return L.sort(function (x, y) { var d = (PU[y.id] || 0) - (PU[x.id] || 0); if (d) return d; return (x.sonraki || "9") < (y.sonraki || "9") ? -1 : (x.sonraki || "9") > (y.sonraki || "9") ? 1 : 0; });
  return L.sort(f[LF2.sira] || f.guncel);
}
function sbTakipYaz(a, b) {
  if (!sbAcik(a)) return { t: a.asama === "Sözleşme" ? "sözleşme" : "", c: "m" };
  if (!a.sonraki) return { t: "plan yok", c: "u" };
  var g = a.sonraki.slice(0, 10), sa = a.sonraki.slice(11, 16), fark = gunFark(g, b);
  if (fark > 0) return { t: fark + " gün gecikti", c: "k" }; if (fark === 0) return { t: "Bugün" + (sa && sa !== "09:00" ? " " + sa : ""), c: "b" };
  if (fark === -1) return { t: "Yarın", c: "m" }; return { t: tarih(g).slice(0, 5), c: "m" };
}
function sbYeniMi(a, V) { return (a.asama || "Aday") === "Aday" && !(V.GA[a.id] || []).length && gunFark(String(a.created).slice(0, 10), V.b) <= 2; }
function sbMk(a, V, sec) {
  var tk = adayTeklifUsd(a, V.ST), tk2 = tk && yt("teklif") ? sayi(tk.usd) + " $" : "", sor = (a.expand && a.expand.sorumlu) || V.UM[a.sorumlu], tp = sbTakipYaz(a, V.b);
  var sol = LF2.secMod ? '<span class="sbCb' + (sec ? " on" : "") + '" aria-hidden="true">' + (sec ? sbI("sbOk", "xs") : "") + "</span>" : sbAv(a.ad, SB_ASR[a.asama || "Aday"]);
  return '<div class="sbMk' + (sec ? " sec" : "") + '" data-sbgit="' + a.id + '" role="button" tabindex="0"' + (LF2.secMod ? ' aria-pressed="' + !!sec + '"' : "") + ">" + sol +
    '<div class="sbMkA"><b>' + sbEsc(a.ad) + "</b>" + (sbYeniMi(a, V) ? '<i class="sbYeni">YENİ</i>' : "") + (a.oncelik === "Yüksek" ? '<i class="sbYuk" title="Yüksek öncelik">!</i>' : "") + "</div>" +
    (LF2.secMod ? "" : '<div class="sbMkAk">' + sbTelBtn(a) + sbWaBtn(a) + "</div>") +
    '<div class="sbMkB">' + sbEsc([a.ilce || a.sehir, a.kaynak].filter(Boolean).join(" · ")) + (tk2 ? " · <b>" + tk2 + "</b>" : "") + "</div>" +
    '<div class="sbMkS">' + sbAs(a.asama) + '<span class="sbMkN">' + sbEsc(a.sonrakiIs || (sbAcik(a) ? "Sıradaki iş yazılmamış" : a.asama === "Kaybedildi" ? (a.kayipNedeni || "kaybedildi") : "")) + '</span><span class="sbTr ' + tp.c + '">' + tp.t + "</span>" + (sor ? sbAv(sor.name || sor.email, sbKRenk(sor.id), 22) : '<span class="sbAv sbAvY" title="Atanmamış">?</span>') + "</div></div>";
}
function sbTablo(L, V) {
  var tum = L.length && L.every(function (a) { return LF.sec[a.id]; });
  return '<div class="sbK sbTbK"><table class="sbTb sbMusT"><thead><tr>' + (satisci() ? '<th class="cb"><input type="checkbox" id="sbTumu" aria-label="Tümünü seç"' + (tum ? " checked" : "") + "></th>" : "") + '<th>Müşteri</th><th>Aşama</th><th>Sıradaki işlem</th><th>Takip</th><th>Sorumlu</th><th class="r">Değer</th><th></th></tr></thead><tbody>' +
    L.map(function (a) { var tk = adayTeklifUsd(a, V.ST), sor = (a.expand && a.expand.sorumlu) || V.UM[a.sorumlu], tp = sbTakipYaz(a, V.b);
      return '<tr data-sbgit="' + a.id + '" class="' + (LF.sec[a.id] ? "sec" : "") + '">' + (satisci() ? '<td class="cb"><input type="checkbox" data-sbcb="' + a.id + '"' + (LF.sec[a.id] ? " checked" : "") + ' aria-label="Seç"></td>' : "") +
        '<td><div class="sbTbM">' + sbAv(a.ad, SB_ASR[a.asama || "Aday"], 34) + "<div><b>" + sbEsc(a.ad) + "</b>" + (sbYeniMi(a, V) ? '<i class="sbYeni">YENİ</i>' : "") + (a.oncelik === "Yüksek" ? '<i class="sbYuk">!</i>' : "") + "<small>" + sbEsc([a.ilce || a.sehir, a.kaynak].filter(Boolean).join(" · ")) + "</small></div></div></td>" +
        "<td>" + sbAs(a.asama) + '</td><td class="sbTbN">' + sbEsc(a.sonrakiIs || "—") + '</td><td><span class="sbTr ' + tp.c + '">' + tp.t + "</span></td><td>" + (sor ? '<span class="sbTbSor">' + sbAv(sor.name || sor.email, sbKRenk(sor.id), 24) + sbEsc((sor.name || sor.email).split(" ")[0]) + "</span>" : '<span class="sbTr u">atanmadı</span>') + "</td>" +
        '<td class="r n">' + (tk && yt("teklif") ? sayi(tk.usd) + " $" : "—") + '</td><td class="sbTbA">' + sbTelBtn(a, "k") + sbWaBtn(a, "", "k") + "</td></tr>"; }).join("") + "</tbody></table></div>";
}
function sbFiltreGrup(V) {
  var say = function (h, f) { var e = {}; ["asama", "takip", "sor", "kay", "tarih"].forEach(function (k) { e[k] = LF2[k]; }); var o = LF2[h]; LF2[h] = f; var n = sbMusFiltre(V, null).length; LF2[h] = o; return n; };
  var U = sbEkip(V).filter(function (u) { return V.A.some(function (a) { return a.sorumlu === u.id; }); });
  var kay = {}; V.A.forEach(function (a) { kay[a.kaynak || "Diğer"] = 1; });
  var G = [["asama", "Aşama", [["Açık", "Açık (hepsi)"]].concat(["Aday", "Nitelikli", "Keşif", "Teklif", "Sözleşme", "Kaybedildi"].map(function (x) { return [x, x]; })).concat([["Tümü", "Tümü"]])],
    ["takip", "Takip durumu", [["", "Hepsi"]].concat(SB_TAKIP.map(function (x) { return [x, x]; }))],
    ["sor", "Sorumlu", [["", "Herkes"], ["ben", "Bana atanan"]].concat(BEN.kendi && !yon() ? [] : U.filter(function (u) { return u.id !== BEN.id; }).map(function (u) { return [u.id, (u.name || u.email).split(" ")[0]]; })).concat([["yok", "Atanmamış"]])],
    ["kay", "Kaynak", [["", "Hepsi"]].concat(Object.keys(kay).sort().map(function (x) { return [x, x]; }))],
    ["tarih", "Kayıt tarihi", [["", "Hepsi"]].concat(SB_TARIH)]];
  return G.map(function (g) { return '<div class="sbFg"><b>' + g[1] + '</b><div class="sbOp">' + g[2].map(function (o) { var on = LF2[g[0]] === o[0], n = o[0] === "" || o[0] === "Tümü" ? "" : say(g[0], o[0]); return '<button data-sbfk="' + g[0] + '" data-sbfv="' + sbEsc(o[0]) + '" aria-pressed="' + on + '">' + sbEsc(o[1]) + (n !== "" ? " <em>" + n + "</em>" : "") + "</button>"; }).join("") + "</div></div>"; }).join("");
}
function sbAktifFiltre() {
  var L = []; if (LF2.asama !== "Açık") L.push(["asama", "Aşama: " + LF2.asama]); if (LF2.takip) L.push(["takip", LF2.takip]);
  if (LF2.sor) { var u = SB.c && SB.c.UM[LF2.sor]; L.push(["sor", LF2.sor === "ben" ? "Bana atanan" : LF2.sor === "yok" ? "Atanmamış" : "Sorumlu: " + (u ? (u.name || u.email).split(" ")[0] : "")]); }
  if (LF2.kay) L.push(["kay", "Kaynak: " + LF2.kay]); if (LF2.tarih) L.push(["tarih", "Kayıt: " + (SB_TARIH.filter(function (x) { return x[0] === LF2.tarih; })[0] || ["", ""])[1]]);
  return L;
}
function sbFiltreSifirla() { LF2.asama = "Açık"; LF2.takip = ""; LF2.sor = ""; LF2.kay = ""; LF2.tarih = ""; LF2.n = 50; }
function sAdaylarB(arg) {
  sbNav(); var m = $("m"); m.className = "sbM";
  if (arg === "huni" || arg === "kuyruk" || arg === "liste") LF2.gor = arg; else if (!arg) LF2.gor = LF2.gor === "kuyruk" || LF2.gor === "huni" ? LF2.gor : "liste";
  if (SB.musF) { sbFiltreSifirla(); var f = SB.musF; SB.musF = null; LF2.gor = "liste"; Object.keys(f).forEach(function (k) { LF2[k] = f[k]; }); if (f.asama === "Sözleşme") LF2.asama = "Sözleşme"; }
  if (!m.querySelector(".sbMusU")) m.innerHTML = sbIskelet();
  sbVeri(true).then(function (V) { sbMusCiz(V); }).catch(function (e) { m.innerHTML = '<div class="sbSayfa">' + sbBos("sbUyari", "Müşteriler yüklenemedi", sbEsc(e.message || "")) + "</div>"; });
}
function sbMusCiz(V) {
  var m = $("m"), mas = window.innerWidth >= 1000, b = V.b, acikN = V.A.filter(sbAcik).length, gecN = V.A.filter(function (a) { return sbAcik(a) && a.sonraki && a.sonraki.slice(0, 10) < b; }).length;
  var qL = sbKuyrukKim(V), af = sbAktifFiltre();
  var ust = sbBas(satisAlt().filter(function (x) { return x[0] === "adaylar"; }).map(function (x) { return x[1]; })[0] || "Müşteriler", V.A.length + " kayıt · " + acikN + " açık" + (gecN ? ' · <span class="kt">' + gecN + " geciken</span>" : ""),
    (satisci() && !mas && LF2.gor !== "kuyruk" ? '<button class="sbIb" id="sbSecM" aria-pressed="' + LF2.secMod + '" aria-label="Toplu seçim">' + sbI("sbGorev") + "</button>" : "") + (satisci() ? '<a class="btn sbBtn or" href="#yeni" aria-label="Yeni müşteri">' + sbI("sbArti") + '<span class="sbMas">Yeni müşteri</span></a>' : ""));
  var seg = '<div class="sbSeg w" role="tablist">' + [["liste", "Liste", "sbListe"], ["huni", "Huni", "sbKanban"], ["kuyruk", "Bugün", "sbTel"]].map(function (g) { return '<a role="tab" href="#adaylar/' + g[0] + '" aria-selected="' + (LF2.gor === g[0]) + '">' + sbI(g[2], "s") + g[1] + (g[0] === "kuyruk" && qL.length ? ' <span class="sbSay kt">' + qL.length + "</span>" : "") + "</a>"; }).join("") + "</div>";
  var h = '<div class="sbSayfa sbMusU">' + ust + seg;
  if (LF2.gor === "kuyruk") { h += sbKuyrukCiz(V, qL); m.innerHTML = h + "</div>"; sbKuyrukBagla(V); return; }
  var fr = '<div class="sbFr"><label class="sbAra">' + sbI("ara", "s sbAraI") + '<input id="sbAra" type="search" placeholder="Ad, telefon, ilçe…" value="' + sbEsc(LF2.ara) + '" autocomplete="off"></label>' +
    (mas ? "" : '<button class="btn sbBtn" id="sbFlt">' + sbI("sbFiltre", "s") + "Filtre" + (af.length ? ' <span class="sbSay p">' + af.length + "</span>" : "") + "</button>") +
    '<label class="sbSirB" aria-label="Sıralama">' + sbI("sbSirala", "s") + '<select id="sbSir">' + sec([["akilli", "Önce öncelikli"], ["sonraki", "Takip tarihi"], ["yeni", "En yeni kayıt"], ["guncel", "Son güncellenen"], ["teklif", "Teklif tutarı"], ["ad", "Ad"]], LF2.sira) + "</select></label></div>";
  var ch = af.length ? '<div class="sbCh">' + af.map(function (f) { return '<button data-sbfx="' + f[0] + '">' + sbEsc(f[1]) + sbI("sbX", "xs") + "</button>"; }).join("") + (af.length > 1 ? '<button class="g" data-sbfx="*">Temizle</button>' : "") + "</div>" : "";
  if (LF2.gor === "huni") {
    var keep = LF2.asama; LF2.asama = "Tümü"; var LH = sbSirala(sbMusFiltre(V, "asama"), V); LF2.asama = keep;
    h += fr + ch + sbHuniGor(LH, V, mas); m.innerHTML = h + "</div>"; sbMusBagla(V, LH); return;
  }
  var L = sbSirala(sbMusFiltre(V), V), G = L.slice(0, LF2.n);
  var lh = '<div class="sbLh"><span>' + L.length + " müşteri</span>" + (L.length > G.length ? "<span>" + G.length + " gösteriliyor</span>" : "") + "</div>";
  var liste = mas ? '<div class="sbMusD"><aside class="sbK sbFp"><div class="sbKh"><h2>Filtreler</h2>' + (af.length ? '<button class="sbKl g" data-sbfx="*">Temizle</button>' : "") + "</div>" + sbFiltreGrup(V) + "</aside><div>" + lh + (G.length ? sbTablo(G, V) : sbBos("sbKisi", "Bu filtrede müşteri yok", "Filtreleri değiştirin ya da temizleyin.")) + "</div></div>" :
    lh + (G.length ? '<div class="sbMkL">' + G.map(function (a) { return sbMk(a, V, !!LF.sec[a.id]); }).join("") + "</div>" : sbBos("sbKisi", "Bu filtrede müşteri yok", "Filtreleri değiştirin ya da temizleyin."));
  var dah = L.length > G.length ? '<button class="btn sbBtn sbDaha" id="sbDaha">Daha fazla göster · ' + (L.length - G.length) + " kişi daha</button>" : "";
  var ip = !mas && !LF2.secMod && satisci() && G.length ? '<div class="sbIpu">Kartı sola kaydır: yapıldı · sağa kaydır: yarına ertele</div>' : "";
  m.innerHTML = h + fr + (mas ? "" : ch) + liste + dah + ip + "</div>" + '<div class="sbTpl" id="sbTpl" hidden></div>';
  sbMusBagla(V, L);
}
function sbKuyrukKim(V) { var kim = LF2.kim || (yon() ? "hep" : "ben"); return V.q.filter(function (x) { return kim === "hep" || x.a.sorumlu === BEN.id || x.a.kesifci === BEN.id; }); }
function sbKuyrukCiz(V, Q) {
  var b = V.b, yap = V.G.filter(function (g) { return String(g.created).slice(0, 10) === b && /^✓/.test(g.metin || "") && ((LF2.kim || (yon() ? "hep" : "ben")) === "hep" || g.yazan === BEN.id); }).length, top = Q.length + yap;
  var ust = '<div class="sbK sbKuU"><div class="sbKuR"><span class="sbIk sbIk-p">' + sbI("sbSimsek") + '</span><div class="sbKuT"><b>Bugün ' + Q.length + " öncelikli kişi · " + yap + ' tamamlandı</b><span class="sbBar"><b style="width:' + (top ? yap / top * 100 : 0).toFixed(0) + '%"></b></span></div>' +
    (yon() || !BEN.kendi ? '<div class="sbSeg k"><button data-sbkim="ben" aria-pressed="' + ((LF2.kim || (yon() ? "hep" : "ben")) === "ben") + '">Benim</button><button data-sbkim="hep" aria-pressed="' + ((LF2.kim || (yon() ? "hep" : "ben")) === "hep") + '">Ekip</button></div>' : "") + "</div>" +
    '<details class="sbKural"><summary>Sıralama nasıl yapılıyor?</summary><p>Puan şunların toplamıdır: <b>yeni aday</b> (ilk 48 saat, henüz aranmadıysa), <b>saatli randevu</b> (bugün), <b>teklif süresi</b> (2 gün içinde doluyor ya da doldu), <b>sıcak teklif</b> (son 5 günde onaylandı), <b>geciken takip</b> (gün sayısıyla artar) ve <b>elle verilen öncelik</b>. Her kartta neden üstte olduğu yazar. Hiçbir müşteri otomatik olarak kaybedilmez.</p></details></div>';
  if (!Q.length) return ust + sbBos("sbOk", "Kuyruk boş", "Bugün için geciken, planlı ya da yeni müşteri yok.");
  return ust + '<div class="sbKuL">' + Q.map(function (x, i) { var a = x.a, sor = (a.expand && a.expand.sorumlu) || V.UM[a.sorumlu] || {};
    return '<div class="sbMk sbKu" data-sbgit="' + a.id + '"><span class="sbSira' + (i < 3 ? " on" : "") + '">' + (i + 1) + '</span><div class="sbMkA"><b>' + sbEsc(a.ad) + "</b></div>" +
      '<div class="sbMkAk">' + sbTelBtn(a) + sbWaBtn(a) + '</div><div class="sbMkB">' + sbEsc([a.ilce, a.asama || "Aday", (sor.name || "").split(" ")[0]].filter(Boolean).join(" · ")) + "</div>" +
      '<div class="sbMkS sbKuS">' + sbNedenH(x.N) + '<small class="sbKuA">' + sbEsc(x.N[0][2] || a.sonrakiIs || "") + "</small>" + (satisci() ? '<span class="sbKuB"><button class="btn sbBtn k" data-sbyap="' + a.id + '">' + sbI("sbOk", "s") + 'Yapıldı</button><button class="btn sbBtn k" data-sbert="' + a.id + '">Yarına</button><button class="btn sbBtn k" data-sbonc="' + a.id + '" aria-label="Öncelik">' + sbI("sbNokta", "s") + "</button></span>" : "") + "</div></div>"; }).join("") + "</div>";
}
function sbKuyrukBagla(V) {
  var bul = function (id) { return V.AM[id]; }, yen = function () { sbSifirla(); sAdaylarB("kuyruk"); };
  bagT("[data-sbkim]", function (e) { LF2.kim = e.dataset.sbkim; sbMusCiz(V); });
  bagT("[data-sbyap]", function (e) { isBitti(bul(e.dataset.sbyap), yen); });
  bagT("[data-sbert]", function (e) { ertele(bul(e.dataset.sbert), 1, yen); });
  bagT("[data-sbonc]", function (e) { sbOncSor([bul(e.dataset.sbonc)], yen); });
  sbGitBagla2(); if (satisci()) kaydirBagla(".sbKu[data-sbgit]", function (r) { return bul(r.dataset.sbgit); }, yen);
}
function sbOncSor(L, sonra) {
  panelAc('<div class="pnlB"><b>Öncelik</b><small>' + (L.length === 1 ? sbEsc(L[0].ad) : L.length + " müşteri") + '</small></div><div class="f"><div class="sbOp">' + [["Yüksek", "Yüksek · kuyrukta üste"], ["", "Normal"], ["Düşük", "Düşük · kuyrukta alta"]].map(function (o) { return '<button data-sbov="' + o[0] + '">' + o[1] + "</button>"; }).join("") + '</div><small style="color:var(--muted)">Elle verilen öncelik puana eklenir; nedeni kartta görünür.</small></div>', "alt");
  bagT("[data-sbov]", function (e) { var v = e.dataset.sbov; sirali(L, function (a) { return api("/api/collections/adaylar/records/" + a.id, { method: "PATCH", body: { oncelik: v } }); }).then(function () { panelKapat(); toast("Öncelik kaydedildi"); sbSifirla(); sonra(); }).catch(hata); });
}
function sbHuniGor(L, V, mas) {
  var S = ["Aday", "Nitelikli", "Keşif", "Teklif", "Sözleşme"], say = {}; S.forEach(function (s) { say[s] = L.filter(function (a) { return (a.asama || "Aday") === s; }); });
  if (mas) return '<div class="sbKb">' + S.map(function (s) { var X = say[s], tut = s === "Teklif" && yt("teklif") ? X.reduce(function (t, a) { var k = adayTeklifUsd(a, V.ST); return t + (k ? k.usd : 0); }, 0) : 0;
    return '<div class="sbKol" data-sbkol="' + s + '"><div class="sbKolB">' + sbAs(s) + '<span class="n">' + X.length + (tut ? " · " + sayi(tut) + " $" : "") + "</span></div>" + X.slice(0, 40).map(function (a) { var tp = sbTakipYaz(a, V.b), sor = (a.expand && a.expand.sorumlu) || V.UM[a.sorumlu];
      return '<div class="sbKc" draggable="' + satisci() + '" data-sbgit="' + a.id + '"><b>' + sbEsc(a.ad) + "</b><small>" + sbEsc([a.ilce, a.kaynak].filter(Boolean).join(" · ")) + '</small><div class="sbKcA"><span class="sbTr ' + tp.c + '">' + tp.t + "</span>" + (sor ? sbAv(sor.name || sor.email, sbKRenk(sor.id), 22) : "") + "</div></div>"; }).join("") + (X.length > 40 ? '<a class="sbKcD" href="#adaylar" data-sbf=\'' + JSON.stringify({ asama: s }) + "'>+ " + (X.length - 40) + " daha · listede aç</a>" : "") + (!X.length ? '<div class="sbKcD">Boş</div>' : "") + "</div>"; }).join("") + "</div>" + (satisci() ? '<div class="sbIpu">Kartı başka kolona sürükleyerek aşamayı değiştirin · her değişiklik onay ister, geri alınabilir</div>' : "");
  var s0 = S.indexOf(LF2.huni) >= 0 ? LF2.huni : "Teklif", X = sbSirala(say[s0].slice(), V);
  return '<div class="sbHs" role="tablist">' + S.map(function (s) { return '<button role="tab" data-sbhuni="' + s + '" aria-selected="' + (s === s0) + '"><b>' + say[s].length + "</b>" + s + "</button>"; }).join("") + "</div>" +
    '<div class="sbLh"><span><b>' + s0 + "</b> · " + X.length + " müşteri</span></div>" + (X.length ? '<div class="sbMkL">' + X.slice(0, LF2.n).map(function (a) { return sbMk(a, V, !!LF.sec[a.id]); }).join("") + "</div>" : sbBos("sbKanban", "Bu aşamada müşteri yok", "")) +
    (X.length > LF2.n ? '<button class="btn sbBtn sbDaha" id="sbDaha">Daha fazla göster · ' + (X.length - LF2.n) + "</button>" : "") + '<div class="sbIpu">Aşama değişikliği müşteri sayfasındaki aşama şeridinden yapılır</div>';
}
function sbGitBagla2() {
  Array.prototype.forEach.call(document.querySelectorAll("[data-sbgit]"), function (r) {
    r.onclick = function (e) { if (e.target.closest("a,button,input,label,select") || r.dataset.kay) return;
      if (LF2.secMod && r.classList.contains("sbMk") && !r.classList.contains("sbKu")) { var id = r.dataset.sbgit; if (LF.sec[id]) delete LF.sec[id]; else LF.sec[id] = 1; var on = !!LF.sec[id]; r.classList.toggle("sec", on); r.setAttribute("aria-pressed", on); var c = r.querySelector(".sbCb"); if (c) { c.classList.toggle("on", on); c.innerHTML = on ? sbI("sbOk", "xs") : ""; } sbTplCiz(); return; }
      location.hash = "#aday/" + r.dataset.sbgit; };
    r.onkeydown = function (e) { if (e.key === "Enter") r.click(); };
  });
}
function sbMusBagla(V, L) {
  var ara = $("sbAra"); if (ara) { ara.oninput = function () { clearTimeout(ara._t); var v = this.value; ara._t = setTimeout(function () { LF2.ara = v; LF2.n = 50; sbMusCiz(V); var a2 = $("sbAra"); if (a2) { a2.focus(); a2.setSelectionRange(v.length, v.length); } }, 220); }; }
  var sr = $("sbSir"); if (sr) sr.onchange = function () { LF2.sira = this.value; sbMusCiz(V); };
  var fl = $("sbFlt"); if (fl) fl.onclick = function () { sbFiltrePanel(V); };
  bagT("[data-sbfx]", function (e) { if (e.dataset.sbfx === "*") sbFiltreSifirla(); else LF2[e.dataset.sbfx] = e.dataset.sbfx === "asama" ? "Açık" : ""; LF2.n = 50; sbMusCiz(V); });
  bagT(".sbFp [data-sbfk]", function (e) { LF2[e.dataset.sbfk] = e.dataset.sbfv; LF2.n = 50; sbMusCiz(V); });
  bagT("[data-sbhuni]", function (e) { LF2.huni = e.dataset.sbhuni; LF2.n = 50; sbMusCiz(V); });
  var sm = $("sbSecM"); if (sm) sm.onclick = function () { LF2.secMod = !LF2.secMod; if (!LF2.secMod) LF.sec = {}; sbMusCiz(V); };
  var dh = $("sbDaha"); if (dh) { dh.onclick = function () { LF2.n += 100; sbMusCiz(V); }; if ("IntersectionObserver" in window) { var io = new IntersectionObserver(function (E) { if (E[0].isIntersecting) { io.disconnect(); LF2.n += 100; sbMusCiz(V); } }, { rootMargin: "300px" }); io.observe(dh); } }
  Array.prototype.forEach.call(document.querySelectorAll("[data-sbcb]"), function (c) { c.onchange = function () { if (c.checked) LF.sec[c.dataset.sbcb] = 1; else delete LF.sec[c.dataset.sbcb]; c.closest("tr").classList.toggle("sec", c.checked); sbTplCiz(); }; });
  var tm = $("sbTumu"); if (tm) tm.onchange = function () { var on = this.checked; L.slice(0, LF2.n).forEach(function (a) { if (on) LF.sec[a.id] = 1; else delete LF.sec[a.id]; }); sbMusCiz(V); };
  sbGitBagla2(); sbFiltreLink();
  if (satisci() && !LF2.secMod) kaydirBagla(".sbMk[data-sbgit]", function (r) { return V.AM[r.dataset.sbgit]; }, function () { sbSifirla(); sAdaylarB(); });
  /* masaüstü huni: sürükle-bırak ile aşama */
  if (satisci()) { var drag = null;
    Array.prototype.forEach.call(document.querySelectorAll(".sbKc[draggable=true]"), function (c) { c.ondragstart = function (e) { drag = c.dataset.sbgit; e.dataTransfer.setData("text/plain", drag); c.classList.add("tas"); }; c.ondragend = function () { c.classList.remove("tas"); }; });
    Array.prototype.forEach.call(document.querySelectorAll("[data-sbkol]"), function (k) { k.ondragover = function (e) { e.preventDefault(); k.classList.add("hedef"); }; k.ondragleave = function () { k.classList.remove("hedef"); };
      k.ondrop = function (e) { e.preventDefault(); k.classList.remove("hedef"); var a = V.AM[drag || e.dataTransfer.getData("text/plain")], s = k.dataset.sbkol; if (!a || (a.asama || "Aday") === s) return;
        if (!confirm(a.ad + ": " + (a.asama || "Aday") + " → " + s + " aşamasına alınsın mı?")) return; asamaYap(a, s, function () { sbSifirla(); sAdaylarB("huni"); }); }; }); }
  sbTplCiz();
  if (!SB.rsz) { SB.rsz = 1; var w0 = window.innerWidth >= 1000; window.addEventListener("resize", function () { var w = window.innerWidth >= 1000; if (w !== w0) { w0 = w; if (/^#adaylar/.test(location.hash) && SB.c) sbMusCiz(SB.c); } }); }
}
function sbFiltrePanel(V) {
  var ciz = function () { var n = sbMusFiltre(V).length;
    panelAc('<div class="pnlB"><b>Filtrele</b><small>' + n + ' müşteri</small></div><div class="sbPnlF">' + sbFiltreGrup(V) + '</div><div class="sbPnlA"><button class="btn" id="sbFT">Temizle</button><button class="btn pri" id="sbFU">' + n + " müşteriyi göster</button></div>", "alt sbPnl");
    bagT("#pnl [data-sbfk]", function (e) { LF2[e.dataset.sbfk] = e.dataset.sbfv; ciz(); });
    $("sbFT").onclick = function () { sbFiltreSifirla(); ciz(); }; $("sbFU").onclick = function () { panelKapat(); LF2.n = 50; sbMusCiz(V); }; };
  ciz();
}
function sbTplCiz() {
  var k = $("sbTpl"), V = SB.c; if (!k || !V) return; var ids = Object.keys(LF.sec).filter(function (i) { return V.AM[i]; });
  if (!ids.length) { k.hidden = true; document.body.classList.remove("sbTplV"); return; } k.hidden = false; document.body.classList.add("sbTplV");
  var U = sbEkip(V);
  k.innerHTML = '<span class="sbTplN"><b>' + ids.length + '</b> seçili</span><button data-sbtp="sor">' + sbI("sbTek") + "<span>Sorumlu ata</span></button><button data-sbtp=\"is\">" + sbI("sbGorev") + "<span>Görev ver</span></button><button data-sbtp=\"as\">" + sbI("sbKanban") + "<span>Aşama</span></button><button data-sbtp=\"dig\">" + sbI("sbNokta") + "<span>Diğer</span></button>";
  var L = ids.map(function (i) { return V.AM[i]; });
  bagT("[data-sbtp]", function (e) { var t = e.dataset.sbtp;
    if (t === "dig") { panelAc('<div class="pnlB"><b>' + ids.length + ' müşteri</b></div><a class="row" href="#" id="sbTpO"><div class="t"><b>Öncelik ver</b><small>yüksek / normal / düşük</small></div></a><a class="row" href="#" id="sbTpX"><div class="t"><b>Excel’e aktar</b></div></a><a class="row" href="#" id="sbTpK"><div class="t"><b>Seçimi kaldır</b></div></a>', "alt");
      $("sbTpO").onclick = function (ev) { ev.preventDefault(); sbOncSor(L, function () { LF.sec = {}; sAdaylarB(); }); };
      $("sbTpX").onclick = function (ev) { ev.preventDefault(); panelKapat(); topluIs("xl", L, U, V.ST); };
      $("sbTpK").onclick = function (ev) { ev.preventDefault(); panelKapat(); LF.sec = {}; LF2.secMod = false; sbMusCiz(V); }; return; }
    topluIs(t, L, U, V.ST); });
}
