import asyncio
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"; O="/home/claude/pb/ekran/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e))); pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto(B); await pg.evaluate("localStorage.clear()"); await pg.goto(B)
        await pg.fill('#gE','burhan-test@ornek.test'); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        await pg.goto(B+"#finans"); await pg.wait_for_timeout(1200); print('SEKME', await pg.locator('.chips button').all_inner_texts())
        print('KASA', (await pg.locator('#fm .card').first.inner_text()).replace("\n"," | ")[:300]); await pg.screenshot(path=O+"n1_kasa.png", full_page=True)
        await pg.goto(B+"#finans/akis"); await pg.wait_for_timeout(1500); print('AKIS', (await pg.locator('#fm .kv').inner_text()).replace("\n"," | "))
        await pg.screenshot(path=O+"n2_akis.png", full_page=True)
        c=pg.locator('[data-hc]').filter(has_text='.'); 
        if await c.count(): await c.first.click(); await pg.wait_for_timeout(500); print('DETAY', (await pg.locator('#nDet').inner_text()).replace("\n"," | ")[:200])
        await pg.goto(B+"#finans/plan"); await pg.wait_for_timeout(1200)
        await pg.select_option('#pT','Cari ödeme (tedarikçi)'); await pg.fill('#pC','Test Tedarikçi'); await pg.fill('#pU','250.000'); await pg.click('#pK'); await pg.wait_for_timeout(1000)
        print('PLAN', (await pg.locator('#fm .card').nth(2).inner_text()).replace("\n"," | ")[:300])
        await pg.locator('[data-od]').first.click(); await pg.wait_for_timeout(400); print('odeme formu hesap secenek', await pg.locator('#odH option').count()); await pg.click('#odK'); await pg.wait_for_timeout(1000)
        await pg.screenshot(path=O+"n3_plan.png", full_page=True)
        await pg.goto(B+"#finans/ortak"); await pg.wait_for_timeout(1200); await pg.fill('#sgT','100.000'); await pg.dispatch_event('#sgT','input'); await pg.wait_for_timeout(200)
        print('SERMAYE', await pg.input_value('#sgB'), await pg.input_value('#sgBt'), (await pg.locator('#sgN').inner_text()))
        await pg.click('#sgK'); await pg.wait_for_timeout(1200); print('ORTAK', (await pg.locator('#fm .card').first.inner_text()).replace("\n"," | ")[:200])
        await pg.goto(B+"#finans/diger"); await pg.wait_for_timeout(600); await pg.click('text=Sabit giderler'); await pg.wait_for_timeout(800); print('SABIT ok', await pg.locator('[data-ed^="fin_sabitler"]').count(), await pg.locator('.chips button.on').inner_text())
        await pg.set_viewport_size({'width':1280,'height':900}); await pg.goto(B+"#finans/akis"); await pg.wait_for_timeout(1500); await pg.screenshot(path=O+"n4_akis_genis.png", full_page=True)
        print('hatalar',errs); await b.close()
asyncio.run(main())
