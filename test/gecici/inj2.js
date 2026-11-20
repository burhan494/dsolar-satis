function sFinans(alt) {
  if (!finansci()) { location.hash = "#bugun"; return; }
  alt = alt || (yt("fin") ? "kasa" : "odeme"); if (!yt("fin") && alt !== "odeme") alt = "odeme"; if ((alt === "ortak" || alt === "varlik") && !yt("ortak")) alt = "kasa"; if (alt === "ozet") alt = "kasa"; if (alt === "borc") alt = "kredi"; if (alt !== "odeme") { OD.liste = ""; OD.yeni = null; }
  $("m").classList.add("genis");
  var GR = { kasa: "kasa", akis: "akis", plan: "akis", senaryo: "akis", odeme: "odeme", kredi: "borc", cek: "borc", rapor: "rapor", ortak: "diger", diger: "diger", sabit: "diger", hareket: "diger", hesap: "diger", soru: "diger", varlik: "diger" }, akt = GR[alt] || "kasa";
  var T = yt("fin") ? [["kasa", "Kasa"], ["akis", "Akış"]] : [];
  T.push(["odeme", "Ödemeler"]);
  if (yt("fin")) { T.push(["borc", "Borçlar"]); T.push(["rapor", "Raporlar"]); T.push(["diger", "Diğer"]); }
  if (alt === "senaryo" && !yt("ortak")) alt = "akis";
  var alt2 = { akis: [["akis", "Nakit akışı"], ["plan", "Gelecek / Gidecek"]].concat(yt("ortak") ? [["senaryo", "5 yıllık senaryo"]] : []), borc: [["kredi", "Krediler ve kartlar"], ["cek", "Çekler"]] }[akt];
  $("m").innerHTML = '<div class="chips finT2">' + T.map(function (t) { var ic = FIN_IK[t[0]]; return '<button onclick="location.hash=\'#finans/' + (t[0] === "borc" ? "kredi" : t[0]) + '\'" class="' + (t[0] === akt ? "on" : "") + '" style="display:inline-flex;align-items:center">' + (ic ? ikon(ic[0], ic[1]) : "") + t[1] + (t[0] === "odeme" && ROZ.v.finans ? ' <small class="fRz">' + ROZ.v.finans + "</small>" : "") + "</button>"; }).join("") + "</div>" +
    (alt2 ? '<div class="seg finS">' + alt2.map(function (x) { return '<button onclick="location.hash=\'#finans/' + x[0] + '\'" class="' + (x[0] === alt ? "on sg" : "") + '">' + x[1] + "</button>"; }).join("") + "</div>" : "") +
    (akt === "diger" && alt !== "diger" ? '<a href="#finans/diger" class="geriL">‹ Diğer</a>' : "") + '<div id="fm"><div class="bos">Yükleniyor…</div></div>';
  if (HIZLI.fin && alt === "plan") { FP.ekle = true; }
  ({ kasa: fKasa, akis: fNakit, plan: fPlan, senaryo: fSenaryo, odeme: fOdeme, hareket: fHareket, hesap: fHesap, kredi: fKredi, cek: fCek, sabit: fSabit, soru: fSoru, ortak: fOrtak, varlik: fVarlik, diger: fDiger, rapor: fRapor }[alt] || fKasa)();
  if (HIZLI.fin) { var hz = HIZLI.fin; HIZLI.fin = ""; var n = 0, iv = setInterval(function () { var s = $("pT"); if (++n > 40) clearInterval(iv); if (!s) return; clearInterval(iv);
    s.value = hz === "tahsilat" ? "Cari alacak (müşteri)" : "Cari ödeme (tedarikçi)"; s.dispatchEvent(new Event("change")); s.closest("details").open = true; s.scrollIntoView({ behavior: "smooth", block: "center" }); }, 150); }
}
location.hash="#finans/senaryo"; "ok"