import asyncio
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"; O="/home/claude/pb/ekran/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e))); pg.on("dialog", lambda d: asyncio.ensure_future(d.accept("1.500.000")))
        async def gir(e):
            await pg.goto(B); await pg.evaluate("localStorage.clear()"); await pg.goto(B); await pg.fill('#gE',e); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        await gir('burhan-test@ornek.test')
        print('menu:', await pg.locator('nav a').all_inner_texts())
        await pg.goto(B+"#finans/hesap"); await pg.wait_for_timeout(500)
        for ad,pb,bk in [("Ziraat TL","TRY","250.000"),("Kasa","TRY","12.500"),("Garanti USD","USD","8.000")]:
            await pg.fill('#kA',ad); await pg.select_option('#kP',pb); await pg.fill('#kB',bk); await pg.click('#kK'); await pg.wait_for_timeout(500)
        await pg.screenshot(path=O+"f1_hesap.png",full_page=True)
        await pg.goto(B+"#finans/hareket"); await pg.wait_for_timeout(600)
        for kat,tut,dur,tar in [("Satış tahsilatı","180.000","Gerçekleşti","2026-11-05"),("Malzeme","95.000","Gerçekleşti","2026-11-07"),("Maaş","140.000","Planlandı","2026-11-30"),("Amcor kira","4.350.000","Planlandı","2026-12-15")]:
            await pg.fill('#hT',tar); await pg.select_option('#hK',kat); await pg.fill('#hU',tut); await pg.select_option('#hD',dur); await pg.fill('#hA','test '+kat); await pg.click('#hK2'); await pg.wait_for_timeout(600)
        await pg.screenshot(path=O+"f2_hareket.png",full_page=True)
        await pg.goto(B+"#finans/kredi"); await pg.wait_for_timeout(500)
        await pg.fill('#rA','Test kredi'); await pg.fill('#rN','2.000.000'); await pg.fill('#rK','1.800.000'); await pg.fill('#rT','95.000'); await pg.click('#rE'); await pg.wait_for_timeout(500)
        await pg.locator('[data-kk]').first.click(); await pg.wait_for_timeout(600)
        await pg.screenshot(path=O+"f3_kredi.png",full_page=True)
        await pg.goto(B+"#finans/ortak"); await pg.wait_for_timeout(500)
        for o,y,u in [("Burhan","Aldı","60.000"),("Batur","Aldı","30.000")]:
            await pg.select_option('#oO',o); await pg.select_option('#oY',y); await pg.fill('#oU',u); await pg.click('#oK'); await pg.wait_for_timeout(500)
        print('ortak:', await pg.locator('.bilgi').first.inner_text())
        await pg.screenshot(path=O+"f4_ortak.png",full_page=True)
        await pg.goto(B+"#finans/varlik"); await pg.wait_for_timeout(500)
        await pg.fill('#vA','Test arsa'); await pg.fill('#vU','250.000'); await pg.click('#vK'); await pg.wait_for_timeout(500)
        await pg.screenshot(path=O+"f5_varlik.png",full_page=True)
        await pg.goto(B+"#finans"); await pg.wait_for_timeout(700)
        await pg.screenshot(path=O+"f6_ozet.png",full_page=True)
        await pg.goto(B+"#ges"); await pg.wait_for_timeout(600)
        for d,u,t,k,h in [("2026-09","1.180.000","1.150.000","4.100.000","2026-11-08"),("2026-10","930.000","980.000","3.600.000","")]:
            await pg.fill('#gD',d); await pg.dispatch_event('#gD','change'); await pg.fill('#gU',u); await pg.fill('#gT',t); await pg.fill('#gK',k); await pg.fill('#gH',h); await pg.click('#gK2'); await pg.wait_for_timeout(700)
        await pg.screenshot(path=O+"f7_ges.png",full_page=True)
        print('ges ozet:', (await pg.locator('.card').first.inner_text()).replace("\n"," | "))
        await gir('muh-test@ornek.test'); print('muhasebe menu:', await pg.locator('nav a').all_inner_texts())
        await pg.goto(B+"#finans"); await pg.wait_for_timeout(600); print('muhasebe sekmeler:', await pg.locator('.chips button').all_inner_texts())
        await pg.goto(B+"#ges"); await pg.wait_for_timeout(400); print('muhasebe #ges ->', await pg.evaluate("location.hash"))
        await gir('satis2-test@ornek.test'); print('satis menu:', await pg.locator('nav a').all_inner_texts())
        await pg.goto(B+"#finans"); await pg.wait_for_timeout(400); print('satis #finans ->', await pg.evaluate("location.hash"))
        print('hatalar', errs); await b.close()
asyncio.run(main())
