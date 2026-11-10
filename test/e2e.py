import asyncio, re
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        async def sayfa():
            ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2); pg=await ctx.new_page()
            pg.on("pageerror",lambda e: errs.append(str(e)[:200])); pg.on("dialog",lambda d: asyncio.ensure_future(d.accept()))
            return pg
        async def giris(pg,e,s):
            await pg.goto(B); await pg.fill('#gE',e); await pg.fill('#gS',s); await pg.click('#gB'); await pg.wait_for_timeout(700)
        # 1 Yonetici: ekip ekle (satis + saha + ortak)
        y=await sayfa(); await giris(y,"burhan-test@ornek.test","Sifre-12345678")
        await y.goto(B+"#ekip"); await y.wait_for_timeout(600)
        sifre={}
        for ad,em,rl in [("Batur (test)","batur-test@ornek.test","satis"),("Eyüp (test)","eyup-test@ornek.test","saha"),("Ece Mimarlık (test)","ece-test@ornek.test","ortak")]:
            await y.fill('#eAd',ad); await y.fill('#eEm',em); await y.select_option('#eRol',rl); await y.click('#eK'); await y.wait_for_timeout(900)
            t=await y.inner_text('#sifre'); sifre[em]=re.search(r'geçici şifre: (\S+)',t).group(1)
        await y.screenshot(path='ekran/1-ekip.png',full_page=True)
        # 2 Satis: yeni aday + mukerrer kontrol + teklif
        s=await sayfa(); await giris(s,"batur-test@ornek.test",sifre["batur-test@ornek.test"])
        await s.screenshot(path='ekran/2-bugun-bos.png')
        await s.goto(B+"#yeni"); await s.wait_for_timeout(400)
        await s.fill('#yAd','Ayşe Örnek'); await s.fill('#yTel','0532 111 22 33'); await s.fill('#yIlce','Urla'); await s.select_option('#yKay','İş ortağı'); await s.fill('#yFat','5.000'); await s.fill('#yIs','Faturayı iste')
        await s.click('#yKay2'); await s.wait_for_timeout(900); aday_url=s.url
        await s.goto(B+"#yeni"); await s.wait_for_timeout(400)
        await s.fill('#yAd','Ayse Ornek baska yazim'); await s.fill('#yTel','+90 532 111 2233'); await s.click('#yKay2'); await s.wait_for_timeout(700)
        muk=await s.inner_text('#yUy'); await s.screenshot(path='ekran/3-mukerrer.png',full_page=True)
        await s.goto(aday_url); await s.wait_for_timeout(800)
        await s.select_option('#dK',label='Eyüp (test)'); await s.select_option('#dO',label='Ece Mimarlık (test)'); await s.click('#dK2'); await s.wait_for_timeout(800)
        await s.fill('#gM','Fatura fotoğrafını istedim, akşam gönderecek.'); await s.click('#gK'); await s.wait_for_timeout(700)
        await s.fill('#tK','9,8'); await s.fill('#tF','8500'); await s.fill('#tN','16 panel, 10 kW inverter'); await s.click('#tE'); await s.wait_for_timeout(900)
        await s.screenshot(path='ekran/4-aday-karti.png',full_page=True)
        satis_onay_butonu=await s.locator('button:has-text("Onayla")').count()
        # 3 Yonetici onay
        await y.goto(B+"#teklifler"); await y.wait_for_timeout(800); await y.click('button:has-text("Onayla")'); await y.wait_for_timeout(800)
        await y.screenshot(path='ekran/5-teklifler.png',full_page=True)
        # 4 Saha: yalniz kendi kesfi
        h=await sayfa(); await giris(h,"eyup-test@ornek.test",sifre["eyup-test@ornek.test"]); await h.goto(B+"#adaylar"); await h.wait_for_timeout(800)
        saha_liste=await h.inner_text('#lst'); saha_menu=await h.inner_text('nav')
        # 5 Ortak
        o=await sayfa(); await giris(o,"ece-test@ornek.test",sifre["ece-test@ornek.test"]); await o.wait_for_timeout(800)
        ortak=await o.inner_text('#m'); await o.screenshot(path='ekran/6-ortak.png',full_page=True)
        # 6 Yonetici: Batur'u kapat -> giris reddi
        await y.goto(B+"#ekip"); await y.wait_for_timeout(600); await y.locator('.row:has-text("batur-test") [data-a]').click(); await y.wait_for_timeout(600)
        k=await sayfa(); await giris(k,"batur-test@ornek.test",sifre["batur-test@ornek.test"]); kapali=await k.inner_text('#gH')
        print("MUKERRER:",muk[:120].replace("\n"," "))
        print("SATIS ONAY BUTONU GORUYOR MU:",satis_onay_butonu)
        print("SAHA LISTESI:",saha_liste.replace("\n"," | ")[:150],"| MENU:",saha_menu.replace("\n"," "))
        print("ORTAK:",ortak.replace("\n"," | ")[:300], "| TEL GORUNUYOR MU:", "0532" in ortak)
        print("KAPALI HESAP:",kapali)
        print("JS HATALARI:",errs)
        await b.close()
asyncio.run(main())
