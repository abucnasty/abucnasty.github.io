export interface BlogPostMeta {
  slug: string;
  title: string;
  /** ISO date string, e.g. "2026-05-11" */
  date: string;
  description?: string;
  tags?: string[];
  /** 'markdown' → src/blog/posts/<slug>/index.md, 'tsx' → src/blog/posts/<slug>/index.tsx */
  type: 'markdown' | 'tsx';
}

/**
 * Add new blog posts here.
 * For a markdown post: create src/blog/posts/<slug>/index.md and set type: 'markdown'.
 * For a custom TSX post: create src/blog/posts/<slug>/index.tsx with a default export
 *   React component and set type: 'tsx'.
 */
export const blogPosts: BlogPostMeta[] = [
  {
    slug: 'ups-wars-utility-science-announcement',
    title: 'UPS Wars: Utility Science Entries Have Opened',
    date: '2026-05-11',
    description: 'Competition entry and form submission details',
    tags: ['ups-wars'],
    type: 'markdown',
  },
];
