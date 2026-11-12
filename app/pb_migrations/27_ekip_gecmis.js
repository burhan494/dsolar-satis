/// <reference path="../pb_data/types.d.ts" />
// Ekip sayfası: kişiye etiket (ör. "Ortak"), son giriş zamanı ve kayıt geçmişi (kim ne değiştirdi).
migrate((app) => {
  const u = app.findCollectionByNameOrId("users");
  if (!u.fields.getByName("unvan")) u.fields.add(new TextField({ name: "unvan", max: 40 }));
  if (!u.fields.getByName("sonGiris")) u.fields.add(new DateField({ name: "sonGiris" }));
  app.save(u);
  let k; try { k = app.findCollectionByNameOrId("kayit_gecmisi"); } catch (e) { k = null; }
  if (!k) {
    k = new Collection({ type: "base", name: "kayit_gecmisi", fields: [
      { name: "kim", type: "text", max: 120 }, { name: "tur", type: "text", max: 40 }, { name: "ne", type: "text", max: 500 },
      { name: "created", type: "autodate", onCreate: true } ] });
    k.listRule = "@request.auth.aktif = true && (@request.auth.rol = 'yonetici' || @request.auth.y_ekip = 'd' || @request.auth.y_ekip = 'g')"; k.viewRule = k.listRule;
    k.createRule = null; k.updateRule = null; k.deleteRule = null;
    app.save(k);
  }
  const g = app.findCollectionByNameOrId("ges_aylik");
  if (!g.fields.getByName("raporTarih")) { g.fields.add(new DateField({ name: "raporTarih" })); app.save(g); }
  // Batur Bey'in ekipteki etiketi: Ortak (yönetimin isteği)
  app.findAllRecords("users").forEach((r) => { if (/batur/i.test(r.getString("name")) && !r.getString("unvan") && r.getString("rol") !== "ortak") { r.set("unvan", "Ortak"); app.saveNoValidate(r); } });
}, (app) => {});
