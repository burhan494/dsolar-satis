/// <reference path="../pb_data/types.d.ts" />
// Beacon müşteri listesini taşımak için aday alanları: kaynak kimliği (tekrar aktarımı önler), öncelik, segment, adres, eski teklif özeti.
migrate((app) => {
  const c = app.findCollectionByNameOrId("adaylar");
  const ekle = (f) => { if (!c.fields.getByName(f.name)) c.fields.add(f); };
  ekle(new TextField({ name: "kaynakId", max: 120 }));
  ekle(new TextField({ name: "oncelik", max: 20 }));
  ekle(new TextField({ name: "segment", max: 60 }));
  ekle(new TextField({ name: "adres", max: 500 }));
  ekle(new TextField({ name: "sehir", max: 60 }));
  ekle(new JSONField({ name: "eskiTeklifler", maxSize: 20000 }));
  if (!(c.indexes || []).some((i) => /idx_aday_kaynakId/.test(i))) c.indexes = (c.indexes || []).concat(["CREATE UNIQUE INDEX idx_aday_kaynakId ON adaylar (kaynakId) WHERE kaynakId != ''"]);
  app.save(c);
}, (app) => {});
