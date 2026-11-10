import asyncio
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2); pg=await ctx.new_page(); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e)[:200])); pg.on("dialog",lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto(B); await pg.fill('#gE','burhan-test@ornek.test'); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(700)
        for ad,fat,kwh,soz in [("Fatura 8000 sözleşme yok","8000","",""),("Fatura 5000","5.000","",""),("kWh 9000 soz 15","","9000","15"),("Fatura 300","300","","")]:
            await pg.goto(B+"#yeni"); await pg.wait_for_timeout(400)
            await pg.fill('#yAd',ad); await pg.fill('#yFat',fat); await pg.fill('#yKwh',kwh); await pg.fill('#ySoz',soz); await pg.fill('#yIlce','Urla')
            await pg.click('#yKay2'); await pg.wait_for_timeout(1000)
            t=await pg.locator('.card:has(h3:text("Ön hesap"))').inner_text()
            print(ad,'=>',' '.join(t.split())[:260])
            if ad=="Fatura 8000 sözleşme yok":
                await pg.click('#oA'); await pg.wait_for_timeout(300); print('  aktarılan:',await pg.input_value('#tK'),await pg.input_value('#tF'),await pg.input_value('#tN'))
                await pg.screenshot(path='ekran/7-on-hesap.png',full_page=True)
        await pg.goto(B+"#ekip"); await pg.wait_for_timeout(700)
        await pg.fill('[data-ay="kur"]','51,2'); await pg.click('#ayK'); await pg.wait_for_timeout(700)
        print('kur kaydı:',await pg.input_value('[data-ay="kur"]'))
        await pg.screenshot(path='ekran/8-ayarlar.png',full_page=True)
        print('HATALAR',errs); await b.close()
asyncio.run(main())
