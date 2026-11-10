import os
import requests, json, io, base64
B="http://127.0.0.1:8090"; s=requests.Session()
su=s.post(B+"/api/collections/_superusers/auth-with-password",json={"identity":os.environ.get("PB_TEST_SU","test-yonetici@ornek.test"),"password":os.environ.get("PB_TEST_SIFRE","")}).json()["token"]
H=lambda t:{"Authorization":t}
def mk(col,data,tok=su,files=None):
    r=s.post(f"{B}/api/collections/{col}/records",headers=H(tok),**({"data":data,"files":files} if files else {"json":data}))
    assert r.status_code==200,(col,r.status_code,r.text[:200]); return r.json()
U={}
for k,rol,aktif in [("yon","yonetici",True),("sat","satis",True),("saha1","saha",True),("saha2","saha",True),("proje","proje",True),("muh","muhasebe",True),("ort1","ortak",True),("ort2","ortak",True),("pasif","satis",False)]:
    U[k]=mk("users",{"email":f"{k}@ornek.test","password":"Sifre-12345678","passwordConfirm":"Sifre-12345678","rol":rol,"aktif":aktif,"name":k})
T={}
for k in U:
    r=s.post(B+"/api/collections/users/auth-with-password",json={"identity":f"{k}@ornek.test","password":"Sifre-12345678"})
    T[k]=r.json().get("token") if r.status_code==200 else None
a1=mk("adaylar",{"ad":"Örnek Müşteri 1","tel":"05000000001","ilce":"Urla","kaynak":"İş ortağı","asama":"Keşif","kesifci":U["saha1"]["id"],"ortak":U["ort1"]["id"],"iys":"İzinli"})
a2=mk("adaylar",{"ad":"Örnek Müşteri 2","tel":"05000000002","ilce":"Çeşme","kaynak":"İş ortağı","asama":"Teklif","kesifci":U["saha2"]["id"],"ortak":U["ort2"]["id"],"iys":"Sorulacak"})
a3=mk("adaylar",{"ad":"Örnek Müşteri 3","tel":"05000000003","ilce":"Seferihisar","kaynak":"Instagram","asama":"Aday"})
t1=mk("teklifler",{"aday":a1["id"],"kwp":9.8,"fiyatUSD":8500,"durum":"Taslak"})
mk("kasa",{"tutar":1000,"pb":"USD","aciklama":"örnek"}); mk("banka",{"banka":"Örnek Banka","limit":1,"kullanilan":0}); mk("ortakcari",{"ortak":"Örnek","bakiye":5})
mk("komisyonlar",{"ortak":U["ort1"]["id"],"aday":a1["id"],"tutarUSD":400,"durum":"Bekliyor"}); mk("komisyonlar",{"ortak":U["ort2"]["id"],"aday":a2["id"],"tutarUSD":300,"durum":"Bekliyor"})
png=base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
f1=mk("kesif_foto",{"aday":a1["id"]},T["saha1"],files={"dosya":("a1.png",png,"image/png")})
f2=mk("kesif_foto",{"aday":a2["id"]},T["saha2"],files={"dosya":("a2.png",png,"image/png")})
def say(col,tok):
    r=s.get(f"{B}/api/collections/{col}/records",headers=H(tok) if tok else {})
    return r.json().get("totalItems") if r.status_code==200 else f"HTTP{r.status_code}"
sonuc=[]
def kontrol(id,ad,kosul,detay): sonuc.append((id,ad,"GEÇTİ" if kosul else "KALDI",detay))
# R8 matrisi
bek={"adaylar":{"yon":3,"sat":3,"saha1":1,"saha2":1,"proje":3,"muh":0,"ort1":0,"ort2":0},
     "teklifler":{"yon":1,"sat":1,"saha1":0,"saha2":0,"proje":0,"muh":1,"ort1":0,"ort2":0},
     "kasa":{"yon":1,"sat":0,"saha1":0,"saha2":0,"proje":0,"muh":1,"ort1":0,"ort2":0},
     "banka":{"yon":1,"sat":0,"saha1":0,"saha2":0,"proje":0,"muh":1,"ort1":0,"ort2":0},
     "ortakcari":{"yon":1,"sat":0,"saha1":0,"saha2":0,"proje":0,"muh":1,"ort1":0,"ort2":0},
     "komisyonlar":{"yon":2,"sat":0,"saha1":0,"saha2":0,"proje":0,"muh":2,"ort1":1,"ort2":1},
     "kesif_foto":{"yon":2,"sat":0,"saha1":1,"saha2":1,"proje":2,"muh":0,"ort1":0,"ort2":0},
     "ortak_musterileri":{"yon":0,"sat":0,"saha1":0,"saha2":0,"proje":0,"muh":0,"ort1":1,"ort2":1}}
