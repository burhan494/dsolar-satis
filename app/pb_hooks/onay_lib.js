// Vadesine 3 gün (ya da daha az) kalmış, onaysız ve hiçbir listede olmayan çıkış ödemelerini günün "otomatik" onay listesine ekler.
// Sabit giderlerin o ayki taksiti henüz hareket olarak yoksa (ödeme listesi ekranındaki gibi) hareket olarak açılır.
function gunTR(n) { return new Date(Date.now() + 3 * 3600e3 + (n || 0) * 864e5).toISOString().slice(0, 10); }
function tara(app) {
  const b = gunTR(0), sinir = gunTR(3), ay0 = b.slice(0, 7), ad = "Vadesi yaklaşanlar · " + b.slice(8, 10) + "." + b.slice(5, 7) + "." + b.slice(0, 4);
  const H = app.findRecordsByFilter("fin_hareketler", "yon = 'Çıkış' && durum != 'Gerçekleşti' && onay = '' && odemeListesi = '' && tarih <= {:s}", "tarih", 500, 0, { s: sinir + " 23:59:59" })
    .filter((m) => !/hesaplar arası/i.test(m.getString("kategori")));
  // sabit giderler: bu ay ve (sınır gelecek aya taşıyorsa) gelecek ay
  const iz = {}; app.findRecordsByFilter("fin_hareketler", "not ~ 'sabit:'", "", 5000, 0).forEach((m) => { const r = /sabit:([a-z0-9]+):(\d{4}-\d{2})/.exec(m.getString("not")); if (r) iz[r[1] + ":" + r[2]] = 1; });
  const aylar = [ay0]; if (sinir.slice(0, 7) !== ay0) aylar.push(sinir.slice(0, 7));
  const S = [];
  app.findRecordsByFilter("fin_sabitler", "yon != 'Giriş'", "", 500, 0).forEach((s) => { aylar.forEach((a) => {
    const bas = s.getString("bas"), bit = s.getString("bit"); if ((bas && bas > a) || (bit && bit < a) || iz[s.id + ":" + a]) return;
    const son = new Date(Date.UTC(+a.slice(0, 4), +a.slice(5, 7), 0)).getUTCDate(), t = a + "-" + String(Math.min(s.getInt("gun") || 1, son)).padStart(2, "0");
    if (t > sinir || t < ay0 + "-01") return; S.push({ s: s, a: a, t: t }); }); });
  if (!H.length && !S.length) return { eklenen: 0 };
  let L; try { L = app.findFirstRecordByFilter("odeme_listeleri", "ad = {:a} && durum = 'Onayda'", { a: ad }); } catch (e) { L = null; }
  if (!L) { L = new Record(app.findCollectionByNameOrId("odeme_listeleri")); L.set("ad", ad); L.set("tur", "Anlık"); L.set("durum", "Onayda"); L.set("not", "Sistem açtı: vadesine 3 gün ya da daha az kalan onaysız ödemeler."); app.save(L); }
  H.forEach((m) => { m.set("onay", "Onay bekliyor"); m.set("odemeListesi", L.id); app.save(m); });
  const col = app.findCollectionByNameOrId("fin_hareketler");
  S.forEach((x) => { const r = new Record(col), s = x.s;
    r.set("tarih", x.t + " 12:00:00.000Z"); r.set("yon", "Çıkış"); r.set("tutar", s.getFloat("tutar")); r.set("pb", s.getString("pb") || "TRY"); r.set("karsiTaraf", s.getString("ad")); r.set("kategori", s.getString("kategori") || "Sabit gider");
    r.set("oncelik", s.getString("oncelik")); r.set("durum", "Planlandı"); r.set("onay", "Onay bekliyor"); r.set("odemeListesi", L.id); r.set("not", "sabit:" + s.id + ":" + x.a + " · sabit giderden (otomatik)"); app.save(r); });
  return { eklenen: H.length + S.length, liste: L.id };
}
module.exports = { tara: tara };
