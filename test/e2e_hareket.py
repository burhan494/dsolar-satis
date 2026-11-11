import asyncio
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"; O="/home/claude/pb/ekran/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e))); pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto(B); await pg.evaluate("localStorage.clear()"); await pg.goto(B)
        await pg.fill('#gE','burhan-test@ornek.test'); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        await pg.goto(B+"#finans/hareket"); await pg.wait_for_timeout(900); await pg.click('#hPl'); await pg.wait_for_timeout(900)
        print('baslik', await pg.locator('#fm .card h3').first.inner_text())
        await pg.locator('[data-he]').first.click(); await pg.wait_for_timeout(400)
        await pg.fill('#eU','2.250.000'); await pg.fill('#eT','2026-12-30'); await pg.click('#eKK'); await pg.wait_for_timeout(1000)
        print('sonra', await pg.locator('#fm .card h3').first.inner_text(), '|', (await pg.locator('[data-he]').filter(has_text='✓').first.inner_text()).replace("\n"," "))
        await pg.click('#hKs'); await pg.wait_for_timeout(800); print('kontrolsuz', await pg.locator('#hKs').inner_text(), await pg.locator('[data-he]').count())
        # gerceklesti: hesap sor
        await pg.locator('[data-g]').first.click(); await pg.wait_for_timeout(500); print('gerceklesti formu', await pg.locator('#hEd .uyari').count(), await pg.input_value('#eD'))
        await pg.select_option('#eH', index=1); await pg.select_option('#ePb', await pg.evaluate("window._HA[document.getElementById('eH').value].pb")); await pg.click('#eKK'); await pg.wait_for_timeout(1000)
        await pg.screenshot(path=O+"h1.png", full_page=True)
        await pg.click('#hYeni'); await pg.wait_for_timeout(400); print('ekle formu', await pg.locator('#hK2').count())
        print('hatalar',errs); await b.close()
asyncio.run(main())
