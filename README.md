# 托福打字专练 · TOEFL Typing Studio

一个**免费、开源、单文件 HTML** 的托福备考打字练习工具。纯前端，原生 JavaScript，无任何第三方库依赖，可离线使用，开箱即用。

> 温暖学术风界面 · 六大功能模块 · 朗读发音 · 错题本本地保存 · 个人成绩 + 全球排行榜 · 可选 AI 无限出题

## ✨ 功能

六个模块（顶部标签切换）：

1. **单词练习** —— 显示单词 + 词性 + 中文释义，自动朗读，逐字母实时反馈，打对自动跳下一个。
2. **听写拼写** —— 隐藏单词只放发音，听音拼写；可「显示答案」。
3. **文章练习** —— 托福风格学术短文打字测试，统计 WPM / 准确率；含 🎧 跟读（每打完一词朗读它）。
4. **语法练习** —— 按 CEFR 等级（B1/B2/C1/C2）+ 题型（综合 / 词形填空 / 选择题 / 句子改错 / 连词成句）双重筛选；每题附中文语法点讲解。
5. **错题本** —— 自动记录错题，按等级 / 题型出薄弱点柱状图，可「🔁 重练错词」「✨ AI 学习分析」，并支持 **⬇ 导出备份 / ⬆ 导入**。
6. **排行榜** —— 自动记录每轮成绩，展示个人最佳 WPM、平均准确率与最近练习历史（本地保存）；接入后端后还有 **🏆 全球排行榜**，可在成绩页一键「上榜」。
7. **每日新闻** —— 开箱即用，抓取当天 BBC 新闻（头条 / 世界 / 科技 / 科学 / 商业）摘要作为打字材料，点一条即进入文章模式练习，紧跟时事。默认走免费公共中转，无需任何配置；也可在「⚙」里填自建后端获得更稳定的服务。

**内置内容**：76 个核心词、4 篇学术短文、72 道语法题（B1=28 / B2=20 / C1=14 / C2=10）。

**错题本本地保存**：使用浏览器 `localStorage` 持久化（关闭页面后仍保留）。在受限 / 沙盒环境（如应用内预览、隐私模式）会自动降级为「仅本次会话」并提示，不报错。错题本顶部状态行会说明当前是否能本地保存。

**♾ AI 无限模式**：每个 AI 模式旁有「无限」开关。打开后练到队尾会自动用 AI 续题，免手动点。

## 🚀 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库（例如 `toefl-typing`），把本文件夹的所有文件推上去。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **Deploy from a branch**，分支选 `main`、目录选 `/ (root)`，保存。
3. 等一两分钟，访问 `https://<你的用户名>.github.io/<仓库名>/` 即可。`index.html` 会作为主页。

> 纯前端、无后端，离线把 `index.html` 用 Chrome / Edge 打开也能用（发音需要联网字体与系统语音）。

## 🤖 让公开版也能用 AI（可选）

AI 出题 / 生成功能默认调用官方接口，**仅在 Claude 应用内运行时可用**。公开的 GitHub Pages 网页因为不能把 API key 写进前端，所以默认 AI 不可用——但内置题库不受影响。

要在公开版启用 AI，部署一个隐藏 key 的代理（已附 `cloudflare-worker.js`）：

