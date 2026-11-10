import asyncio
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e)))
        async def gir(s):
            await pg.goto(B); await pg.fill('#gE','burhan-test@ornek.test'); await pg.fill('#gS',s); await pg.click('#gB'); await pg.wait_for_timeout(800)
        await gir('Sifre-12345678'); await pg.goto(B+"#profil"); await pg.wait_for_timeout(300)
        await pg.fill('#pE','Sifre-12345678'); await pg.fill('#pY','Yeni-Sifre-2026x'); await pg.fill('#pT','Yeni-Sifre-2026x'); await pg.click('#pK'); await pg.wait_for_timeout(2000)
        print('cikis sonrasi giris ekrani:', await pg.locator('#gE').count())
        await gir('Yeni-Sifre-2026x'); print('yeni sifreyle giris:', await pg.locator('#m').count())
        await pg.goto(B+"#profil"); await pg.wait_for_timeout(300); await pg.fill('#pE','Yeni-Sifre-2026x'); await pg.fill('#pY','Sifre-12345678'); await pg.fill('#pT','Sifre-12345678'); await pg.click('#pK'); await pg.wait_for_timeout(1500)
        print('hata',errs); await b.close()
asyncio.run(main())
