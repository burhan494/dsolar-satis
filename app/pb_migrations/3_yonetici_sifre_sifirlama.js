/// <reference path="../pb_data/types.d.ts" />
// Yönetici, ekipten birinin şifresini sıfırlayabilir (manageRule)
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  users.manageRule = "@request.auth.aktif = true && @request.auth.rol = 'yonetici'";
  app.save(users);
}, (app) => { const u = app.findCollectionByNameOrId("users"); u.manageRule = null; app.save(u); });
