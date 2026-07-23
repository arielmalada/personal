import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createThumbnailUrl,
  parseArguments,
  parseSharedLink,
  updateFrontmatter,
} from './immich-shared-link.js';

const shareUrl =
  'https://immich.example.com/share/share-key?existing-query=ignored';

test('creates a public thumbnail URL from a shared link', () => {
  const sharedLink = parseSharedLink(shareUrl);

  assert.equal(
    createThumbnailUrl(sharedLink, 'asset-id'),
    'https://immich.example.com/api/assets/asset-id/thumbnail?size=preview&edited=true&key=share-key',
  );
});

test('keeps a reverse-proxy base path', () => {
  const sharedLink = parseSharedLink(
    'https://photos.example.com/immich/share/share-key',
  );

  assert.equal(
    createThumbnailUrl(sharedLink, 'asset-id'),
    'https://photos.example.com/immich/api/assets/asset-id/thumbnail?size=preview&edited=true&key=share-key',
  );
});

test('updates existing hero image frontmatter to a remote source object', () => {
  const markdown = `---
title: Test post
heroImage: https://old.example.com/image.jpg
heroImageRemote: false
---

Post body.
`;

  assert.equal(
    updateFrontmatter(markdown, 'https://immich.example.com/thumbnail'),
    `---
title: Test post
heroImage:
  remote: true
  src: https://immich.example.com/thumbnail
---

Post body.
`,
  );
});

test('replaces an existing hero image source object', () => {
  const markdown = `---
title: Test post
heroImage:
  remote: false
  src: ./local-image.jpg
---

Post body.
`;

  assert.equal(
    updateFrontmatter(markdown, 'https://immich.example.com/thumbnail'),
    `---
title: Test post
heroImage:
  remote: true
  src: https://immich.example.com/thumbnail
---

Post body.
`,
  );
});

test('parses the asset and frontmatter options', () => {
  assert.deepEqual(
    parseArguments([
      shareUrl,
      '--asset',
      '2',
      '--frontmatter',
      'src/content/blog/post.md',
    ]),
    {
      asset: 2,
      frontmatter: 'src/content/blog/post.md',
      shareUrl,
    },
  );
});
