import asyncio
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"; O="/home/claude/pb/ekran/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e))); pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto(B); await pg.evaluate("localStorage.clear()"); await pg.goto(B)
        await pg.fill('#gE','burhan-test@ornek.test'); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        await pg.goto(B+"#finans/ortak"); await pg.wait_for_timeout(1000)
        await pg.set_input_files('#oxD',__import__('os').environ['ORTAK_TEST_XLSX']); await pg.wait_for_timeout(2500)
        print('ONIZ:', (await pg.locator('#oxO').inner_text()).replace("\n"," | ")[:600])
        await pg.click('#oxK'); 
        for i in range(200):
            await pg.wait_for_timeout(1000)
            if not await pg.locator('#oxK').count() or await pg.locator('#oxS .uyari').count(): break
        print('SONRA:', (await pg.locator('#fm .card').first.inner_text()).replace("\n"," | ")[:500])
        # elle giris
        await pg.fill('#oU','10.000'); await pg.fill('#oKur','50'); print('usd onizleme', await pg.input_value('#oUsd')); await pg.fill('#oA','elle test'); await pg.click('#oK'); await pg.wait_for_timeout(1000)
        await pg.click('button[data-of="s|DRK"]'); await pg.wait_for_timeout(700); print('DRK filtre:', await pg.locator('#fm .card h3').last.inner_text())
        await pg.locator('#fm [data-ed]').first.click(); await pg.wait_for_timeout(300); print('editor', await pg.locator('#edK').count())
        await pg.screenshot(path=O+"o1.png", full_page=True)
        # krediler/cek/sabit duzenleme
        await pg.goto(B+"#finans/kredi"); await pg.wait_for_timeout(1000); await pg.locator('[data-ed^="krediler"]').first.click(); await pg.wait_for_timeout(300)
        await pg.fill('#ed_5','95.000'); await pg.click('#edK2'); await pg.wait_for_timeout(900); print('kredi:', (await pg.locator('[data-ed^="krediler"]').first.inner_text()).replace("\n"," ")[:200])
        await pg.click('[data-yeni="fin_kartlar"]'); await pg.wait_for_timeout(300); await pg.fill('#ed_0','Test Bank'); await pg.fill('#ed_1','Test Kişi'); await pg.fill('#ed_2','9999'); await pg.click('#edK2'); await pg.wait_for_timeout(900); print('kart sayisi', await pg.locator('[data-ed^="fin_kartlar"]').count())
        await pg.goto(B+"#finans/cek"); await pg.wait_for_timeout(1000); print('CEK:', (await pg.locator('#fm').inner_text()).replace("\n"," | ")[:300])
        await pg.click('[data-yeni="cek"]'); await pg.wait_for_timeout(300); await pg.fill('#ed_2','150.000'); await pg.fill('#ed_5','Test Firma'); await pg.fill('#ed_6','123456'); await pg.fill('#ed_7','Garanti'); await pg.click('#edK2'); await pg.wait_for_timeout(1000)
        print('CEK2:', (await pg.locator('#fm .card').first.inner_text()).replace("\n"," | ")[:300])
        await pg.goto(B+"#finans/sabit"); await pg.wait_for_timeout(900); await pg.locator('[data-ed^="fin_sabitler"]').first.click(); await pg.wait_for_timeout(300); await pg.fill('#ed_3','460.000'); await pg.click('#edK2'); await pg.wait_for_timeout(900)
        print('SABIT:', (await pg.locator('[data-ed^="fin_sabitler"]').first.inner_text()).replace("\n"," "))
        print('hatalar',errs); await b.close()
asyncio.run(main())
