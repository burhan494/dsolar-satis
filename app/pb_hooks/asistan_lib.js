// Yönetici asistanı (Claude) bağlantısı — sunucu tarafı.
// Kurallar: yalnız okuma (tek istisna: kullanıcının kendi yönetici günlüğü); telefon, adres, e-posta asla dönmez;
// müşteri adları kısaltılır; Param verisi okunmaz (yalnız sahibinin kendi gönderdiği özet); her erişim denetim kaydına yazılır.
const SURUM_PROTOKOL = ["2025-06-18", "2025-03-26", "2024-11-05"];
const ERISIM_SN = 3600, YENILEME_GUN = 60, KOD_SN = 600;

/* ---------- genel ---------- */
function bugunTR() { return new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10); }
function gunEkle(t, n) { const d = new Date(t + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function gunFark(a, b) { return Math.round((Date.parse(b.slice(0, 10) + "T12:00:00Z") - Date.parse(a.slice(0, 10) + "T12:00:00Z")) / 864e5); }
function dbTarih(ms) { return new Date(ms).toISOString().replace("T", " "); }
function yuvarla(x, n) { const k = Math.pow(10, n || 0); return Math.round((+x || 0) * k) / k; }
function jsonAl(r, alan, varsayilan) { try { const v = JSON.parse(r.getString(alan) || "null"); return v == null ? varsayilan : v; } catch (e) { return varsayilan; } }
function bul(app, kol, filtre, sira, n, p) { try { return app.findRecordsByFilter(kol, filtre || "id != ''", sira || "", n || 100000, 0, p || {}); } catch (e) { return []; } }
function kisaAd(ad) { const p = String(ad || "").trim().split(/\s+/).filter(Boolean); if (!p.length) return "?"; return p.length === 1 ? p[0] : p[0] + " " + p[p.length - 1].charAt(0).toLocaleUpperCase("tr") + "."; }
function ilkAd(app, uid) { if (!uid) return ""; try { return String(app.findRecordById("users", uid).getString("name") || "").split(/\s+/)[0]; } catch (e) { return ""; } }
// hata metinlerinde erişim anahtarı ya da adres parametresi sızmasın
function temizHata(m) { return String(m || "").replace(/(access_token|token|secret|appkey|password|sifre)=([^&\s"']+)/gi, "$1=***").replace(/https?:\/\/[^\s"']+/g, (u) => u.split("?")[0]).slice(0, 200); }
function rastgele(n) { return $security.randomString(n || 48); }
function ozetle(s) { return $security.sha256(String(s)); }
function b64url(hex) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_", b = [];
  for (let i = 0; i < hex.length; i += 2) b.push(parseInt(hex.substr(i, 2), 16));
  let o = "";
  for (let i = 0; i < b.length; i += 3) {
    const n = (b[i] << 16) | ((b[i + 1] || 0) << 8) | (b[i + 2] || 0);
    o += A[(n >> 18) & 63] + A[(n >> 12) & 63] + (i + 1 < b.length ? A[(n >> 6) & 63] : "") + (i + 2 < b.length ? A[n & 63] : "");
  }
  return o;
}
function pkceDogru(dogrulayici, beklenen) { return !!dogrulayici && b64url($security.sha256(dogrulayici)) === beklenen; }
function kapali() { return String($os.getenv("DSOLAR_ASISTAN") || "").toLowerCase() === "kapali"; }
function disAdres(e) {
  const env = String($os.getenv("DSOLAR_DIS_ADRES") || "").replace(/\/+$/, "");
  if (env) return env;
  const h = e.request.host; return (e.request.tls ? "https://" : (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(h) ? "http://" : "https://")) + h;
}
function ip(e) { try { return e.realIP(); } catch (x) { return ""; } }
function logla(app, uid, islem, sonuc, ipAdr, ayrinti) {
  try { const r = new Record(app.findCollectionByNameOrId("asistan_log")); if (uid) r.set("kullanici", uid); r.set("islem", String(islem).slice(0, 200)); r.set("sonuc", String(sonuc || "").slice(0, 200)); r.set("ip", ipAdr || ""); r.set("ayrinti", String(ayrinti || "").slice(0, 2000)); app.save(r); } catch (e) {}
}
// kimler bağlanabilir: aktif yönetici; DSOLAR_ASISTAN_EPOSTA tanımlıysa yalnız oradaki adresler
function izinli(u) {
  if (!u || !u.getBool("aktif") || u.getString("rol") !== "yonetici") return false;
  let L = String($os.getenv("DSOLAR_ASISTAN_EPOSTA") || "").toLowerCase().split(/[,;\s]+/).filter(Boolean);
  if (!L.length) { try { const d = JSON.parse($app.findFirstRecordByFilter("fin_ayarlar", "anahtar = 'asistan_izin'").getString("deger") || "{}") || {}; L = (d.eposta || []).map((x) => String(x).toLowerCase()); } catch (e) {} }
  return !L.length || L.indexOf(String(u.getString("email")).toLowerCase()) >= 0;
}

/* ---------- OAuth deposu ---------- */
function oauthYaz(app, tur, anahtar, o) {
  const r = new Record(app.findCollectionByNameOrId("asistan_oauth"));
  r.set("tur", tur); r.set("anahtar", anahtar); r.set("istemci", o.istemci || ""); if (o.kullanici) r.set("kullanici", o.kullanici);
  if (o.bitisMs) r.set("bitis", dbTarih(o.bitisMs)); r.set("veri", o.veri || {}); app.save(r); return r;
}
function oauthBul(app, tur, anahtar) {
  try { const r = app.findFirstRecordByFilter("asistan_oauth", "tur = {:t} && anahtar = {:a}", { t: tur, a: anahtar });
    const b = r.getString("bitis"); if (b && Date.parse(b.replace(" ", "T")) < Date.now()) { try { app.delete(r); } catch (x) {} return null; }
    return r; } catch (e) { return null; }
}
function istemciKaydet(app, b) {
  const uri = Array.isArray(b.redirect_uris) ? b.redirect_uris.map(String) : [];
  if (!uri.length) throw new Error("redirect_uris gerekli");
  uri.forEach((u) => { if (!donusIzinli(u)) throw new Error("Bu dönüş adresine izin verilmiyor: " + u); });
  const id = "dsolar-" + rastgele(24), ad = String(b.client_name || "Claude").slice(0, 100);
  oauthYaz(app, "istemci", id, { istemci: id, veri: { ad: ad, uri: uri } });
  return { client_id: id, client_name: ad, redirect_uris: uri, grant_types: ["authorization_code", "refresh_token"], response_types: ["code"], token_endpoint_auth_method: "none", client_id_issued_at: Math.floor(Date.now() / 1000) };
}
// yalnız Claude'un dönüş adresleri (ve yerel test) kabul edilir: başka bir uygulama bu bağlantıyı kullanamaz
function donusIzinli(u) {
  return /^https:\/\/(claude\.ai|claude\.com|www\.claude\.ai)\/[^\s]*$/.test(u) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/[^\s]*$/.test(u);
}
function istemciAl(app, id) { const r = oauthBul(app, "istemci", String(id || "")); if (!r) return null; return { id: r.getString("anahtar"), ad: (jsonAl(r, "veri", {}) || {}).ad || "Claude", uri: (jsonAl(r, "veri", {}) || {}).uri || [] }; }
function kodVer(app, istemci, uid, uri, challenge, kapsam) {
  const kod = rastgele(48);
  oauthYaz(app, "kod", ozetle(kod), { istemci: istemci, kullanici: uid, bitisMs: Date.now() + KOD_SN * 1000, veri: { uri: uri, ch: challenge, kapsam: kapsam || "dsolar.oku" } });
  return kod;
}
function anahtarVer(app, istemci, uid, kapsam) {
  const er = rastgele(48), ye = rastgele(56);
  oauthYaz(app, "erisim", ozetle(er), { istemci: istemci, kullanici: uid, bitisMs: Date.now() + ERISIM_SN * 1000, veri: { kapsam: kapsam } });
  oauthYaz(app, "yenileme", ozetle(ye), { istemci: istemci, kullanici: uid, bitisMs: Date.now() + YENILEME_GUN * 864e5, veri: { kapsam: kapsam } });
  return { access_token: er, token_type: "Bearer", expires_in: ERISIM_SN, refresh_token: ye, scope: kapsam };
}
function tokenAl(app, b) {
  const tur = String(b.grant_type || "");
  if (tur === "authorization_code") {
    const r = oauthBul(app, "kod", ozetle(String(b.code || "")));
    if (!r) return { hata: "invalid_grant", aciklama: "Kod geçersiz ya da süresi dolmuş" };
    const v = jsonAl(r, "veri", {}), ist = r.getString("istemci"), uid = r.getString("kullanici");
    try { app.delete(r); } catch (x) {}  // tek kullanımlık
    if (b.client_id && String(b.client_id) !== ist) return { hata: "invalid_grant", aciklama: "İstemci uyuşmuyor" };
    if (b.redirect_uri && String(b.redirect_uri) !== v.uri) return { hata: "invalid_grant", aciklama: "Dönüş adresi uyuşmuyor" };
    if (!pkceDogru(String(b.code_verifier || ""), v.ch)) return { hata: "invalid_grant", aciklama: "PKCE doğrulanamadı" };
    let u; try { u = app.findRecordById("users", uid); } catch (x) { u = null; }
    if (!izinli(u)) return { hata: "access_denied", aciklama: "Kullanıcının asistan yetkisi yok" };
    return { tamam: anahtarVer(app, ist, uid, v.kapsam || "dsolar.oku"), uid: uid };
  }
  if (tur === "refresh_token") {
    const r = oauthBul(app, "yenileme", ozetle(String(b.refresh_token || "")));
    if (!r) return { hata: "invalid_grant", aciklama: "Yenileme anahtarı geçersiz" };
    const ist = r.getString("istemci"), uid = r.getString("kullanici"), v = jsonAl(r, "veri", {});
    if (b.client_id && String(b.client_id) !== ist) return { hata: "invalid_grant", aciklama: "İstemci uyuşmuyor" };
    try { app.delete(r); } catch (x) {}  // her yenilemede yeni anahtar
    let u; try { u = app.findRecordById("users", uid); } catch (x) { u = null; }
    if (!izinli(u)) return { hata: "access_denied", aciklama: "Kullanıcının asistan yetkisi yok" };
    return { tamam: anahtarVer(app, ist, uid, v.kapsam || "dsolar.oku"), uid: uid };
  }
  return { hata: "unsupported_grant_type", aciklama: "Desteklenmeyen grant_type" };
}
// erişim anahtarını doğrula → kullanıcı kaydı (yetkisi geri alınmışsa null)
function erisimKullanici(app, bearer) {
  if (!bearer) return null; const r = oauthBul(app, "erisim", ozetle(bearer)); if (!r) return null;
  let u; try { u = app.findRecordById("users", r.getString("kullanici")); } catch (e) { return null; }
  return izinli(u) ? u : null;
}
function iptalEt(app, uid) { let n = 0; bul(app, "asistan_oauth", "kullanici = {:u}", "", 5000, { u: uid }).forEach((r) => { try { app.delete(r); n++; } catch (e) {} }); return n; }
function temizle(app) { bul(app, "asistan_oauth", "bitis != '' && bitis < {:s}", "", 5000, { s: dbTarih(Date.now()) }).forEach((r) => { try { app.delete(r); } catch (e) {} }); }
function basarisizSay(app, ipAdr) { try { return app.findRecordsByFilter("asistan_log", "islem = 'giris' && sonuc = 'hata' && ip = {:i} && created > {:t}", "", 100, 0, { i: ipAdr, t: dbTarih(Date.now() - 15 * 60e3) }).length; } catch (e) { return 0; } }

/* ---------- şirket özeti (uygulamadaki hesaplarla aynı) ---------- */
function kurKarti(app) {
  let k = null, h = {};
  try { k = jsonAl(app.findFirstRecordByFilter("fin_ayarlar", "anahtar = 'kasa_kur'"), "deger", null); } catch (e) {}
  try { h = jsonAl(app.findFirstRecordByFilter("ayarlar", "anahtar = 'hesap'"), "deger", {}) || {}; } catch (e) {}
  return k && k.usd ? { usd: +k.usd, eur: +k.eur || +k.usd * 1.12, tarih: k.tarih || "", kaynak: k.elle ? "elle girildi" : k.kaynak || "kasa tablosu" }
    : { usd: +h.kur || 50, eur: (+h.kur || 50) * 1.16, tarih: h.kurTarih || "", kaynak: h.kurKaynak || "ön hesap ayarı" };
}
function usdKarsilik(t, pb, K) { return pb === "USD" ? t : pb === "EUR" ? t * K.eur / K.usd : t / K.usd; }
function kasa(app, K) {
  const H = bul(app, "fin_hesaplar", "", "sirket,ad").map((r) => ({ id: r.id, acilis: r.getFloat("acilis"), acilisTarihi: r.getString("acilisTarihi"), updated: r.getString("updated"), aktif: r.getBool("aktif"), tur: r.getString("tur"), pb: r.getString("pb"), sirket: r.getString("sirket") }));
  const M = bul(app, "fin_hareketler", "durum = 'Gerçekleşti' && hesap != ''", "tarih");
  const B = {}; H.forEach((h) => { B[h.id] = +h.acilis || 0; });
  M.forEach((r) => { const hid = r.getString("hesap"); if (!(hid in B)) return; const h = H.filter((x) => x.id === hid)[0];
    const mt = r.getString("tarih").slice(0, 10);
    if (h.acilisTarihi) { const at = h.acilisTarihi.slice(0, 10); if (mt < at) return; if (mt === at && !((r.getString("updated") || r.getString("created") || "") > (h.updated || ""))) return; }
    B[hid] += (r.getString("yon") === "Giriş" ? 1 : -1) * (r.getFloat("hesapTutar") > 0 ? r.getFloat("hesapTutar") : (r.getFloat("tutar") || 0)); });
  const T = { kul: 0, vadeli: 0, kmh: 0 }, S = {};
  H.forEach((h) => { if (!h.aktif) return; const b = B[h.id] || 0, u = usdKarsilik(b, h.pb, K), s = h.sirket || "Diğer";
    S[s] = S[s] || { kul: 0, vadeli: 0 };
    if (h.tur === "Vadeli") { S[s].vadeli += u; T.vadeli += u; } else { S[s].kul += u; T.kul += u; }
    if (h.tur === "KMH" && b < 0) T.kmh += u; });
  const tarihler = H.filter((h) => h.aktif && h.acilisTarihi).map((h) => h.acilisTarihi.slice(0, 10)).sort();
  return { kullanilabilirUsd: yuvarla(T.kul), vadeliUsd: yuvarla(T.vadeli), kmhUsd: yuvarla(T.kmh), sirketler: Object.keys(S).map((s) => ({ sirket: s, kullanilabilirUsd: yuvarla(S[s].kul), vadeliUsd: yuvarla(S[s].vadeli) })), sonEkstre: tarihler.length ? tarihler[tarihler.length - 1] : "" };
}
function finans(app) {
  const b = bugunTR(), K = kurKarti(app), k = kasa(app, K);
  const bek = bul(app, "fin_hareketler", "durum != 'Gerçekleşti' && onay != 'Reddedildi'", "tarih");
  const top = (L) => yuvarla(L.reduce((s, r) => s + usdKarsilik(r.getFloat("tutar") || 0, r.getString("pb") || "TRY", K), 0));
  const once = bek.filter((r) => r.getString("tarih").slice(0, 10) < b), gc = once.filter((r) => r.getString("yon") === "Çıkış"), gg = once.filter((r) => r.getString("yon") === "Giriş");
  const ara = (n, yon) => bek.filter((r) => { const t = r.getString("tarih").slice(0, 10); return t >= b && t <= gunEkle(b, n) && r.getString("yon") === yon; });
  const onayda = bul(app, "odeme_listeleri", "durum = 'Onayda'", "-created");
  const kurYasi = K.tarih ? gunFark(K.tarih, b) : null;
  return { kur: { usdTry: K.usd, eurTry: yuvarla(K.eur, 2), tarih: K.tarih, kaynak: K.kaynak, gunOnce: kurYasi }, kasa: k,
    gecmisTarihliOdeme: { adet: gc.length, usd: top(gc) }, gecmisTarihliTahsilat: { adet: gg.length, usd: top(gg) },
    onumuzdeki7Gun: { girisUsd: top(ara(7, "Giriş")), cikisUsd: top(ara(7, "Çıkış")) }, onumuzdeki30Gun: { girisUsd: top(ara(30, "Giriş")), cikisUsd: top(ara(30, "Çıkış")) },
    onaydakiOdemeListeleri: onayda.map((r) => ({ ad: r.getString("ad"), tur: r.getString("tur"), hazirlandi: r.getString("created").slice(0, 10) })) };
}
function tkGecSon(created) { const d = new Date(created.slice(0, 10) + "T12:00:00Z"); let n = 0; while (n < 7) { d.setUTCDate(d.getUTCDate() + 1); if (d.getUTCDay() % 6) n++; } return d.toISOString().slice(0, 10); }
function satis(app) {
  const b = bugunTR(), ay = b.slice(0, 7);
  const A = bul(app, "adaylar", "", "sonraki"), acik = A.filter((r) => r.getString("asama") !== "Sözleşme" && r.getString("asama") !== "Kaybedildi");
  const s = (r) => r.getString("sonraki").slice(0, 10);
  const huni = {}; ["Aday", "Nitelikli", "Keşif", "Teklif", "Sözleşme", "Kaybedildi"].forEach((x) => { huni[x] = A.filter((r) => r.getString("asama") === x).length; });
  const T = bul(app, "teklifler", "", "-created");
  const anl = T.filter((t) => t.getString("durum") === "Anlaşıldı" && (t.getString("updated") || t.getString("created")).slice(0, 7) === ay);
  const gon = T.filter((t) => t.getString("durum") === "Gönderildi");
  return { aktifMusteri: acik.length, huni: huni,
    isler: { gecikmis: acik.filter((r) => s(r) && s(r) < b).length, bugun: acik.filter((r) => s(r) === b).length, buHafta: acik.filter((r) => s(r) > b && s(r) <= gunEkle(b, 7)).length, planYok: acik.filter((r) => !s(r)).length },
    buAy: { anlasma: anl.length, anlasmaUsd: yuvarla(anl.reduce((x, t) => x + (t.getFloat("fiyatUSD") || 0), 0)) },
    teklif: { musteride: gon.length, suresiDolan: gon.filter((t) => tkGecSon(t.getString("created")) < b).length, onayBekleyen: T.filter((t) => t.getString("durum") === "Onay bekliyor" || t.getString("durum") === "Taslak").length } };
}
function ges(app) {
  const b = bugunTR(), dun = gunEkle(b, -1);
  let g = null; try { g = app.findFirstRecordByFilter("ges_aylik", "donem = {:d}", { d: dun.slice(0, 7) }); } catch (e) {}
  const gun = g ? jsonAl(g, "iscGun", {}) || {} : {}, teo = g ? jsonAl(g, "iscT", {}) || {} : {}, d = String(+dun.slice(8, 10));
  const ham = gun[d] != null ? gun[d] : gun[dun.slice(8, 10)];
  const ayTop = Object.keys(gun).reduce((s, k) => s + (+gun[k] || 0), 0);
  const OL = bul(app, "ges_olaylar", "durum != 'Kapandı'", "-tarih");
  const ie = OL.filter((o) => o.getString("ieNo") && o.getString("ieDurum") !== "Doğrulandı");
  let isc = {}; try { const r = app.findFirstRecordByFilter("isc_ayar", "id != ''"); isc = { sonSenk: r.getString("sonSenk"), hata: temizHata(r.getString("hata")), canli: jsonAl(r, "canli", {}) }; } catch (e) {}
  const canli = isc.canli || {};
  // GDZ ARiL raporu (elle yüklenen Excel): reaktif oranlar çekilen aktif enerjiye göre, sınır endüktif %20 / kapasitif %15
  const AG = g ? jsonAl(g, "arilGun", {}) || {} : {}, AK = Object.keys(AG).sort(), AT = { av: 0, ac: 0, ric: 0, rcc: 0 }, eksik = [];
  AK.forEach((k) => { const o = AG[k] || {}; Object.keys(AT).forEach((x) => { AT[x] += +o[x] || 0; }); if (k < b && ((o.vo != null && o.vo < 100) || o.tn === 0)) eksik.push(k); });
  const aril = AK.length ? { sonGun: AK[AK.length - 1], gunSayisi: AK.length, verisKwh: yuvarla(AT.av), cekisKwh: yuvarla(AT.ac), induktifYuzde: AT.ac > 0 ? yuvarla(AT.ric / AT.ac * 100) : null, kapasitifYuzde: AT.ac > 0 ? yuvarla(AT.rcc / AT.ac * 100) : null, eksikVeriGunleri: eksik, not: "GDZ ARiL Excel'inden; ay bitmeden kesin değil" } : null;
  return { aril, dun: { tarih: dun, veriVar: ham != null, uretimKwh: ham != null ? yuvarla(ham) : null, teorikOranYuzde: ham != null && +(teo[d] || 0) ? yuvarla(ham / +teo[d] * 100) : null },
    buAy: { donem: dun.slice(0, 7), iscGunlukToplamKwh: yuvarla(ayTop), gunSayisi: Object.keys(gun).length, not: "iSolarCloud günlük toplamı; uygulamadaki aylık rakam sayaç verisi varsa onu kullanır" },
    olaylar: { acik: OL.length, acil: OL.filter((o) => o.getString("oncelik") === "Acil").length, isEmriAcik: ie.length, isEmriGecikmis: ie.filter((o) => o.getString("sonTarih") && o.getString("sonTarih").slice(0, 10) < b).length },
    izleme: { sonSenk: isc.sonSenk || "", hata: isc.hata || "", anlikGucKw: canli.gucKw != null ? yuvarla(canli.gucKw, 1) : null, bugunKwh: canli.bugunKwh != null ? yuvarla(canli.bugunKwh) : null, alarm: canli.alarm || 0 } };
}
function reklam(app, u) { try { const o = require(`${__hooks}/meta_lib.js`).ozet(app, u, "7"); return { son7Gun: o }; } catch (e) { return { hata: temizHata((e && e.message) || e) }; } }
function sistem(app) {
  let s = {}; try { s = JSON.parse(toString($os.readFile(`${__hooks}/../pb_public/surum.json`))); } catch (e) {}
  let meta = {}; try { const r = app.findFirstRecordByFilter("meta_ayar", "anahtar = 'ana'"); meta = { sonSenk: r.getString("sonSenk"), hata: temizHata(r.getString("hata")) }; } catch (e) {}
  return { surum: s.surum || null, guncelleme: s.durum || "", guncellemeTarihi: s.tarih || "", meta: meta };
}
// önem sırasıyla uyarılar: kritik > onemli > bilgi. "anahtar" aynı uyarının tekrar gönderilmemesi içindir.
function uyarilar(o) {
  const U = [], b = bugunTR(), ekle = (seviye, anahtar, metin) => U.push({ seviye: seviye, anahtar: anahtar, metin: metin });
  const f = o.finans, g = o.ges, s = o.satis;
  if (f) {
    if (f.kasa.kullanilabilirUsd < 0) ekle("kritik", "kasa-eksi-" + b, "Kullanılabilir nakit eksi: " + f.kasa.kullanilabilirUsd + " $");
    if (f.gecmisTarihliOdeme.adet) ekle("onemli", "gecmis-odeme-" + b, f.gecmisTarihliOdeme.adet + " ödeme tarihi geçmiş ve yapıldı işaretlenmemiş (" + f.gecmisTarihliOdeme.usd + " $)");
    if (f.onaydakiOdemeListeleri.length) ekle("onemli", "odeme-onay-" + b, f.onaydakiOdemeListeleri.length + " ödeme listesi onayınızı bekliyor");
    if (f.kur.gunOnce != null && f.kur.gunOnce > 3) ekle("bilgi", "kur-eski-" + f.kur.tarih, "Kasa kuru " + f.kur.gunOnce + " gün eski");
    if (f.onumuzdeki7Gun.cikisUsd > f.kasa.kullanilabilirUsd + f.onumuzdeki7Gun.girisUsd) ekle("kritik", "7gun-nakit-" + b, "Önümüzdeki 7 günün ödemeleri kasayı ve beklenen girişleri aşıyor");
  }
  if (g) {
    if (g.izleme.sonSenk && Date.parse(g.izleme.sonSenk.replace(" ", "T")) < Date.now() - 3 * 3600e3) ekle("onemli", "isc-senk-" + b, "GES verisi 3 saatten uzun süredir gelmiyor (son: " + g.izleme.sonSenk.slice(0, 16) + ")");
    if (g.dun.veriVar && g.dun.teorikOranYuzde != null && g.dun.teorikOranYuzde < 60) ekle("onemli", "ges-dusuk-" + g.dun.tarih, "Dünkü GES üretimi teorik değerin %" + g.dun.teorikOranYuzde + "'i");
    if (!g.dun.veriVar) ekle("bilgi", "ges-veri-yok-" + g.dun.tarih, "Dünkü GES üretim verisi yok");
    if (g.aril && g.aril.kapasitifYuzde > 15) ekle("onemli", "reaktif-kap-" + g.aril.sonGun.slice(0, 7), "Sayaçta kapasitif reaktif %" + g.aril.kapasitifYuzde + " (sınır %15): ay sonunda reaktif bedel riski");
    if (g.aril && g.aril.induktifYuzde > 20) ekle("onemli", "reaktif-ind-" + g.aril.sonGun.slice(0, 7), "Sayaçta endüktif reaktif %" + g.aril.induktifYuzde + " (sınır %20): ay sonunda reaktif bedel riski");
    if (g.aril && g.aril.eksikVeriGunleri.length) ekle("bilgi", "aril-eksik-" + g.aril.eksikVeriGunleri.slice(-1)[0], "GDZ sayacından eksik veri: " + g.aril.eksikVeriGunleri.join(", "));
    if (g.olaylar.acil) ekle("kritik", "ges-acil-" + b, g.olaylar.acil + " acil GES olayı açık");
    if (g.olaylar.isEmriGecikmis) ekle("onemli", "ie-gecik-" + b, g.olaylar.isEmriGecikmis + " GES iş emri son tarihi geçti");
  }
  if (s) {
    if (s.isler.gecikmis) ekle("onemli", "gecikmis-is-" + b, s.isler.gecikmis + " müşteride sıradaki iş gecikmiş");
    if (s.teklif.suresiDolan) ekle("bilgi", "teklif-suresi-" + b, s.teklif.suresiDolan + " teklifin süresi doldu, hatırlatma bekliyor");
    if (s.teklif.onayBekleyen) ekle("onemli", "teklif-onay-" + b, s.teklif.onayBekleyen + " teklif onayınızı bekliyor");
  }
  if (o.sistem && o.sistem.meta && o.sistem.meta.hata) ekle("onemli", "meta-hata-" + b, "Meta reklam bağlantısında hata: " + o.sistem.meta.hata.slice(0, 120));
  const sira = { kritik: 0, onemli: 1, bilgi: 2 }; U.sort((a, b2) => sira[a.seviye] - sira[b2.seviye]);
  return U;
}
function ozet(app, u, bolum) {
  const o = { tarih: bugunTR(), saat: new Date(Date.now() + 3 * 3600e3).toISOString().slice(11, 16), kaynak: "D Solar canlı veri (satis.dsolar.net)" };
  const B = bolum && bolum !== "hepsi" ? [bolum] : ["satis", "finans", "ges", "reklam", "sistem"];
  if (B.indexOf("satis") >= 0) o.satis = satis(app);
  if (B.indexOf("finans") >= 0) o.finans = finans(app);
  if (B.indexOf("ges") >= 0) o.ges = ges(app);
  if (B.indexOf("reklam") >= 0) o.reklam = reklam(app, u);
  if (B.indexOf("sistem") >= 0) o.sistem = sistem(app);
  o.uyarilar = uyarilar(o);
  return o;
}
function musteriTakip(app, kapsam, n) {
  const b = bugunTR(), son = kapsam === "hafta" ? gunEkle(b, 7) : b;
  const A = bul(app, "adaylar", "asama != 'Sözleşme' && asama != 'Kaybedildi' && sonraki != '' && sonraki <= {:s}", "sonraki", 500, { s: son + " 23:59:59" })
    .filter((r) => kapsam !== "gecikmis" || r.getString("sonraki").slice(0, 10) < b);
  return { kapsam: kapsam, toplam: A.length, not: "Telefon ve adres verilmez; ad kısaltılır. Ayrıntı için uygulamada müşteri kartını açın (ref).",
    liste: A.slice(0, n || 30).map((r) => { const t = r.getString("sonraki").slice(0, 10);
      return { ref: r.id, musteri: kisaAd(r.getString("ad")), asama: r.getString("asama"), is: r.getString("sonrakiIs") || "", tarih: t, gecikmeGun: t < b ? gunFark(t, b) : 0, ilce: r.getString("ilce"), sorumlu: ilkAd(app, r.getString("sorumlu")) }; }) };
}

/* ---------- yönetici günlüğü ve kişisel özet (yalnız sahibine) ---------- */
const GUNLUK_TUR = ["karar", "is", "hedef", "onay", "gorev", "yatirim", "uyari", "not"], GUNLUK_DURUM = ["acik", "devam", "bekliyor", "tamam", "iptal"];
function gunlukJson(r) { return { id: r.id, alan: r.getString("alan"), tur: r.getString("tur"), baslik: r.getString("baslik"), durum: r.getString("durum"), sorumlu: r.getString("sorumlu"), tarih: r.getString("tarih").slice(0, 10), sonraki: r.getString("sonraki"), not: r.getString("not"), anahtar: r.getString("anahtar"), guncellendi: r.getString("updated").slice(0, 16) }; }
function gunlukListe(app, uid, a) {
  a = a || {}; const f = ["sahip = {:u}"], p = { u: uid };
  if (a.alan) { f.push("alan = {:a}"); p.a = a.alan; }
  if (a.durum === "acik") f.push("durum != 'tamam' && durum != 'iptal'"); else if (a.durum) { f.push("durum = {:d}"); p.d = a.durum; }
  if (a.tur) { f.push("tur = {:t}"); p.t = a.tur; }
  return bul(app, "asistan_gunluk", f.join(" && "), "-updated", Math.min(+a.limit || 50, 200), p).map(gunlukJson);
}
function gunlukYaz(app, uid, a) {
  let r;
  if (a.id) { try { r = app.findRecordById("asistan_gunluk", String(a.id)); } catch (e) { throw new Error("Kayıt bulunamadı"); } if (r.getString("sahip") !== uid) throw new Error("Kayıt bulunamadı"); }
  else if (a.anahtar) { try { r = app.findFirstRecordByFilter("asistan_gunluk", "sahip = {:u} && anahtar = {:k}", { u: uid, k: String(a.anahtar) }); } catch (e) { r = null; } }
  if (!r) { r = new Record(app.findCollectionByNameOrId("asistan_gunluk")); r.set("sahip", uid); r.set("kaynak", "asistan");
    if (!a.alan || !a.tur || !a.baslik) throw new Error("Yeni kayıt için alan, tur ve baslik gerekli"); }
  if (a.alan != null) { if (["sirket", "kisisel"].indexOf(a.alan) < 0) throw new Error("alan: sirket ya da kisisel"); r.set("alan", a.alan); }
  if (a.tur != null) { if (GUNLUK_TUR.indexOf(a.tur) < 0) throw new Error("tur: " + GUNLUK_TUR.join(", ")); r.set("tur", a.tur); }
  if (a.durum != null) { if (GUNLUK_DURUM.indexOf(a.durum) < 0) throw new Error("durum: " + GUNLUK_DURUM.join(", ")); r.set("durum", a.durum); }
  else if (!r.getString("durum")) r.set("durum", "acik");
  ["baslik", "sorumlu", "sonraki", "not", "anahtar"].forEach((k) => { if (a[k] != null) r.set(k, String(a[k])); });
  if (a.tarih != null) r.set("tarih", a.tarih ? String(a.tarih).slice(0, 10) + " 09:00:00.000Z" : "");
  app.save(r); return gunlukJson(r);
}
function kisiselOzet(app, uid) {
  let r; try { r = app.findFirstRecordByFilter("asistan_kisisel", "sahip = {:u}", { u: uid }); } catch (e) { r = null; }
  if (!r) return { var: false, not: "Henüz kişisel özet gönderilmedi. Param'da 'Asistana özet gönder' ile kullanıcı kendisi gönderir; Param şifreli olduğu için sunucu okuyamaz." };
  return { var: true, gonderildi: r.getString("updated").slice(0, 16), kapsam: jsonAl(r, "kapsam", []), ozet: jsonAl(r, "ozet", {}) };
}

// kritik olay taraması (sunucuda 15 dakikada bir): yalnız 'kritik' uyarılar; her uyarı anahtarıyla bir kez kaydedilir.
// DSOLAR_KRITIK_FIRE_URL + DSOLAR_KRITIK_FIRE_TOKEN tanımlıysa Claude zamanlanmış görevi tetiklenir (telefona bildirim o görevden gider).
function kritikTara(app) {
  if (kapali()) return { atlandi: true };
  const yon = bul(app, "users", "aktif = true && rol = 'yonetici'", "created", 50).filter(izinli); if (!yon.length) return { kullanici: 0 };
  const U = uyarilar(ozet(app, yon[0], "hepsi")).filter((u) => u.seviye === "kritik"), yeni = [];
  yon.forEach((u) => U.forEach((x) => { let var_ = null; try { var_ = app.findFirstRecordByFilter("asistan_gunluk", "sahip = {:u} && anahtar = {:k}", { u: u.id, k: x.anahtar }); } catch (e) {}
    if (var_) return; const r = new Record(app.findCollectionByNameOrId("asistan_gunluk"));
    r.set("sahip", u.id); r.set("alan", "sirket"); r.set("tur", "uyari"); r.set("baslik", x.metin); r.set("durum", "acik"); r.set("anahtar", x.anahtar); r.set("kaynak", "sunucu"); r.set("tarih", bugunTR() + " 09:00:00.000Z");
    app.save(r); yeni.push(x); }));
  const url = String($os.getenv("DSOLAR_KRITIK_FIRE_URL") || ""), tok = String($os.getenv("DSOLAR_KRITIK_FIRE_TOKEN") || "");
  if (yeni.length && url && tok) { try { const r = $http.send({ url: url, method: "POST", timeout: 20, headers: { "Authorization": "Bearer " + tok, "anthropic-beta": "experimental-cc-routine-2026-04-01", "anthropic-version": "2023-06-01", "Content-Type": "application/json" }, body: JSON.stringify({ text: "D Solar kritik uyarı: " + yeni.map((x) => x.metin).join(" | ") }) });
      logla(app, "", "kritik-bildirim", r.statusCode < 300 ? "tamam" : "hata", "", String(r.statusCode)); } catch (e) { logla(app, "", "kritik-bildirim", "hata", "", temizHata(e.message || e)); } }
  return { yeni: yeni.length };
}
module.exports = { kritikTara, SURUM_PROTOKOL, bugunTR, disAdres, ip, logla, izinli, kapali, istemciKaydet, istemciAl, donusIzinli, kodVer, tokenAl, erisimKullanici, iptalEt, temizle, basarisizSay, ozet, musteriTakip, gunlukListe, gunlukYaz, kisiselOzet, b64url, pkceDogru, uyarilar };
