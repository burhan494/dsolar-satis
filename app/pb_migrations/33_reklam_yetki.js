/// <reference path="../pb_data/types.d.ts" />
// v53: Reklamlar sayfası müşteri bölümünü görebilen herkese açık (yalnız satış rolüne değil)
migrate((app) => {
  const R = "@request.auth.aktif = true && (@request.auth.rol = 'yonetici' || (@request.auth.rol != 'ortak' && @request.auth.y_musteri != ''))";
  ["meta_ayar", "meta_gunluk"].forEach((n) => { const c = app.findCollectionByNameOrId(n); c.listRule = R; c.viewRule = R; app.save(c); });
}, (app) => {
  const R = "@request.auth.aktif = true && (@request.auth.rol = 'yonetici' || @request.auth.rol = 'satis')";
  ["meta_ayar", "meta_gunluk"].forEach((n) => { const c = app.findCollectionByNameOrId(n); c.listRule = R; c.viewRule = R; app.save(c); });
});
