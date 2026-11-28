"""Régénère pnp.pdf (Print & Play) et regles.pdf (règles illustrées) à partir de l'app.
Usage : python3 tools/make_pdfs.py  (depuis la racine du dépôt). À lancer après chaque modification du jeu."""
import asyncio, pathlib
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1200, 'height': 900})
        await pg.add_init_script("Object.defineProperty(window,'EMPIRES_FIREBASE',{value:null,writable:false})")
        url = (ROOT / 'index.html').as_uri()
        await pg.goto(url + '#imprimer'); await pg.wait_for_timeout(1200)
        await pg.pdf(path=str(ROOT / 'pnp.pdf'), format='A4', print_background=True, prefer_css_page_size=True)
        await pg.goto(url + '#regles'); await pg.wait_for_timeout(1200)
        await pg.emulate_media(media='print')
        await pg.pdf(path=str(ROOT / 'regles.pdf'), format='A4', print_background=True, margin={'top': '12mm', 'bottom': '12mm', 'left': '12mm', 'right': '12mm'})
        await b.close()
    print('pnp.pdf et regles.pdf régénérés')
asyncio.run(main())
