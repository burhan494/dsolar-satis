/// <reference path="../pb_data/types.d.ts" />
// v93 · D Solar — Final Premium Experience (yalnız ekleme)
//  users.tercihler : kişisel tercihler (Bugün kart sırası/gizlenenler, hızlı işlem favorileri, bildirim tercihleri ve okundu bilgisi).
//                    Kullanıcı yalnız kendi kaydını değiştirebilir (mevcut users kuralı); yetki alanlarına dokunmaz.
//  gorevler.tur    : "Toplantı" ve "Hatırlatma" değerleri eklenir.
migrate((app) => {
  const u = app.findCollectionByNameOrId("users");
  if (!u.fields.getByName("tercihler")) u.fields.add(new JSONField({ name: "tercihler", maxSize: 60000 }));
  app.save(u);
  const g = app.findCollectionByNameOrId("gorevler"), t = g.fields.getByName("tur");
  ["Toplantı", "Hatırlatma"].forEach((v) => { if (t.values.indexOf(v) < 0) t.values.push(v); });
  app.save(g);
}, (app) => {
  const u = app.findCollectionByNameOrId("users"), f = u.fields.getByName("tercihler"); if (f) { u.fields.removeById(f.id); app.save(u); }
  const g = app.findCollectionByNameOrId("gorevler"), t = g.fields.getByName("tur"); t.values = t.values.filter((v) => v !== "Toplantı" && v !== "Hatırlatma"); app.save(g);
});
