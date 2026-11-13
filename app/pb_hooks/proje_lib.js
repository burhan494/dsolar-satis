// Proje ödeme planını Finans'a planlı hareket olarak aktarır ve plan değişince günceller.
// Tahsilatlar KDV dahil yazılır (teklif ve sözleşme "+KDV"dir, nakit akışına giren para KDV dahildir).
// Malzeme maliyeti: anahtar teslimde sözleşme tarihinden 75 gün sonra, öz tüketim ve malzeme satışında sözleşme tarihinde.
// Stoktan kullanılan malzemede (maliyet 0) gider yazılmaz.
const IMZA = "proje ödeme planından";
function kdvOran(app) { try { const r = app.findFirstRecordByFilter("ayarlar", "anahtar = 'hesap'"); const d = JSON.parse(r.getString("deger") || "{}"); return +d.kdv >= 0 && +d.kdv < 1 ? +d.kdv : 0.2; } catch (x) { return 0.2; } }
function gunEkle(t, n) { const d = new Date(String(t).slice(0, 10) + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function malTarih(p, mal) { const bas = String(p.getString("basla") || new Date().toISOString()).slice(0, 10), tur = p.getString("tur") || "Anahtar teslim";
  return mal && mal.tarih ? String(mal.tarih).slice(0, 10) : tur === "Anahtar teslim" ? gunEkle(bas, 75) : bas; }
function planOku(p) { let plan = {}; try { plan = JSON.parse(p.getString("odemePlan") || "{}") || {}; } catch (x) { plan = {}; } return plan; }
// planın finansa yazılacak satırları; her satırın anahtarı (T0, T1… ve M) eşleştirme için kullanılır
function satirlar(app, p) {
  const plan = planOku(p), mal = plan.maliyet || {}, bedel = p.getFloat("bedelUsd"), tur = p.getString("tur") || "Anahtar teslim", kdv = kdvOran(app), L = [];
  (plan.tahsilat || []).filter((r) => +r.oran > 0 && r.tarih).forEach((r, i) => L.push({ a: "T" + i, tarih: String(r.tarih).slice(0, 10), yon: "Giriş", kategori: tur === "Malzeme satışı" ? "Malzeme satışı tahsilatı" : "Proje tahsilatı",
    tutar: Math.round(bedel * +r.oran * (1 + kdv)) / 100, aciklama: (r.ad || "Tahsilat") + " %" + r.oran + " · " + tur + " · KDV dahil" }));
  if (+mal.usd > 0 && !mal.stok) L.push({ a: "M", tarih: malTarih(p, mal), yon: "Çıkış", kategori: "Malzeme", tutar: Math.round(+mal.usd * 100) / 100, aciklama: "Malzeme maliyeti (tekliften)" });
  return L;
}
function mevcut(app, p) { // bu projenin plandan gelen kayıtları; eski kayıtlar (anahtarsız) sıra ile eşleştirilir
  let R = []; try { R = app.findRecordsByFilter("fin_hareketler", "aday = {:a} && not ~ {:n}", "created", 200, 0, { a: p.getString("aday"), n: IMZA }); } catch (x) { R = []; }
  const M = {}; let gi = 0;
  R.forEach((r) => { const m = /#(T\d+|M)\b/.exec(r.getString("not")); let k = m ? m[1] : r.getString("yon") === "Giriş" ? "T" + gi++ : "M"; if (!M[k]) M[k] = r; else M[k + "_" + r.id] = r; });
  return M;
}
function yaz(app, p) {
  const L = satirlar(app, p), M = mevcut(app, p), col = app.findCollectionByNameOrId("fin_hareketler"); let ad = ""; try { ad = app.findRecordById("adaylar", p.getString("aday")).getString("ad"); } catch (x) {}
  const kalan = Object.assign({}, M);
  L.forEach((s) => { const e = M[s.a]; delete kalan[s.a];
    if (e && e.getString("durum") === "Gerçekleşti") return; // gerçekleşmiş tahsilat/ödeme olduğu gibi kalır
    const r = e || new Record(col);
    r.set("tarih", s.tarih + " 12:00:00.000Z"); r.set("yon", s.yon); r.set("kategori", s.kategori); r.set("tutar", s.tutar); r.set("pb", "USD"); r.set("aciklama", s.aciklama + (s.a === "M" ? " · " + ad : ""));
    r.set("not", IMZA + " #" + s.a); r.set("aday", p.getString("aday")); r.set("karsiTaraf", ad); if (!e) r.set("durum", "Planlandı"); app.save(r); });
  Object.keys(kalan).forEach((k) => { const r = kalan[k]; if (r.getString("durum") !== "Gerçekleşti") app.delete(r); }); // plandan çıkarılan, gerçekleşmemiş satırlar silinir
  return L.length;
}
function planAktar(app, p) {
  if (p.getBool("planAktarildi")) return;
  if (!satirlar(app, p).length) return;
  yaz(app, p); p.set("planAktarildi", true); app.saveNoValidate(p);
}
module.exports = { planAktar: planAktar, planYenile: (app, p) => yaz(app, p), satirlar: satirlar };
