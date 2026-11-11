import asyncio
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"; O="/home/claude/pb/ekran/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        pg=await b.new_page(viewport={'width':1280,'height':900}); pg.on("pageerror",lambda e: errs.append(str(e)))
        await pg.goto(B); await pg.evaluate("localStorage.clear()"); await pg.goto(B)
        await pg.fill('#gE','burhan-test@ornek.test'); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        await pg.goto(B+"#ges"); await pg.wait_for_timeout(1500); await pg.screenshot(path=O+"g1.png", full_page=True)
        print('TABLO', (await pg.locator('table.nt').inner_text()).replace("\n"," | ")[:700])
        await pg.click('#gSenk'); await pg.wait_for_timeout(2500); print('toast', await pg.locator('.toast').all_inner_texts())
        await pg.goto(B+"#finans/akis"); await pg.wait_for_timeout(1500)
        c=pg.locator('tr:has-text("GES geliri") td[data-hc]'); print('GES akis', [ (await c.nth(i).inner_text()) for i in range(min(6,await c.count()))])
        await c.nth(0).click(); await pg.wait_for_timeout(400); print('DET', (await pg.locator('#nDet').inner_text()).replace("\n"," | ")[:300])
        await pg.goto(B+"#ges"); await pg.wait_for_timeout(1500); await pg.locator('[data-kt]').first.click(); await pg.wait_for_timeout(300); await pg.click('#ktK'); await pg.wait_for_timeout(1500)
        print('SONRA', (await pg.locator('table.nt tbody tr').last.inner_text()).replace("\n"," | "))
        await pg.goto(B+"#finans/akis"); await pg.wait_for_timeout(1500); c=pg.locator('tr:has-text("GES geliri") td[data-hc]'); print('GES akis2', [ (await c.nth(i).inner_text()) for i in range(min(6,await c.count()))])
        print('hatalar',errs); await b.close()
asyncio.run(main())
