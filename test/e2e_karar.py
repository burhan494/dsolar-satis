import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1366,'height':900}); errs=[]; pg.on("pageerror",lambda e: errs.append(str(e))); pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto("http://127.0.0.1:8090/"); await pg.evaluate("localStorage.clear()"); await pg.goto("http://127.0.0.1:8090/")
        await pg.fill('#gE','burhan-test@ornek.test'); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        await pg.goto("http://127.0.0.1:8090/#finans/akis"); await pg.wait_for_timeout(1800)
        k=pg.locator('.card:has(h3:has-text("Nakit açığı"))'); print('PANEL', (await k.inner_text()).replace("\n"," | ")[:900])
        await k.screenshot(path="/mnt/user-data/outputs/taslak/karar-paneli.png")
        await pg.click('[data-kr="ertele"]'); await pg.wait_for_timeout(1500); print('ertele sonrası', (await pg.locator('.card:has(h3:has-text("Nakit açığı")) h3').first.inner_text()))
        await pg.click('[data-kr="kredi"]'); await pg.wait_for_timeout(1500); print('kredi sonrası', await pg.locator('.card h3:has-text("Nakit açığı")').count())
        print('hatalar',errs); await b.close()
asyncio.run(main())
