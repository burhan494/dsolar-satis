// TCMB günlük kurları (döviz satış). Sonuç: fin_ayarlar 'kasa_kur' + ayarlar 'hesap'.kur (teklif ön hesabı).
// Aynı gün elle kur girildiyse (deger.elle = bugün) otomatik çekim onu ezmez; zorla=true ise ezer.
function bugunTR() { return new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10); }
function kurCek(app, zorla) {
  const r = $http.send({ url: $os.getenv("DSOLAR_TCMB_URL") || "https://www.tcmb.gov.tr/kurlar/today.xml", method: "GET", timeout: 20, headers: { "User-Agent": "Mozilla/5.0 dsolar" } });
  if (r.statusCode !== 200) throw new Error("TCMB yanıtı " + r.statusCode);
  const x = toString(r.body);
  const tm = /Tarih="(\d{2})\.(\d{2})\.(\d{4})"/.exec(x), tarih = tm ? tm[3] + "-" + tm[2] + "-" + tm[1] : bugunTR();
  const al = (kod) => { const m = new RegExp('Kod="' + kod + '"[\\s\\S]*?<ForexSelling>([0-9.]+)</ForexSelling>').exec(x); return m ? parseFloat(m[1]) : null; };
  const usd = al("USD"), eur = al("EUR");
  if (!(usd > 0) || !(eur > 0)) throw new Error("TCMB dosyasında USD/EUR bulunamadı");
  let k; try { k = app.findFirstRecordByData("fin_ayarlar", "anahtar", "kasa_kur"); } catch (e) { k = new Record(app.findCollectionByNameOrId("fin_ayarlar")); k.set("anahtar", "kasa_kur"); }
  let d = {}; try { d = JSON.parse(k.getString("deger") || "{}") || {}; } catch (e) { d = {}; }
  if (!zorla && d.elle && d.elle === bugunTR()) return { durum: "atlandı", mesaj: "Bugün elle kur girilmiş; TCMB kuru yazılmadı", usd: d.usd, eur: d.eur };
  const gecmis = d.gecmis && typeof d.gecmis === "object" ? d.gecmis : {};
  gecmis[tarih] = { usd: usd, eur: eur };
  Object.keys(gecmis).sort().slice(0, -60).forEach((t) => { delete gecmis[t]; });
  k.set("deger", { usd: usd, eur: eur, tarih: tarih, kaynak: "TCMB döviz satış", cekim: new Date().toISOString(), elle: "", gecmis: gecmis });
  app.save(k);
  try { const h = app.findFirstRecordByData("ayarlar", "anahtar", "hesap"); let hd = {}; try { hd = JSON.parse(h.getString("deger") || "{}"); } catch (e) {}
    hd.kur = Math.round(usd * 100) / 100; hd.kurTarih = tarih; hd.kurKaynak = "TCMB"; h.set("deger", hd); app.save(h); } catch (e) {}
  return { durum: "tamam", mesaj: "TCMB " + tarih + ": USD " + usd + " · EUR " + eur, usd: usd, eur: eur, tarih: tarih };
}
module.exports = { kurCek: kurCek, bugunTR: bugunTR };
