/* ---------- v89 (taslak): GDZ ARiL portalı Excel raporları ----------
   Tüketim raporu (günlük/saatlik: Tarih, Aktif Çekiş, Reaktif İndüktif/Kapasitif Çekiş, Aktif Veriş, … Tanım Sayısı, Veri Oranı),
   Ayaksonu/Güncel endeks (Endeks Tarihi, T Toplam, Demand, RI, RC) ve Kesinti bilgileri (Başlangıç, Bitiş).
   ges_aylik'ta arilGun / arilEndeks / arilKesinti alanlarına ayrı saklanır; OSOS formunun ve yük profilinin üstüne yazmaz. */
function arilSayi(x) {
  if (x == null || x === "") return null; if (typeof x === "number") return x;
  var s = String(x).replace(/%|\s|kWh|kVArh/gi, ""); if (!s) return null;
  if (s.indexOf(",") >= 0) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  var v = parseFloat(s); return isNaN(v) ? null : v;
}
function arilTarih(x) { // → "2026-11-18" ve saat (varsa)
  if (x == null || x === "") return null;
  if (typeof x === "number") { var d = new Date(Math.round((x - 25569) * 864e5)); return { g: d.toISOString().slice(0, 10), s: d.getUTCHours() }; }
  var s = String(x).trim(), m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (m) return { g: m[3] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2), s: m[4] != null ? +m[4] : null };
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/); if (m) return { g: m[1] + "-" + m[2] + "-" + m[3], s: m[4] != null ? +m[4] : null };
  return null;
}
function arilBaslik(R_, test) { for (var i = 0; i < Math.min(R_.length, 15); i++) { var r = (R_[i] || []).map(function (x) { return String(x == null ? "" : x).replace(/\s+/g, " ").trim(); }); if (test(r)) return { i: i, H: r }; } return null; }
function arilCoz(sheets) {
  var S = { gun: {}, endeks: null, kesinti: [], tur: [] };
  sheets.forEach(function (R_) { R_ = R_ || [];
    var b = arilBaslik(R_, function (r) { return r.indexOf("Tarih") >= 0 && r.some(function (x) { return /^Aktif Veri[sş]/i.test(x); }) && r.some(function (x) { return /^Aktif [CÇ]eki[sş]/i.test(x); }); });
    if (b) { var H = b.H, c = function (re) { return H.findIndex(function (x) { return re.test(x); }); };
      var K = { t: H.indexOf("Tarih"), ac: c(/^Aktif [CÇ]eki[sş]/i), ric: c(/^Reaktif [İI]nd[üu]ktif [CÇ]eki[sş]/i), rcc: c(/^Reaktif Kapasitif [CÇ]eki[sş]/i), av: c(/^Aktif Veri[sş]/i), riv: c(/^Reaktif [İI]nd[üu]ktif Veri[sş]/i), rcv: c(/^Reaktif Kapasitif Veri[sş]/i), tn: c(/^Tan[ıi]m Say/i), vo: c(/^Veri Oran/i) };
      var saatlik = false;
      R_.slice(b.i + 1).forEach(function (r) { r = r || []; var t = arilTarih(r[K.t]); if (!t) return; if (t.s != null && t.s !== 0) saatlik = true;
        var o = S.gun[t.g] || (S.gun[t.g] = { av: 0, ac: 0, ric: 0, rcc: 0, riv: 0, rcv: 0, tn: null, vo: null, n: 0 });
        ["av", "ac", "ric", "rcc", "riv", "rcv"].forEach(function (k) { var v = K[k] >= 0 ? arilSayi(r[K[k]]) : null; if (v != null) o[k] += v; });
        var tn = K.tn >= 0 ? arilSayi(r[K.tn]) : null, vo = K.vo >= 0 ? arilSayi(r[K.vo]) : null;
        if (tn != null) o.tn = o.tn == null ? tn : Math.min(o.tn, tn); if (vo != null) { o.voT = (o.voT || 0) + vo; o.n++; } });
      Object.keys(S.gun).forEach(function (g) { var o = S.gun[g]; if (o.n) o.vo = Math.round(o.voT / o.n); delete o.voT; delete o.n; ["av", "ac", "ric", "rcc", "riv", "rcv"].forEach(function (k) { o[k] = Math.round(o[k] * 10) / 10; }); });
      S.tur.push(saatlik ? "tüketim (saatlik)" : "tüketim (günlük)"); return; }
    b = arilBaslik(R_, function (r) { return r.some(function (x) { return /(Endeks|Okuma) Tarihi/i.test(x); }) && r.some(function (x) { return /^T ?Toplam|^T0$/i.test(x); }); });
    if (b) { var H2 = b.H, c2 = function (re) { return H2.findIndex(function (x) { return re.test(x); }); }, son = null;
      R_.slice(b.i + 1).forEach(function (r) { r = r || []; var t = arilTarih(r[c2(/(Endeks|Okuma) Tarihi/i)]); if (!t) return;
        var e = { tarih: t.g, t: arilSayi(r[c2(/^T ?Toplam|^T0$/i)]), t1: arilSayi(r[c2(/^T1$/i)]), t2: arilSayi(r[c2(/^T2$/i)]), t3: arilSayi(r[c2(/^T3$/i)]), demand: arilSayi(r[c2(/^Demand$/i)]), demandT: String(r[c2(/^Demand Tarihi/i)] || ""), ri: arilSayi(r[c2(/^RI\b|[İI]nd[üu]ktif/i)]), rc: arilSayi(r[c2(/^RC\b|Kapasitif/i)]) };
        if (!son || e.tarih >= son.tarih) son = e; });
      if (son) { S.endeks = son; S.tur.push("endeks"); } return; }
    b = arilBaslik(R_, function (r) { return r.some(function (x) { return /^Ba[sş]lang[ıi][cç]/i.test(x); }) && r.some(function (x) { return /^Biti[sş]/i.test(x); }); });
    if (b) { var H3 = b.H, c3 = function (re) { return H3.findIndex(function (x) { return re.test(x); }); };
      R_.slice(b.i + 1).forEach(function (r) { r = r || []; var bs = r[c3(/^Ba[sş]lang[ıi][cç]/i)]; if (bs == null || bs === "") return;
        S.kesinti.push({ bas: String(bs), bit: String(r[c3(/^Biti[sş]/i)] || ""), tip: String(r[c3(/Tip|T[üu]r/i)] || ""), sure: String(r[c3(/S[üu]re/i)] || ""), aciklama: String(r[c3(/A[cç][ıi]klama|Neden/i)] || "") }); });
      S.tur.push("kesinti"); }
  });
  return S.tur.length ? S : null;
}
/* ay özeti: reaktif oranlar çekilen aktif enerjiye göre (sınır >50 kVA: endüktif %20, kapasitif %15) */
function arilOzet(gun) {
  var G_ = Object.keys(gun || {}).sort(), T = { av: 0, ac: 0, ric: 0, rcc: 0, riv: 0, rcv: 0 }, eksik = [];
  G_.forEach(function (d) { var o = gun[d]; Object.keys(T).forEach(function (k) { T[k] += +o[k] || 0; }); if ((o.vo != null && o.vo < 100) || o.tn === 0) eksik.push(d); });
  return { gunler: G_, T: T, ri: T.ac > 0 ? T.ric / T.ac : null, rc: T.ac > 0 ? T.rcc / T.ac : null, eksik: eksik, son: G_[G_.length - 1] };
}
function arilYukle(A, f, G, sonra) {
  var aylar = {}; Object.keys(A.gun).forEach(function (d) { (aylar[d.slice(0, 7)] = aylar[d.slice(0, 7)] || {})[d] = A.gun[d]; });
  if (A.endeks) { var ea = A.endeks.tarih.slice(0, 7); aylar[ea] = aylar[ea] || {}; }
  A.kesinti.forEach(function (k) { var t = arilTarih(k.bas); if (t) { aylar[t.g.slice(0, 7)] = aylar[t.g.slice(0, 7)] || {}; } });
  var L = Object.keys(aylar).sort().map(function (ay) { var g = G.filter(function (x) { return x.donem === ay; })[0] || {}, M = Object.assign({}, g.arilGun || {}, aylar[ay]);
    var K = A.kesinti.filter(function (k) { var t = arilTarih(k.bas); return t && t.g.slice(0, 7) === ay; }); return { ay: ay, g: g, M: M, oz: arilOzet(M), K: K }; });
  var yuz = function (x) { return x == null ? "—" : "%" + sayi(x * 100); };
  $("osO").dataset.tur = "aril";
  $("osO").innerHTML = '<div class="bilgi" style="margin:8px 0"><b>GDZ ARiL raporu</b> · ' + A.tur.join(", ") + L.map(function (x) { var o = x.oz;
      return '<div style="margin-top:6px"><b>' + ayAd(x.ay) + "</b>: " + o.gunler.length + " gün · veriş " + sayi(o.T.av) + " kWh · çekiş " + sayi(o.T.ac) + " kWh · endüktif " + yuz(o.ri) + " · kapasitif " + yuz(o.rc) +
        (o.eksik.length ? '<br><span style="color:var(--bad)">Eksik veri: ' + o.eksik.map(function (d) { return d.slice(8) + "." + d.slice(5, 7); }).join(", ") + "</span>" : "") + (x.K.length ? "<br>" + x.K.length + " kesinti kaydı" : "") + (function () { var es = Object.keys(x.g.arilGun || {}), yeni = Object.keys(aylar[x.ay]), ayni = yeni.filter(function (d) { return es.indexOf(d) >= 0; }).length; return "<br><small>" + (ayni ? ayni + " gün zaten kayıtlı (mükerrer olmaz, bu dosyadaki değerle güncellenir) · " : "") + (yeni.length - ayni) + " yeni gün" + (x.g.arilDosya ? " · önceki dosya: " + esc(x.g.arilDosya) : "") + "</small>"; })() + "</div>"; }).join("") +
    (A.endeks ? '<div style="margin-top:6px">Endeks ' + esc(A.endeks.tarih) + ": T " + sayi(A.endeks.t) + " · demand " + sayi(A.endeks.demand, 3) + " kW</div>" : "") +
    '<small style="display:block;margin-top:6px;color:var(--muted)">Resmî OSOS formunun ve yük profilinin yerine geçmez; ayrı saklanır. Aynı günün verisi bu dosyadan güncellenir.</small><button class="btn pri" id="arK" style="margin-top:8px">ARiL verisini kaydet</button></div>';
  $("arK").onclick = function () { var btn = this; btn.disabled = true;
    sirali(L, function (x) { var body = { donem: x.ay, arilGun: x.M, arilDosya: f.name, arilTarih: bugun() + " 12:00:00.000Z" };
      if (A.endeks && A.endeks.tarih.slice(0, 7) === x.ay) body.arilEndeks = A.endeks;
      if (x.K.length) { var E = (x.g.arilKesinti || []).slice(), var_ = {}; E.forEach(function (k) { var_[k.bas] = 1; }); x.K.forEach(function (k) { if (!var_[k.bas]) E.push(k); }); body.arilKesinti = E; }
      return api("/api/collections/ges_aylik/records" + (x.g.id ? "/" + x.g.id : ""), { method: x.g.id ? "PATCH" : "POST", body: body }); })
      .then(function () { toast("ARiL verisi kaydedildi"); sonra(); }).catch(function (e) { btn.disabled = false; hata(e); }); };
}
function arilKarti(G) {
  var g = G.filter(function (x) { return x.arilGun && Object.keys(x.arilGun).length; }).sort(function (x, y) { return x.donem < y.donem ? 1 : -1; })[0]; if (!g) return "";
  var o = arilOzet(g.arilGun), E = g.arilEndeks, K = g.arilKesinti || [], son7 = o.gunler.slice(-7).reverse();
  var kut = function (ad, v, alt, kotu) { return '<div style="flex:1 1 140px;min-width:0;border:1px solid var(--line);border-radius:12px;padding:10px 12px"><small style="color:var(--muted);display:block">' + ad + '</small><b style="font-size:20px' + (kotu ? ";color:var(--bad)" : "") + '">' + v + '</b><small style="display:block;color:var(--muted)">' + alt + "</small></div>"; };
  var riK = o.ri != null && o.ri > 0.2, rcK = o.rc != null && o.rc > 0.15;
  return '<div class="card" id="arilK"><h3>' + ikon("grafik", "#0b7373", "kucuk") + 'GDZ sayaç (ARiL) <small style="color:var(--muted);font-weight:500;margin-left:auto">' + ayAd(g.donem) + " · son gün " + (o.son ? o.son.slice(8) + "." + o.son.slice(5, 7) : "—") + "</small></h3>" +
    ((riK || rcK) ? '<div class="uyari" style="margin:10px 14px"><b>Reaktif sınır aşılıyor:</b> ' + (rcK ? "kapasitif %" + sayi(o.rc * 100) + " (sınır %15)" : "") + (riK && rcK ? " · " : "") + (riK ? "endüktif %" + sayi(o.ri * 100) + " (sınır %20)" : "") + ". Bu ay sonunda faturaya reaktif bedel gelebilir; kompanzasyon/inverter gece reaktif ayarı kontrol edilmeli.</div>" : "") +
    (o.eksik.length ? '<div class="bilgi" style="margin:10px 14px">Sayaçtan eksik veri gelen gün: <b>' + o.eksik.map(function (d) { return d.slice(8) + "." + d.slice(5, 7); }).join(", ") + "</b>. Bugünse normal (gün bitmedi); geçmiş günse GDZ'ye haber verin.</div>" : "") +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:4px 14px 10px">' +
      kut("Üretim (aktif veriş)", sayi(o.T.av) + " kWh", o.gunler.length + " gün toplamı") + kut("Tüketim (aktif çekiş)", sayi(o.T.ac) + " kWh", "gece/iç tüketim") +
      kut("Kapasitif / çekiş", o.rc == null ? "—" : "%" + sayi(o.rc * 100), "sınır %15 · " + sayi(o.T.rcc) + " kVArh", rcK) + kut("Endüktif / çekiş", o.ri == null ? "—" : "%" + sayi(o.ri * 100), "sınır %20 · " + sayi(o.T.ric) + " kVArh", riK) + "</div>" +
    '<div style="overflow-x:auto;padding:0 14px"><table class="nt" style="font-size:13px;white-space:nowrap;width:100%"><thead><tr><th style="text-align:left">Gün</th><th>Veriş</th><th>Çekiş</th><th>Kapasitif</th><th>Endüktif</th><th>Veri</th></tr></thead><tbody>' +
      son7.map(function (d) { var r = g.arilGun[d], ek = (r.vo != null && r.vo < 100) || r.tn === 0, oran = r.ac > 0 ? r.rcc / r.ac : null;
        return '<tr><td style="text-align:left;white-space:nowrap"><b>' + d.slice(8) + "." + d.slice(5, 7) + "</b></td><td>" + sayi(r.av) + "</td><td>" + sayi(r.ac) + '</td><td style="' + (oran > 0.15 ? "color:var(--bad);font-weight:700" : "") + '">' + sayi(r.rcc) + (oran != null ? " <small>%" + sayi(oran * 100) + "</small>" : "") + "</td><td>" + sayi(r.ric) + '</td><td style="' + (ek ? "color:var(--bad);font-weight:700" : "color:var(--ok)") + '">' + (r.vo != null ? "%" + r.vo : "—") + "</td></tr>"; }).join("") + "</tbody></table></div>" +
    (E ? '<div style="padding:10px 14px;border-top:1px solid var(--line);margin-top:10px"><b>Endeks</b> <small style="color:var(--muted)">' + esc(E.tarih) + "</small><br>T toplam " + sayi(E.t, 3) + (E.t1 != null ? " · T1 " + sayi(E.t1, 3) + " · T2 " + sayi(E.t2, 3) + " · T3 " + sayi(E.t3, 3) : "") + " · RI " + sayi(E.ri, 3) + " · RC " + sayi(E.rc, 3) + (E.demand != null ? "<br>Demand " + sayi(E.demand, 3) + " kW" + (E.demandT ? " · " + esc(E.demandT) : "") : "") + "</div>" : "") +
    '<div style="padding:10px 14px;border-top:1px solid var(--line)"><b>Kesintiler</b> ' + (K.length ? K.map(function (k) { return '<div class="row sk" style="padding:6px 0"><div class="t"><b class="w">' + esc(k.tip || "Kesinti") + "</b><small>" + esc(k.bas) + " – " + esc(k.bit) + (k.sure ? " · " + esc(k.sure) : "") + "</small></div></div>"; }).join("") : '<small style="color:var(--muted)">Bu ay GDZ kesinti kaydı yok.</small>') + "</div>" +
    '<div class="not"><small>Kaynak: GDZ ARiL portalı Excel raporu (' + esc(g.arilDosya || "") + "). Oranlar çekilen aktif enerjiye göre; ay bitmeden kesin değildir.</small></div></div>";
}
