/* v92 · Finans B+ Premium — Hesaplar, bakiye düzeltme, transfer */
FB.hf = { banka: "", pb: "", sifir: false };
function fbBankaAd(h) { return h.tur === "Kasa" ? "Kasa" : h.banka || (h.ad || "").replace(/^(D Solar|DRK)\s+/, "").split(" ")[0] || "Diğer"; }
function fbHesaplar() {
  Promise.all([fbVeri(), fbListe0("fin_limitler", "", "banka").catch(function () { return []; })]).then(function (X) {
    var V = FB.v, LM = X[1].filter(function (l) { return FB.s === "hep" || (l.sirket || "D Solar") === FB.s; }), R = fbHesap(FB.s), KU = V.KU, f = FB.hf;
    var kartBos = V.KT.filter(function (k) { return k.durum !== "Kapandı" && (FB.s === "hep" || (k.sirket || "D Solar") === FB.s) && k.limit > 0; }).reduce(function (t, k) { return t + usdKarsilik(Math.max(0, k.limit - (+k.borc || 0)), k.pb || "TRY", KU); }, 0);
    var nakdiBos = LM.reduce(function (t, l) { return t + Math.max(0, (+l.nakdiLimit || 0) - (+l.nakdiRisk || 0)); }, 0) / KU.usd;
    var kp = '<div class="sbKp fbKp">' + fbKpi("fbCuzdan", "Kullanılabilir nakit", fbK(R.kul), "vadesiz + kasa" + (R.kmh ? " · KMH eksisi düşüldü" : ""), "#finans/genel") +
      fbKpi("sbKilit", "Vadeli mevduat", fbK(R.vadeli), "ayrı · kullanılabilire dahil değil", "#finans/kasa") +
      fbKpi("fbPasta", "Toplam finansal varlık", fbK(R.kul + R.vadeli), "nakit + vadeli", "#finans/mali") +
      fbKpi("fbKart", "Kullanılabilir kredi limiti", fbK(kartBos + nakdiBos), "borç değil, imkân · kart " + fbK(kartBos) + " · nakdi " + fbK(nakdiBos), "#finans/kredi") + "</div>";
    var H = R.H.filter(function (h) { return h.aktif; }), bankalar = [], pbs = [];
    H.forEach(function (h) { var b = fbBankaAd(h); if (bankalar.indexOf(b) < 0) bankalar.push(b); if (pbs.indexOf(h.pb) < 0) pbs.push(h.pb); });
    var fil = '<div class="fbFil"><label class="fbSel">' + fbI("fbBanka", "s") + '<select id="fbHB"><option value="">Bütün bankalar</option>' + bankalar.sort().map(function (b) { return '<option' + (f.banka === b ? " selected" : "") + ">" + fbEsc(b) + "</option>"; }).join("") + "</select></label>" +
      '<div class="sbSeg k fbSeg">' + [["", "Tümü"], ["TRY", "TL"], ["USD", "USD"], ["EUR", "EUR"]].filter(function (x) { return !x[0] || pbs.indexOf(x[0]) >= 0; }).map(function (x) { return '<button data-fbhp="' + x[0] + '" aria-pressed="' + (f.pb === x[0]) + '">' + x[1] + "</button>"; }).join("") + "</div></div>";
    var sifir = 0, liste = H.filter(function (h) { if (f.banka && fbBankaAd(h) !== f.banka) return false; if (f.pb && h.pb !== f.pb) return false; var z = Math.abs(V.B[h.id] || 0) < 0.005; if (z) sifir++; return f.sifir || !z; });
    var gr = {}; liste.forEach(function (h) { var k = (h.sirket || "Diğer") + "|" + fbBankaAd(h); (gr[k] = gr[k] || []).push(h); });
    var kartlar = Object.keys(gr).sort().map(function (k) { var p = k.split("|"), L = gr[k], top = L.reduce(function (t, h) { return h.tur === "Vadeli" ? t : t + usdKarsilik(V.B[h.id] || 0, h.pb, KU); }, 0);
      return '<div class="sbPane fbK fbHk"><div class="sbKh"><h2>' + bankaRozet(p[1] === "Kasa" ? "kasa" : p[1]) + fbEsc(p[1]) + (FB.s === "hep" ? ' <i class="sbEtN">' + fbEsc(p[0]) + "</i>" : "") + '</h2><b class="fbKsag">' + fbF(top) + "</b></div>" +
        L.map(function (h) { var bk = V.B[h.id] || 0, ad = h.ad.replace(new RegExp("^" + (h.sirket || "") + "\\s+"), "");
          return '<button class="sbKv fbHr" data-fbab="' + h.id + '"><span><b class="fbHsA">' + fbEsc(ad) + "</b><small>" + fbEsc([h.tur === "Vadesiz" ? "" : h.tur, h.hesapNo].filter(Boolean).join(" · ")) + (h.tur === "Vadeli" ? ' <i class="sbEtN">nakde dahil değil</i>' : "") + (h.acilisTarihi ? " · ekstre " + tarih(h.acilisTarihi.slice(0, 10)) : "") + '</small></span><b class="' + (bk < 0 ? "fbKt" : "") + '">' + fbOrj(bk, h.pb) + (h.pb !== FB.pb ? "<small>≈ " + fbF(usdKarsilik(bk, h.pb, KU)) + "</small>" : "") + "</b></button>"; }).join("") + "</div>"; });
    var sol = [], sag = []; kartlar.forEach(function (k, i) { (i % 2 ? sag : sol).push(k); });
    $("fbUst").innerHTML = fbBaslik("Hesaplar", H.length + " aktif hesap · " + fbKurEt(), yd("fin") ? '<button class="sbBtn" id="fbTrB">' + fbI("fbBorc", "s") + 'Transfer</button><a class="sbBtn or yalnizD" href="#finans/hesap">' + fbI("sbArti", "s") + "Hesap</a>" : "") +
      '<div class="fbSecS">' + fbSecici() + "</div>" + fbAltNav([["kasa", "Hesaplar"], ["hareket", "Hareketler"], ["hesap", "Yönetim"]], "kasa");
    $("fm").innerHTML = kp + fil + '<div class="fbIz fbIz2"><div class="fbSol">' + sol.join("") + '</div><div class="fbSag">' + sag.join("") + "</div></div>" +
      (sifir ? '<button class="sbBtn fbTam" id="fbSf">' + (f.sifir ? "Sıfır bakiyeli hesapları gizle" : "Sıfır bakiyeli " + sifir + " hesabı göster") + "</button>" : "") +
      '<div class="fbSrc"><i></i>Bakiye = son ekstre bakiyesi + sonrasında bu hesaba bağlanan gerçekleşmiş hareketler. Dokununca düzeltme formu açılır; her düzeltme kaydedilir.</div>' + kurKarti(KU);
    fbSeciciBagla(fbHesaplar); kurBagla(KU, function () { fbVeri(true).then(fbHesaplar); });
    $("fbHB").onchange = function () { f.banka = this.value; fbHesaplar(); };
    bagT("[data-fbhp]", function (e) { f.pb = e.dataset.fbhp; fbHesaplar(); });
    if ($("fbSf")) $("fbSf").onclick = function () { f.sifir = !f.sifir; fbHesaplar(); };
    if ($("fbTrB")) $("fbTrB").onclick = function () { fbTransfer(); };
    bagT("[data-fbab]", function (e) { if (!yd("fin")) { toast("Bakiye düzeltme için Finans düzenleme yetkisi gerekir"); return; } fbDuzelt(e.dataset.fbab); });
    fbGizUygula(); fbKonumGeri();
  }).catch(hata);
}
/* ---------- alttan açılan form ---------- */
function fbSheet(bas, alt, ic, btn) {
  fbSheetKapat(); var d = document.createElement("div"); d.className = "fbOv"; d.id = "fbOv";
  d.innerHTML = '<div class="fbSh" role="dialog" aria-modal="true" aria-label="' + fbEsc(bas) + '"><div class="fbTut"></div><div class="fbShB"><div><h3>' + bas + '</h3><small>' + alt + '</small></div><button class="sbIb k" id="fbShX" aria-label="Kapat">' + fbI("sbX") + "</button></div>" + ic +
    '<div class="fbShA"><button class="sbBtn" id="fbShV">Vazgeç</button><button class="sbBtn pri" id="fbShK">' + btn + "</button></div></div>";
  document.body.appendChild(d); document.body.classList.add("fbShAcik");
  d.onclick = function (e) { if (e.target === d) fbSheetKapat(); }; $("fbShX").onclick = fbSheetKapat; $("fbShV").onclick = fbSheetKapat;
  fbMaskele(d); return d;
}
function fbSheetKapat() { var d = $("fbOv"); if (d) d.remove(); document.body.classList.remove("fbShAcik"); }
function fbNum(v) { if (v == null) return null; var s = String(v).trim().replace(/\s/g, ""), neg = /^[-−]/.test(s); s = s.replace(/^[-−]/, ""); var n = num(s); return n == null ? null : neg ? -n : n; }
function fbDuzelt(id) {
  var V = FB.v, h = V.H.filter(function (x) { return x.id === id; })[0]; if (!h) return; var bk = V.B[h.id] || 0, sem = h.pb === "TRY" ? "₺" : h.pb === "EUR" ? "€" : "$";
  var ic = '<div class="sbKv"><span>Sistemdeki bakiye</span><b>' + fbOrj(bk, h.pb) + '</b></div><label class="fbLbl">Ekstredeki bakiye (eksi olabilir)<div class="fbInp"><input id="fbDY" class="fbTutar" inputmode="decimal" autocomplete="off" placeholder="' + String(Math.round(bk * 100) / 100).replace(".", ",") + '"><span>' + sem + '</span></div></label>' +
    '<div class="sbKv"><span>Fark</span><b id="fbDF">–</b></div><div class="fbIki"><label class="fbLbl">Ekstre tarihi<input id="fbDT" type="date" value="' + V.b + '" max="' + V.b + '"></label><label class="fbLbl">Neden<select id="fbDN"><option value="">Seçin</option>' +
    ["Banka masrafı", "Faiz / getiri", "Kaydı unutulmuş hareket", "Kur / çevrim farkı", "Açılış eşitleme", "Diğer"].map(function (x) { return "<option>" + x + "</option>"; }).join("") + '</select></label></div><label class="fbLbl">Açıklama<input id="fbDA" maxlength="300" placeholder="ör. Kasım hesap işletim ücreti"></label>' +
    '<div class="fbKil">' + fbI("sbGecmis", "s") + "<span>Eski bakiye, yeni bakiye, tarih, neden, açıklama ve işlemi yapan (" + fbEsc(BEN.name || BEN.email) + ") kaydedilir. Geçmiş hareketler değişmez.</span></div><div id=\"fbDG\"></div>";
  fbSheet("Bakiye düzeltme", fbEsc(h.ad) + " · " + fbEsc(h.sirket || ""), ic, "Düzeltmeyi kaydet");
  var fk = function () { var y = fbNum($("fbDY").value); $("fbDF").innerHTML = y == null ? "–" : '<span class="' + (y - bk < 0 ? "fbKt" : "fbGir") + '">' + fbOrj(Math.round((y - bk) * 100) / 100, h.pb) + "</span>"; }; $("fbDY").oninput = fk;
  fbListe0("fin_duzeltmeler", "hesap = '" + h.id + "'", "-created").then(function (L) { if (!L.length || !$("fbDG")) return;
    $("fbDG").innerHTML = '<div class="fbDGl"><b>Önceki düzeltmeler</b>' + L.slice(0, 4).map(function (d) { return '<div class="sbKv"><span>' + tarih(d.tarih.slice(0, 10)) + " · " + fbEsc(d.neden) + "<small>" + fbEsc(d.kimAd) + (d.aciklama ? " · " + fbEsc(d.aciklama) : "") + "</small></span><b>" + fbOrj(d.eski, d.pb) + " → " + fbOrj(d.yeni, d.pb) + "</b></div>"; }).join("") + "</div>"; fbMaskele($("fbDG")); }).catch(function () {});
  $("fbShK").onclick = function () { var y = fbNum($("fbDY").value), bt = this; if (y == null) { toast("Ekstredeki bakiyeyi yazın"); return; } if (!$("fbDN").value) { toast("Neden seçin"); return; } if (!$("fbDT").value) { toast("Tarih gerekli"); return; }
    bt.disabled = true; bt.textContent = "Kaydediliyor…";
    api("/api/dsolar/bakiye-duzelt", { method: "POST", body: { hesap: h.id, yeni: y, tarih: $("fbDT").value, neden: $("fbDN").value, aciklama: $("fbDA").value.trim() } })
      .then(function (r) { fbSheetKapat(); toast("Bakiye düzeltildi · fark " + sayi(r.fark, 2) + " " + (PB_AD[h.pb] || h.pb)); return fbVeri(true); }).then(fbHesaplar)
      .catch(function (e) { bt.disabled = false; bt.textContent = "Düzeltmeyi kaydet"; hata(e); }); };
}
function fbTransfer() {
  var V = FB.v, H = V.H.filter(function (h) { return h.aktif && h.tur !== "Vadeli" && (FB.s === "hep" || h.sirket === FB.s || true); }).sort(function (a, b) { return (a.sirket + a.ad).localeCompare(b.sirket + b.ad, "tr"); });
  var op = function (sec) { var g = {}; H.forEach(function (h) { (g[h.sirket || "Diğer"] = g[h.sirket || "Diğer"] || []).push(h); });
    return '<option value="">Seçin</option>' + Object.keys(g).map(function (s) { return '<optgroup label="' + fbEsc(s) + '">' + g[s].map(function (h) { return '<option value="' + h.id + '"' + (h.id === sec ? " selected" : "") + ">" + fbEsc(h.ad.replace(new RegExp("^" + s + "\\s+"), "")) + " · " + fbEsc(PB_AD[h.pb] || h.pb) + "</option>"; }).join("") + "</optgroup>"; }).join(""); };
  var ic = '<label class="fbLbl">Kaynak hesap<select id="fbTK">' + op("") + '</select><small id="fbTKb" class="fbMut"></small></label><label class="fbLbl">Hedef hesap<select id="fbTH">' + op("") + '</select><small id="fbTHb" class="fbMut"></small></label>' +
    '<div id="fbTI" class="fbIl" hidden><b>Şirketler arası transfer</b><div class="sbSeg k fbSeg">' + [["cari", "Cari"], ["borç", "Borç"], ["sermaye", "Sermaye"]].map(function (x) { return '<button data-fbti="' + x[0] + '" aria-pressed="false">' + x[1] + "</button>"; }).join("") + '</div><small>Birlikte görünümde yalnız bu bağlı iki kayıt birbirini götürür.</small></div>' +
    '<div class="fbIki"><label class="fbLbl">Gönderilen<div class="fbInp"><input id="fbTG" class="fbTutar" inputmode="decimal" autocomplete="off"><span id="fbTGs">–</span></div></label><label class="fbLbl">Alınan<div class="fbInp"><input id="fbTA" class="fbTutar" inputmode="decimal" autocomplete="off"><span id="fbTAs">–</span></div></label></div>' +
    '<div class="fbIki"><label class="fbLbl">Uygulanan kur<input id="fbTU" disabled placeholder="otomatik"></label><label class="fbLbl">Banka masrafı (kaynak hesaptan)<div class="fbInp"><input id="fbTM" class="fbTutar" inputmode="decimal" autocomplete="off" placeholder="0"><span id="fbTMs">–</span></div></label></div>' +
    '<div class="fbIki"><label class="fbLbl">İşlem tarihi<input id="fbTT" type="date" value="' + V.b + '" max="' + V.b + '"></label><label class="fbLbl">Açıklama<input id="fbTD" maxlength="300"></label></div>' +
    '<div class="fbKil">' + fbI("fbBorc", "s") + "<span>Çıkış ve giriş (ve varsa masraf) tek işlemde, birbirine bağlı kaydedilir; biri kaydedilemezse hiçbiri kaydedilmez. Transfer gelir ya da gider sayılmaz; banka masrafı ayrı gider olarak yazılır. Kaydedilen transfer sonradan değiştirilemez.</span></div>";
  fbSheet("Hesaplar arası transfer", "Gönderilen ve alınan gerçek tutarlar korunur", ic, "Transferi kaydet");
  var iliski = "", istek = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), hb = function (id) { return V.H.filter(function (h) { return h.id === id; })[0]; };
  var gun = function () { var k = hb($("fbTK").value), h = hb($("fbTH").value), sm = function (x) { return x ? (x.pb === "TRY" ? "₺" : x.pb === "EUR" ? "€" : "$") : "–"; };
    $("fbTGs").textContent = sm(k); $("fbTMs").textContent = sm(k); $("fbTAs").textContent = sm(h);
    $("fbTKb").innerHTML = k ? "bakiye " + fbOrj(V.B[k.id] || 0, k.pb) + " · " + fbEsc(k.sirket) : ""; $("fbTHb").innerHTML = h ? "bakiye " + fbOrj(V.B[h.id] || 0, h.pb) + " · " + fbEsc(h.sirket) : "";
    $("fbTI").hidden = !(k && h && k.sirket !== h.sirket);
    var g = fbNum($("fbTG").value), a = fbNum($("fbTA").value);
    if (k && h && k.pb === h.pb && g > 0 && document.activeElement !== $("fbTA")) $("fbTA").value = $("fbTG").value;
    a = fbNum($("fbTA").value); $("fbTU").value = g > 0 && a > 0 && k && h && k.pb !== h.pb ? "1 " + k.pb + " = " + sayi(a / g, 4) + " " + h.pb : k && h && k.pb === h.pb ? "aynı para birimi" : "";
    fbMaskele($("fbOv")); };
  ["fbTK", "fbTH"].forEach(function (i) { $(i).onchange = gun; }); ["fbTG", "fbTA", "fbTM"].forEach(function (i) { $(i).oninput = gun; });
  bagT("[data-fbti]", function (e) { iliski = e.dataset.fbti; Array.prototype.forEach.call(document.querySelectorAll("[data-fbti]"), function (x) { x.setAttribute("aria-pressed", x === e); }); });
  $("fbShK").onclick = function () { var bt = this, k = hb($("fbTK").value), h = hb($("fbTH").value), g = fbNum($("fbTG").value), a = fbNum($("fbTA").value), ms = fbNum($("fbTM").value) || 0;
    if (!k || !h) { toast("Kaynak ve hedef hesabı seçin"); return; } if (k.id === h.id) { toast("Kaynak ve hedef aynı olamaz"); return; } if (!(g > 0) || !(a > 0)) { toast("Gönderilen ve alınan tutarı yazın"); return; }
    if (k.sirket !== h.sirket && !iliski) { toast("Şirketler arası transferin türünü seçin"); return; }
    if (k.pb !== h.pb) { var ref = usdKarsilik(g, k.pb, V.KU), ref2 = usdKarsilik(a, h.pb, V.KU); if (Math.abs(ref2 / ref - 1) > 0.03 && !confirm("Uygulanan kur bugünkü kasa kurundan %" + sayi(Math.abs(ref2 / ref - 1) * 100, 1) + " farklı. Tutarlar doğru mu?")) return; }
    bt.disabled = true; bt.textContent = "Kaydediliyor…";
    api("/api/dsolar/transfer", { method: "POST", body: { istekId: istek, kaynak: k.id, hedef: h.id, gonderilen: g, alinan: a, masraf: ms, tarih: $("fbTT").value, aciklama: $("fbTD").value.trim(), iliski: iliski } })
      .then(function (r) { fbSheetKapat(); toast("Transfer kaydedildi · " + r.tur); return fbVeri(true); }).then(function () { sFinans(FB.alt); })
      .catch(function (e) { bt.disabled = false; bt.textContent = "Transferi kaydet"; hata(e); }); };
}
window.addEventListener("hashchange", function () { if (typeof fbSheetKapat === "function") fbSheetKapat(); });
