import re,glob,sys,os
D='/tmp/claude-0/v46'
src=open(D+'/taban.html',encoding='utf-8').read()
for a,b in [('fKasa','fKasa0'),('sGes','sGes0'),('invAnaliz','invAnaliz0'),('invKarti','invKarti0')]: src=src.replace('\nfunction '+a+'(','\nfunction '+b+'(',1)
YAMA=[
 ('''$("kEkB").onclick = function () { var k = KM[$("kEk").value], v = num($("kEkA").value); if (!k || !(v > 0)) { toast("Kalem ve adet seçin"); return; } X.kalemler.push(kalemYap(k, v, X.kur, T.eurUsd));''',
  '''$("kEkB").onclick = function () { var bt = this; if (bt.disabled) return; var k = KM[$("kEk").value], v = num($("kEkA").value); if (!k || !(v > 0)) { toast("Kalem ve adet seçin"); return; }
      var var0 = X.kalemler.filter(function (x) { return x.id === k.id; })[0]; if (var0 && !confirm(kAd(k) + " listede zaten var (" + sayi(var0.adet, var0.adet % 1 ? 2 : 0) + " " + var0.birim + "). Yeni satır açılmadan adedine " + sayi(v, v % 1 ? 2 : 0) + " eklensin mi?")) return;
      bt.disabled = true; if (var0) { var0.adet = Math.round((var0.adet + v) * 1000) / 1000; var0.toplamUsd = Math.round(var0.birimUsd * var0.adet * 100) / 100; } else X.kalemler.push(kalemYap(k, v, X.kur, T.eurUsd));'''),
]
YAMA.append(("""<h3 style="flex-wrap:wrap">' + esc(L.ad) + ' <span class="pill">' + esc(L.durum) + '</span>""", """<h3 style="flex-wrap:wrap">' + esc(L.ad) + ' <span class="pill">' + esc(L.durum) + '</span> <button class="btn sm" data-msjk="odeme" data-msjid="' + L.id + '">💬 Yaz</button>"""))
YAMA.append(("""(m ? '<div class="cB"><button class="btn sm" data-od="' + m.id + '">' + (giris ? "Tahsil edildi" : "Ödendi") + "</button></div>" : '<div class="cB"><span class="pill">' + (k.sabit ? "sabit" : "tahmini") + "</span></div>")""", """planButon(k, m, giris)"""))
YAMA.append(("""bagT("[data-od]", function (e) { gercekFormu(e.closest(".row"), MM[e.dataset.od], H, fPlan); });""", """bagT("[data-od]", function (e) { gercekFormu(e.closest(".row"), MM[e.dataset.od], H, fPlan); }); tekOnayBagla(MM, fPlan);"""))
YAMA.append(("""    var bol = function (L, G, giris) { var T = s(L) || 1;""", """    TKS = []; var bol = function (L, G, giris) { var T = s(L) || 1;"""))
YAMA.append(("""ad: s.ad + " (sabit)", tutar: +s.tutar, pb: s.pb || "TRY", sabit: true }""", """ad: s.ad + " (sabit)", tutar: +s.tutar, pb: s.pb || "TRY", sabit: true, sid: s.id, sAy: a, sKat: s.kategori || "Sabit gider", sOnc: s.oncelik || "" }"""))
YAMA.append(("""    html += '<div class="card"><h3>' + ikon("liste", "#d97706", "kucuk") + 'Açık listeler""", """    html += tekOnayBolum(M);\n    html += '<div class="card"><h3>' + ikon("liste", "#d97706", "kucuk") + 'Açık listeler"""))
YAMA.append(('    $("fm").innerHTML = html;\n    bagT("[data-ody]"', '    $("fm").innerHTML = html; tekOnayBagla(null, fOdeme);\n    bagT("[data-ody]"'))
YAMA.append(("""usdKarsilik(+s.tutar || 0, s.pb || "TRY", KU), { t: a + "-" + String(s.gun || 1).padStart(2, "0"), ad: s.ad + " (sabit)", tutar: +s.tutar, pb:""", """usdKarsilik(sabitTutar(s, a), s.pb || "TRY", KU), { t: a + "-" + String(s.gun || 1).padStart(2, "0"), ad: s.ad + (prsBagli(s) ? " (personel kartlarından)" : " (sabit)"), tutar: sabitTutar(s, a), pb:"""))
YAMA.append(("""if (!sabitAyda(s, a) || sIz[s.id + ":" + a] || (a === ay0""", """if (!sabitAyda(s, a) || sIz[s.id + ":" + a] || (prsBagli(s) && !sabitTutar(s, a)) || (a === ay0"""))
YAMA.append(("""if (!sabitAyda(s, a) || iz[s.id + ":" + a]) continue;""", """if (!sabitAyda(s, a) || iz[s.id + ":" + a] || (prsBagli(s) && !sabitTutar(s, a))) continue;"""))
YAMA.append(("""ac: [s.kategori || "Sabit gider", "her ay"].join(" · "), tutar: +s.tutar || 0,""", """ac: [s.kategori || "Sabit gider", prsBagli(s) ? "personel kartlarından" : "her ay"].join(" · "), tutar: sabitTutar(s, a),"""))
YAMA.append(("""bu.forEach(function (s) { top[s.pb || "TRY"] = (top[s.pb || "TRY"] || 0) + (+s.tutar || 0); });""", """bu.forEach(function (s) { top[s.pb || "TRY"] = (top[s.pb || "TRY"] || 0) + sabitTutar(s, ay); });"""))
YAMA.append((""""</b><small>" + esc([s.kategori, "her ay " + (s.gun || 1)""", """(prsBagli(s) ? ' <span class="pill" style="background:#e0f2fe;color:#075985">personel kartlarından · bu ay ' + sayi(sabitTutar(s, ay)) + " ₺</span>" : "") + "</b><small>" + esc([s.kategori, "her ay " + (s.gun || 1)"""))
YAMA.append(("""    G.forEach(function (g) { (g.ypBosluk || []).forEach(function (bo) { var t0 = bo.bas.slice(0, 4) + "-" + bo.bas.slice(4, 6) + "-" + bo.bas.slice(6, 8); if (bo.olay || t0 < gunSonra(-40)) return;
      dk.push(["kt", (bo.tur === "veri" ? "Sayaçtan veri yok (olası kesinti): " : "Gündüz üretim durdu: ") + ypYaz(bo.bas) + " – " + ypYaz(bo.bit) + " (" + ypSure(bo.dk) + "). Olay defterine yazın.", "uretim"]); }); });""", """    var bsO = gesBoslukOzet(G); if (bsO) dk.push(bsO); dk = dk.concat(gesProDk(G, RA, P, IS));"""))
