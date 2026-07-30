# Year-in-Focus — month festival images (zero-config)

Drop a photo named after the **month** (lowercase) and it auto-binds to that
card in the "Myanmar · 12 Months of Festivals" carousel — no code changes.

Accepted names (any of `.webp` / `.jpg` / `.jpeg` / `.png` / `.avif`):

```
january.webp   february.webp   march.webp     april.webp
may.webp       june.webp       july.webp      august.webp
september.webp october.webp    november.webp  december.webp
```

- Vite bundles + content-hashes them automatically (cache-busting).
- If a month's image is missing, the card shows a sleek themed placeholder
  (never a broken-image icon).
- Tip: ~1200px wide, compressed WebP keeps the carousel fast.
