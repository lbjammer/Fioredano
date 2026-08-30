#!/usr/bin/env python3
"""
Build a single self-contained HTML file from the multi-file site.

The published Artifact preview runs under a content-security policy that blocks
every external image, stylesheet and font host, so the shareable version has to
carry its CSS, JS, webfonts and photos inline. This script does that without
touching the real site, which keeps its separate files.

    python3 build/inline.py            ->  dist/fioredano-artifact.html

The output has no <!doctype>, <html>, <head> or <body> wrapper: the Artifact
host supplies that skeleton and expects page content only.
"""

import base64
import mimetypes
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
OUT = DIST / "fioredano-artifact.html"


def data_uri(path: pathlib.Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def main() -> int:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "assets/css/site.css").read_text(encoding="utf-8")
    js = (ROOT / "assets/js/site.js").read_text(encoding="utf-8")

    # Keep only what lives between <body> and </body>; the host wraps the rest.
    body = re.search(r"<body[^>]*>(.*)</body>", html, re.S)
    if not body:
        print("error: could not find <body> in index.html", file=sys.stderr)
        return 1
    doc = body.group(1)

    # <picture> gives the browser a WebP it will always prefer, so inlining both
    # encodings would double the payload for nothing. Drop the WebP source and
    # inline the JPEG only.
    doc = re.sub(r"\s*<source[^>]*type=\"image/webp\"[^>]*>", "", doc)

    # Photos -> data URIs.
    used = set()

    def swap(match: "re.Match[str]") -> str:
        rel = match.group(2)
        path = ROOT / rel
        if not path.exists():
            print(f"warn: missing asset {rel}", file=sys.stderr)
            return match.group(0)
        used.add(rel)
        return f'{match.group(1)}="{data_uri(path)}"'

    doc = re.sub(r'(src|href)="(assets/img/[^"]+)"', swap, doc)

    # The site script is inlined, so drop its <script src>.
    doc = re.sub(r'\s*<script src="assets/js/site\.js"></script>', "", doc)

    # Self-hosted webfonts -> data URIs, so @font-face resolves inside the sandbox.
    def swap_font(match: "re.Match[str]") -> str:
        path = ROOT / "assets/fonts" / match.group(1)
        if not path.exists():
            print(f"warn: missing font {match.group(1)}", file=sys.stderr)
            return match.group(0)
        return f'url("{data_uri(path)}")'

    css, n_fonts = re.subn(r'url\("\.\./fonts/([^"]+)"\)', swap_font, css)

    # The artifact is one page: the thank-you redirect has nowhere to go, and the
    # sandbox blocks navigation anyway. Keep the visitor on the form instead.
    js = js.replace("redirect: 'thank-you.html'", "redirect: ''")

    page = (
        f"<title>Fioredano Construction</title>\n<style>\n{css}\n</style>\n"
        f"{doc}\n<script>\n{js}\n</script>\n"
    )

    DIST.mkdir(exist_ok=True)
    OUT.write_text(page, encoding="utf-8")

    size = OUT.stat().st_size
    print(
        f"wrote {OUT.relative_to(ROOT)}  ({size / 1048576:.2f} MB, "
        f"{len(used)} images and {n_fonts} fonts inlined)"
    )
    if size > 16 * 1024 * 1024:
        print("error: over the 16 MB artifact limit", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
