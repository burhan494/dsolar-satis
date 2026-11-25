// Finans B+ Premium — sunucu kuralları (şirket ayrımı, gizlilik, transfer, bakiye düzeltme, onay güvenliği, mükerrer engeli, değişiklik geçmişi)
const GZ = /personel|maaş|maas|ortak|avans|tazminat|sgk prim/i;
const ONAY_ALAN = ["tutar", "pb", "karsiTaraf", "hesap", "iban", "kart"];
const TR_ALAN = ["tutar", "pb", "yon", "hesap", "hesapTutar", "durum", "tarih", "sirket"];
const r2 = (v) => Math.round((+v || 0) * 100) / 100;
function yon(a) { return a && a.getString("rol") === "yonetici"; }
function finD(a) { return yon(a) || (a && a.getString("y_fin") === "d"); }
function finG(a) { return yon(a) || (a && (a.getString("y_fin") === "d" || a.getString("y_fin") === "g")); }
function kim(a) { return a ? (a.getString("name") || a.getString("email")) : "sistem"; }
function gizliMi(r) { return GZ.test(r.getString("kategori")) || /^(Burhan|Batur)$/.test(r.getString("karsiTaraf")); }
function hesapSirket(app, id) { if (!id) return ""; try { return app.findRecordById("fin_hesaplar", id).getString("sirket"); } catch (x) { return ""; } }
function sirketIzin(a, s) { if (!a || yon(a)) return true; const k = a.getString("y_sirket"); return !k || k === s; }
// legacy bakiyeler() ile aynı kural: açılış + açılış tarihinden sonraki gerçekleşmiş hareketler (aynı gün: hesap güncellemesinden sonra işaretlenenler)
function bakiye(app, h) {
  let b = h.getFloat("acilis"); const at = String(h.getString("acilisTarihi") || "").slice(0, 10), hu = h.getString("updated");
  app.findRecordsByFilter("fin_hareketler", "hesap = {:h} && durum = 'Gerçekleşti'", "", 0, 0, { h: h.id }).forEach((m) => {
    const mt = String(m.getString("tarih")).slice(0, 10);
    if (at) { if (mt < at) return; if (mt === at && !((m.getString("updated") || m.getString("created")) > hu)) return; }
    b += (m.getString("yon") === "Giriş" ? 1 : -1) * (m.getFloat("hesapTutar") > 0 ? m.getFloat("hesapTutar") : m.getFloat("tutar")); });
  return r2(b);
}
function gecmis(app, kol, r, islem, degisim, a) {
  try { const c = app.findCollectionByNameOrId("fin_gecmis"), g = new Record(c);
    g.set("koleksiyon", kol); g.set("kayit", r.id); g.set("islem", islem); g.set("kim", kim(a).slice(0, 120)); g.set("sirket", r.getString("sirket") || "");
    g.set("ozet", [r.getString("karsiTaraf") || r.getString("ad") || r.getString("ortak"), r.getString("aciklama"), r.get("tutar") != null && r.getString("tutar") ? r.getFloat("tutar") + " " + (r.getString("pb") || "") : ""].filter(Boolean).join(" · ").slice(0, 300));
    g.set("degisim", degisim || {}); app.save(g); } catch (x) { console.log("fin_gecmis yazılamadı", x); }
}
function fark(o, r) { const D = {}; r.collection().fields.fieldNames().forEach((f) => { if (f === "updated" || f === "created") return; const a = o.getString(f), b = r.getString(f); if (a !== b) D[f] = [a, b]; }); return D; }
function tarihStr(t) { const s = String(t || "").slice(0, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new BadRequestError("Tarih geçersiz"); return s; }
module.exports = {
  GZ, ONAY_ALAN, TR_ALAN, r2, yon, finD, finG, kim, gizliMi, hesapSirket, sirketIzin, bakiye, gecmis, fark, tarihStr,
  // atomik transfer: çıkış + giriş (+ ayrı banka masrafı) tek işlemde; biri kaydedilemezse hiçbiri kaydedilmez
  transfer: (app, a, b, test) => {
    const istek = String(b.istekId || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40); if (!istek) throw new BadRequestError("İstek kimliği eksik");
    const gon = r2(b.gonderilen), al = r2(b.alinan), mas = r2(b.masraf), t = tarihStr(b.tarih);
    if (!(gon > 0) || !(al > 0)) throw new BadRequestError("Gönderilen ve alınan tutar sıfırdan büyük olmalı");
    if (mas < 0) throw new BadRequestError("Masraf eksi olamaz");
    if (b.kaynak === b.hedef) throw new BadRequestError("Kaynak ve hedef hesap aynı olamaz");
    const K = app.findRecordById("fin_hesaplar", b.kaynak), H = app.findRecordById("fin_hesaplar", b.hedef);
    if (!K.getBool("aktif") || !H.getBool("aktif")) throw new BadRequestError("Kapalı hesaba transfer yapılamaz");
    const sk = K.getString("sirket"), sh = H.getString("sirket");
    if (!sirketIzin(a, sk) || !sirketIzin(a, sh)) throw new ForbiddenError("Bu şirketin hesaplarına yetkiniz yok");
    if (K.getString("pb") === H.getString("pb") && Math.abs(gon - al) > 0.004) throw new BadRequestError("Aynı para biriminde gönderilen ve alınan eşit olmalı (masrafı ayrı yazın)");
    let tur = "Hesaplar arası";
    if (sk !== sh) { const x = String(b.iliski || ""); if (!/^(cari|borç|sermaye)$/.test(x)) throw new BadRequestError("Şirketler arası transferde ilişki seçin: cari, borç ya da sermaye"); tur = "Şirketler arası · " + x; }
    const kat = sk === sh ? "Hesaplar arası transfer" : "Şirketler arası transfer", tid = "tr_" + istek, not = String(b.aciklama || "").slice(0, 300);
    const kur = r2(al / gon * 10000) / 10000;
    app.runInTransaction((tx) => {
      const col = tx.findCollectionByNameOrId("fin_hareketler");
      const yaz = (h, y, tutar, kat2, tt, s, ek) => { const r = new Record(col);
        r.set("tarih", t + " 12:00:00.000Z"); r.set("hesap", h.id); r.set("yon", y); r.set("tutar", tutar); r.set("pb", h.getString("pb")); r.set("durum", "Gerçekleşti");
        r.set("kategori", kat2); r.set("transferId", tid); r.set("transferTur", tt); r.set("sirket", h.getString("sirket")); r.set("anahtar", tid + ":" + s);
        r.set("aciklama", ek); r.set("karsiTaraf", s === "c" ? H.getString("ad") : s === "g" ? K.getString("ad") : K.getString("banka") || "Banka"); r.set("kur", kur);
        r.set("not", not); if (a) r.set("giren", a.id); r.set("kontrol", true); r.set("kontrolEden", kim(a)); r.set("kontrolTarihi", t + " 12:00:00.000Z");
        tx.save(r); return r; };
      const c = yaz(K, "Çıkış", gon, kat, tur, "c", "Transfer → " + H.getString("ad") + (K.getString("pb") !== H.getString("pb") ? " (kur " + kur + ")" : ""));
      if (test === "ikinci") throw new BadRequestError("TEST: ikinci bacak bilerek başarısız");
      const g = yaz(H, "Giriş", al, kat, tur, "g", "Transfer ← " + K.getString("ad"));
      if (mas > 0) yaz(K, "Çıkış", mas, "Banka masrafı", "Banka masrafı", "m", "Transfer masrafı · " + H.getString("ad"));
      [c, g].forEach((r) => gecmis(tx, "fin_hareketler", r, "transfer", { transferId: tid, tur: tur }, a));
    });
    return { transferId: tid, tur: tur, kur: kur };
  },
  // bakiye düzeltme: eski bakiyeyi sunucu hesaplar; açılış ve tarihi yeni bakiyeye çekilir; geçmiş hareketler değişmez
  duzelt: (app, a, b) => {
    const t = tarihStr(b.tarih), yeni = r2(b.yeni), neden = String(b.neden || "").slice(0, 80); if (!neden) throw new BadRequestError("Neden seçin");
    let sonuc = null;
    app.runInTransaction((tx) => {
      const h = tx.findRecordById("fin_hesaplar", b.hesap); if (!sirketIzin(a, h.getString("sirket"))) throw new ForbiddenError("Bu şirketin hesabına yetkiniz yok");
      const eski = bakiye(tx, h), d = new Record(tx.findCollectionByNameOrId("fin_duzeltmeler"));
      d.set("hesap", h.id); d.set("sirket", h.getString("sirket")); d.set("pb", h.getString("pb")); d.set("eski", eski); d.set("yeni", yeni); d.set("fark", r2(yeni - eski));
      d.set("tarih", t + " 12:00:00.000Z"); d.set("neden", neden); d.set("aciklama", String(b.aciklama || "").slice(0, 500)); if (a) d.set("kim", a.id); d.set("kimAd", kim(a).slice(0, 120));
      d.set("oncekiAcilis", h.getFloat("acilis")); d.set("oncekiTarih", h.getString("acilisTarihi")); tx.save(d);
      h.set("acilis", yeni); h.set("acilisTarihi", t + " 23:59:00.000Z"); tx.unsafeWithoutHooks().save(h);
      gecmis(tx, "fin_hesaplar", h, "bakiye düzeltme", { bakiye: [eski, yeni], neden: neden }, a);
      sonuc = { eski: eski, yeni: yeni, fark: r2(yeni - eski), id: d.id }; });
    return sonuc;
  },
};
