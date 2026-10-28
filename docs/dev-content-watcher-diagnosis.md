# 开发内容索引异常：诊断与缓解

日期：2026-10-27。

## 现场证据

- Astro 7.3.5，实际使用 Vite 8.2.2，Windows NTFS 本地盘。
- 故障日志顺序：Configuration file removed → 批量文件变更 → Vite module runner has been closed → server restarted → Entry page home was not found。
- 故障时 .astro/data-store.json 中 blog、page、journal 均为空 Map，content-modules.mjs 为空 Map；源内容和配置文件实际仍在，修改时间未变化。
- 完整重启重新扫描后恢复。不是鼠标前端脚本删除内容，也没有证据证明是构建覆盖开发缓存。
- glob loader 的 unlink 回调直接删除索引；配置自动重启路径没有显式调用启动时的完整内容同步。异常删除事件和重启交叠可使空索引持续存在；原日志缺少具体 unlink 路径，尚未通过受控重现证明全部因果细节。

## 触发来源的边界

原监听只记录配置删除提示，不记录具体删除路径或操作进程。不能确定是 Windows 原生监听误报、目录短暂不可访问，还是外部程序的临时替换操作。文件修改时间不变不足以排除临时重命名。不得直接归咎于编辑器、杀毒、同步工具或某一个进程。

## 本次修复

- Windows 改用 Vite/Chokidar 轮询，间隔 300ms，二进制 1000ms，避免仅依赖原生文件事件通知。
- atomic 500ms 合并短时删除/重建；awaitWriteFinish 300ms 等待写入稳定后处理新增/修改。
- 添加仅开发生效的诊断插件：记录关键内容/配置 add、unlink、unlinkDir 的具体路径和 exists 状态，并记录 watcher error。
- 不拦截删除、不修改 node_modules、不增加依赖、不修改首页异常判断。
- 更正 cacheDir 注释：该选项不是本问题的已验证修复，开发内容存储仍在 .astro。
- 代价：Windows 文件更新检测略有延迟，轮询有额外磁盘/CPU 开销。

## 验证

1. 新增临时文章：首页 200，列表 5 篇，测试文章 200；日志 add exists=true。
2. 删除本轮临时文章：日志 unlink exists=false，列表恢复 4 篇；测试文章变为 404，证明真实删除未被屏蔽。
3. 配置格式化触发自动重启：随后连续三轮首页和列表均 200，列表始终 4 篇，索引约 66KB，未再变为空集合。
4. 临时测试文件已删除；只保留监听配置和本文档。

结论：针对疑似原生事件异常的缓解已落地，短时验证通过；未捕获最初触发进程，也未证明长期不再复现。若再次出现，先保留含 [blog-watch] 的日志，检查 unlink 路径与 exists 状态，避免立即重启覆盖现场。
