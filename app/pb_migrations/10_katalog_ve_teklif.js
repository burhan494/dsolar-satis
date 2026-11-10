/// <reference path="../pb_data/types.d.ts" />
// Ürün kataloğu (Beacon'dan aktarılır) ve kalem kalem teklif alanları + teklif ayarları.
// Katalog alış fiyatı içerdiği için yalnız yönetici ve satış rolü görür; yalnız yönetici değiştirir.
migrate((app) => {
  const A = "@request.auth.aktif = true && ";
  const YON = A + "@request.auth.rol = 'yonetici'";
  const SAT = A + "(@request.auth.rol = 'yonetici' || @request.auth.rol = 'satis')";
  let k;
  try { k = app.findCollectionByNameOrId("katalog"); } catch (e) { k = null; }
  if (!k) {
    k = new Collection({ type: "base", name: "katalog", fields: [
      { name: "kat", type: "text", required: true },
      { name: "marka", type: "text" },
      { name: "model", type: "text", required: true },
      { name: "fiyat", type: "number" },
      { name: "pb", type: "select", values: ["TRY", "USD", "EUR"], maxSelect: 1 },
      { name: "birim", type: "text" },
      { name: "guc", type: "number" },
      { name: "garanti", type: "number" },
      { name: "mensei", type: "text" },
      { name: "teknoloji", type: "text" },
      { name: "boyut", type: "text" },
      { name: "agirlik", type: "text" },
      { name: "img", type: "text", max: 600000 },
      { name: "ozellik", type: "json", maxSize: 20000 },
      { name: "aktif", type: "bool" },
      { name: "kaynakId", type: "text" },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true } ],
      indexes: ["CREATE INDEX idx_katalog_kaynakId ON katalog (kaynakId)"] });
  }
  k.listRule = SAT; k.viewRule = SAT; k.createRule = YON; k.updateRule = YON; k.deleteRule = YON;
  app.save(k);

  const t = app.findCollectionByNameOrId("teklifler");
  const users = app.findCollectionByNameOrId("users");
  [{ name: "tip", type: "select", values: ["On-grid", "Hibrit"], maxSelect: 1 },
   { name: "panelAdet", type: "number" },
   { name: "malzemeUsd", type: "number" },
   { name: "marj", type: "number" },
   { name: "kur", type: "number" },
   { name: "uretimYil", type: "number" },
   { name: "kalemler", type: "json", maxSize: 200000 },
   { name: "hazirlayan", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
   { name: "onceki", type: "text" }].forEach((d) => { if (!t.fields.getByName(d.name)) t.fields.add(new Field(d)); });
  app.save(t);

  const ay = app.findCollectionByNameOrId("ayarlar");
  try { app.findFirstRecordByData("ayarlar", "anahtar", "teklif"); } catch (e) {
    const r = new Record(ay);
    r.set("anahtar", "teklif");
    r.set("deger", {
      firma: { ad: "D Solar", unvan: "D Solar Danışmanlık Mühendislik San. ve Tic. A.Ş.", web: "www.dsolar.net", adres: "Şirinkent Mah. 4253 Sok. No:19 Urla/İZMİR", tel: "0544 498 25 99" },
      marj: 25, gecerlilik: 7, teslimGun: 120, birimTL: 4.22, zam: 25, degr: 0.4, eurUsd: 1.16,
      slogan: "2 YIL ÜCRETSİZ İŞLETME, BAKIM ve TAKİP!",
      odeme: [[50, "Sözleşme imzalanmasına müteakip en geç 3 iş günü"], [50, "Montajın tamamlanmasına müteakip en geç 3 iş günü"]],
      dahil: [
        ["Mühendislik ve izinler", ["Yerinde keşif ve çatı ölçümü", "Bağlantı çağrı mektubu başvurusu ve takibi", "Kar, rüzgâr ve statik hesaplar, statik proje onayı", "Yerleşim planı, tek hat şeması ve topraklama projesi", "EDAŞ proje onayı", "Bağlantı ve sistem kullanım anlaşmaları", "İtfaiye uygunluk yazısı"]],
        ["Tedarik ve montaj", ["Tüm ekipmanın tedariki ve sahaya nakliyesi", "Projeye uygun montaj ve şebeke bağlantısı", "Çift yönlü sayaç", "Topraklama ölçümü ve raporu", "Online üretim ve tüketim izleme sistemi", "Yangın tüpü, ikaz levhası ve sarf malzemeleri"]],
        ["Kabul", ["Sistem testleri", "Geçici kabul dosyası, kabul organizasyonu ve tutanaklar"]],
        ["Kamu harçları", ["EDAŞ başvuru, proje onay ve geçici kabul harçları", "Statik onay ve itfaiye harçları", "Abonelik güvence bedelleri ve teminatlar"]],
        ["İşletme ve sigorta", ["Montaj all-risk sigortası", "2 yıl 24 saat uzaktan izleme", "2 yıl yıllık önleyici bakım"]]],
      haric: ["Çatıda gerekebilecek yapısal güçlendirme, izolasyon ve tadilat", "Mevcut iç elektrik tesisatında gerekebilecek revizyonlar", "KDV (%20)"],
      asamalar: [["Yerinde keşif", "1-3 gün"], ["Proje ve tasarım", "5 gün"], ["Tasarım onayı", "5 gün"], ["Fiyat ve sözleşme", "2 gün"], ["Resmi izin ve onaylar", "~90 gün"], ["Montaj ve devreye alma", "~90 gün içinde"]],
      idari: [
        ["Geçerlilik ve akdi ilişki", "Bu teklifteki bütün fiyat ve koşullar, teklif tarihinden itibaren {gecerlilik} iş günü geçerlidir. Bu tarihten sonra yeniden değerlendirmeye tabi olacaktır. Taraflar arasındaki akdi ilişki, mutabık kalınacak şartlara dayanan bağlayıcı bir anlaşmanın konusunu oluşturur."],
        ["Teslim süresi", "Ekipman teslim süresi, mutabık kalınan ödeme teminatının D Solar tarafından alınmasından itibaren; teknik detayların tanımlanmış olduğu, gerekli inşaat izinleri, finans olanakları ve EDAŞ proje onaylarının sağlandığı varsayılarak {teslimGun} iş günüdür. Nihai kurulum, işletmeye alma ve çalıştırma takvimi anlaşma tarihinde taraflarca birlikte belirlenir."],
        ["Telif hakkı", "Teklif ve ekindeki tüm veri, çizim ve açıklamalar D Solar'ın fikri ve maddi mülkiyetidir; D Solar'ın yazılı izni olmadan kopyalanamaz, üçüncü kişilerle paylaşılamaz ve başka firmalardan teklif almak amacıyla kullanılamaz. Müşteri, teklifle aldığı bilgileri gizli tutar ve yalnızca bu teklifi değerlendirmek için kullanır."],
        ["İbra bildirisi", "Bu belge müzakereye yöneliktir; bağlayıcı teklif ya da hükümlerin kabulü sayılmaz ve taraflar arasında yükümlülük doğurmaz. Taraflar görüşmeleri istedikleri zaman sona erdirebilir. Resmi yazılı anlaşmalar usulüne uygun onaylanıp imzalanmadıkça, prensipte varılan mutabakatlar bağlayıcı yükümlülük doğurmaz."],
        ["Muhtelif", "D Solar, teklif edilen modül tipini dengi bileşenlerle değiştirerek teklifi revize etme hakkını saklı tutar. Tesisin kurulması ve işletilmesi için gereken inşaat ve işletme izinlerini almak müşterinin sorumluluğundadır. Diğer şart ve prosedürler sözleşme görüşmelerinde netleştirilir."]]
    });
    app.save(r);
  }
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("katalog")); } catch (e) {}
  try { app.delete(app.findFirstRecordByData("ayarlar", "anahtar", "teklif")); } catch (e) {}
});
