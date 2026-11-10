import asyncio
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e))); pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto(B); await pg.evaluate("localStorage.clear()"); await pg.goto(B)
        await pg.fill('#gE','burhan-test@ornek.test'); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        await pg.goto(B+"#yeni"); await pg.wait_for_timeout(500)
        await pg.fill('#yAd','Silinecek Deneme'); await pg.fill('#yTel','0532 999 88 77'); await pg.click('#yKay2'); await pg.wait_for_timeout(1200)
        h=await pg.evaluate("location.hash"); print('eklendi', h)
        await pg.fill('#gM','not'); await pg.click('#gK'); await pg.wait_for_timeout(800)
        await pg.click('#aSil'); await pg.wait_for_timeout(1200); print('silme sonrasi', await pg.evaluate("location.hash"), await pg.locator('.toast').all_inner_texts())
        await pg.goto(B+h); await pg.wait_for_timeout(800); print('kart acilinca', await pg.locator('.toast').all_inner_texts())
        # teklifli musteri
        await pg.goto(B+"#yeni"); await pg.wait_for_timeout(500); await pg.fill('#yAd','Teklifli Deneme'); await pg.fill('#yTel','0532 777 66 55'); await pg.click('#yKay2'); await pg.wait_for_timeout(1200)
        await pg.fill('#tK','5'); await pg.fill('#tF','7000'); await pg.click('#tE'); await pg.wait_for_timeout(1200)
        print('teklifli: sil butonu', await pg.locator('#aSil').count(), 'kaybedildi butonu', await pg.locator('#aKay').count())
        await pg.click('#aKay'); await pg.wait_for_timeout(1000); print('asama', await pg.locator('.card h3 .pill').first.inner_text())
        print('hatalar',errs); await b.close()
asyncio.run(main())
