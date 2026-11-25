/* v91 · Satış B+ — Planlama (görüşme, keşif, montaj, resmî işlem: gün / hafta / ay / kişi), Projeler, yönlendirme */
var PL = { gor: "gun", gun: "", kim: "", tur: "" };
var SB_TUR_RENK = { Arama: "#2563eb", "Görüşme": "#7c3aed", "Keşif": "#0d9488", Teklif: "#ea580c", Montaj: "#b45309", "Resmî işlem": "#475569", "Diğer": "#64748b" };
function sPlanlama(arg) {
  sbNav(); var m = $("m"); m.className = "sbM"; if (!m.querySelector(".sbPl")) m.innerHTML = sbIskelet();
  if (arg && /^(gun|hafta|ay|kisi)$/.test(arg)) PL.gor = arg; if (!PL.gun) PL.gun = bugun(); if (!PL.kim) PL.kim = BEN.kendi && !yon() ? "ben" : yon() ? "hep" : "ben";
  sbVeri(true).then(function (V) {
    var GV = V.GV, b = V.b, ust;
    var plU = sbBas("Planlama", "Görüşme, keşif, montaj ve resmî işler tek yerde", (satisci() || yd("proje") ? '<button class="btn sbBtn or" id="sbPlY">' + sbI("sbArti", "s") + '<span class="sbMas">Görev</span></button>' : ""));
    if (!GV) { m.innerHTML = '<div class="sbSayfa sbPl">' + plU + sbBos("sbTakvim", "Görev tablosu henüz kurulmadı", "Sunucu güncellemesinden sonra görevler burada görünür. Şimdilik müşterilerin sıradaki işleri Müşteriler › Bugün'de.") + "</div>"; return; }
    var kim = function (g) { if (PL.kim === "hep") return true; var S = g.sorumlu || []; if (PL.kim === "ben") return S.indexOf(BEN.id) >= 0 || (g.aday && V.AM[g.aday] && (V.AM[g.aday].sorumlu === BEN.id || V.AM[g.aday].kesifci === BEN.id) && !S.length); return S.indexOf(PL.kim) >= 0; };
    var L = GV.filter(function (g) { return g.durum === "Açık" && kim(g) && (!PL.tur || g.tur === PL.tur); });
    /* proje adımları (son tarihli; görev değil, projeden gelir) */
    var PA = []; (V.P || []).filter(function (p) { return p.durum === "Sürüyor"; }).forEach(function (p) { prjDurum(p).sonraki.forEach(function (s) { if (s.kilit) return; PA.push({ p: p, a: V.AM[p.aday] || {}, s: s, tarih: s.son, tur: s.kol === "saha" && s.k === "montaj" ? "Montaj" : s.kol === "saha" ? "Diğer" : "Resmî işlem" }); }); });
    if (PL.tur) PA = PA.filter(function (x) { return x.tur === PL.tur; });
    var U = sbEkip(V), kisiS = '<label class="sbSirB" aria-label="Kimin planı">' + sbI("sbTek", "s") + '<select id="sbPlK">' + sec([["ben", "Benim"], ["hep", "Herkes"]].concat(U.filter(function (u) { return u.id !== BEN.id; }).map(function (u) { return [u.id, (u.name || u.email).split(" ")[0]]; })), PL.kim) + "</select></label>";
    var turS = '<label class="sbSirB" aria-label="Tür">' + sbI("sbFiltre", "s") + '<select id="sbPlT">' + sec([["", "Tüm türler"]].concat(SB_TUR.map(function (t) { return [t, t]; })), PL.tur) + "</select></label>";
    var seg = '<div class="sbSeg w4" role="tablist">' + [["gun", "Gün"], ["hafta", "Hafta"], ["ay", "Ay"], ["kisi", "Kişi"]].map(function (x) { return '<a role="tab" href="#planlama/' + x[0] + '" aria-selected="' + (PL.gor === x[0]) + '">' + x[1] + "</a>"; }).join("") + "</div>";
    var nav = '<div class="sbPlN"><button class="sbIb" data-sbpln="-1" aria-label="Önceki">' + sbI("sbSol") + '</button><button class="btn sbBtn k" data-sbpln="0">Bugün</button><b>' + sbPlBas(PL.gor, PL.gun) + '</b><button class="sbIb" data-sbpln="1" aria-label="Sonraki">' + sbI("sbSag") + "</button></div>";
    var gec = L.filter(function (g) { return g.tarih && String(g.tarih).slice(0, 10) < b; });
    ust = '<div class="sbSayfa sbPl">' + plU + seg + '<div class="sbFr">' + kisiS + turS + "</div>" + nav;
    var ic = "";
    if (PL.gor === "gun") {
      var gL = L.filter(function (g) { return String(g.tarih || "").slice(0, 10) === PL.gun; }).sort(sbSaatSir), pL = PA.filter(function (x) { return x.tarih.slice(0, 10) === PL.gun; });
      ic = (PL.gun === b && gec.length ? sbKart("Geciken görevler <span class=\"sbSay kt\">" + gec.length + "</span>", gec.sort(sbSaatSir).map(function (g) { return sbPlSat(g, V); }).join(""), { c: "sbKt" }) : "") +
        sbKart(sbGunAd(PL.gun), gL.length ? gL.map(function (g) { return sbPlSat(g, V); }).join("") : sbBos("sbTakvim", "Bu gün için görev yok", ""), { ks: gL.length + " görev" }) +
        (pL.length ? sbKart("Proje adımları · son tarih", pL.map(sbPaSat).join(""), { ks: "projeden" }) : "");
    } else if (PL.gor === "hafta" || PL.gor === "kisi") {
      var bas = sbHaftaBas(PL.gun), G = []; for (var i = 0; i < 7; i++) G.push(sbGunEkle(bas, i));
      if (PL.gor === "hafta") ic = '<div class="sbHft">' + G.map(function (d) { var X = L.filter(function (g) { return String(g.tarih || "").slice(0, 10) === d; }).sort(sbSaatSir), Y = PA.filter(function (x) { return x.tarih.slice(0, 10) === d; });
        return '<section class="sbK sbHftG' + (d === b ? " bu" : "") + '"><div class="sbKh"><h2>' + ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][new Date(d + "T12:00").getDay()] + " " + tarih(d).slice(0, 5) + '</h2><span class="sbKs">' + (X.length + Y.length || "") + "</span></div>" + (X.map(function (g) { return sbPlSat(g, V, true); }).join("") + Y.map(sbPaSat).join("") || '<div class="sbBosK">—</div>') + "</section>"; }).join("") + "</div>";
      else { var K = U.map(function (u) { var X = GV.filter(function (g) { return g.durum === "Açık" && (g.sorumlu || []).indexOf(u.id) >= 0 && (!PL.tur || g.tur === PL.tur) && G.indexOf(String(g.tarih || "").slice(0, 10)) >= 0; }).sort(sbSaatSir), gc = GV.filter(function (g) { return g.durum === "Açık" && (g.sorumlu || []).indexOf(u.id) >= 0 && g.tarih && String(g.tarih).slice(0, 10) < b; }).length;
          return '<section class="sbK"><div class="sbKh"><h2>' + sbAv(u.name || u.email, sbKRenk(u.id), 28) + sbEsc((u.name || u.email).split(" ")[0]) + '</h2><span class="sbKs">' + X.length + " görev bu hafta" + (gc ? ' · <span class="kt">' + gc + " geciken</span>" : "") + "</span></div>" + '<div class="sbYuk3">' + G.map(function (d) { var n = X.filter(function (g) { return String(g.tarih).slice(0, 10) === d; }).length; return '<i title="' + tarih(d) + ": " + n + '" style="--y:' + Math.min(1, n / 5) + '"><b>' + (n || "") + "</b></i>"; }).join("") + "</div>" + (X.slice(0, 8).map(function (g) { return sbPlSat(g, V, true); }).join("") || '<div class="sbBosK">Bu hafta görev yok</div>') + "</section>"; }).join("");
        ic = '<div class="sbKisiG">' + K + "</div>"; }
    } else {
      var ay = PL.gun.slice(0, 7), ilk = new Date(ay + "-01T12:00:00"), gs = new Date(ilk.getFullYear(), ilk.getMonth() + 1, 0).getDate(), bos = (ilk.getDay() + 6) % 7, H = "";
      for (var j = 0; j < bos; j++) H += "<i></i>";
      for (var d2 = 1; d2 <= gs; d2++) { var t = ay + "-" + String(d2).padStart(2, "0"), n = L.filter(function (g) { return String(g.tarih || "").slice(0, 10) === t; }), mt = n.filter(function (g) { return g.tur === "Montaj" || g.tur === "Keşif"; }).length, pa = PA.filter(function (x) { return x.tarih.slice(0, 10) === t; }).length;
        H += '<button class="sbAyG' + (t === b ? " bu" : "") + (t < b && n.length ? " gec" : "") + '" data-sbplg="' + t + '"><b>' + d2 + "</b>" + (n.length ? "<span>" + n.length + " görev</span>" : "") + (mt ? '<em class="t">' + mt + " saha</em>" : "") + (pa ? '<em class="p">' + pa + " proje</em>" : "") + "</button>"; }
      ic = '<section class="sbK"><div class="sbAyB">' + ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(function (x) { return "<b>" + x + "</b>"; }).join("") + '</div><div class="sbAy">' + H + '</div><div class="sbKay"><i></i>Güne dokunun: o günün listesi açılır · saha = keşif ve montaj</div></section>';
    }
    ic += sbKapasite(V, GV, PA);
    m.innerHTML = ust + ic + "</div>";
    sbPlBagla(V);
  }).catch(function (e) { m.innerHTML = '<div class="sbSayfa">' + sbBos("sbUyari", "Plan yüklenemedi", sbEsc(e.message || "")) + "</div>"; });
}
function sbSaatSir(x, y) { return String(x.tarih || "9") < String(y.tarih || "9") ? -1 : 1; }
function sbHaftaBas(t) { var d = new Date(t + "T12:00:00"), k = (d.getDay() + 6) % 7; return sbGunEkle(t, -k); }
function sbPlBas(g, t) { if (g === "gun") return sbGunAd(t); if (g === "ay") return AY_AD_SB[+t.slice(5, 7) - 1] + " " + t.slice(0, 4); var b = sbHaftaBas(t); return tarih(b).slice(0, 5) + " – " + tarih(sbGunEkle(b, 6)).slice(0, 5); }
function sbPlSat(g, V, kisa) {
  var a = g.aday ? V.AM[g.aday] || (g.expand || {}).aday || {} : null, S = (g.sorumlu || []).map(function (i) { var u = V.UM[i]; return u ? (u.name || u.email).split(" ")[0] : ""; }).filter(Boolean), t = String(g.tarih || ""), b = V.b, gc = t && t.slice(0, 10) < b;
  return '<div class="sbPlS' + (gc ? " gec" : "") + '"' + (a ? ' data-sbgit="' + g.aday + '"' : "") + '><span class="sbPlZ">' + (gc ? tarih(t).slice(0, 5) + "<small>" + gunFark(t, b) + " gün geç</small>" : g.saatli ? t.slice(11, 16) : kisa ? "" : "gün içi") + '</span><span class="sbPlR" style="background:' + (SB_TUR_RENK[g.tur] || "#64748b") + '"></span><div class="sbPlT"><small>' + sbEsc(g.tur) + (g.oncelik === "Yüksek" ? ' · <b class="kt">yüksek</b>' : "") + "</small><b>" + sbEsc(g.baslik) + "</b><small>" + sbEsc([a && a.ad, g.adres || (a && a.ilce), S.join(" + ")].filter(Boolean).join(" · ")) + "</small></div>" +
    '<span class="sbGvB">' + (a ? sbTelBtn(a, "k") : "") + (satisci() || yd("proje") ? '<button class="sbIb k" data-sbplt="' + g.id + '" aria-label="Tamamlandı">' + sbI("sbOk") + "</button>" : "") + "</span></div>";
}
function sbPaSat(x) { var gc = x.s.gec > 0; return '<a class="sbPlS' + (gc ? " gec" : "") + '" href="#aday/' + x.p.aday + '" data-sbprj="' + x.p.aday + '"><span class="sbPlZ">son<small>' + tarih(x.s.son).slice(0, 5) + '</small></span><span class="sbPlR" style="background:' + (SB_TUR_RENK[x.tur] || "#64748b") + '"></span><div class="sbPlT"><small>Proje adımı · ' + (x.s.kol === "saha" ? "saha" : "resmî") + "</small><b>" + sbEsc(x.s.ad) + "</b><small>" + sbEsc([x.a.ad, x.p.kwp ? sayi(x.p.kwp, 1) + " kWp" : "", gc ? x.s.gec + " gün gecikti" : ""].filter(Boolean).join(" · ")) + "</small></div></a>"; }
function sbKapasite(V, GV, PA) {
  if (!yt("proje") && !yon()) return ""; var b = V.b, H = []; for (var i = 0; i < 4; i++) { var bs = sbGunEkle(sbHaftaBas(b), i * 7), bt = sbGunEkle(bs, 6);
    H.push({ bs: bs, m: GV.filter(function (g) { return g.durum === "Açık" && g.tur === "Montaj" && String(g.tarih || "").slice(0, 10) >= bs && String(g.tarih).slice(0, 10) <= bt; }).length, k: GV.filter(function (g) { return g.durum === "Açık" && g.tur === "Keşif" && String(g.tarih || "").slice(0, 10) >= bs && String(g.tarih).slice(0, 10) <= bt; }).length, p: PA.filter(function (x) { return x.tur === "Montaj" && x.tarih.slice(0, 10) <= bt && x.tarih.slice(0, 10) >= bs; }).length }); }
  var bek = (V.P || []).filter(function (p) { return p.durum === "Sürüyor" && !((p.adimlar || {}).montaj || {}).durum; }).length, kap = 2;
  return sbKart("Kurulum kapasitesi", '<div class="sbKap4">' + H.map(function (h, i) { var y = h.m / kap; return '<div class="' + (y > 1 ? "kt" : y >= 1 ? "u" : "") + '"><small>' + (i ? tarih(h.bs).slice(0, 5) + " haftası" : "Bu hafta") + "</small><b>" + h.m + "<span>/" + kap + "</span></b><small>montaj · " + h.k + " keşif" + (h.p ? " · " + h.p + " son tarih" : "") + "</small></div>"; }).join("") + "</div>" +
    '<div class="sbKay' + (bek ? " u" : "") + '"><i></i>Montajı bekleyen ' + bek + " proje · haftalık kapasite " + kap + " montaj (varsayım; ekip sayısına göre ayarlanacak)</div>", { ks: "önümüzdeki 4 hafta" });
}
function sbPlBagla(V) {
  var yen = function () { sbSifirla(); sPlanlama(); };
  bagT("[data-sbpln]", function (e) { var n = +e.dataset.sbpln; if (!n) PL.gun = V.b; else if (PL.gor === "gun") PL.gun = sbGunEkle(PL.gun, n); else if (PL.gor === "ay") { var d = new Date(PL.gun.slice(0, 7) + "-15T12:00:00"); d.setMonth(d.getMonth() + n); PL.gun = d.toISOString().slice(0, 10); } else PL.gun = sbGunEkle(PL.gun, 7 * n); sPlanlama(); });
  bagT("[data-sbplg]", function (e) { PL.gun = e.dataset.sbplg; PL.gor = "gun"; location.hash = "#planlama/gun"; });
  bagT("[data-sbplt]", function (e) { var g = V.GV.filter(function (x) { return x.id === e.dataset.sbplt; })[0]; if (g) sbGorevTamam(g, yen); });
  var k = $("sbPlK"); if (k) k.onchange = function () { PL.kim = this.value; sPlanlama(); };
  var t = $("sbPlT"); if (t) t.onchange = function () { PL.tur = this.value; sPlanlama(); };
  var y = $("sbPlY"); if (y) y.onclick = function () { sbGorevPanelMus(V, yen); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-sbprj]"), function (a) { a.addEventListener("click", function () { SB.detSek[a.dataset.sbprj] = "proje"; }); });
  sbGitBagla2();
}
function sbGorevPanelMus(V, sonra) {
  var A = V.A.filter(sbAcik).concat(V.A.filter(function (a) { return a.asama === "Sözleşme"; }));
  panelAc('<div class="pnlB"><b>Yeni görev</b><small>Önce müşteriyi seçin (isteğe bağlı)</small></div><div class="f"><input id="sbGmA" list="sbGmL" placeholder="Müşteri adı (boş bırakılabilir)" autocomplete="off"><datalist id="sbGmL">' + A.slice(0, 600).map(function (a) { return '<option value="' + sbEsc(a.ad + (a.ilce ? " · " + a.ilce : "")) + '">'; }).join("") + '</datalist><button class="btn pri" id="sbGmD">Devam</button></div>', "alt");
  $("sbGmD").onclick = function () { var v = $("sbGmA").value.trim(), a = v ? A.filter(function (x) { return x.ad + (x.ilce ? " · " + x.ilce : "") === v || x.ad === v; })[0] : null; if (v && !a) { toast("Listeden bir müşteri seçin ya da boş bırakın"); return; } sbGorevPanel(a, null, sonra, { tarih: PL.gun + " 09:00" }); };
}
/* ---------- PROJELER ---------- */
function sProjelerB() {
  sbNav(); var m = $("m"); m.className = "sbM"; if (!m.querySelector(".sbPj")) m.innerHTML = sbIskelet();
  Promise.all([liste("projeler", "", "-basla", "aday"), sbVeri().catch(function () { return null; })]).then(function (R) {
    var P = R[0], V = R[1] || { F: null, kur: 0, GV: null }, f = PF.d, b = bugun(), D = {}; P.forEach(function (p) { D[p.id] = prjDurum(p); });
    var sur = P.filter(function (p) { return p.durum === "Sürüyor"; }), gec = sur.filter(function (p) { return D[p.id].kirmizi.length; }), L = P.filter(function (p) { return f === "Tümü" || p.durum === f; }).sort(function (x, y) { return D[y.id].kirmizi.length - D[x.id].kirmizi.length || (x.basla < y.basla ? 1 : -1); });
    var fiyat = yt("teklif") || yt("fin"), tah = function (p) { return V.F ? V.F.filter(function (h) { return h.aday === p.aday && h.durum === "Gerçekleşti"; }).reduce(function (s, h) { return s + (h.pb === "TRY" ? +h.tutar : (+h.tutar || 0) * ((+h.kur) || V.kur)); }, 0) : null; };
    var kart = function (p) { var d = D[p.id], a = (p.expand || {}).aday || {}, A2 = p.adimlar || {}, yz = d.top ? Math.round(d.tamam / d.top * 100) : 0, PK = prjKol(p), nx = d.sonraki.filter(function (s) { return !s.kilit; })[0], t = tah(p), sor = V.UM && V.UM[a.sorumlu];
      var grp = function (k) { if (!PK[k]) return ""; var S = PK[k].adim, ok = S.filter(function (s) { return (A2[s[0]] || {}).durum === "tamam"; }).length; return '<div class="sbPjG"><small>' + (k === "saha" ? "Saha" : "Resmî") + " " + ok + "/" + S.length + '</small><span class="sbPjD">' + S.map(function (s) { var x = A2[s[0]] || {}, ge = d.kirmizi.some(function (r) { return r.indexOf(s[1] + " (") === 0; }); return '<i class="' + (x.durum === "tamam" ? "ok" : ge ? "kt" : d.sonraki.some(function (n) { return n.k === s[0]; }) ? "s" : "") + '" title="' + sbEsc(s[1]) + '"></i>'; }).join("") + "</span></div>"; };
      return '<a class="sbK sbPjK' + (d.kirmizi.length && p.durum === "Sürüyor" ? " gec" : "") + '" href="#aday/' + p.aday + '" data-sbprj="' + p.aday + '"><div class="sbPjU">' + sbAv(a.ad, p.durum === "Tamamlandı" ? "#15803d" : "#0d9488", 40) + '<div class="sbPjA"><b>' + sbEsc(a.ad || "—") + "</b><small>" + sbEsc([a.ilce, p.kwp ? sayi(p.kwp, 1) + " kWp" : "", p.tur].filter(Boolean).join(" · ")) + '</small></div><b class="sbPjY">%' + yz + "</b></div>" +
        '<span class="sbBar"><b style="width:' + yz + "%" + (d.kirmizi.length ? ";background:#dc2626" : "") + '"></b></span><div class="sbPjGs">' + grp("saha") + grp("resmi") + "</div>" +
        '<div class="sbPjB"><span><small>Bedel</small><b>' + (fiyat ? sayi(p.bedelUsd) + " $" : "—") + "</b></span><span><small>Tahsilat</small><b>" + (t != null ? sbTL(t) : "—") + "</b></span><span><small>Sorumlu</small><b>" + sbEsc(sor ? (sor.name || "").split(" ")[0] : "—") + "</b></span></div>" +
        '<small class="sbPjN' + (d.kirmizi.length ? " kt" : "") + '">' + sbEsc(p.durum !== "Sürüyor" ? p.durum : d.kirmizi.length ? "Geciken: " + d.kirmizi.join(", ") : nx ? "Sıradaki: " + nx.ad + " · " + tarih(nx.son) : "Adımlar tamam") + "</small></a>"; };
    var GV = V.GV || [], PA = []; sur.forEach(function (p) { D[p.id].sonraki.forEach(function (s) { if (!s.kilit) PA.push({ p: p, a: (p.expand || {}).aday || {}, s: s, tarih: s.son, tur: s.k === "montaj" ? "Montaj" : s.kol === "saha" ? "Diğer" : "Resmî işlem" }); }); });
    var hf = PA.filter(function (x) { return x.tarih.slice(0, 10) <= sbGunEkle(b, 7); }).sort(function (x, y) { return x.tarih < y.tarih ? -1 : 1; });
    m.innerHTML = '<div class="sbSayfa sbPj">' + sbBas("Projeler", "Sözleşme sonrası saha ve resmî süreç") +
      '<div class="sbKp">' + sbKpi("sbPanel", "Süren", sur.length, sayi(sur.reduce(function (s, p) { return s + (+p.kwp || 0); }, 0), 1) + " kWp", "#projeler", null) + sbKpi("sbUyari", "Geciken adım", gec.length, gec.length ? "kırmızı kartlar" : "gecikme yok", "#projeler", null, gec.length ? "kt" : "") +
      sbKpi("sbKamyon", "Montaj bekleyen", sur.filter(function (p) { return !((p.adimlar || {}).montaj || {}).durum; }).length, "planlama › kapasite", "#planlama/hafta", null) + sbKpi("sbOk", "Tamamlanan", P.filter(function (p) { return p.durum === "Tamamlandı"; }).length, "toplam", "#projeler", null) + "</div>" +
      '<div class="sbIki"><div class="sbSut">' + (hf.length ? sbKart("7 gün içinde son tarihi gelen", hf.slice(0, 10).map(sbPaSat).join(""), { ks: hf.length + " adım" }) : "") +
      '<div class="sbSeg" style="margin:2px 0 10px">' + ["Sürüyor", "Tamamlandı", "İptal", "Tümü"].map(function (c) { return '<button data-pf="' + c + '" aria-pressed="' + (f === c) + '">' + c + "</button>"; }).join("") + "</div>" +
      (L.length ? '<div class="sbPjL">' + L.map(kart).join("") + "</div>" : sbBos("sbPanel", "Proje yok", "Sözleşme aşamasındaki müşterinin Proje sekmesinden başlatılır.")) + '</div><div class="sbSut">' + (V.GV ? sbKapasite(V, GV, PA) : "") +
      sbKart("Adım düzeni", '<div class="sbKv"><span>Saha işleri</span><b>' + PRJ_SAHA.map(function (s) { return s[1]; }).join(" · ") + '</b></div><div class="sbKv"><span>Resmî işlemler</span><b>' + PRJ_RESMI.length + ' adım</b></div><div class="sbKay"><i></i>12 adım aynen korunur · yeşil tamam · turuncu sıradaki · kırmızı gecikmiş</div>') + "</div></div></div>";
    bagT("[data-pf]", function (e) { PF.d = e.dataset.pf; sProjeler(); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-sbprj]"), function (a) { a.addEventListener("click", function () { SB.detSek[a.dataset.sbprj] = "proje"; }); });
  }).catch(function (e) { m.innerHTML = '<div class="sbSayfa">' + sbBos("sbUyari", "Projeler yüklenemedi", sbEsc(e.message || "")) + "</div>"; });
}
/* ---------- Diğer sayfalar: aynı kabuk (menü + kart dili) ---------- */
function sbSarmala(f, sinif) { return function () { sbNav(); var m = $("m"); if (m) { m.className = "sbM " + (sinif || ""); } return f.apply(this, arguments); }; }
/* ---------- yönlendirme ---------- */
var SB_ADAY0 = sAday, SB_TEKLIF0 = sTeklif, SB_TEKLIFLER0 = sTeklifler;
sAdaylar = sAdaylarB; sAday = sAdayB; sTeklifler = sTekliflerB; sTeklif = sTeklifB; sProjeler = sProjelerB;
sKatalog = sbSarmala(sKatalog, "sbEski sbKat"); sReklamlar = sbSarmala(sReklamlar, "sbEski sbRek"); sYeni = sbSarmala(sYeni, "sbEski sbYeniM");
(function () { var e0 = sEkip; sEkip = function () { var s = SB.ekipSek; SB.ekipSek = null; var r = e0.apply(this, arguments); if (s) sbBekle(function () { return document.querySelector("[data-eksk=" + s + "]"); }, function (x) { x.click(); }); return r; }; })();
(function () { var b0 = sBugun; sBugun = function () { var s = (location.hash.replace(/^#/, "").split("/")[0]) || ""; var arg = location.hash.split("/")[1];
  if (s === "satis") return sSatisGenel(); if (s === "hedefler") return sSatisHedef(); if (s === "planlama") return sPlanlama(arg); if (s === "sdiger") return sSatisDiger();
  return b0.apply(this, arguments); }; })();
