/// <reference path="../pb_data/types.d.ts" />
// Kişi başı bölüm yetkileri: her bölüm için '' (yok), 'g' (görür), 'd' (düzenler); 'kendi' = sadece kendi müşterileri.
// Yönetici rolü her şeye erişir; ödeme ve teklif onayı yalnız yöneticide kalır. İş ortağı (rol 'ortak') eski kurallarıyla devam eder.
migrate((app) => {
  const MOD = ["musteri", "teklif", "fiyat", "proje", "fin", "odeme", "ges", "ortak", "ekip"];
  const u = app.findCollectionByNameOrId("users");
  MOD.forEach((m) => { if (!u.fields.getByName("y_" + m)) u.fields.add(new SelectField({ name: "y_" + m, values: ["g", "d"], maxSelect: 1 })); });
  if (!u.fields.getByName("kendi")) u.fields.add(new BoolField({ name: "kendi" }));
  app.save(u);
  // mevcut rollerin karşılığı
  const SAB = {
    satis: { musteri: "d", teklif: "d", proje: "d" },
    saha: { musteri: "d", proje: "d", kendi: true },
    proje: { musteri: "g", proje: "d" },
    muhasebe: { teklif: "g", proje: "g", fin: "d", odeme: "d" },
  };
  app.findAllRecords("users").forEach((r) => { const s = SAB[r.getString("rol")]; if (!s) return;
    MOD.forEach((m) => { if (!r.getString("y_" + m) && s[m]) r.set("y_" + m, s[m]); }); if (s.kendi) r.set("kendi", true); app.saveNoValidate(r); });

  const A = "@request.auth.aktif = true", Y = "@request.auth.rol = 'yonetici'";
  const G = (...ms) => "(" + [Y].concat(ms.map((m) => "@request.auth.y_" + m + " = 'g' || @request.auth.y_" + m + " = 'd'")).join(" || ") + ")";
  const D = (...ms) => "(" + [Y].concat(ms.map((m) => "@request.auth.y_" + m + " = 'd'")).join(" || ") + ")";
  const K = (p) => "(@request.auth.kendi = false || " + p + "sorumlu = @request.auth.id || " + p + "kesifci = @request.auth.id)";
  const OR = (alan) => "(@request.auth.rol = 'ortak' && " + alan + " = @request.auth.id)";
  const kur = (ad, L, C, U, Dl) => { const c = app.findCollectionByNameOrId(ad); c.listRule = L; c.viewRule = L; if (C !== undefined) c.createRule = C; if (U !== undefined) c.updateRule = U; if (Dl !== undefined) c.deleteRule = Dl; app.save(c); };

  kur("adaylar", A + " && " + G("musteri") + " && " + K(""), A + " && " + D("musteri"),
    A + " && " + D("musteri") + " && " + K("") + " && (@request.auth.kendi = false || @request.body.sorumlu:isset = false)", A + " && " + D("musteri") + " && " + K(""));
  const g2 = app.findCollectionByNameOrId("gorusmeler");
  kur("gorusmeler", A + " && " + G("musteri", "proje") + " && " + K("aday."), A + " && " + G("musteri", "proje") + " && " + K("aday.") + " && yazan = @request.auth.id", g2.updateRule, A + " && " + Y);
  kur("kesif_foto", A + " && " + G("musteri", "proje") + " && " + K("aday."), A + " && " + D("musteri", "proje") + " && " + K("aday."), undefined, A + " && " + D("proje"));
  kur("projeler", A + " && " + G("proje", "fin") + " && " + K("aday."), A + " && " + D("proje"),
    A + " && " + D("proje") + " && " + K("aday.") + " && (" + Y + " || @request.auth.y_teklif = 'd' || @request.auth.y_fiyat = 'd' || @request.body.bedelUsd:isset = false)", A + " && " + D("proje"));
  kur("teklifler", A + " && " + G("teklif") + " && " + K("aday."),
    A + " && (" + Y + " || (@request.auth.y_teklif = 'd' && @request.body.durum != 'Gönderildi' && @request.body.durum != 'Anlaşıldı'))",
    A + " && (" + Y + " || (@request.auth.y_teklif = 'd' && @request.body.durum != 'Gönderildi'))", A + " && " + D("teklif"));
  kur("katalog", A + " && " + G("teklif", "fiyat"), A + " && " + D("fiyat"), A + " && " + D("fiyat"), A + " && " + D("fiyat"));
  kur("komisyonlar", A + " && (" + G("fin", "fiyat") + " || " + OR("ortak") + ")", A + " && " + D("fin"), A + " && " + D("fin"), A + " && " + D("fin"));
  const yl = app.findCollectionByNameOrId("yonlendirmeler");
  kur("yonlendirmeler", A + " && (" + G("musteri") + " || " + OR("ortak") + ")", yl.createRule, A + " && " + D("musteri"), A + " && " + D("musteri"));
  ["banka", "fin_hesaplar", "fin_kartlar", "fin_limitler", "fin_sabitler", "fin_talepler", "fin_teminatlar", "kasa", "krediler", "ortakcari"].forEach((n) =>
    kur(n, A + " && " + G("fin", "odeme"), A + " && " + D("fin"), A + " && " + D("fin"), A + " && " + D("fin")));
  const onayKis = "(@request.body.onay:isset = false || @request.body.onay = '' || @request.body.onay = 'Onay bekliyor') && @request.body.onaylayan:isset = false";
  kur("fin_hareketler", A + " && " + G("fin", "odeme"),
    A + " && (" + Y + " || ((@request.auth.y_fin = 'd' || @request.auth.y_odeme = 'd') && " + onayKis + " && (@request.body.durum != 'Gerçekleşti' || @request.body.yon = 'Giriş')))",
    A + " && (" + Y + " || ((@request.auth.y_fin = 'd' || @request.auth.y_odeme = 'd') && " + onayKis + " && (@request.body.durum:isset = false || @request.body.durum != 'Gerçekleşti' || yon = 'Giriş' || onay = 'Onaylandı') && (onay != 'Onaylandı' || @request.body.tutar:isset = false || @request.body.tutar <= tutar)))",
    A + " && " + D("fin"));
  kur("odeme_listeleri", A + " && " + G("fin", "odeme"), A + " && " + D("fin", "odeme"),
    A + " && (" + Y + " || ((@request.auth.y_fin = 'd' || @request.auth.y_odeme = 'd') && @request.body.onaylayan:isset = false && (@request.body.durum:isset = false || @request.body.durum = 'Onayda' || @request.body.durum = 'Kapandı')))", A + " && " + Y);
  kur("fin_ayarlar", A + " && " + G("fin", "ges", "ortak"), A + " && " + D("fin", "ges", "ortak"), A + " && " + D("fin", "ges", "ortak"), A + " && " + Y);
  ["ges_aylik", "ges_bakimcilar", "ges_olaylar"].forEach((n) => kur(n, A + " && " + G("ges"), A + " && " + D("ges"), A + " && " + D("ges"), A + " && " + D("ges")));
  kur("isc_ayar", A + " && " + G("ges"));
  ["ortak_cari", "varliklar"].forEach((n) => kur(n, A + " && " + G("ortak"), A + " && " + D("ortak"), A + " && " + D("ortak"), A + " && " + D("ortak")));
  const kendiDegil = ["rol", "aktif", "kendi"].concat(MOD.map((m) => "y_" + m)).map((f) => "@request.body." + f + ":isset = false").join(" && ");
  const uc = app.findCollectionByNameOrId("users");
  uc.createRule = A + " && (" + Y + " || (@request.auth.y_ekip = 'd' && @request.body.rol != 'yonetici'))";
  uc.updateRule = A + " && (" + Y + " || (@request.auth.y_ekip = 'd' && rol != 'yonetici' && (@request.body.rol:isset = false || @request.body.rol != 'yonetici')) || (id = @request.auth.id && " + kendiDegil + "))";
  app.save(uc);
}, (app) => {});
