// iSolarCloud (Sungrow) senkronu — sunucu tarafı. Bağlantı bilgileri isc_ayar kaydında (gizli alanlar) durur.
// Beacon'daki iscSenk mantığının sunucuya taşınmış hali: günlük üretim (p83022), teorik üretim (p83018), PR (p83023), anlık durum ve açık arızalar.
function gunEkle(t, n) { var d = new Date(t + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function birim(o) { if (!o) return null; var v = parseFloat(o.value); if (isNaN(v)) return null; var u = String(o.unit || "").toLowerCase().replace(/\s/g, ""); var k = { wh: 1e-3, kwh: 1, mwh: 1e3, gwh: 1e6, w: 1e-3, kw: 1, mw: 1e3, gw: 1e6 }[u]; return k == null ? v : v * k; }
function post(A, path, body) {
  var r = $http.send({ url: (A.gw || "https://gateway.isolarcloud.eu") + path, method: "POST", timeout: 40,
    headers: { "Content-Type": "application/json;charset=UTF-8", "sys_code": "901", "x-access-key": A.secret },
    body: JSON.stringify(Object.assign({ appkey: A.appkey, lang: "_en_US" }, body)) });
  var j = r.json; if (!j) throw new Error("iSolarCloud yanıtı okunamadı (" + r.statusCode + ")"); return j;
}
function hataMetni(j) { var m = (j && j.result_msg) || "", d = j && j.result_data;
  if (d && d.login_state != null && String(d.login_state) !== "1") return ({ "-1": "iSolarCloud hesabı bulunamadı", "0": "iSolarCloud şifresi yanlış", "2": "Hesap yanlış şifre yüzünden kilitlendi", "5": "Hesap yönetici tarafından kilitlendi" })[String(d.login_state)] || "Giriş başarısız";
  if (/appkey/i.test(m)) return "Appkey geçersiz"; if (/access|secret/i.test(m)) return "Secret key geçersiz"; return "iSolarCloud hatası: " + (m || (j && j.result_code) || "bilinmiyor"); }
function token(A, rec, yeni) {
  var t = rec.getString("token"), at = rec.getInt("tokenAt");
  if (!yeni && t && Date.now() - at < 20 * 3600e3) return t;
  var j = post(A, "/openapi/login", { user_account: A.user, user_password: A.pass });
  if (String(j.result_code) !== "1" || !j.result_data || String(j.result_data.login_state) !== "1" || !j.result_data.token) throw new Error(hataMetni(j));
  rec.set("token", j.result_data.token); rec.set("tokenAt", Date.now()); return j.result_data.token;
}
function cagir(A, rec, path, body) {
  var j = post(A, path, Object.assign({ token: token(A, rec, false) }, body));
  if (String(j.result_code) !== "1" && /token/i.test(j.result_msg || "")) j = post(A, path, Object.assign({ token: token(A, rec, true) }, body));
  if (String(j.result_code) !== "1") throw new Error(hataMetni(j));
  return j.result_data;
}
function invSenk(A, rec, ps, eski) {
  var L = [], sayfa = 1;
  while (sayfa < 20) { var D = cagir(A, rec, "/openapi/getDeviceList", { ps_id: String(ps.ps_id), curPage: sayfa, size: 100, device_type_list: [1] }), pl = (D && (D.pageList || D.list)) || []; L = L.concat(pl); if (pl.length < 100) break; sayfa++; }
  L = L.filter(function (x) { return x.ps_key && (x.device_type == null || +x.device_type === 1); });
  if (!L.length) throw new Error("Santralde inverter bulunamadı");
  var bas = gunEkle(bugunTR(), -35), bit = gunEkle(bugunTR(), -1), gun = (eski && eski.gun) || {}, sinir = gunEkle(bugunTR(), -90).replace(/-/g, "");
  for (var i = 0; i < L.length; i += 50) { var parca = L.slice(i, i + 50).map(function (x) { return x.ps_key; });
    var H = cagir(A, rec, "/openapi/getDevicePointsDayMonthYearDataList", { data_point: "p1", data_type: "2", query_type: "1", start_time: bas.replace(/-/g, ""), end_time: bit.replace(/-/g, ""), ps_key_list: parca, order: 0 });
    parca.forEach(function (k) { ((H && H[k] && H[k].p1) || []).forEach(function (e) { var v = parseFloat(e["2"]); if (isNaN(v)) return; gun[k] = gun[k] || {}; gun[k][e.time_stamp] = Math.round(v / 10) / 100; }); }); }
  Object.keys(gun).forEach(function (k) { Object.keys(gun[k]).forEach(function (d) { if (d < sinir) delete gun[k][d]; }); });
  return { zaman: Date.now(), liste: L.map(function (x) { return { k: x.ps_key, ad: x.device_name || x.device_sn || x.ps_key, sn: x.device_sn || "", model: x.device_model_code || "", ariza: x.dev_fault_status, durum: x.dev_status }; }), gun: gun };
}
function bugunTR() { return new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10); }
function senk(app, zorla) {
  var rec; try { rec = app.findFirstRecordByFilter("isc_ayar", "anahtar = 'ana'"); } catch (e) { return { durum: "kurulmadi", mesaj: "iSolarCloud bağlantısı kurulmadı" }; }
  var A = { appkey: rec.getString("appkey"), secret: rec.getString("secret"), user: rec.getString("kullanici"), pass: rec.getString("sifre"), gw: rec.getString("gw") || "" };
  if (!A.appkey || !A.secret || !A.user || !A.pass) return { durum: "eksik", mesaj: "Bağlantı bilgileri eksik" };
  try {
    var P = cagir(A, rec, "/openapi/getPowerStationList", { curPage: 1, size: 100 }), L = (P && P.pageList) || [];
    if (!L.length) throw new Error("Bu hesapta santral bulunamadı");
    var psId = rec.getString("psId"), ps = null;
    if (psId) ps = L.filter(function (x) { return String(x.ps_id) === psId; })[0];
    if (!ps) { var es = L.filter(function (x) { return /d\s*solar/i.test(x.ps_name || ""); }); ps = L.length === 1 ? L[0] : es.length === 1 ? es[0] : null; }
    if (!ps) { rec.set("santraller", L.map(function (x) { return { id: String(x.ps_id), ad: x.ps_name }; })); throw new Error("Birden fazla santral var; GES › Bağlantı'dan seçin"); }
    rec.set("psId", String(ps.ps_id)); rec.set("psAd", ps.ps_name || "");
    rec.set("canli", { bugunKwh: birim(ps.today_energy), toplamKwh: birim(ps.total_energy), gucKw: birim(ps.curr_power), durum: ps.ps_status, alarm: ps.alarm_count || 0, zaman: new Date().toISOString() });
    // günlük veri: son kayıtlı günden 3 gün geriden dün'e kadar (en fazla 89 günlük parçalar)
    var son = rec.getString("sonGun"), dun = gunEkle(bugunTR(), -1), bas = son ? gunEkle(son, -3) : (rec.getString("baslangic") || "2026-09-01"), key = ps.ps_id + "_11_0_0", yeni = {}, sonGun = son;
    while (bas <= dun) { var bit = gunEkle(bas, 89); if (bit > dun) bit = dun;
      var D = cagir(A, rec, "/openapi/getDevicePointsDayMonthYearDataList", { data_point: "p83022,p83018,p83023", data_type: "2", query_type: "1", start_time: bas.replace(/-/g, ""), end_time: bit.replace(/-/g, ""), ps_key_list: [key], order: 0 });
      var r = (D && D[key]) || {};
      [["p83022", "isc"], ["p83018", "iscT"], ["p83023", "iscPR"]].forEach(function (pk) { (r[pk[0]] || []).forEach(function (e) { var ts = String(e.time_stamp || ""), v = parseFloat(e["2"] != null ? e["2"] : e["4"] != null ? e["4"] : e["1"]); if (ts.length !== 8 || isNaN(v)) return;
        var ay = ts.slice(0, 4) + "-" + ts.slice(4, 6), g = ts.slice(6, 8); yeni[ay] = yeni[ay] || { isc: {}, iscT: {}, iscPR: {} };
        if (pk[1] === "iscPR") { if (v > 1.5) v = v / 100; yeni[ay].iscPR[g] = Math.round(v * 1000) / 1000; } else yeni[ay][pk[1]][g] = Math.round(v / 10) / 100;
        var t = ay + "-" + g; if (pk[1] === "isc" && (!sonGun || t > sonGun)) sonGun = t; }); });
      bas = gunEkle(bit, 1); }
    var col = app.findCollectionByNameOrId("ges_aylik");
    Object.keys(yeni).forEach(function (ay) { var g; try { g = app.findFirstRecordByFilter("ges_aylik", "donem = {:d}", { d: ay }); } catch (e) { g = new Record(col); g.set("donem", ay); }
      var bir = function (alan, ek) { var o = {}; try { o = JSON.parse(g.getString(alan) || "{}") || {}; } catch (e) { o = {}; } if (Array.isArray(o) || typeof o !== "object") o = {}; Object.keys(ek).forEach(function (k) { o[k] = ek[k]; }); return o; };
      g.set("iscGun", bir("iscGun", yeni[ay].isc)); g.set("iscT", bir("iscT", yeni[ay].iscT)); g.set("iscPR", bir("iscPR", yeni[ay].iscPR)); app.save(g); });
    if (sonGun) rec.set("sonGun", sonGun);
    // açık arızalar
    try { var M = {}, ekle = function (D) { ((D && D.pageList) || []).forEach(function (x) { if (x && x.fault_code) M[x.fault_code] = { kod: x.fault_code, ad: x.fault_name || "", acik: x.fault_desc || "", tur: +x.fault_type || 0, seviye: +x.fault_level || 0, durum: +x.process_status || 0, bas: x.create_time || "", bit: x.over_time || "", cihaz: x.device_name || "" }; }); };
      ekle(cagir(A, rec, "/openapi/getFaultAlarmInfo", { curPage: "1", size: "100", ps_id: String(ps.ps_id), fault_type: "1,2,3", process_status: "8" }));
      rec.set("alarm", Object.keys(M).map(function (k) { return M[k]; })); } catch (e) {}
    // inverterler: liste ve son 35 günün günlük üretimi (p1), 90 gün saklanır; saatte bir değil günde bir kez yeter
    try { var invEski = {}; try { invEski = JSON.parse(rec.getString("inv") || "{}") || {}; } catch (e) { invEski = {}; }
      if (zorla || !invEski.zaman || Date.now() - invEski.zaman > 20 * 3600e3) rec.set("inv", invSenk(A, rec, ps, invEski)); } catch (e) { console.log("inverter senk hatası", e); }
    rec.set("sonSenk", new Date().toISOString()); rec.set("hata", ""); app.save(rec);
    return { durum: "tamam", mesaj: Object.keys(yeni).length + " ay güncellendi", sonGun: sonGun };
  } catch (e) { rec.set("hata", String((e && e.message) || e)); rec.set("sonDeneme", new Date().toISOString()); try { app.save(rec); } catch (e2) {} return { durum: "hata", mesaj: String((e && e.message) || e) }; }
}
module.exports = { senk: senk };
