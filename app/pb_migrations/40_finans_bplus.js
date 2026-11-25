/// <reference path="../pb_data/types.d.ts" />
// v92 · Finans B+ Premium — veri modeli (yalnız ekleme; mevcut alanlar silinmez, adı değişmez).
//  fin_hareketler : sirket (hesaptan ya da açıkça), gizli (maaş/personel/ortak: yalnız Finans yetkisi görür),
//                   transferId + transferTur (hesaplar arası / şirketler arası; iki bacak birbirine bağlı),
//                   anahtar (mükerrer engeli: kısmi ödeme kalanı ve transfer bacakları için tekil anahtar)
//  fin_sabitler   : sirket, gizli
//  fin_duzeltmeler: bakiye düzeltme geçmişi (eski/yeni bakiye, fark, ekstre tarihi, neden, açıklama, kullanıcı) — yalnız sunucu yazar
//  fin_gecmis     : finans kayıtlarının değişiklik geçmişi (kim, ne zaman, hangi alan eskiden ne idi) — yalnız sunucu yazar
//  users.y_sirket : boş = iki şirket; "D Solar" ya da "DRK" = yalnız o şirketin hesap ve hareketleri (sunucu kuralı)
// Taşıma: hareketin şirketi hesabından; hesabı olmayan kayıtlar "D Solar" (varsayılan, ekranda işaretli). Maaş/personel/ortak kayıtları gizli=true.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users"), hes = app.findCollectionByNameOrId("fin_hesaplar").id;
  const A = "@request.auth.aktif = true", Y = "@request.auth.rol = 'yonetici'";
  const G = (m) => "@request.auth.y_" + m + " = 'g' || @request.auth.y_" + m + " = 'd'";
  const S = "(@request.auth.y_sirket = '' || sirket = @request.auth.y_sirket)";
  const ekle = (c, f) => { if (!c.fields.getByName(f.name)) c.fields.add(f); };
  // kullanıcı: şirket kısıtı (kullanıcı kendi kaydında değiştiremez)
  ekle(users, new SelectField({ name: "y_sirket", maxSelect: 1, values: ["D Solar", "DRK"] }));
  if (users.updateRule && users.updateRule.indexOf("y_sirket:isset") < 0) users.updateRule = users.updateRule.replace("@request.body.y_ekip:isset = false", "@request.body.y_ekip:isset = false && @request.body.y_sirket:isset = false");
  app.save(users);
  const h = app.findCollectionByNameOrId("fin_hareketler");
  ekle(h, new TextField({ name: "sirket", max: 40 })); ekle(h, new BoolField({ name: "gizli" })); ekle(h, new TextField({ name: "transferId", max: 40 }));
  ekle(h, new SelectField({ name: "transferTur", maxSelect: 1, values: ["Hesaplar arası", "Şirketler arası · cari", "Şirketler arası · borç", "Şirketler arası · sermaye", "Banka masrafı"] }));
  ekle(h, new TextField({ name: "anahtar", max: 120 }));
  h.indexes = (h.indexes || []).filter((x) => x.indexOf("idx_fh_anahtar") < 0).concat(["CREATE UNIQUE INDEX idx_fh_anahtar ON fin_hareketler (anahtar) WHERE anahtar != ''", "CREATE INDEX idx_fh_sirket ON fin_hareketler (sirket)", "CREATE INDEX idx_fh_transfer ON fin_hareketler (transferId)"]);
  h.listRule = A + " && (" + Y + " || ((" + G("fin") + ") && " + S + ") || ((" + G("odeme") + ") && gizli = false && " + S + "))"; h.viewRule = h.listRule;
  app.save(h);
  const fh = app.findCollectionByNameOrId("fin_hesaplar");
  fh.listRule = A + " && (" + Y + " || ((" + G("fin") + " || " + G("odeme") + ") && " + S + "))"; fh.viewRule = fh.listRule; app.save(fh);
  const sb = app.findCollectionByNameOrId("fin_sabitler");
  ekle(sb, new TextField({ name: "sirket", max: 40 })); ekle(sb, new BoolField({ name: "gizli" }));
  sb.listRule = A + " && (" + Y + " || ((" + G("fin") + ") && " + S + ") || ((" + G("odeme") + ") && gizli = false && " + S + "))"; sb.viewRule = sb.listRule; app.save(sb);
  // kredi, kart, limit, teminat, varlık: şirket alanı (varsayılan D Solar) ve sunucu tarafı şirket kısıtı
  ["krediler", "fin_kartlar", "fin_limitler", "fin_teminatlar", "varliklar"].forEach((ad) => { let c; try { c = app.findCollectionByNameOrId(ad); } catch (e) { return; }
    ekle(c, new TextField({ name: "sirket", max: 40 }));
    if (c.listRule != null && c.listRule.indexOf("y_sirket") < 0) { c.listRule = "(" + c.listRule + ") && " + S; c.viewRule = c.listRule; }
    app.save(c); app.findRecordsByFilter(ad, "sirket = ''", "", 0, 0).forEach((r) => { r.set("sirket", "D Solar"); app.unsafeWithoutHooks().saveNoValidate(r); }); });
  const yoksa = (ad, olustur) => { try { app.findCollectionByNameOrId(ad); } catch (e) { app.save(olustur()); } };
  yoksa("fin_duzeltmeler", () => { const c = new Collection({ type: "base", name: "fin_duzeltmeler", fields: [
    { name: "hesap", type: "relation", required: true, collectionId: hes, maxSelect: 1, cascadeDelete: false },
    { name: "sirket", type: "text", max: 40 }, { name: "pb", type: "text", max: 3 },
    { name: "eski", type: "number" }, { name: "yeni", type: "number" }, { name: "fark", type: "number" },
    { name: "tarih", type: "date" }, { name: "neden", type: "text", max: 80 }, { name: "aciklama", type: "text", max: 500 },
    { name: "kim", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false }, { name: "kimAd", type: "text", max: 120 },
    { name: "oncekiAcilis", type: "number" }, { name: "oncekiTarih", type: "text", max: 40 },
    { name: "created", type: "autodate", onCreate: true } ], indexes: ["CREATE INDEX idx_fd_hesap ON fin_duzeltmeler (hesap)"] });
    c.listRule = A + " && (" + Y + " || ((" + G("fin") + ") && " + S + "))"; c.viewRule = c.listRule; c.createRule = null; c.updateRule = null; c.deleteRule = null; return c; });
  yoksa("fin_gecmis", () => { const c = new Collection({ type: "base", name: "fin_gecmis", fields: [
    { name: "koleksiyon", type: "text", max: 40 }, { name: "kayit", type: "text", max: 40 }, { name: "islem", type: "text", max: 20 },
    { name: "ozet", type: "text", max: 300 }, { name: "degisim", type: "json", maxSize: 20000 }, { name: "sirket", type: "text", max: 40 },
    { name: "kim", type: "text", max: 120 }, { name: "created", type: "autodate", onCreate: true } ],
    indexes: ["CREATE INDEX idx_fg_kayit ON fin_gecmis (kayit)", "CREATE INDEX idx_fg_created ON fin_gecmis (created)"] });
    c.listRule = A + " && (" + Y + " || ((" + G("fin") + ") && " + S + "))"; c.viewRule = c.listRule; c.createRule = null; c.updateRule = null; c.deleteRule = null; return c; });
  // taşıma: şirket ve gizlilik
  const GZ = /personel|maaş|maas|ortak|avans|tazminat|sgk prim/i, H = {};
  app.findRecordsByFilter("fin_hesaplar", "id != ''", "", 0, 0).forEach((x) => { H[x.id] = x.getString("sirket"); });
  app.findRecordsByFilter("fin_hareketler", "id != ''", "", 0, 0).forEach((r) => {
    let deg = false; if (!r.getString("sirket")) { r.set("sirket", H[r.getString("hesap")] || "D Solar"); deg = true; }
    const gz = GZ.test(r.getString("kategori")) || /^(Burhan|Batur)$/.test(r.getString("karsiTaraf"));
    if (gz && !r.getBool("gizli")) { r.set("gizli", true); deg = true; }
    if (deg) app.unsafeWithoutHooks().saveNoValidate(r); });
  app.findRecordsByFilter("fin_sabitler", "id != ''", "", 0, 0).forEach((r) => {
    let deg = false; if (!r.getString("sirket")) { r.set("sirket", "D Solar"); deg = true; }
    if (GZ.test(r.getString("kategori") + " " + r.getString("ad")) && !r.getBool("gizli")) { r.set("gizli", true); deg = true; }
    if (deg) app.unsafeWithoutHooks().saveNoValidate(r); });
}, (app) => {
  ["fin_duzeltmeler", "fin_gecmis"].forEach((n) => { try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {} });
  const A = "@request.auth.aktif = true", Y = "@request.auth.rol = 'yonetici'", G = (m) => "@request.auth.y_" + m + " = 'g' || @request.auth.y_" + m + " = 'd'", L = A + " && (" + Y + " || " + G("fin") + " || " + G("odeme") + ")";
  const sil = (ad, F) => { const c = app.findCollectionByNameOrId(ad); F.forEach((n) => { const f = c.fields.getByName(n); if (f) c.fields.removeById(f.id); }); c.listRule = L; c.viewRule = L; if (ad === "fin_hareketler") c.indexes = (c.indexes || []).filter((x) => !/idx_fh_(anahtar|sirket|transfer)/.test(x)); app.save(c); };
  ["krediler", "fin_kartlar", "fin_limitler", "fin_teminatlar", "varliklar"].forEach((ad) => { try { const c = app.findCollectionByNameOrId(ad), f = c.fields.getByName("sirket"); if (f) c.fields.removeById(f.id); if (c.listRule) { c.listRule = c.listRule.replace(/^\((.*)\) && \(@request\.auth\.y_sirket = '' \|\| sirket = @request\.auth\.y_sirket\)$/, "$1"); c.viewRule = c.listRule; } app.save(c); } catch (e) {} });
  sil("fin_hareketler", ["sirket", "gizli", "transferId", "transferTur", "anahtar"]); sil("fin_sabitler", ["sirket", "gizli"]); sil("fin_hesaplar", []);
  const u = app.findCollectionByNameOrId("users"), f = u.fields.getByName("y_sirket"); if (f) u.fields.removeById(f.id); u.updateRule = u.updateRule.replace(" && @request.body.y_sirket:isset = false", ""); app.save(u);
});
