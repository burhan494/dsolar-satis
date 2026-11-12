// Kayıt geçmişi: önemli değişiklikleri "kim, ne" olarak saklar (yalnız yönetici ve ekip yöneticisi görür).
module.exports = {
  yaz: (app, kim, tur, ne) => { try { const c = app.findCollectionByNameOrId("kayit_gecmisi"); const r = new Record(c); r.set("kim", String(kim || "sistem").slice(0, 120)); r.set("tur", tur); r.set("ne", String(ne).slice(0, 500)); app.save(r); } catch (x) { console.log("kayıt geçmişi yazılamadı", x); } },
  kim: (e) => { const a = e.auth; return a ? (a.getString("name") || a.getString("email")) : "sistem"; },
};
