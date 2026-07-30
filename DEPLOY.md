# Deploy to GitHub Pages

## Option 1 — Automated (GitHub Actions, recommended)

1. Push this folder to your `johnathanmt/Myweb` repo (replace the old files).
2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. In GitHub → Settings → Pages → set source to `gh-pages` branch.

---

## Option 2 — Manual one-time deploy

```bash
npm install
npm run build
# Copy dist/ contents to the repo root (or a /docs folder)
# Then in GitHub → Settings → Pages → set source to the branch/folder
```

---

## Local dev

```bash
npm install
npm run dev        # http://localhost:5173/Myweb/
```
