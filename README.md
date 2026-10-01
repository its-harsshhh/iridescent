# Iridescent

Turn any logo into a fluid, iridescent animation — inspired by the tiny animated “PRO” SVG from Refero.

Drop in a logo (PNG, SVG, JPG, WebP) or type some text, pick a colour preset, tweak speed / flow / shimmer / glow, and export:

- **MP4** in social frames (1:1, 4:5, 9:16, 16:9) up to 1440p
- **GIF** for Slack, Notion, email
- **Animated SVG** — a single self-contained file; SVG logos stay vector and weigh a few KB
- **PNG** still or a transparent PNG frame sequence

No build step and no backend: everything renders in the browser with SVG filters
(`feTurbulence` → `feDisplacementMap` → `feGaussianBlur` → `feColorMatrix` → `feComponentTransfer`).

## Run locally

Serve the `public/` folder with any static server, e.g.

```bash
npx serve public
```

## Deploy

Hosted on Cloudflare (Workers static assets) at https://iridescent.harshpal653.workers.dev:

```bash
npx wrangler deploy
```
