import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { withBase } from '../lib/url';
import { SITE } from '../consts';
import { getBlogPosts } from '../lib/content';

export async function GET(context: APIContext) {
  const posts = await getBlogPosts();

  return rss({
    title: SITE.title,
    description: SITE.rssDescription,
    site: context.site ?? 'https://arielmalada.id',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: withBase(`/blog/${post.id}/`),
      categories: post.data.tags,
    })),
  });
}
