---
title: "Getting Started"
description: "A comprehensive guide on configuring your site, managing pages, publishing posts, and executing CLI commands in Mare Blog."
pubDate: 2026-08-30
featured: false
tags: [astro, blogging]
---

## 1. Deploying to Cloudflare Pages

You can deploy your own copy of Mare Blog using Cloudflare Pages' Git integration:

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/?to=/:account/pages/new/provider/github)

Sign in to Cloudflare, connect GitHub, and select your fork or copy of the
repository. Configure the project with:

| Setting                | Value        |
| :--------------------- | :----------- |
| Framework preset       | Astro        |
| Build command          | `pnpm build` |
| Build output directory | `dist`       |

The build command generates the static Astro site. Once the first deployment
succeeds, pushes to the connected branch trigger new builds.
After deployment, update `url` in `site.config.ts` to your site's public URL.

## 2. Configuring Your Site

Global site metadata and navigation are managed in `site.config.ts`.

This project ships with a working default configuration that you can customize to fit your site:

```typescript
export default defineConfig({
  lang: "en",
  title: "NapperPeng",
  description: "A minimal, lightning-fast personal blog built with Astro.",
  author: "紫竹为签",
  authorUrl: "https://github.com/NapperPeng",
  authorBio: "A passionate developer.",
  authorDetails:
    "A student with basic full-stack development skills who enjoys playing Minecraft.",
  authorLocation: "China",
  avatar: "/avatar.png",
  authorLinks: [
    {
      name: "GitHub",
      href: "https://github.com/NapperPeng",
      icon: "lucide:github",
    },
  ],
  url: "https://mare-blog.pages.dev",
  postsPerPage: 6,
  nav: [
    { name: "Home", href: "/", icon: "lucide:home" },
    { name: "Blog", href: "/blog", icon: "lucide:book-open" },
    { name: "Journal", href: "/journal", icon: "lucide:calendar-days" },
  ],
});
```

### Configuration Options Breakdown

#### Main Site Metadata

- `lang`: The site's language code.
- `title`: The global title of your blog used in SEO meta tags and the header.
- `description`: Default meta description used for social sharing and search engines.
- `author`: The name displayed in post footers and other author metadata.
- `authorUrl`: External link to your GitHub, personal website, or portfolio.
- `authorBio`: Short introduction used in author-related UI blocks.
- `authorDetails`: Detailed introduction displayed on the Home page profile card. Separate paragraphs with a blank line.
- `authorLocation`: Optional location text displayed with the author profile.
- `avatar`: URL for the author avatar image.
- `authorLinks`: Optional list of profile links such as GitHub, X, or LinkedIn.
- `url`: The public base URL of the site.
- `postsPerPage`: Number of posts displayed on each blog archive page.
- `nav`: Array of header links. Each item requires `name` and `href`; `icon` is optional and uses identifiers like `lucide:home`.

To customize the site, update the fields in `site.config.ts`. You can change
the content and structure independently.

## 3. Modifying the Home Page

Home is the personal introduction page. Update `authorDetails`, `avatar`,
`authorLocation` and `authorLinks` in `site.config.ts`
to customize the profile card.

Edit `src/content/page/home.mdx` for the longer introduction, interests,
project showcase, or contact details. It is rendered by `src/pages/index.astro`
at `/` and is excluded from the standalone page routes.

The header navigation contains Home, Blog, and Journal.

## 4. Writing & Publishing Posts

Blog articles live inside the content directory: `src/content/blog/`.

To publish a new article:

1. Create a new `.md` or `.mdx` file in `src/content/blog/` (e.g., `my-first-post.md`).
2. Add the required Frontmatter metadata at the top of the file.

```markdown
---
title: "Blog Title"
description: "A short description of the post..."
pubDate: 2026-08-30
featured: true
tags: [astro, writing]
---

Write your Markdown or MDX content here.
```

Every new post appears in the blog list. Home is reserved for personal information.

Use the optional `tags` field to group related posts. Tags appear on article
cards and article pages, link to their tag archive, and are listed at
`/blog/tags`. Posts without tags remain valid and are omitted from the tag index.

```yaml
tags:
  - astro
  - writing
```

## 5. Keeping a Journal

Short notes and moments can be published on the Journal timeline without
appearing in the blog archive. Create a `.md` or `.mdx` file in
`src/content/journal/` with a title and date/time:

```markdown
---
title: "A small note"
pubDate: 2026-09-26
---

Write a short note here. Markdown content appears directly on the timeline.
```

Entries are sorted newest first. The date and time appear beside each entry on
the left; its title and content appear on the right. Use the same
`YYYY-MM-DDTHH:mm:ss` format for blog posts and journal entries.

## 6. Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                         |
| :--------------------- | :--------------------------------------------- |
| `pnpm install`         | Installs dependencies                          |
| `pnpm dev`             | Starts local dev server at `localhost:4321`    |
| `pnpm build`           | Builds your production site to `./dist/`       |
| `pnpm preview`         | Previews your build locally, before deploying  |
| `pnpm format`          | Formats code across the project using Prettier |
| `pnpm astro ...`       | Runs Astro CLI commands                        |
| `pnpm astro -- --help` | Gets help using the Astro CLI                  |
