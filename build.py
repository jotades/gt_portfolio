"""Builds a single, self-contained HTML file from this folder.

    python build.py            -> dist/giovanni-tauro-portfolio.html

The site works as it is from index.html (for GitHub Pages, or a local server).
The single file is for places that want one file: the claude.ai artifact, Netlify Drop, email.
"""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).parent
MIME = {".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml"}

def data_uri(path):
    p = ROOT / path
    return f"data:{MIME[p.suffix.lower()]};base64," + base64.b64encode(p.read_bytes()).decode()

html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "css/site.css").read_text(encoding="utf-8")
css = re.sub(r"url\(\.\./(assets/img/[^)]+)\)", lambda m: "url(" + data_uri(m.group(1)) + ")", css)
html = html.replace('<link rel="stylesheet" href="css/site.css">', "<style>\n" + css + "</style>", 1)
html = re.sub(r'<script src="(js/[^"]+)"></script>', lambda m: "<script>\n" + (ROOT / m.group(1)).read_text(encoding="utf-8") + "</script>", html)
html = re.sub(r'(src|href)="(assets/img/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', html)
out = ROOT / "dist" / "giovanni-tauro-portfolio.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"{out.relative_to(ROOT)}  {out.stat().st_size / 1e6:.1f} MB")
