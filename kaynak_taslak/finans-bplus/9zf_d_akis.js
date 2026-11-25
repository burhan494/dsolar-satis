/* v92 · Finans B+ Premium — Kısa vade nakit akışı (7/30/60/90/özel), durum ayrımı, tampon, "Ne olur?" denemesi */
FB.sen = { gec: false, tah: false, ek: 0, ekT: "" }; FB.yonF = ""; FB.stF = "";
function fbAkis(alt2) {
  if (alt2 === "giris" || alt2 === "cikis") FB.yonF = alt2;
  fbVeri().then(function () {
    var V = FB.v, b = V.b, R = fbHesap(FB.s), per = FB.per, mob = window.innerWidth < 1000;
    var bit = per === -1 ? (FB.ozS || gunSonra(30)) : gunSonra(per), bas = per === -1 ? (FB.ozB && FB.ozB > b ? FB.ozB : b) : b;
    var P = fbProj(R, bit), Ps = fbSenaryoProj(R, bit), senAcik = FB.sen.gec || FB.sen.tah || FB.sen.ek > 0;
    // pencere (özel aralıkta başlangıç tarihine kadar olanlar başlangıç nakdine katılır)
    var Lw = P.L.filter(function (k) { return (k.t < b ? b : k.t) >= bas; }), basN = P.bas + P.L.filter(function (k) { return (k.t < b ? b : k.t) < bas; }).reduce(function (t, k) { return t + (k.yon === "Giriş" ? 1 : -1) * k.usd; }, 0);
    var gir = Lw.filter(function (k) { return k.yon === "Giriş"; }).reduce(function (t, k) { return t + k.usd; }, 0), cik = Lw.filter(function (k) { return k.yon !== "Giriş"; }).reduce(function (t, k) { return t + k.usd; }, 0);
    var perB = '<div class="sbSeg w fbPer" style="grid-template-columns:repeat(5,minmax(0,1fr))">' + [[7, "7 gün"], [30, "30 gün"], [60, "60 gün"], [90, "90 gün"], [-1, "Özel"]].map(function (x) { return '<button data-fbper="' + x[0] + '" aria-pressed="' + (per === x[0]) + '">' + x[1] + "</button>"; }).join("") + "</div>" +
      (per === -1 ? '<div class="fbIki fbOz"><label class="fbLbl">Başlangıç<input type="date" id="fbOzB" min="' + b + '" value="' + bas + '"></label><label class="fbLbl">Bitiş<input type="date" id="fbOzS" min="' + b + '" max="' + gunSonra(150) + '" value="' + bit + '"></label></div>' : "");
    var pan = '<div class="sbPan fbPan"><div class="fbLb">' + (per === -1 ? tarih(bas) + " – " + tarih(bit) : per + " gün · " + tarih(b).slice(0, 5) + " – " + tarih(bit)) + " · " + fbSirketAd(FB.s) + '</div><div class="fbBig">' + fbF(P.son) + ' <small class="fbBigS">dönem sonu</small></div>' +
      fbGrafik(P, mob ? 340 : 640, mob ? 118 : 160, true) +
      '<div class="fbKy fbKy4"><div><b>' + fbF(basN) + "</b><span>başlangıç nakdi</span></div><div><b class=\"fbGirA\">" + fbF(gir, { isaret: true }) + "</b><span>beklenen tahsilat</span></div><div><b class=\"fbCikA\">" + fbF(-cik) + "</b><span>planlanan ödeme</span></div><div><b class=\"" + (P.eksi ? "fbKt" : P.alt ? "fbUy" : "") + '">' + fbF(P.min.v) + "</b><span>en düşük · " + tarih(P.min.t) + "</span></div></div>" +
      '<div class="fbPanR">' + (P.eksi ? '<span class="sbCh kt">Nakit açığı · ' + tarih(P.eksi) + "</span>" : '<span class="sbCh d">Nakit açığı yok</span>') + (P.tampon ? P.alt ? '<span class="sbCh u">Tampon altı · ' + tarih(P.alt) + " · açık " + fbK(P.acik) + "</span>" : '<span class="sbCh d">Tampon ' + fbK(P.tampon) + " korunuyor</span>" : '<a class="sbCh d" href="#finans/ayar">Tampon belirlenmemiş</a>') + "</div></div>";
    var sirk = FB.s !== "hep" ? "" : '<div class="sbPane fbK"><div class="sbKh"><h2>Şirketler ayrı</h2><small class="fbKs">bir şirketin fazlası diğerinin açığını kapatmaz</small></div><table class="sbTb fbTb"><tr><th></th><th class="r dC">Bugün</th><th class="r">Dönem sonu</th><th class="r">En düşük</th><th class="r">Durum</th></tr>' +
      FB_SIRKETLER.map(function (s) { var r = fbHesap(s), p = fbProj(r, bit); return "<tr><td><b>" + s + '</b><small class="fbMut">tampon ' + (p.tampon ? fbK(p.tampon) : "yok") + '</small></td><td class="r n dC">' + fbF(r.kul) + '</td><td class="r n">' + fbF(p.son) + '</td><td class="r n">' + fbF(p.min.v) + "<small>" + tarih(p.min.t).slice(0, 5) + '</small></td><td class="r">' + (p.eksi ? '<i class="sbCh kt">eksi · ' + tarih(p.eksi).slice(0, 5) + "</i>" : p.alt ? '<i class="sbCh u">tampon altı · ' + tarih(p.alt).slice(0, 5) + "</i>" : '<i class="sbCh ok">yeterli</i>') + "</td></tr>"; }).join("") + "</table></div>";
    var sum = function (st, y) { return P.L.filter(function (k) { return k.st === st && (!y || k.yon === y); }).reduce(function (t, k) { return t + k.usd; }, 0); };
    var ayr = '<div class="sbPane fbK"><div class="sbKh"><h2>Hareketlerin güvenilirliği</h2><small class="fbKs">giriş / çıkış</small></div>' +
      [["kes", "sözleşme, kredi, çek, onaylı ödeme, sabit gider, faturalı kira"], ["pla", "elle girilmiş beklenti ve ödeme planı"], ["tah", "GES kira ve reaktif bedel tahmini"]].map(function (x) { return '<div class="sbKv"><span>' + fbStEt(x[0]) + " <small>" + x[1] + "</small></span><b>" + fbK(sum(x[0], "Giriş"), { isaret: true }) + " / " + fbK(-sum(x[0], "Çıkış")) + "</b></div>"; }).join("") +
      '<div class="sbKv"><span>' + fbStEt("gec") + ' <small>geciken tahsilat · nakde sayılmadı</small></span><b>' + fbK(P.T.gecG) + '</b></div><div class="sbKv"><span>' + fbStEt("gec") + ' <small>geciken ödeme · bugün düşüldü</small></span><b>' + fbK(-P.T.gecC) + "</b></div>" +
      '<div class="sbKv"><span>' + fbStEt("bel") + ' <small>tarihi belirsiz proje alacağı · akışa girmez</small></span><b>' + fbK(R.belTop) + "</b></div></div>";
    var sen = '<div class="sbPane fbK"><div class="sbKh"><h2>' + fbI("sbKalem", "s") + 'Ne olur?</h2><i class="sbEt">deneme</i><small class="fbKs">kayıtları değiştirmez</small></div><div class="fbSenB">' +
      '<button class="sbCh' + (FB.sen.gec ? " ok" : "") + ' fbSenC" data-fbsen="gec">Tahsilatlar 15 gün gecikirse</button><button class="sbCh' + (FB.sen.tah ? " ok" : "") + ' fbSenC" data-fbsen="tah">Tahmini gelirler gelmezse</button></div>' +
      '<div class="fbIki"><label class="fbLbl">Ek ödeme<div class="fbInp"><input id="fbSnE" class="fbTutar" inputmode="decimal" value="' + (FB.sen.ek ? String(Math.round(fbCev(FB.sen.ek))).replace(".", ",") : "") + '" placeholder="0"><span>' + fbSem() + '</span></div></label><label class="fbLbl">Tarihi<input type="date" id="fbSnT" min="' + b + '" value="' + (FB.sen.ekT || gunSonra(7)) + '"></label></div>' +
      (senAcik ? '<div class="sbUy ' + (Ps.eksi ? "kt" : "") + '">' + fbI("sbUyari", "s") + "<span><b>Deneme sonucu:</b> dönem sonu " + fbF(Ps.son) + ", en düşük " + fbF(Ps.min.v) + " (" + tarih(Ps.min.t) + ")" + (Ps.eksi ? ", nakit " + tarih(Ps.eksi) + " eksiye düşüyor" : Ps.alt ? ", tampon " + tarih(Ps.alt) + " aşılıyor (açık " + fbK(Ps.acik) + ")" : ", tampon korunuyor") + '.</span><button class="sbBtn fbSif" id="fbSnS">Sıfırla</button></div>' : '<small class="fbMut">Bir seçenek açın ya da ek ödeme yazın.</small>') + "</div>";
    var F = Lw.filter(function (k) { return (!FB.yonF || (FB.yonF === "giris") === (k.yon === "Giriş")) && (!FB.stF || k.st === FB.stF); });
    var gr = {}; F.forEach(function (k) { var t = k.t < b ? b : k.t, d = gunFark(b, t), g = d === 0 ? "Bugün" : d <= 7 ? "Bu hafta" : d <= 14 ? "Gelecek hafta" : ayAd(t.slice(0, 7)); (gr[g] = gr[g] || []).push(k); });
    var fil = '<div class="fbFil"><div class="sbSeg k fbSeg">' + [["", "Tümü"], ["giris", "Giriş"], ["cikis", "Çıkış"]].map(function (x) { return '<button data-fbyon="' + x[0] + '" aria-pressed="' + (FB.yonF === x[0]) + '">' + x[1] + "</button>"; }).join("") + '</div><label class="fbSel"><select id="fbStF"><option value="">Bütün durumlar</option>' + [["kes", "Kesin"], ["pla", "Planlı"], ["tah", "Tahmini"], ["gec", "Gecikmiş"]].map(function (x) { return '<option value="' + x[0] + '"' + (FB.stF === x[0] ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + "</select></label></div>";
    var lst = '<div class="sbPane fbK"><div class="sbKh"><h2>Hareketler</h2><small class="fbKs">' + F.length + " kalem · tarih sırasıyla</small></div>" + fil + (Object.keys(gr).map(function (g) { return '<div class="fbGun">' + g + "</div>" + gr[g].map(fbHarSat).join(""); }).join("") || '<div class="sbBosK">Bu dönemde hareket yok.</div>') +
      '<a class="fbKl" href="#finans/plan">Gelecek / Gidecek listesinde düzenle' + fbI("sbSag", "xs") + "</a></div>";
    var bel = R.BEL.length ? '<div class="sbPane fbK"><div class="sbKh"><h2>Tarihi belirsiz proje alacakları</h2><small class="fbKs">tarih uydurulmaz · akışa dahil değil</small></div>' + R.BEL.map(function (x) { return '<div class="sbKv"><span><b class="fbHsA">' + fbEsc(x.ad) + "</b><small>sözleşme " + fbF(x.p.bedelUsd) + " · planlı/tahsil " + fbF(x.p.bedelUsd - x.kalan) + "</small></span><b>" + fbF(x.kalan) + "</b></div>"; }).join("") + '<a class="fbKl" href="#finans/nakit">Tarih vermek için 6–12 ay ekranı' + fbI("sbSag", "xs") + "</a></div>" : "";
    $("fbUst").innerHTML = fbBaslik("Nakit akışı", fbKurEt(), "") + '<div class="fbSecS">' + fbSecici() + "</div>" + fbAltNav([["akis", "Kısa vade"], ["nakit", "6–12 ay"], ["plan", "Plan"]].concat(yt("ortak") ? [["senaryo", "5 yıl"]] : []), "akis");
    $("fm").innerHTML = perB + '<div class="fbIz"><div class="fbSol">' + pan + sirk + lst + '</div><div class="fbSag">' + ayr + sen + bel + "</div></div>";
    fbSeciciBagla(function () { fbAkis(); });
    bagT("[data-fbper]", function (e) { FB.per = +e.dataset.fbper; try { localStorage.setItem("fbPer", FB.per); } catch (x) {} fbAkis(); });
    if ($("fbOzB")) { $("fbOzB").onchange = function () { FB.ozB = this.value; fbAkis(); }; $("fbOzS").onchange = function () { FB.ozS = this.value; fbAkis(); }; }
    bagT("[data-fbyon]", function (e) { FB.yonF = e.dataset.fbyon; fbAkis(); }); $("fbStF").onchange = function () { FB.stF = this.value; fbAkis(); };
    bagT("[data-fbsen]", function (e) { FB.sen[e.dataset.fbsen] = !FB.sen[e.dataset.fbsen]; fbAkis(); });
    $("fbSnE").onchange = function () { var n = fbNum(this.value) || 0; FB.sen.ek = n > 0 ? n / fbCev(1) : 0; FB.sen.ekT = $("fbSnT").value; fbAkis(); };
    $("fbSnT").onchange = function () { FB.sen.ekT = this.value; if (FB.sen.ek) fbAkis(); };
    if ($("fbSnS")) $("fbSnS").onclick = function () { FB.sen = { gec: false, tah: false, ek: 0, ekT: "" }; fbAkis(); };
    fbGizUygula(); fbKonumGeri();
  }).catch(hata);
}
/* "Ne olur?" — yalnız ekranda: kalemler kopyalanır, gerçek kayıtlar değişmez */
function fbSenaryoProj(R, bitis) {
  var S = FB.sen, IT = R.IT.map(function (k) { return Object.assign({}, k); });
  if (S.gec) IT.forEach(function (k) { if (k.yon === "Giriş" && k.st !== "gec") k.t = gunSonra(15, k.t < FB.v.b ? FB.v.b : k.t); });
  if (S.tah) IT = IT.filter(function (k) { return k.st !== "tah"; });
  if (S.ek > 0) IT.push({ t: S.ekT || gunSonra(7), usd: S.ek, yon: "Çıkış", st: "pla", ad: "Deneme: ek ödeme" });
  IT.sort(function (x, y) { return x.t < y.t ? -1 : x.t > y.t ? 1 : 0; });
  return fbProj(Object.assign({}, R, { IT: IT }), bitis);
}
