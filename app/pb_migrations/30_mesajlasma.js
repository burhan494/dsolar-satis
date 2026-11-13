/// <reference path="../pb_data/types.d.ts" />
// Ekip içi mesajlaşma: sohbetler (birebir, grup, kayda bağlı) ve mesajlar.
// Herkes yalnız üyesi olduğu sohbetleri görür. İş ortakları (rol "ortak") mesajlaşmaya katılmaz.
// Varsayılan "Ekip" grubu aktif tüm ekip üyeleriyle kurulur; yeni eklenen kişi hook ile gruba girer.
migrate((app) => {
  const A = "@request.auth.aktif = true && @request.auth.rol != 'ortak'";
  const users = app.findCollectionByNameOrId("users");
  let S; try { S = app.findCollectionByNameOrId("sohbetler"); } catch (e) { S = null; }
  if (!S) S = new Collection({ type: "base", name: "sohbetler", fields: [
    { name: "tip", type: "select", values: ["birebir", "grup", "kayit"], maxSelect: 1, required: true },
    { name: "ad", type: "text", max: 120 },
    { name: "uyeler", type: "relation", collectionId: users.id, maxSelect: 200, cascadeDelete: false },
    { name: "kayitTip", type: "text", max: 30 },
    { name: "kayitId", type: "text", max: 40 },
    { name: "anahtar", type: "text", max: 120 },
    { name: "sonMesaj", type: "text", max: 300 },
    { name: "sonMesajTarih", type: "date" },
    { name: "sonGonderen", type: "text", max: 40 },
    { name: "olusturan", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
    { name: "created", type: "autodate", onCreate: true }, { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ],
    indexes: ["CREATE UNIQUE INDEX idx_sohbet_anahtar ON sohbetler (anahtar) WHERE anahtar != ''"] });
  const UYE = "uyeler.id ?= @request.auth.id";
  S.listRule = A + " && " + UYE; S.viewRule = S.listRule;
  S.createRule = A; // üyelik, birebir anahtarı ve oluşturan hook'ta (mesaj.pb.js) ayarlanır
  S.updateRule = A + " && " + UYE; // yalnız ad ve üye eklenebilir (hook denetler)
  S.deleteRule = null;
  app.save(S);

  let M; try { M = app.findCollectionByNameOrId("mesajlar"); } catch (e) { M = null; }
  if (!M) M = new Collection({ type: "base", name: "mesajlar", fields: [
    { name: "sohbet", type: "relation", collectionId: S.id, maxSelect: 1, cascadeDelete: true, required: true },
    { name: "gonderen", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
    { name: "metin", type: "text", max: 4000 },
    { name: "ek", type: "file", maxSelect: 5, maxSize: 15 * 1024 * 1024, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"] },
    { name: "eylem", type: "json", maxSize: 4000 },
    { name: "okuyanlar", type: "relation", collectionId: users.id, maxSelect: 200, cascadeDelete: false },
    { name: "duzenlendi", type: "bool" },
    { name: "created", type: "autodate", onCreate: true }, { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ],
    indexes: ["CREATE INDEX idx_mesaj_sohbet ON mesajlar (sohbet, created)"] });
  const SUYE = "sohbet.uyeler.id ?= @request.auth.id";
  M.listRule = A + " && " + SUYE; M.viewRule = M.listRule;
  M.createRule = A + " && " + SUYE; // gönderen hook'ta oturum sahibine sabitlenir, eylem alanı istemciden yazılamaz
  // gönderen metnini düzeltebilir; diğer üyeler yalnız "okundu" ekler (hook ayrıca denetler)
  M.updateRule = A + " && " + SUYE;
  M.deleteRule = null;
  app.save(M);

  // varsayılan Ekip grubu
  let ekip = null; try { ekip = app.findFirstRecordByFilter("sohbetler", "anahtar = 'ekip'"); } catch (e) { ekip = null; }
  if (!ekip) {
    const U = app.findRecordsByFilter("users", "aktif = true && rol != 'ortak'", "created", 500, 0);
    ekip = new Record(S); ekip.set("tip", "grup"); ekip.set("ad", "Ekip"); ekip.set("anahtar", "ekip"); ekip.set("uyeler", U.map((u) => u.id));
    ekip.set("sonMesaj", "Ekip sohbeti açıldı"); ekip.set("sonMesajTarih", new Date().toISOString().replace("T", " "));
    app.save(ekip);
  }
}, (app) => {});
