/// <reference path="../pb_data/types.d.ts" />
// D Solar test şeması — yalnız test ortamı. Roller: yonetici, satis, saha, proje, muhasebe, ortak
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  users.fields.add(new SelectField({ name: "rol", values: ["yonetici","satis","saha","proje","muhasebe","ortak"], maxSelect: 1, required: true }));
  users.fields.add(new BoolField({ name: "aktif" }));
  // kullanıcı kendi rolünü ve aktifliğini değiştiremez; yalnız yönetici
  users.listRule = "@request.auth.aktif = true && (@request.auth.rol = 'yonetici' || id = @request.auth.id)";
  users.viewRule = users.listRule;
  users.createRule = null;
  users.updateRule = "@request.auth.aktif = true && (@request.auth.rol = 'yonetici' || (id = @request.auth.id && @request.body.rol:isset = false && @request.body.aktif:isset = false))";
  users.deleteRule = null;
  users.authRule = "aktif = true";
  app.save(users);

  const A = "@request.auth.aktif = true && ";
  const yon = "@request.auth.rol = 'yonetici'";
  const adaylar = new Collection({
    type: "base", name: "adaylar",
    fields: [
      { name: "ad", type: "text", required: true },
      { name: "tel", type: "text" },
      { name: "ilce", type: "text" },
      { name: "kaynak", type: "select", values: ["Eski teklif","Teklifsiz aday","Referans","İş ortağı","Instagram","WhatsApp","Site/toplu","Diğer"], maxSelect: 1 },
      { name: "asama", type: "select", values: ["Aday","Nitelikli","Keşif","Teklif","Sözleşme","Kaybedildi"], maxSelect: 1 },
      { name: "sozlesmeGucu", type: "number" },
      { name: "sorumlu", type: "relation", collectionId: users.id, maxSelect: 1 },
      { name: "kesifci", type: "relation", collectionId: users.id, maxSelect: 1 },
      { name: "ortak", type: "relation", collectionId: users.id, maxSelect: 1 },
      { name: "iys", type: "select", values: ["Sorulacak","İzinli","İzinsiz"], maxSelect: 1 },
      { name: "not", type: "text" },
    ],
  });
  const adayOku = A + "(" + yon + " || @request.auth.rol = 'satis' || @request.auth.rol = 'proje' || (@request.auth.rol = 'saha' && kesifci = @request.auth.id))";
  adaylar.listRule = adayOku; adaylar.viewRule = adayOku;
  adaylar.createRule = A + "(" + yon + " || @request.auth.rol = 'satis')";
  adaylar.updateRule = A + "(" + yon + " || @request.auth.rol = 'satis' || (@request.auth.rol = 'saha' && kesifci = @request.auth.id && @request.body.ortak:isset = false && @request.body.sorumlu:isset = false))";
  adaylar.deleteRule = A + yon;
  app.save(adaylar);

  const teklifler = new Collection({
    type: "base", name: "teklifler",
    fields: [
      { name: "aday", type: "relation", collectionId: adaylar.id, maxSelect: 1, required: true },
      { name: "kwp", type: "number" },
      { name: "fiyatUSD", type: "number" },
      { name: "durum", type: "select", values: ["Taslak","Onay bekliyor","Gönderildi","Anlaşıldı","Kaybedildi"], maxSelect: 1 },
      { name: "onaylayan", type: "relation", collectionId: users.id, maxSelect: 1 },
    ],
  });
  const tOku = A + "(" + yon + " || @request.auth.rol = 'satis' || @request.auth.rol = 'muhasebe')";
  teklifler.listRule = tOku; teklifler.viewRule = tOku;
  teklifler.createRule = A + "(" + yon + " || @request.auth.rol = 'satis')";
  // "Gönderildi" durumuna yalnız yönetici geçirir (insan onayı)
  teklifler.updateRule = A + "(" + yon + " || (@request.auth.rol = 'satis' && @request.body.durum != 'Gönderildi'))";
  teklifler.deleteRule = A + yon;
  app.save(teklifler);

  const fin = (name, fields) => { const c = new Collection({ type: "base", name, fields });
    const r = A + "(" + yon + " || @request.auth.rol = 'muhasebe')"; c.listRule = r; c.viewRule = r; c.createRule = r; c.updateRule = r; c.deleteRule = A + yon; app.save(c); return c; };
  fin("kasa", [{ name: "tarih", type: "date" }, { name: "tutar", type: "number" }, { name: "pb", type: "text" }, { name: "aciklama", type: "text" }]);
  fin("banka", [{ name: "banka", type: "text" }, { name: "limit", type: "number" }, { name: "kullanilan", type: "number" }]);
  fin("ortakcari", [{ name: "ortak", type: "text" }, { name: "bakiye", type: "number" }]);

  const kom = new Collection({ type: "base", name: "komisyonlar", fields: [
    { name: "ortak", type: "relation", collectionId: users.id, maxSelect: 1, required: true },
    { name: "aday", type: "relation", collectionId: adaylar.id, maxSelect: 1 },
    { name: "tutarUSD", type: "number" }, { name: "durum", type: "select", values: ["Bekliyor","Hak edildi","Ödendi"], maxSelect: 1 } ] });
  const kOku = A + "(" + yon + " || @request.auth.rol = 'muhasebe' || (@request.auth.rol = 'ortak' && ortak = @request.auth.id))";
  kom.listRule = kOku; kom.viewRule = kOku; kom.createRule = A + "(" + yon + " || @request.auth.rol = 'muhasebe')"; kom.updateRule = kom.createRule; kom.deleteRule = A + yon;
  app.save(kom);

  const foto = new Collection({ type: "base", name: "kesif_foto", fields: [
    { name: "aday", type: "relation", collectionId: adaylar.id, maxSelect: 1, required: true },
    { name: "dosya", type: "file", maxSelect: 1, maxSize: 15000000, protected: true, mimeTypes: ["image/jpeg","image/png","image/heic"] } ] });
  const fOku = A + "(" + yon + " || @request.auth.rol = 'proje' || (@request.auth.rol = 'saha' && aday.kesifci = @request.auth.id))";
  foto.listRule = fOku; foto.viewRule = fOku; foto.createRule = A + "(" + yon + " || (@request.auth.rol = 'saha' && aday.kesifci = @request.auth.id))"; foto.updateRule = null; foto.deleteRule = A + yon;
  app.save(foto);

  // İş ortağı yalnız bu görünümü okur: ad, ilçe, aşama — telefon ve fiyat yok
  const og = new Collection({ type: "view", name: "ortak_musterileri",
    viewQuery: "SELECT id, ad, ilce, asama, ortak FROM adaylar WHERE ortak != ''" });
  og.listRule = A + "@request.auth.rol = 'ortak' && ortak = @request.auth.id"; og.viewRule = og.listRule;
  app.save(og);
}, (app) => {
  ["ortak_musterileri","kesif_foto","komisyonlar","ortakcari","banka","kasa","teklifler","adaylar"].forEach((n) => { try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {} });
});
