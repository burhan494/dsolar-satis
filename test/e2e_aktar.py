import asyncio
# BEACON_TEST_YEDEK: deneme amaçlı (gerçek olmayan) Beacon yedek dosyasının yolu; depoya konmaz
from playwright.async_api import async_playwright
B="http://127.0.0.1:8090/"; O="/home/claude/pb/ekran/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e)))
        await pg.goto(B); await pg.evaluate("localStorage.clear()"); await pg.goto(B)
        await pg.fill('#gE','burhan-test@ornek.test'); await pg.fill('#gS','Sifre-12345678'); await pg.click('#gB'); await pg.wait_for_timeout(800)
        for tur in [1,2]:
            await pg.goto(B+"#bugun"); await pg.wait_for_timeout(300); await pg.goto(B+"#ekip"); await pg.wait_for_timeout(800)
            await pg.set_input_files('#akD',__import__("os").environ["BEACON_TEST_YEDEK"]); await pg.wait_for_timeout(500)
            if tur==1: print((await pg.locator('#akO').inner_text())[:1500]); await pg.locator('#akO').screenshot(path=O+"a1_onizleme.png")
            await pg.click('#akK'); await pg.wait_for_selector('#akS .bilgi, #akS .uyari', timeout=30000)
            print('TUR',tur, await pg.locator('#akS').inner_text())
        for t in ["ozet","hareket","hesap","kredi","sabit","soru","ortak","varlik"]:
            await pg.goto(B+"#finans/"+t); await pg.wait_for_timeout(700); await pg.screenshot(path=O+f"b_{t}.png",full_page=True)
        await pg.goto(B+"#ges"); await pg.wait_for_timeout(700); await pg.screenshot(path=O+"b_ges.png",full_page=True)
        print('hatalar',errs); await b.close()
asyncio.run(main())
