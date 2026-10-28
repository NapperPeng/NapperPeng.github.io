// @ts-check
import siteConfig from "./site.config";
import { existsSync } from "node:fs";
import { relative } from "node:path";

import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import { satteri } from "@astrojs/markdown-satteri";

// https://astro.build/config
export default defineConfig({
  // Build cache location; dev content storage remains in .astro.
  cacheDir: "./node_modules/.astro",
  markdown: {
    processor: satteri({
      hastPlugins: [
        {
          name: "github-alerts",
          element: {
            filter: ["blockquote"],
            visit(node, context) {
              const firstParagraph = node.children.find(
                (child) => child.type === "element" && child.tagName === "p",
              );
              if (
                firstParagraph?.type !== "element" ||
                firstParagraph.tagName !== "p"
              ) {
                return;
              }

              const firstText = firstParagraph.children[0];
              if (firstText?.type !== "text") return;

              const match = firstText.value.match(
                /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?=$|[\t\r\n ])/,
              );
              if (!match) return;

              const alertType = match[1].toLowerCase();
              const remainingText = firstText.value
                .slice(match[0].length)
                .replace(/^[\t\r\n ]+/, "");
              const remainingChildren = [...firstParagraph.children];

              if (remainingText) {
                remainingChildren[0] = { ...firstText, value: remainingText };
              } else {
                remainingChildren.shift();
              }
              context.setProperty(
                firstParagraph,
                "children",
                remainingChildren,
              );

              const rawClasses = node.properties.className as unknown;
              const classNames = Array.isArray(rawClasses)
                ? rawClasses
                : typeof rawClasses === "string"
                  ? rawClasses.split(/\s+/)
                  : [];
              context.setProperty(node, "className", [
                ...classNames,
                "markdown-alert",
                `markdown-alert-${alertType}`,
              ]);
              context.insertBefore(firstParagraph, {
                type: "element",
                tagName: "p",
                properties: { className: ["markdown-alert-title"] },
                children: [{ type: "text", value: match[1] }],
              });

              if (remainingChildren.length === 0) {
                context.removeNode(firstParagraph);
              }
            },
          },
        },
      ],
    }),
  },
  vite: {
    server: {
      watch: {
        // Windows native notifications have reported whole-tree unlink bursts
        // while files still existed. Poll actual file state instead.
        usePolling: process.platform === "win32",
        interval: 300,
        binaryInterval: 1000,
        atomic: 500,
        awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
      },
    },
    plugins: [
      tailwindcss(),
      {
        name: "blog-watch-diagnostics",
        apply: "serve",
        configureServer(server) {
          // Observe, don't suppress events: real deletes must still update content.
          const report = (event: string, path: string) => {
            if (!["add", "unlink", "unlinkDir"].includes(event)) return;
            if (
              !/[/\\]src[/\\]content[/\\]|astro\.config\.|tsconfig\.json$/.test(
                path,
              )
            )
              return;
            server.config.logger.info(
              `[blog-watch] ${event} ${relative(server.config.root, path)} exists=${existsSync(path)}`,
            );
          };
          server.watcher.on("all", report);
          server.watcher.on("error", (error) => {
            server.config.logger.error(`[blog-watch] ${String(error)}`);
          });
        },
      },
    ],
  },
  site: siteConfig.url,
  base: "/",
  integrations: [
    sitemap(),
    mdx(),
    icon({
      include: {
        lucide: ["*"],
      },
    }),
  ],
});
