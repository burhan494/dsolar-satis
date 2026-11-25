/// <reference path="../pb_data/types.d.ts" />
// Finans B+ Premium — sunucu tarafı finans güvenliği. Ayrıntı: finans_lib.js
routerAdd("POST", "/api/dsolar/transfer", (e) => {
  const L = require(`${__hooks}/finans_lib.js`), a = e.auth;
  if (!a || !a.getBool("aktif") || !L.finD(a)) throw new ForbiddenError("Transfer için Finans düzenleme yetkisi gerekir");
  const b = e.requestInfo().body || {}, test = $os.getenv("DS_TEST") === "1" ? String(b._test || "") : "";
  try { return e.json(200, L.transfer(e.app, a, b, test)); }
  catch (x) { const m = String(x && x.message || x); if (/UNIQUE|anahtar/i.test(m)) throw new BadRequestError("Bu transfer zaten kaydedildi"); throw x; }
}, $apis.requireAuth("users"));
routerAdd("POST", "/api/dsolar/bakiye-duzelt", (e) => {
  const L = require(`${__hooks}/finans_lib.js`), a = e.auth;
  if (!a || !a.getBool("aktif") || !L.finD(a)) throw new ForbiddenError("Bakiye düzeltme için Finans düzenleme yetkisi gerekir");
  return e.json(200, L.duzelt(e.app, a, e.requestInfo().body || {}));
}, $apis.requireAuth("users"));

onRecordCreateRequest((e) => {
  const L = require(`${__hooks}/finans_lib.js`), r = e.record, a = e.auth, q = e.requestInfo().query || {};
  r.set("tutar", L.r2(r.getFloat("tutar"))); if (r.getFloat("hesapTutar")) r.set("hesapTutar", L.r2(r.getFloat("hesapTutar")));
  const hs = L.hesapSirket(e.app, r.getString("hesap"));
  if (hs) r.set("sirket", hs); else if (!r.getString("sirket")) r.set("sirket", (a && a.getString("y_sirket")) || "D Solar");
  if (L.gizliMi(r)) r.set("gizli", true);
  if (r.getString("transferId") && !(a && L.yon(a))) throw new ForbiddenError("Transfer kaydı yalnız transfer ekranından açılır");
  if (a && !L.yon(a)) {
    if (!L.sirketIzin(a, r.getString("sirket"))) throw new ForbiddenError("Bu şirkete kayıt yetkiniz yok");
    if (r.getBool("gizli") && !L.finG(a)) throw new ForbiddenError("Bu kayıt türü için Finans yetkisi gerekir");
  }
  // kısmi ödeme/tahsilat kalanı: aynı ana kayıttan eşzamanlı ikinci kalan açılamaz (tekil anahtar)
  if (r.getString("ana") && !r.getString("anahtar")) { try { const p = e.app.findRecordById("fin_hareketler", r.getString("ana")); r.set("anahtar", "kalan:" + p.id + ":" + p.getString("updated")); } catch (x) {} }
  // mükerrer: aynı yön, tutar, para birimi, karşı taraf, kategori, gün ve hesap 2 dakika içinde ikinci kez girilemez
  if (q.cift !== "1" && !r.getString("transferId")) {
    let var_ = null; try { const son = new Date(Date.now() - 120000).toISOString().replace("T", " ");
      const gun = String(r.getString("tarih")).slice(0, 10);
      var_ = e.app.findRecordsByFilter("fin_hareketler", "karsiTaraf = {:k} && created >= {:s}", "", 50, 0, { k: r.getString("karsiTaraf"), s: son }).filter((x) =>
        x.getString("yon") === r.getString("yon") && Math.abs(x.getFloat("tutar") - r.getFloat("tutar")) < 0.005 && x.getString("pb") === r.getString("pb") && x.getString("kategori") === r.getString("kategori") &&
        x.getString("hesap") === r.getString("hesap") && x.getString("belgeNo") === r.getString("belgeNo") && String(x.getString("tarih")).slice(0, 10) === gun)[0] || null;
    } catch (x) { var_ = null; if (!/no rows/i.test(String(x))) console.log("mükerrer denetimi", x); }
    if (var_) throw new BadRequestError("Aynı kayıt 2 dakika içinde zaten girildi (mükerrer). Gerçekten ikinci bir kayıtsa tekrar onaylayın.");
  }
  try { e.next(); } catch (x) { if (/anahtar|UNIQUE/i.test(String(x && x.message || x))) throw new BadRequestError("Bu kısmi ödemenin kalanı zaten kaydedildi (mükerrer)"); throw x; }
  L.gecmis(e.app, "fin_hareketler", r, "ekleme", {}, a);
}, "fin_hareketler");

