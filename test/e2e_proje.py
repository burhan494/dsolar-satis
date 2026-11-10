import asyncio
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"; O="/home/claude/pb/ekran/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e))); pg.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
        async def gir(e):
            await pg.goto(B); await pg.evaluate("localStorage.clear()"); await pg.goto(B); await pg.fill('#gE',e); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        await gir('satis2-test@ornek.test'); print('satis menu', await pg.locator('nav a').all_inner_texts())
        await pg.goto(B+"#teklifler"); await pg.wait_for_timeout(800)
        await pg.locator('button[data-d="Anlaşıldı"]').first.click(); await pg.wait_for_timeout(1200)
        print('toast', await pg.locator('.toast').all_inner_texts())
        await pg.goto(B+"#adaylar"); await pg.wait_for_timeout(600); await pg.click('button[data-c="Sözleşme"]'); await pg.wait_for_timeout(300)
        await pg.locator('#lst a.row').first.click(); await pg.wait_for_timeout(1000)
        print('baslat butonu', await pg.locator('#pBasla').count(), 'bedel', await pg.input_value('#pBed0'))
        await pg.fill('#pBas','2026-10-01'); await pg.click('#pBasla'); await pg.wait_for_timeout(1200)
        print('proje karti', (await pg.locator('#prjKart h3').inner_text()), '|', (await pg.locator('#prjKart .uyari, #prjKart .bilgi').first.inner_text())[:200])
        await pg.locator('[data-pa="montaj"]').click(); await pg.wait_for_timeout(300); print('montaj kilit toast', await pg.locator('.toast').last.inner_text())
        await pg.locator('[data-pa="ges_uygunluk"]').click(); await pg.wait_for_timeout(300); await pg.select_option('#paD','Tamamlandı'); await pg.fill('#paS','Batur'); await pg.click('#paK'); await pg.wait_for_timeout(1200)
        print('sonra', (await pg.locator('#prjKart h3').inner_text()), '| montaj satiri:', await pg.locator('[data-pa="montaj"]').inner_text())
        await pg.screenshot(path=O+"p1_proje.png",full_page=True)
        await pg.goto(B+"#projeler"); await pg.wait_for_timeout(800); print('projeler:', (await pg.locator('#m').inner_text()).replace("\n"," | ")[:300])
        await pg.screenshot(path=O+"p2_projeler.png")
        await gir('burhan-test@ornek.test'); await pg.goto(B+"#projeler"); await pg.wait_for_timeout(800); print('yon menu', await pg.locator('nav a').all_inner_texts())
        await pg.locator('#m a.row').first.click(); await pg.wait_for_timeout(1500); print('karlilik:', (await pg.locator('#prjKar').inner_text())[:200])
        await pg.screenshot(path=O+"p3_nav.png")
        print('hatalar',errs); await b.close()
asyncio.run(main())
