export interface NavItem {
  /** Navigation item display label */
  name: string;
  /** Navigation target path or URL */
  href: string;
  /** Icon identifier */
  icon?: string;
}

export interface AuthorLink {
  /** Link display label */
  name: string;
  /** Link target URL */
  href: string;
  /** Icon identifier */
  icon?: string;
}

export interface SiteConfig {
  /** Site language */
  lang: string;
  /** Site title */
  title: string;
  /** Site description */
  description: string;
  /** Author name */
  author: string;
  /** Author URL */
  authorUrl: string;
  /** Author biography */
  authorBio: string;
  /** Detailed author introduction displayed on the Home page */
  authorDetails: string;
  /** Author location */
  authorLocation: string;
  /** Author avatar image URL */
  avatar: string;
  /** Optional array of author links */
  authorLinks?: AuthorLink[];
  /** Base URL of the site */
  url: string;
  /** Number of posts to show on each blog archive page */
  postsPerPage: number;
  /** Header navigation items */
  nav: NavItem[];
}

export function defineConfig(config: SiteConfig): SiteConfig {
  return config;
}

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
