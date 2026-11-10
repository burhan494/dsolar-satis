# D Solar Satış

D Solar'ın evsel GES satış uygulaması: aday ve teklif takibi, keşif, iş ortakları, ekip yönetimi.
PocketBase (tek dosya sunucu) ofis sunucusunda çalışır; ekranlar `app/pb_public` içindedir.

- `app/pb_public/` — uygulama ekranları (tek sayfa)
- `app/pb_migrations/` — veritabanı şeması ve yetki kuralları
- `sunucu/` — Windows kurulum, elle güncelleme ve otomatik güncelleyici betikleri
- `surumler/` — imzalı güncelleme paketleri ve `manifest.json`
- `araclar/paketle.py` — paket üretme ve imzalama
- `test/` — rol/yetki ve uçtan uca testler (yerel test sunucusu ve örnek verilerle)

Güvenlik: sunucu yalnız `sunucu/imza-acik.xml` ile doğrulanan paketleri uygular. Gizli imza anahtarı
bu depoda yoktur. Depoda müşteri verisi, şifre ya da erişim anahtarı bulunmaz.
