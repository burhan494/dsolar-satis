import asyncio, os
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"; O="/home/claude/pb/ekran/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e))); pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto(B); await pg.evaluate("localStorage.clear()"); await pg.goto(B)
        await pg.fill('#gE','burhan-test@ornek.test'); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        # bir hareketi bir hesaba bagla (baglanti kaldirma testi)
        await pg.goto(B+"#finans/hesap"); await pg.wait_for_timeout(900)
        await pg.set_input_files('#ykD', os.environ['KASA']); await pg.wait_for_timeout(1500)
        print('ONIZLEME:', (await pg.locator('#ykO').inner_text()).replace("\n"," | ")[:700])
        await pg.click('#ykK'); await pg.wait_for_timeout(1000)
        for i in range(120):
            if await pg.locator('#ykD').count() and not await pg.locator('#ykK').count(): break
            if await pg.locator('#ykS .uyari').count(): break
            await pg.wait_for_timeout(1000)
        print('SONRA:', (await pg.locator('#fm').inner_text()).replace("\n"," | ")[:900])
        await pg.screenshot(path=O+"k1_hesap.png", full_page=True)
        await pg.goto(B+"#finans/kredi"); await pg.wait_for_timeout(900); print('KREDI:', [t for t in (await pg.locator('#fm').inner_text()).split("\n") if 'Koç' in t or 'kalan' in t][:3])
        await pg.goto(B+"#finans"); await pg.wait_for_timeout(900); print('OZET:', (await pg.locator('.card h3').first.inner_text()))
        print('hatalar',errs); await b.close()
asyncio.run(main())
