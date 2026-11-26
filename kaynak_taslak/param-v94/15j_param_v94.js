/* ---------- v94: Kartlar ekranı asgari ve kısmi ödemeleri de görür ----------
   Ödemeler listesi (prmOdDurum) asgari/kısmi kaydı zaten sayıyordu; kart ekranı yalnız "tamamı ödendi"ye bakıyordu.
   Hesap ya da veri değişmez: yalnız görünüm, mevcut D.asgari ve D.kismi kayıtlarını okur. */
function prmKartOdBilgi(D, b) {
  if (!b) return null; var key = "k:" + b.id; if (D.odendi[key]) return null;
  var borc = b.sum ? +b.sum.debt || 0 : 0, as = (D.asgari || {})[key], ks = typeof prmKismi === "function" ? prmKismi(D, key, null) : { top: 0, son: null };
  if (as) return { tur: "asgari", t: as.t, odenen: +as.tutar || 0, kalan: Math.max(0, borc - (+as.tutar || 0) - ks.top) };
  if (ks.top > 0) return { tur: ks.top >= borc - 1 ? "tam" : "kismi", t: ks.son, odenen: ks.top, kalan: Math.max(0, borc - ks.top) };
  return null;
}
(function () {
  var k0 = prmKartlar;
  prmKartlar = function (D) {
    var L = k0.apply(this, arguments);
    try { L.forEach(function (k) { if (k.kapali || k.yeni || !k.son) return; var x = prmKartOdBilgi(D, k.son); if (!x) return; k.odBilgi = x;
        if (x.tur === "asgari") { k.durum = "Asgari ödendi"; k.dRenk = "yesil"; } else if (x.tur === "tam") { k.durum = "✓ Ödendi"; k.dRenk = "yesil"; } else { k.durum = "Kısmi ödendi"; k.dRenk = "tur"; } }); } catch (e) {}
    return L; };
  var s0 = prmSKartlar;
  prmSKartlar = function (D) {
    var R = s0.apply(this, arguments);
    try { var t = document.createElement("template"); t.innerHTML = R.html;
      (D.belgeler || []).forEach(function (b) { var x = prmKartOdBilgi(D, b); if (!x) return; var btn = t.content.querySelector('[data-prmod="k:' + b.id + '"]'); if (!btn) return;
        var sat = btn.closest(".prmS"), sm = sat && sat.querySelector("small"); if (!sm) return;
        var f = b.sum && +b.sum.fees > 0 ? " · faiz/masraf " + prmP(b.sum.fees) : "";
        if (x.tur === "tam") { sm.style.color = "var(--ok)"; sm.textContent = "ödendi " + tarih(x.t).slice(0, 5) + f; btn.classList.add("on"); btn.textContent = "✓"; return; }
        sm.style.color = "#b45309";
        sm.textContent = (x.tur === "asgari" ? "asgari ödendi " : "kısmi ödendi ") + (x.t ? tarih(x.t).slice(0, 5) + " · " : "") + prmP(x.odenen) + " · kalan " + prmP(x.kalan) + (x.tur === "asgari" ? " sonraki ekstreye devreder, faiz işler" : "") + f;
        btn.classList.add("yarim"); btn.textContent = "½"; btn.setAttribute("aria-label", (x.tur === "asgari" ? "asgari ödendi" : "kısmi ödendi") + "; tamamı ödendiyse işaretle"); });
      R.html = t.innerHTML; } catch (e) {}
    return R; };
})();
