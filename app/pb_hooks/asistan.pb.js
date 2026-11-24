/// <reference path="../pb_data/types.d.ts" />
// Yönetici asistanı (Claude) için güvenli, salt okunur bağlantı: OAuth 2.1 (PKCE) + MCP (Streamable HTTP, JSON yanıt).
// Her kullanıcı kendi D Solar hesabıyla giriş yapar; paylaşılan sabit anahtar yoktur. Yalnız aktif yöneticiler bağlanabilir.
// Kapatmak için sunucuda DSOLAR_ASISTAN=kapali; bir kullanıcının tüm bağlantılarını iptal için POST /api/dsolar/asistan/iptal.
routerAdd("GET", "/.well-known/oauth-authorization-server", (e) => require(`${__hooks}/asistan_http.js`).asMeta(e));
routerAdd("GET", "/.well-known/oauth-authorization-server/mcp", (e) => require(`${__hooks}/asistan_http.js`).asMeta(e));
routerAdd("GET", "/.well-known/openid-configuration", (e) => require(`${__hooks}/asistan_http.js`).asMeta(e));
routerAdd("GET", "/.well-known/oauth-protected-resource", (e) => require(`${__hooks}/asistan_http.js`).prMeta(e));
routerAdd("GET", "/.well-known/oauth-protected-resource/mcp", (e) => require(`${__hooks}/asistan_http.js`).prMeta(e));
routerAdd("POST", "/oauth/register", (e) => require(`${__hooks}/asistan_http.js`).kayit(e));
routerAdd("GET", "/oauth/authorize", (e) => require(`${__hooks}/asistan_http.js`).yetkiSayfa(e));
routerAdd("POST", "/oauth/authorize", (e) => require(`${__hooks}/asistan_http.js`).yetkiGiris(e));
routerAdd("POST", "/oauth/token", (e) => require(`${__hooks}/asistan_http.js`).token(e));
routerAdd("POST", "/mcp", (e) => require(`${__hooks}/asistan_http.js`).mcp(e));
routerAdd("GET", "/mcp", (e) => require(`${__hooks}/asistan_http.js`).mcpGet(e));
routerAdd("DELETE", "/mcp", (e) => e.noContent(204));
routerAdd("GET", "/api/dsolar/asistan/ozet", (e) => require(`${__hooks}/asistan_http.js`).ozetApi(e), $apis.requireAuth("users"));
routerAdd("POST", "/api/dsolar/asistan/iptal", (e) => require(`${__hooks}/asistan_http.js`).iptalApi(e), $apis.requireAuth("users"));
cronAdd("asistan_temizle", "23 * * * *", () => { try { require(`${__hooks}/asistan_lib.js`).temizle($app); } catch (e) { console.log("asistan temizlik hatası", e); } });
cronAdd("asistan_kritik", "*/15 * * * *", () => { try { require(`${__hooks}/asistan_lib.js`).kritikTara($app); } catch (e) { console.log("asistan kritik tarama hatası", e); } });
