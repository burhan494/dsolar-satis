/// <reference path="../pb_data/types.d.ts" />
// İlk yönetici hesabı: e-posta ve geçici şifre güncelleme betiğinden ortam değişkeniyle gelir; hesap varsa dokunulmaz.
migrate((app) => {
  const email = $os.getenv("DSOLAR_ILK_EPOSTA"), sifre = $os.getenv("DSOLAR_ILK_SIFRE"), ad = $os.getenv("DSOLAR_ILK_AD") || "Yönetici";
  if (!email || !sifre) return;
  try { app.findAuthRecordByEmail("users", email); return; } catch (e) {}
  const r = new Record(app.findCollectionByNameOrId("users"));
  r.set("email", email); r.set("name", ad); r.set("rol", "yonetici"); r.set("aktif", true); r.setPassword(sifre); r.set("verified", true);
  app.save(r);
}, (app) => {});
