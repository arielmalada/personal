# arielmalada.id

Personal portfolio and blog for [Ariel Malada](https://arielmalada.id), built with Astro 7 and plain CSS. The site is statically generated and packaged as an unprivileged Nginx container for portable self-hosting.

The design is based on the MIT-licensed [Astro Keel](https://github.com/kpab/astro-keel) theme.

## Requirements

- Node.js 22.12 or newer; Node.js 24 is used in CI and Docker
- npm
- Docker, only when building the production image

## Development

```sh
npm install
npm run dev
```

Draft work and blog entries are visible in development. Production builds exclude every entry with `draft: true`.

## Quality checks

```sh
npm run format:check
npm run check
npm run build
```

`npm run build` also generates the Pagefind search index in `dist/pagefind`.

## Content

Portfolio entries live in `src/content/works/`. Blog posts live in `src/content/blog/`. Both accept Markdown and MDX.

Work frontmatter:

```yaml
---
title: Project name
description: A concise project summary.
tech: ['Astro', 'TypeScript']
link: https://example.com
repo: https://github.com/example/project
role: Frontend developer
order: 1
publishDate: 2026-01-01
draft: true
---
```

Blog frontmatter:

```yaml
---
title: Post title
description: A concise summary for listings and search.
heroImage: ./post-hero.jpg
heroImageRemote: false
publishDate: 2026-01-01
updatedDate: 2026-01-02
tags: ['astro', 'frontend']
draft: true
---
```

Set `draft: false` when an entry is ready for the production build.
Set `heroImageRemote: true` for externally hosted hero images; local images are optimized by Astro by default.

## Container

```sh
docker build -t arielmalada-personal-site .
docker run --rm -p 8080:8080 arielmalada-personal-site
```

The image serves the static site at `http://localhost:8080`. It does not include TLS or a public deployment configuration; a reverse proxy or Cloudflare Tunnel can be added at the host level later.

## Docker Compose

The Compose configuration runs the published GHCR image as a read-only, non-root service. It publishes port `8080` on the host for a reverse proxy, Cloudflare Tunnel, or access from the local network.

```sh
docker compose pull
docker compose up -d
docker compose ps
```

Update and restart the site with:

```sh
docker compose pull
docker compose up -d --remove-orphans
```

Copy `.env.example` to `.env` only when you need to override the image tag, bind address, or host port. Set `SITE_BIND=127.0.0.1` to restrict access to services running directly on the same host.

On TrueNAS SCALE, use this file with **Apps > Install via YAML**, or configure a Custom App with image `ghcr.io/arielmalada/personal:edge`, container port `8080`, and an available host port. The GHCR package must be public unless registry credentials are configured in TrueNAS.

## Automation

`.github/workflows/ci.yml` validates formatting, Astro types, content schemas, and the production build.

`.github/workflows/container.yml` validates multi-architecture images on pull requests and publishes `linux/amd64` and `linux/arm64` images to GitHub Container Registry from `main`, version tags, and manual runs.

## License

The project retains the Astro Keel MIT license in [`LICENSE`](./LICENSE).
