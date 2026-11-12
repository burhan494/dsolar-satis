// Proje ödeme planını Finans'a planlı hareket olarak aktarır (bir kez).
function planAktar(app, p) {
  if (p.getBool("planAktarildi")) return;
  let plan = {}; try { plan = JSON.parse(p.getString("odemePlan") || "{}") || {}; } catch (x) { plan = {}; }
  const satir = (plan.tahsilat || []).filter((r) => +r.oran > 0 && r.tarih), mal = plan.maliyet || {};
  if (!satir.length && !(+mal.usd > 0)) return;
  let ad = ""; try { ad = app.findRecordById("adaylar", p.getString("aday")).getString("ad"); } catch (x) {}
  const col = app.findCollectionByNameOrId("fin_hareketler"), bedel = p.getFloat("bedelUsd"), tur = p.getString("tur") || "Anahtar teslim";
  const yeni = (o) => { const r = new Record(col); Object.keys(o).forEach((k) => r.set(k, o[k])); r.set("aday", p.getString("aday")); r.set("pb", "USD"); r.set("durum", "Planlandı"); r.set("karsiTaraf", ad); app.save(r); };
  satir.forEach((r) => yeni({ tarih: String(r.tarih).slice(0, 10) + " 12:00:00.000Z", yon: "Giriş", kategori: tur === "Malzeme satışı" ? "Malzeme satışı tahsilatı" : "Proje tahsilatı", tutar: Math.round(bedel * +r.oran) / 100, aciklama: (r.ad || "Tahsilat") + " %" + r.oran + " · " + tur, not: "proje ödeme planından" }));
  if (+mal.usd > 0) yeni({ tarih: String(mal.tarih || p.getString("basla")).slice(0, 10) + " 12:00:00.000Z", yon: "Çıkış", kategori: "Malzeme", tutar: Math.round(+mal.usd * 100) / 100, aciklama: "Malzeme maliyeti (tekliften) · " + ad, not: "proje ödeme planından" });
  p.set("planAktarildi", true); app.saveNoValidate(p);
}
module.exports = { planAktar: planAktar };
