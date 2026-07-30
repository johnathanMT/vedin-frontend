# Memory Gallery — images

Drop your photos here (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`).

To add a photo to the gallery you do **two** things:

1. Put the image file in this folder, e.g. `osaka-night.jpg`.
2. Add **one** entry to `src/data/galleryData.js` whose `file` matches the filename.

That's it — Vite bundles + hashes the image automatically, and `GallerySection.jsx`
resolves it at build time. No path strings, no `public/` URLs, no 404s.

> Tip: keep images reasonably sized (≤ ~1600px wide, compressed) for fast loads.