hata=[]; toplam=0
for col,m in bek.items():
    for u,n in m.items():
        g=say(col,T[u]); toplam+=1
        if g!=n: hata.append(f"{col}/{u}: beklenen {n}, gelen {g}")
kontrol("R8","Rol × koleksiyon görünürlük matrisi ("+str(toplam)+" hücre)",not hata,"; ".join(hata) or "hepsi beklenen")
kontrol("R1","Satış finans koleksiyonlarını göremez",all(say(c,T["sat"])==0 for c in ["kasa","banka","ortakcari"]),"kasa/banka/ortakcari = 0")
r=s.get(f"{B}/api/collections/ortak_musterileri/records/{a2['id']}",headers=H(T["ort1"])); kontrol("R2","Ortak başkasının müşterisini ID ile açamaz",r.status_code==404,f"HTTP {r.status_code}")
r=s.get(f"{B}/api/collections/ortak_musterileri/records",headers=H(T["ort1"])).json()["items"]; kontrol("R3","Ortak yalnız ad, ilçe, aşama görür (telefon yok)",bool(r) and "tel" not in r[0],"alanlar: "+",".join(sorted(k for k in r[0] if k not in("collectionId","collectionName"))))
r=s.get(f"{B}/api/collections/kesif_foto/records/{f2['id']}",headers=H(T["saha1"])); kontrol("R4","Saha atanmadığı işin fotoğrafını göremez",r.status_code==404,f"HTTP {r.status_code}")
u=f"{B}/api/files/kesif_foto/{f1['id']}/{f1['dosya']}"
r0=s.get(u); ft=s.post(B+"/api/files/token",headers=H(T["saha1"])).json()["token"]; r1=s.get(u+"?token="+ft)
ft2=s.post(B+"/api/files/token",headers=H(T["saha2"])).json()["token"]; r2=s.get(u+"?token="+ft2)
kontrol("R5","Korumalı dosya: jetonsuz ve yetkisiz açılmaz",r0.status_code in(403,404) and r1.status_code==200 and r2.status_code in(403,404),f"jetonsuz {r0.status_code}, yetkili {r1.status_code}, başka saha {r2.status_code}")
r=s.patch(f"{B}/api/collections/users/records/{U['sat']['id']}",headers=H(T["sat"]),json={"rol":"yonetici"}); kontrol("R6","Kullanıcı kendi rolünü yükseltemez",r.status_code in(400,403,404),f"HTTP {r.status_code}")
kontrol("R7","Pasif kullanıcı giriş yapamaz",T["pasif"] is None,"giriş reddedildi" if T["pasif"] is None else "giriş yaptı")
r=s.patch(f"{B}/api/collections/teklifler/records/{t1['id']}",headers=H(T["sat"]),json={"durum":"Gönderildi"}); r2=s.patch(f"{B}/api/collections/teklifler/records/{t1['id']}",headers=H(T["yon"]),json={"durum":"Gönderildi"})
kontrol("T1","Teklifi 'Gönderildi' yapmak yalnız yöneticide (insan onayı)",r.status_code in(400,403,404) and r2.status_code==200,f"satış {r.status_code}, yönetici {r2.status_code}")
r=s.patch(f"{B}/api/collections/adaylar/records/{a1['id']}",headers=H(T["saha1"]),json={"ortak":U["ort2"]["id"]}); kontrol("R9","Saha aday kaydında ortak/sorumlu değiştiremez",r.status_code in(400,403,404),f"HTTP {r.status_code}")
r=s.get(f"{B}/api/collections/adaylar/records"); kontrol("R10","Girişsiz istek veri göremez",r.status_code==200 and r.json()["totalItems"]==0 or r.status_code in(401,403),f"HTTP {r.status_code}, {r.json().get('totalItems')}")
for x in sonuc: print(" | ".join(map(str,x)))
print("TOPLAM", sum(x[2]=="GEÇTİ" for x in sonuc),"/",len(sonuc))
