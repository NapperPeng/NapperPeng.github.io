# GitHub Pages 上线前最终修改需求

## 1. 文档目的

本需求用于将项目以 GitHub Pages 用户站点形式上线。

目标仓库：`NapperPeng.github.io`

目标网址：`https://napperpeng.github.io/`

本阶段只处理上线所需的配置、部署工作流和说明文件，不改变现有页面视觉设计、鼠标交互或内容结构。

## 2. 部署方案

- 使用 GitHub Pages 用户站点。
- 使用 GitHub Actions 自动完成生产构建和发布。
- 网站部署在域名根路径 `/`，不使用 `/mare-blog` 这类项目子路径。
- 构建产物为 Astro 生成的 `dist/` 目录。
- Node.js 和 pnpm 只在 GitHub Actions 构建环境中使用，GitHub Pages 只托管静态文件。

## 3. 必须修改或新增的文件

### 3.1 `site.config.ts`

将站点地址改为正式用户站点地址：

```ts
url: "https://napperpeng.github.io",
```

该地址用于 sitemap、robots.txt 和站点元信息。

保留现有作者、导航、字体和文章分页配置，除非上线前确认需要更换。

### 3.2 `astro.config.mts`

确认配置使用根路径：

```ts
site: siteConfig.url,
base: "/",
```

用户站点不需要 `/mare-blog` 这样的 `base` 前缀。

需要确认以下资源和内部链接在构建结果中均以根路径正常工作：

- `/`
- `/blog`
- `/journal`
- `/fonts/...`
- `/avatar.png`
- `/favicon.svg`

### 3.3 `.github/workflows/deploy.yml`

新增 GitHub Actions 工作流，要求：

- 推送到 `main` 分支时自动部署。
- 支持在 GitHub Actions 页面手动触发。
- 使用 Node.js 22。
- 使用 pnpm 安装依赖。
- 使用 `pnpm install --frozen-lockfile` 保证依赖版本稳定。
- 使用 `pnpm build` 生成 `dist/`。
- 使用官方 Pages artifact 和 deploy action 发布。
- 构建失败时不得执行部署。

推荐工作流结构：

```yaml
name: Deploy Astro site to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3.4 `package.json`

将项目版本与当前 Git 标签保持一致：

```json
"version": "2.2.0"
```

同时确认 `build` 脚本存在且为：

```json
"build": "astro build"
```

### 3.5 `README.md` 与 `README.en.md`

在不恢复本地运行和构建部署章节的前提下，补充正式站点链接（如果上线前已确定）：

```md
网站：https://napperpeng.github.io/
```

两份 README 中的项目名称、版本号和正式地址需要保持一致。

## 4. 上线前检查项

- 仓库名确认为 `NapperPeng.github.io`。
- GitHub 用户名与仓库名大小写对应正确。
- `site.config.ts` 使用正式站点 URL。
- `astro.config.mts` 使用根路径 `base: "/"`。
- 不存在指向旧 `mare-blog.pages.dev` 的站点配置。
- `pnpm-lock.yaml` 与 `package.json` 保持同步。
- 本地生产构建成功。
- 构建结果包含首页、Blog、文章详情、Tag、Archive、Journal、404、robots.txt 和 sitemap。
- 头像、favicon 和本地字体资源能够正常加载。
- GitHub Actions 文件已提交到仓库。

## 5. 验收标准

部署完成后，以下地址可以正常访问：

- `/`
- `/blog/`
- `/blog/tags/`
- `/blog/archive/`
- `/journal/`
- `/404/`
- `/robots.txt`
- `/sitemap-index.xml`

并确认：

- 页面刷新不会出现 404。
- Blog 文章、Tag 和分页链接正常。
- 日间 / 夜间主题正常。
- 字体、头像、图标和自定义鼠标正常。
- 移动端没有横向溢出。
- sitemap 和 robots.txt 使用 `napperpeng.github.io` 地址。

## 6. 本阶段不包含的内容

- 不更换域名或绑定自定义域名。
- 不修改页面视觉设计。
- 不修改文章内容和 Journal 内容。
- 不新增后端、数据库或服务端运行时。
