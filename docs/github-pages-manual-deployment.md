# GitHub Pages 手动部署指南

本指南用于将 Astro 项目部署为 GitHub Pages 用户站点。

目标仓库：`NapperPeng.github.io`

目标地址：`https://napperpeng.github.io/`

这里的“手动部署”是指按步骤手动完成 GitHub 仓库和 Pages 配置；实际构建与发布由 GitHub Actions 自动执行。

## 一、准备工作

确认本地已安装：

- Git
- Node.js 22.12.0 或更高版本
- pnpm
- GitHub 账号

同时确认项目目录为：

```text
D:\blogs
```

## 二、创建用户站点仓库

1. 登录 GitHub。
2. 点击右上角 `New repository`。
3. Repository name 填写：

   ```text
   NapperPeng.github.io
   ```

4. 选择仓库可见性。
5. 不要勾选自动创建 README、`.gitignore` 或 License，避免与本地项目产生冲突。
6. 点击 `Create repository`。

用户站点仓库的特殊之处是：仓库名决定根域名，最终地址为：

```text
https://napperpeng.github.io/
```

## 三、修改上线配置

在本地项目中完成需求文档里的修改，重点确认：

### 1. 站点地址

`site.config.ts`：

```ts
url: "https://napperpeng.github.io",
```

### 2. 根路径

`astro.config.mts`：

```ts
site: siteConfig.url,
base: "/",
```

不要配置 `base: "/mare-blog"`，因为这里使用的是用户站点仓库。

### 3. Actions 文件

创建目录和文件：

```text
.github/workflows/deploy.yml
```

将上线需求文档中的 GitHub Actions 内容复制进去并保存。

## 四、本地验证生产构建

在项目根目录执行：

```bash
pnpm install
pnpm build
```

构建成功后检查 `dist/` 是否生成。重点确认没有构建错误，并检查是否包含：

- `dist/index.html`
- `dist/blog/`
- `dist/journal/`
- `dist/robots.txt`
- `dist/sitemap-index.xml`
- `dist/fonts/`

如果本地构建失败，先修复错误，不要继续推送。

## 五、提交并关联远程仓库

先确认当前分支：

```bash
git branch --show-current
```

如果不是 `main`，切换或重命名为 `main`：

```bash
git branch -M main
```

添加远程仓库：

```bash
git remote add origin https://github.com/NapperPeng/NapperPeng.github.io.git
```

如果已经存在错误的远程地址，先查看：

```bash
git remote -v
```

再修改：

```bash
git remote set-url origin https://github.com/NapperPeng/NapperPeng.github.io.git
```

提交上线配置：

```bash
git add .
git commit -m "chore: prepare GitHub Pages deployment"
```

推送主分支：

```bash
git push -u origin main
```

推送当前版本标签：

```bash
git push origin v2.2
```

## 六、启用 GitHub Pages

1. 打开 GitHub 仓库页面。
2. 进入 `Settings`。
3. 左侧进入 `Pages`。
4. 在 `Build and deployment` 中找到 `Source`。
5. 选择 `GitHub Actions`。
6. 保存设置。

不要选择 `Deploy from a branch`，因为本项目使用 Actions 构建 Astro，而不是直接把源代码目录作为静态文件目录。

## 七、检查 GitHub Actions

1. 打开仓库的 `Actions` 页面。
2. 找到 `Deploy Astro site to GitHub Pages`。
3. 打开最新一次运行记录。
4. 等待 `build` 和 `deploy` 两个 Job 都显示绿色成功。

构建阶段主要包括：

- 下载代码
- 安装 pnpm
- 安装 Node.js 22
- 安装依赖
- 执行 `pnpm build`
- 上传 `dist/`

部署阶段会把上传的构建产物发布到 GitHub Pages。

## 八、访问线上站点

Actions 成功后，访问：

```text
https://napperpeng.github.io/
```

第一次部署可能需要等待几十秒到几分钟。

也可以在：

```text
Settings → Pages
```

看到 GitHub Pages 给出的站点地址。

## 九、上线验收

依次检查：

1. 首页是否正常显示。
2. Blog 列表是否有文章。
3. 点击文章能否进入详情页。
4. Tag 页面和分页是否正常。
5. Archive 是否显示文章标题。
6. Journal 是否显示时间线内容。
7. 刷新文章详情页是否仍然正常。
8. 日间 / 夜间模式是否正常。
9. 字体、头像、favicon 是否加载。
10. 自定义鼠标和文章交互是否正常。
11. 手机宽度是否出现横向滚动。
12. `/robots.txt` 是否能访问。
13. `/sitemap-index.xml` 是否能访问。

## 十、常见问题

### Actions 没有运行

检查：

- 工作流文件是否位于 `.github/workflows/`。
- 文件扩展名是否为 `.yml` 或 `.yaml`。
- 推送的分支是否为 `main`。
- Actions 是否被仓库设置禁用。

也可以在 Actions 页面使用 `Run workflow` 手动触发。

### `pnpm install --frozen-lockfile` 失败

通常表示 `package.json` 与 `pnpm-lock.yaml` 不一致。先在本地执行：

```bash
pnpm install
```

然后提交更新后的锁文件。

### 页面能打开但 CSS、字体或图片 404

确认这是用户站点部署，并且：

- `site.config.ts` 地址正确。
- `astro.config.mts` 使用 `base: "/"`。
- 没有残留 `/mare-blog` 或其他旧路径配置。

### GitHub Pages 显示旧页面

检查最新 Actions 是否成功。成功后等待 CDN 刷新，再使用浏览器强制刷新或无痕窗口访问。

### 构建失败但线上旧版本仍能访问

这是正常的保护行为。只有构建和部署都成功后，新版本才会替换旧版本。

## 十一、以后如何发布更新

以后只需要：

```bash
git add .
git commit -m "更新说明"
git push origin main
```

GitHub Actions 会自动重新构建和部署，不需要手动上传 `dist/`。
