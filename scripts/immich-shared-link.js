#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const usage = `Usage: npm run immich:link -- <share-url> [options]

Options:
  --asset <number>       Select an asset from the share (default: 1)
  --frontmatter <path>   Write the URL to a Markdown file's frontmatter
  --help                 Show this help message`;

export function parseSharedLink(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error('Provide a valid Immich shared URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('The Immich shared URL must use HTTP or HTTPS.');
  }

  const segments = url.pathname.split('/').filter(Boolean);
  const shareIndex = segments.indexOf('share');
  const key = segments[shareIndex + 1];

  if (shareIndex === -1 || !key) {
    throw new Error('The URL must contain an Immich /share/<key> path.');
  }

  return {
    origin: url.origin,
    basePath: `/${segments.slice(0, shareIndex).join('/')}`.replace(/\/$/, ''),
    key,
  };
}

export function createThumbnailUrl(sharedLink, assetId) {
  const url = new URL(
    `${sharedLink.basePath}/api/assets/${encodeURIComponent(assetId)}/thumbnail`,
    sharedLink.origin,
  );

  url.searchParams.set('size', 'preview');
  url.searchParams.set('edited', 'true');
  url.searchParams.set('key', sharedLink.key);
  return url.href;
}

export function updateFrontmatter(content, thumbnailUrl) {
  const match = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---(?:\r?\n|$))/);

  if (!match) {
    throw new Error('The Markdown file must start with YAML frontmatter.');
  }

  const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = match[2].split(lineEnding);
  const heroImageIndex = lines.findIndex((line) => line.startsWith('heroImage:'));

  if (heroImageIndex === -1) {
    lines.push('heroImage:', '  remote: true', `  src: ${thumbnailUrl}`);
  } else {
    let end = heroImageIndex + 1;

    while (end < lines.length && /^\s/.test(lines[end])) {
      end += 1;
    }

    lines.splice(
      heroImageIndex,
      end - heroImageIndex,
      'heroImage:',
      '  remote: true',
      `  src: ${thumbnailUrl}`,
    );
  }

  const remoteFlagIndex = lines.findIndex((line) =>
    line.startsWith('heroImageRemote:'),
  );
  if (remoteFlagIndex !== -1) {
    lines.splice(remoteFlagIndex, 1);
  }

  return `${match[1]}${lines.join(lineEnding)}${match[3]}${content.slice(match[0].length)}`;
}

export function parseArguments(args) {
  const options = { asset: 1, frontmatter: undefined, shareUrl: undefined };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === '--help') {
      return { help: true };
    }

    if (argument === '--asset') {
      const asset = Number(args[index + 1]);

      if (!Number.isInteger(asset) || asset < 1) {
        throw new Error('--asset must be a positive whole number.');
      }

      options.asset = asset;
      index += 1;
      continue;
    }

    if (argument === '--frontmatter') {
      const path = args[index + 1];

      if (!path) {
        throw new Error('--frontmatter requires a Markdown file path.');
      }

      options.frontmatter = path;
      index += 1;
      continue;
    }

    if (argument.startsWith('--') || options.shareUrl) {
      throw new Error(`Unexpected argument: ${argument}`);
    }

    options.shareUrl = argument;
  }

  if (!options.shareUrl) {
    throw new Error('Provide an Immich shared URL.');
  }

  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.help) {
    console.log(usage);
    return;
  }

  const sharedLink = parseSharedLink(options.shareUrl);
  const detailsUrl = new URL(
    `${sharedLink.basePath}/api/shared-links/me`,
    sharedLink.origin,
  );
  detailsUrl.searchParams.set('key', sharedLink.key);

  const response = await fetch(detailsUrl, {
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Immich returned ${response.status} while resolving the shared link.`,
    );
  }

  const share = await response.json();
  const asset = share.assets?.[options.asset - 1];

  if (!asset?.id) {
    throw new Error(`Shared link does not contain asset ${options.asset}.`);
  }

  const thumbnailUrl = createThumbnailUrl(sharedLink, asset.id);
  const frontmatter = `heroImage:\n  remote: true\n  src: ${thumbnailUrl}`;

  if (options.frontmatter) {
    const content = await readFile(options.frontmatter, 'utf8');
    await writeFile(
      options.frontmatter,
      updateFrontmatter(content, thumbnailUrl),
      'utf8',
    );
    console.log(`Updated ${options.frontmatter}`);
  }

  console.log(frontmatter);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });
}
