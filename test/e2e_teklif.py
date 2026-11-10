import asyncio
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"; O="/home/claude/pb/ekran/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e))); pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
        async def gir(e):
            await pg.goto(B); await pg.evaluate("localStorage.clear()"); await pg.goto(B); await pg.fill('#gE',e); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        await gir('burhan-test@ornek.test')
        await pg.goto(B+"#bugun"); await pg.goto(B+"#ekip"); await pg.wait_for_timeout(800)
        await pg.set_input_files('#akD',__import__('os').environ['BEACON_TEST_YEDEK']); await pg.wait_for_timeout(400); await pg.click('#akK'); await pg.wait_for_selector('#akS .bilgi', timeout=30000)
        print([l for l in (await pg.locator('#akS').inner_text()).split("\n") if 'katalog' in l.lower()])
        await gir('satis2-test@ornek.test')
        await pg.goto(B+"#yeni"); await pg.wait_for_timeout(500)
        await pg.fill('#yAd','Teklif Deneme Kişi'); await pg.fill('#yTel','0532 444 55 66'); await pg.fill('#yIlce','Urla'); await pg.fill('#yFat','3.000'); await pg.fill('#ySoz','10'); await pg.click('#yKay2'); await pg.wait_for_timeout(1200)
        aid=(await pg.evaluate("location.hash")).split('/')[1]
        await pg.click('text=Kalem kalem teklif'); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=O+"t1_teklif.png",full_page=True)
        print('fiyat kart:', (await pg.locator('.card').nth(2).inner_text()).replace("\n"," | ")[:400] if await pg.locator('.uyari').count()==0 else (await pg.locator('.uyari').inner_text()))
        # adet degistir + kalem ekle
        await pg.locator('[data-ka]').first.fill('14'); await pg.locator('[data-ka]').first.dispatch_event('change'); await pg.wait_for_timeout(300)
        await pg.click('#kOner'); await pg.wait_for_timeout(400)
        await pg.click('#kKay'); await pg.wait_for_timeout(1500)
        print('hash', await pg.evaluate("location.hash"))
        await pg.screenshot(path=O+"t2_pdf_mobil.png",full_page=True)
        await pg.set_viewport_size({'width':900,'height':1200}); await pg.wait_for_timeout(300)
        await pg.emulate_media(media="print"); await pg.pdf(path=O+"teklif_test.pdf", format="A4"); await pg.emulate_media(media="screen")
        print('onay bekliyor uyarisi:', await pg.locator('.uyari').count())
        # yonetici onaylar, revize
        await gir('burhan-test@ornek.test'); await pg.goto(B+"#aday/"+aid); await pg.wait_for_timeout(1000)
        await pg.locator('button:has-text("Onayla")').first.click(); await pg.wait_for_timeout(1000)
        await pg.locator('a:has-text("Revize")').first.click(); await pg.wait_for_timeout(1200)
        await pg.locator('[data-kx]').last.click(); await pg.wait_for_timeout(300); await pg.click('#kKay'); await pg.wait_for_timeout(1500)
        print('revizyon sonrasi uyarı', await pg.locator('.uyari').count(), (await pg.locator('.ust').inner_text()).replace("\n"," ")[-90:])
        await pg.goto(B+"#teklifler"); await pg.wait_for_timeout(800); print('teklifler:', (await pg.locator('#m').inner_text()).replace("\n"," | ")[:500])
        print('hatalar',errs); await b.close()
asyncio.run(main())
