import requests
B="http://127.0.0.1:8090"; P="Sifre-12345678"
su=requests.post(B+"/api/collections/_superusers/auth-with-password",json={"identity":"test-yonetici@ornek.test","password":"Test-Sifre-123456"}).json()["token"]
S={"Authorization":su}
def kul(email,rol):
    r=requests.get(B+"/api/collections/users/records",params={"filter":"email='%s'"%email},headers=S).json()["items"]
    if r: requests.patch(B+"/api/collections/users/records/"+r[0]["id"],headers=S,json={"rol":rol,"aktif":True,"password":P,"passwordConfirm":P})
    else: requests.post(B+"/api/collections/users/records",headers=S,json={"email":email,"rol":rol,"aktif":True,"password":P,"passwordConfirm":P,"name":email.split("@")[0]})
    a=requests.post(B+"/api/collections/users/auth-with-password",json={"identity":email,"password":P}).json()
    if "token" not in a: print(email,a)
    return a["token"]
T={"yonetici":kul("burhan-test@ornek.test","yonetici"),"muhasebe":kul("muh-test@ornek.test","muhasebe"),"satis":kul("satis2-test@ornek.test","satis"),"saha":kul("eyup-test@ornek.test","saha"),"ortak":kul("ece-test@ornek.test","ortak"),"proje":kul("proje-test@ornek.test","proje")}
h=requests.post(B+"/api/collections/fin_hesaplar/records",headers={"Authorization":T["yonetici"]},json={"ad":"Test TL","tur":"Banka","pb":"TRY","acilis":1000,"aktif":True}).json()["id"]
ok=True
beklenen={"fin_hesaplar":["yonetici","muhasebe"],"fin_hareketler":["yonetici","muhasebe"],"krediler":["yonetici","muhasebe"],"ortak_cari":["yonetici"],"varliklar":["yonetici"],"ges_aylik":["yonetici"]}
ornek={"fin_hesaplar":{"ad":"x","tur":"Kasa","pb":"TRY","aktif":True},"fin_hareketler":{"tarih":"2026-11-10 12:00:00.000Z","hesap":h,"yon":"Giriş","tutar":5,"durum":"Gerçekleşti"},
 "krediler":{"ad":"k","pb":"TRY"},"ortak_cari":{"tarih":"2026-11-10 12:00:00.000Z","ortak":"Batur","yon":"Aldı","tutarUsd":1},"varliklar":{"ad":"v"},"ges_aylik":{"donem":"2026-0%d"}}
i=1
for c,izin in beklenen.items():
    for r,t in T.items():
        H={"Authorization":t}; body=dict(ornek[c])
        if c=="ges_aylik": body["donem"]="2026-0%d"%i; i+=1
        ls=requests.get(B+f"/api/collections/{c}/records",headers=H); n=ls.json().get("totalItems",0) if ls.ok else -1
        cr=requests.post(B+f"/api/collections/{c}/records",headers=H,json=body)
        gor = ls.ok and n>0 or cr.ok
        dog = (r in izin)==cr.ok and (r in izin or n<=0)
        if cr.ok and r!="yonetici":
            d=requests.delete(B+f"/api/collections/{c}/records/"+cr.json()["id"],headers=H)
            if d.ok: dog=False; print("  silme izni olmamali:",c,r)
        if not dog: ok=False
        print(("OK " if dog else "HATA"),c,r,"liste:",n,"olustur:",cr.status_code)
# ges donem dogrulama
bad=requests.post(B+"/api/collections/ges_aylik/records",headers={"Authorization":T["yonetici"]},json={"donem":"2026-13"})
print("donem 2026-13 reddedildi:",bad.status_code==400); ok=ok and bad.status_code==400
print("SONUC", "TAMAM" if ok else "HATA VAR")
