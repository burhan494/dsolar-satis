/// <reference path="../pb_data/types.d.ts" />
// GES olay defteri: arıza, bakım, temizlik, şebeke kesintisi; iSolarCloud alarmından deftere alınabilir.
migrate((app) => {
  const A = "@request.auth.aktif = true && ", YON = A + "@request.auth.rol = 'yonetici'";
  let c; try { c = app.findCollectionByNameOrId("ges_olaylar"); } catch (e) { c = null; }
  if (!c) c = new Collection({ type: "base", name: "ges_olaylar", fields: [
    { name: "tarih", type: "date", required: true },
    { name: "tur", type: "select", values: ["Arıza", "Bakım", "Temizlik", "Şebeke kesintisi", "Denetim", "Diğer"], maxSelect: 1, required: true },
    { name: "baslik", type: "text", required: true, max: 200 },
    { name: "cihaz", type: "text", max: 120 },
    { name: "aciklama", type: "text", max: 3000 },
    { name: "durum", type: "select", values: ["Açık", "Kapandı"], maxSelect: 1, required: true },
    { name: "kapanis", type: "date" },
    { name: "kayipKwh", type: "number" },
    { name: "maliyetTl", type: "number" },
    { name: "sorumlu", type: "text", max: 120 },
    { name: "alarmKod", type: "text", max: 80 },
    { name: "created", type: "autodate", onCreate: true },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ] });
  c.listRule = YON; c.viewRule = YON; c.createRule = YON; c.updateRule = YON; c.deleteRule = YON;
  app.save(c);
}, (app) => { try { app.delete(app.findCollectionByNameOrId("ges_olaylar")); } catch (e) {} });
