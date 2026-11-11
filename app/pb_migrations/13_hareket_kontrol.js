/// <reference path="../pb_data/types.d.ts" />
// Ödeme planı gözden geçirme: her hareket için "kontrol edildi" işareti.
migrate((app) => {
  const c = app.findCollectionByNameOrId("fin_hareketler");
  [{ name: "kontrol", type: "bool" }, { name: "kontrolEden", type: "text" }, { name: "kontrolTarihi", type: "date" }].forEach((d) => { if (!c.fields.getByName(d.name)) c.fields.add(new Field(d)); });
  app.save(c);
}, (app) => {});