onRecordUpdateRequest((e) => {
  const L = require(`${__hooks}/finans_lib.js`), r = e.record, o = r.original(), a = e.auth, b = e.requestInfo().body || {};
  if (a && !L.yon(a)) {
    if (!L.sirketIzin(a, o.getString("sirket"))) throw new ForbiddenError("Bu şirketin kaydına yetkiniz yok");
    if (o.getBool("gizli") && !L.finG(a)) throw new ForbiddenError("Bu kayıt için Finans yetkisi gerekir");
  }
  r.set("tutar", L.r2(r.getFloat("tutar"))); if (r.getFloat("hesapTutar")) r.set("hesapTutar", L.r2(r.getFloat("hesapTutar")));
  // transfer bacakları: tutar, hesap, yön, tarih ve durum değiştirilemez (sil ve yeniden aç)
  if (o.getString("transferId") && L.TR_ALAN.some((f) => o.getString(f) !== r.getString(f))) throw new BadRequestError("Geçmiş transfer değiştirilemez. Gerekirse transferi silip yeniden kaydedin.");
  if (r.getString("transferId") !== o.getString("transferId") || r.getString("transferTur") !== o.getString("transferTur") || r.getString("anahtar") !== o.getString("anahtar")) throw new BadRequestError("Transfer bilgisi elle değiştirilemez");
  // çift ödeme: zaten gerçekleşmiş kayıt ikinci kez "Ödendi/Tahsil edildi" yapılamaz (düzeltme ayrı akış)
  if (o.getString("durum") === "Gerçekleşti" && b.durum === "Gerçekleşti" && b.kontrolEden) throw new BadRequestError("Bu kayıt zaten " + (o.getString("yon") === "Giriş" ? "tahsil edildi" : "ödendi") + " olarak işaretlenmiş");
  const hs = L.hesapSirket(e.app, r.getString("hesap")); if (hs) r.set("sirket", hs);
  if (a && !L.yon(a) && !L.sirketIzin(a, r.getString("sirket"))) throw new ForbiddenError("Kaydı yetkiniz olmayan şirkete taşıyamazsınız");
  if (L.gizliMi(r)) r.set("gizli", true);
  // onay güvenliği: onaylı ödemede tutar, para birimi, alıcı, hesap, IBAN ya da kart değişirse onay düşer (ödeme işaretleme hariç)
  if (o.getString("onay") === "Onaylandı" && r.getString("durum") !== "Gerçekleşti" && L.ONAY_ALAN.some((f) => o.getString(f) !== r.getString(f)) && !(L.yon(a) && b.onay === "Onaylandı")) {
    const D = L.ONAY_ALAN.filter((f) => o.getString(f) !== r.getString(f));
    r.set("onay", "Onay bekliyor"); r.set("onaylayan", ""); r.set("onayTarihi", ""); r.set("onayIstek", new Date().toISOString().replace("T", " "));
    r.set("onayNot", ("Değişti (" + D.join(", ") + "): yeniden onay gerekli. " + (o.getString("onayNot") || "")).slice(0, 500));
  }
  const D = L.fark(o, r); e.next();
  if (Object.keys(D).length) L.gecmis(e.app, "fin_hareketler", r, o.getString("durum") !== r.getString("durum") ? "durum" : "değişiklik", D, a);
}, "fin_hareketler");

