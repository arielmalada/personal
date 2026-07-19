export const SITE = {
  title: 'Ariel Malada',
  description:
    'Frontend engineer focused on thoughtful interfaces, user experience, and the systems behind them.',
  rssDescription:
    'Writing about frontend engineering, user experience, and learning in public.',
  ogImage: '/og.jpg',
  email: 'arielmalada@outlook.com',
  location: 'Tampere, Finland',
} as const;

export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about/', label: 'About' },
  { href: '/works/', label: 'Works' },
  { href: '/photos/', label: 'Photos' },
  { href: '/blog/', label: 'Blog' },
  { href: '/search/', label: 'Search' },
] as const;

export const SOCIAL_LINKS = [
  { href: 'https://github.com/arielmalada', label: 'GitHub' },
  { href: 'https://linkedin.com/in/arielmld', label: 'LinkedIn' },
  { href: 'https://www.instagram.com/arielmld/', label: 'Instagram' },
  { href: `mailto:${SITE.email}`, label: 'Email' },
] as const;
