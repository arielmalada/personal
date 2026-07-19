import { getCollection } from 'astro:content';

const includeDrafts = import.meta.env.DEV;

export async function getBlogPosts() {
  const posts = await getCollection(
    'blog',
    ({ data }) => includeDrafts || !data.draft,
  );
  return posts.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
}

export async function getWorkEntries() {
  const works = await getCollection(
    'works',
    ({ data }) => includeDrafts || !data.draft,
  );
  return works.sort((a, b) => {
    const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;
    return (
      orderA - orderB ||
      b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
    );
  });
}

export async function getPhotos() {
  const photos = await getCollection(
    'photos',
    ({ data }) => includeDrafts || !data.draft,
  );
  return photos.sort((a, b) => {
    const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;
    return (
      orderA - orderB ||
      b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
    );
  });
}
