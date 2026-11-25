/* v59: telefonda/ana ekranda eski sürüm takılı kalmasın. Sunucudaki sürüm bu sayfadakinden yeniyse sayfa bir kez yenilenir.
   DS_SURUM her pakette paket numarasıyla aynı olmalı. */
var DS_SURUM = 92;
function surumDenetle() {
  fetch("/surum.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
    if (!(+j.surum > DS_SURUM) || j.durum !== "basarili") return; var a = "dsYen" + j.surum;
    try { if (sessionStorage.getItem(a)) return; sessionStorage.setItem(a, "1"); } catch (e) { return; }
    if (typeof PRM !== "undefined" && (PRM.kayit || PRM.k)) { if (!document.getElementById("dsYeniS")) document.body.insertAdjacentHTML("beforeend", '<button id="dsYeniS" class="btn sm pri" style="position:fixed;left:50%;transform:translateX(-50%);bottom:96px;z-index:50" onclick="location.replace(location.pathname+\'?v=' + j.surum + '\'+location.hash)">Yeni sürüm hazır · yenile</button>'); try { sessionStorage.removeItem(a); } catch (e) {} return; }
    location.replace(location.pathname + "?v=" + j.surum + location.hash);
  }).catch(function () {});
}
setTimeout(surumDenetle, 1500);
document.addEventListener("visibilitychange", function () { if (!document.hidden) surumDenetle(); });
