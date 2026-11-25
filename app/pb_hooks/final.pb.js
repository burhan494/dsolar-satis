/// <reference path="../pb_data/types.d.ts" />
// v93 · Kişisel tercihler yalnız kullanıcının kendisine görünür (ekip listesinde başkasının tercihleri gönderilmez).
onRecordEnrich((e) => { if (!e.requestInfo || !e.requestInfo.auth || e.requestInfo.auth.id !== e.record.id) e.record.hide("tercihler"); e.next(); }, "users");