onRecordDeleteRequest((e) => {
  const L = require(`${__hooks}/finans_lib.js`), r = e.record, a = e.auth;
  if (a && !L.yon(a) && !L.sirketIzin(a, r.getString("sirket"))) throw new ForbiddenError("Bu şirketin kaydına yetkiniz yok");
  const tid = r.getString("transferId");
  if (!tid) { e.next(); L.gecmis(e.app, "fin_hareketler", r, "silme", {}, a); return; }
  // transfer: bütün bacaklar birlikte silinir
  e.app.runInTransaction((tx) => { tx.findRecordsByFilter("fin_hareketler", "transferId = {:t} && id != {:i}", "", 0, 0, { t: tid, i: r.id }).forEach((x) => { tx.unsafeWithoutHooks().delete(x); L.gecmis(tx, "fin_hareketler", x, "silme", { transferId: tid }, a); }); });
  e.next(); L.gecmis(e.app, "fin_hareketler", r, "silme", { transferId: tid }, a);
}, "fin_hareketler");

// diğer finans tabloları: şirket kısıtı ve değişiklik geçmişi
onRecordCreateRequest((e) => { const L = require(`${__hooks}/finans_lib.js`), r = e.record, a = e.auth;
  if (r.collection().name === "fin_sabitler") { if (!r.getString("sirket")) r.set("sirket", (a && a.getString("y_sirket")) || "D Solar"); if (L.GZ.test(r.getString("kategori") + " " + r.getString("ad"))) r.set("gizli", true); }
  if (a && !L.yon(a) && r.collection().fields.getByName("sirket") && !L.sirketIzin(a, r.getString("sirket"))) throw new ForbiddenError("Bu şirkete kayıt yetkiniz yok");
  e.next(); L.gecmis(e.app, r.collection().name, r, "ekleme", {}, a); }, "fin_hesaplar", "fin_sabitler", "ortak_cari", "fin_kartlar", "odeme_listeleri");
onRecordUpdateRequest((e) => { const L = require(`${__hooks}/finans_lib.js`), r = e.record, o = r.original(), a = e.auth;
  if (a && !L.yon(a) && r.collection().fields.getByName("sirket") && (!L.sirketIzin(a, o.getString("sirket")) || !L.sirketIzin(a, r.getString("sirket")))) throw new ForbiddenError("Bu şirketin kaydına yetkiniz yok");
  if (r.collection().name === "fin_sabitler" && L.GZ.test(r.getString("kategori") + " " + r.getString("ad"))) r.set("gizli", true);
  const D = L.fark(o, r); e.next(); if (Object.keys(D).length) L.gecmis(e.app, r.collection().name, r, "değişiklik", D, a); }, "fin_hesaplar", "fin_sabitler", "ortak_cari", "fin_kartlar", "odeme_listeleri");
onRecordDeleteRequest((e) => { const L = require(`${__hooks}/finans_lib.js`), r = e.record, a = e.auth;
  if (a && !L.yon(a) && r.collection().fields.getByName("sirket") && !L.sirketIzin(a, r.getString("sirket"))) throw new ForbiddenError("Bu şirketin kaydına yetkiniz yok");
  e.next(); L.gecmis(e.app, r.collection().name, r, "silme", {}, a); }, "fin_hesaplar", "fin_sabitler", "ortak_cari", "fin_kartlar", "odeme_listeleri");

// her kayıt yolu (sunucu aktarımları dahil): şirket hesabından, yoksa D Solar; maaş/personel/ortak gizli
onRecordCreate((e) => { const L = require(`${__hooks}/finans_lib.js`), r = e.record; const hs = L.hesapSirket(e.app, r.getString("hesap"));
  if (hs) r.set("sirket", hs); else if (!r.getString("sirket")) r.set("sirket", "D Solar"); if (L.gizliMi(r)) r.set("gizli", true); e.next(); }, "fin_hareketler");
onRecordUpdate((e) => { const L = require(`${__hooks}/finans_lib.js`), r = e.record; const hs = L.hesapSirket(e.app, r.getString("hesap"));
  if (hs) r.set("sirket", hs); else if (!r.getString("sirket")) r.set("sirket", "D Solar"); if (L.gizliMi(r)) r.set("gizli", true); e.next(); }, "fin_hareketler");
