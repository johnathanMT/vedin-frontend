# 🎬 Video Showcase — reels folder

The "Highlights in Motion" master-detail gallery (`src/components/VideoShowcase.jsx`)
loads its 4 reels from **this folder** by filename. Drop your files here — no code
change needed for the videos themselves.

## Required filenames

| Reel | Video (required) | Poster (optional but recommended) |
|------|------------------|-----------------------------------|
| 1 | `reel-1.mp4` | `reel-1.webp` |
| 2 | `reel-2.mp4` | `reel-2.webp` |
| 3 | `reel-3.mp4` | `reel-3.webp` |
| 4 | `reel-4.mp4` | `reel-4.webp` |

- **Missing a file?** The card shows a sleek themed gradient + a hint — never a broken player.
- **Poster** = the still shown before the video plays (and as the thumbnail). Keep it ≤ 80 KB WebP.

## Asset specs (keep it fast)
- **Format:** H.264 **MP4** (`yuv420p`), `+faststart`.
- **Length:** ~10 s. **Size:** ≤ 4 MB each (hard ceiling 6 MB).
- **Resolution:** 1280×720 is plenty (it renders in a ~960px frame).
- Encode example:
  ```bash
  ffmpeg -i raw.mov -t 10 -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow \
         -c:a aac -b:a 96k -movflags +faststart -pix_fmt yuv420p public/reels/reel-1.mp4
  # poster frame:
  ffmpeg -i public/reels/reel-1.mp4 -vframes 1 -vf "scale=1280:-2" -q:v 3 /tmp/f.png
  cwebp -q 80 /tmp/f.png -o public/reels/reel-1.webp
  ```

## Updating the captions / descriptions / order
Edit the `REELS` array near the top of `src/components/VideoShowcase.jsx`.
`caption` (one line under the thumbnail) and `desc` (longer line under the master
player) are **i18n objects** — only `en` is required; the rest fall back to `en`.

```js
{
  id: 'reel-1',                 // ← must match reel-1.mp4 / reel-1.webp
  accent: '#b8860b',            // gradient/placeholder tint (Batman gold/maroon)
  caption: { en: 'The Journey', mm: '…', jp: '…', zh: '…', vn: '…', ne: '…', id: '…' },
  desc:    { en: 'Where it begins …', mm: '…', jp: '…', /* … */ },
}
```
Want more/fewer than 4 reels? Add/remove entries — the thumbnail rail adapts.

---

## ✅ 100%-SAFE AI-VIDEO CHECKLIST (permanent reference)

> *General information, not legal advice. For high-stakes use, consult an IP
> attorney in your jurisdiction.* Using AI to animate **your own face** into
> **original, generic** cinematic scenes is generally safe — the risk is what
> else is in frame and which tool you use. Follow all six:

1. **Your face only.** Your likeness = yours. Never use a real person's face/voice
   without **written consent**; never deepfake celebrities or public figures.
2. **Original, generic scenes.** Evoke a *mood* (space station, neon city, misty
   forest) — never reproduce a recognizable movie's set, shots, or characters
   (that's an infringing derivative work).
3. **No trademarks / logos / IP characters.** Keep brand marks, studio logos, and
   characters (e.g. Batman, product designs) out of frame. *(A "Batman-theme"
   colour palette on your site is fine; an actual Bat-logo is not.)*
4. **AI tool licence grants commercial rights.** Use a tool whose Terms of Service
   explicitly allow commercial use AND give you output ownership (e.g. paid
   Runway / Pika / Kling / Sora / Adobe Firefly). **Save a PDF/screenshot of the
   ToS at creation time.**
5. **Music = royalty-free or licensed.** The #1 takedown cause. Use Epidemic
   Sound / Artlist / YouTube Audio Library, or AI music with commercial rights —
   and keep the licence/receipt.
6. **Keep records.** A folder with tool ToS, music licences, and consent forms.

**Do these six → safe to publish on a public professional portfolio.**