YAMA.append(("""'Dikkat edilecekler</h3>" + (dk.map(function (x) { return '<a class="row" ' + (x[2].charAt(0)""".replace("'Dikkat",'"Dikkat'), """"Dikkat edilecekler</h3>" + (gesDkSar(dk).map(function (x) { return '<a class="row' + (x[3] ? " gsGiz" : "") + '" ' + (x[2].charAt(0)"""))
YAMA.append(("""Her şey yolunda: arıza yok, inverterler normal, kira tahsilatları güncel.</div>') + "</div></div>";""", """Her şey yolunda: arıza yok, inverterler normal, kira tahsilatları güncel.</div>') + gesDkDaha(dk) + "</div></div>";"""))
YAMA.append(("""var revizyon = eski && eski.durum === "Gönderildi";""", """var revizyon = eski && (eski.durum === "Gönderildi" || eski.durum === "Anlaşıldı");"""))
YAMA.append(("""(eski && eski.durum === "Gönderildi" ? "Revizyon olarak kaydet" """, """(eski && (eski.durum === "Gönderildi" || eski.durum === "Anlaşıldı") ? "Revizyon olarak kaydet" """))
for a,b in YAMA:
    assert src.count(a)==1, a[:60]
    src=src.replace(a,b)
src=src.split('\n')
js=''.join(open(f,encoding='utf-8').read()+'\n' for f in sorted(glob.glob(D+'/*.js')))
css=''.join(open(f,encoding='utf-8').read()+'\n' for f in sorted(glob.glob(D+'/*.css')))
adlar=set(re.findall(r'^function ([A-Za-z0-9_]+)\(',js,re.M))
# eski tanımları sil
out=[];i=0;silinen=[]
bas=[n for n,l in enumerate(src) if l.strip()=='<script>'][0]
son=[n for n,l in enumerate(src) if l.strip()=='</script>'][-1]
def ust(l): return l[:1] not in (' ','\t','') 
while i<len(src):
    l=src[i]; m=re.match(r'^function ([A-Za-z0-9_]+)\(',l)
    if bas<i<son and m and m.group(1) in adlar:
        silinen.append(m.group(1))
        # tek satır mı?
        j=i+1
        while j<len(src) and not ust(src[j]): j+=1
        if j<len(src) and src[j].startswith('}'): i=j+1
        else: i=j
        continue
    out.append(l); i+=1
s='\n'.join(out)
assert '</style>\n</head>' in s; s=s.replace('</style>\n</head>', '\n'+css+'</style>\n</head>',1)
k='// iPhone: klavye'
assert k in s
s=s.replace(k, js+k,1)
open('/home/claude/dsolar-satis/app/pb_public/index.html','w',encoding='utf-8').write(s)
print('yeni/değişen fonksiyon:',len(adlar),'silinen eski:',len(silinen))
eksik=[a for a in adlar if a not in silinen]; print('yeni:',sorted(eksik))
