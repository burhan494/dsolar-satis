/// <reference path="../pb_data/types.d.ts" />
// Satış teklifi doğrudan "Gönderildi" olarak oluşturamaz; onay yalnız yöneticide
migrate((app) => {
  const t = app.findCollectionByNameOrId("teklifler");
  t.createRule = "@request.auth.aktif = true && (@request.auth.rol = 'yonetici' || (@request.auth.rol = 'satis' && @request.body.durum != 'Gönderildi' && @request.body.durum != 'Anlaşıldı'))";
  app.save(t);
}, (app) => {});