1. 注册 [Cloudflare](https://dash.cloudflare.com)（免费档足够）。
2. **Workers & Pages → Create → Worker**，把 `cloudflare-worker.js` 的内容粘进去，部署。
3. 在该 Worker 的 **Settings → Variables and Secrets** 添加：
   - `ANTHROPIC_API_KEY` = 你的 Anthropic API key（设为 **Secret**）
   - （可选）`ALLOW_ORIGIN` = 你的站点地址，例如 `https://你的用户名.github.io`
4. 复制 Worker 地址（形如 `https://xxx.你的子域.workers.dev`）。
5. 打开网页 → 点任意「✨ AI」按钮 → 在弹出的「自建 AI 代理后端」输入框里粘贴该地址 → 保存并重试。地址会记在本机浏览器里，下次自动生效。

> 代理保持与官方接口相同的请求 / 响应格式，前端无需改动。API key 只存在于 Cloudflare 服务器端，不会出现在网页里。

## 🏆 开启全球排行榜（可选）

**个人成绩 / 历史**开箱即用，存在本机 `localStorage`，无需任何配置。

**全球排行榜（跨用户）**需要一个共享数据库。已附 `leaderboard-worker.js` + `leaderboard-schema.sql`，用 Cloudflare Worker + D1（免费档）部署：

1. 注册 / 登录 [Cloudflare](https://dash.cloudflare.com)。
2. 建数据库：**Workers & Pages → D1 → Create**，命名如 `toefl-leaderboard`；进入它的 **Console**，粘贴 `leaderboard-schema.sql` 的内容执行一次（建表）。
3. 建 Worker：**Workers & Pages → Create → Worker**，把 `leaderboard-worker.js` 内容粘进去部署。
4. 绑定数据库：该 Worker 的 **Settings → Bindings → Add → D1 database**，变量名填 **`DB`**，选刚建的 `toefl-leaderboard`。
5. （可选）**Settings → Variables** 加 `ALLOW_ORIGIN` = 你的站点地址。
6. 复制 Worker 地址（形如 `https://xxx.workers.dev`）。
7. 打开网页 →「排行榜」标签 → 在输入框粘贴该地址 → 保存。之后打完一轮点「🏆 上榜」即可。

> ⚠️ 这是休闲排行榜，分数由前端上报、无法防伪造，仅供娱乐，别当严肃竞赛成绩。

## 📰 每日新闻（开箱即用）

「每日新闻」**默认就能用，无需任何配置**：通过免费的公共 RSS→JSON 中转服务（rss2json）直接在浏览器里抓取当天 BBC 官方 RSS 摘要，顶部可切换 头条/世界/科技/科学/商业，点任意一条即进入文章模式开练。

**（可选）自建后端获得更稳定的服务：** 公共中转偶尔会限流或不稳定。想要更可靠，可用附带的 `news-worker.js` 部署一个 Cloudflare Worker：

1. 登录 [Cloudflare](https://dash.cloudflare.com) → **Workers & Pages → Create → Worker**。
2. 把 `news-worker.js` 内容粘进去部署（不需要数据库、不需要密钥）。
3. （可选）**Settings → Variables** 加 `ALLOW_ORIGIN` = 你的站点地址。
4. 复制 Worker 地址（形如 `https://xxx.workers.dev`）。
5. 网页 →「每日新闻」→ 点 **⚙** → 粘贴该地址保存。之后即走你自己的后端。

> 仅使用 BBC 公开 RSS 的「标题 + 摘要」（供聚合转载用），不抓全文。请遵守来源方条款，仅作个人学习。自建 Worker 已对结果缓存 15 分钟。

## 🎨 设计

- 主题：温暖学术风（米纸色背景 + 纸张噪点纹理）。
- 字体：标题 Fraunces（衬线）、打字区 JetBrains Mono（等宽）、正文 Noto Sans SC。
- 配色：光标=蓝 `#1f6f9c`、错误=红 `#c0392b`、正确=绿 `#3f7d54`、品牌色赭红 `#bf4a2c`。

## ⚠️ 已知限制

- `localStorage` 按浏览器 / 设备隔离，不跨设备同步；清理浏览器数据会丢失（可用「导出备份」保存 JSON）。
- 不配置代理时，公开 GitHub Pages 上 AI 功能不可用。
- 不配置后端时，只有「个人成绩」，没有跨用户的全球排行榜。
- 全球排行榜分数由前端上报，无防作弊机制，仅供娱乐。

## 📄 许可

[MIT](./LICENSE) —— 自由使用、修改、分发。
