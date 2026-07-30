SELF-HOSTED JAPANESE FONT FOR THE 3D NEON SIGNS
================================================

The Tokyo neon signs in src/three/NeonCity.jsx render Japanese text. drei's
built-in font is Latin-only, so to show kanji/kana you must place a Japanese
font file here:

    public/fonts/NotoSansJP.woff

UNTIL you do, the signs automatically fall back to their Latin labels
(CYBER, TOKYO, RAMEN, …) — the scene never shows tofu (□) boxes.

HOW TO ADD THE FONT (one of these):

1) Download Noto Sans JP (Regular) as .woff and save it as the exact name above.
   Quick command (run from the Myweb_Frontend folder):

     mkdir -p public/fonts
     curl -L -o public/fonts/NotoSansJP.woff \
       "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff"

   (.woff is required — troika's text engine does NOT read .woff2.)

2) Or use any .woff/.ttf/.otf Japanese font you like; just name it
   NotoSansJP.woff (or change the JP_FONT path in NeonCity.jsx to match).

Once the file is present, reload the site — the signs switch from the Latin
fallback to full Japanese automatically (a one-time GET confirms the font
exists, then troika loads it). Commit the .woff so it deploys with the site.
