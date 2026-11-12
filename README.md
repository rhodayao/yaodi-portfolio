# 姚迪 · UI/UX 设计师作品集

前后端分离的在线作品集：React 前台 + Cloudflare Workers 后端 + KV 存储。
前台与后台共用一份内容数据，不再维护重复的 Express / Docker 后端。

## 预览

| 首页 | 关于我 |
| --- | --- |
| ![首页](docs/preview/home.jpg) | ![关于我](docs/preview/about.jpg) |

| 作品索引 | 博闻智数 / 金融 AI |
| --- | --- |
| ![作品索引](docs/preview/work.jpg) | ![博闻智数](docs/preview/project-ai.jpg) |

| 内容后台 |
| --- |
| ![内容后台](docs/preview/admin.jpg) |

---

## 目录结构

```text
portfolio-website/
├─ frontend/                   前台：React + TypeScript
│  ├─ src/
│  │  ├─ components/           页面组件
│  │  ├─ pages/                首页、作品详情、后台
│  │  ├─ styles/               页面样式
│  │  └─ data/seed.ts          读取共享内容作为兜底
│  ├─ public/                  图片、favicon、404、_headers
│  ├─ index.html
│  └─ tsconfig.json
│
├─ backend/                    后端：只有 Cloudflare Worker
│  └─ src/index.js             API、登录、KV 内容、图片上传
│
├─ shared/
│  └─ content.json             唯一的内容种子文件
│
├─ scripts/
│  ├─ build.mjs                esbuild 构建前台
│  └─ package-pages.mjs        生成 Cloudflare Pages 静态包
│
├─ docs/preview/               README 预览图
├─ wrangler.jsonc              Worker 配置（KV、静态资源）
└─ package.json
```

### 为什么不再有 `server/` 和 `Dockerfile`

之前同时存在 Express 和 Worker 两套后端，逻辑重复，容易出现“本地改了、线上没改”的问题。
现在只保留 `backend/src/index.js` 作为唯一后端：

- 本地开发：`wrangler dev` 使用本地 KV 模拟
- 线上部署：同一份 Worker 代码部署到 Cloudflare
- 前台通过同一套 `/api/*` 接口访问，不再需要 Node 服务器
- 内容只维护 `shared/content.json` 一份种子

---

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前台 | React 18、React Router、TypeScript、esbuild |
| 后端 | Cloudflare Workers |
| 存储 | Cloudflare KV（内容、备份、上传图片） |
| 部署 | Wrangler / Cloudflare Workers |
| 本地开发 | Wrangler 本地模式 + 本地 KV |

---

## 本地运行

### 1. 安装依赖

```bash
cd /Users/yaodi/Documents/deepseek-harness/default-workspace/portfolio-website
npm install
```

也可以用 pnpm：

```bash
pnpm install
```

### 2. 本地环境变量

项目已包含本地开发用的 `.dev.vars`（不提交到 Git）：

```text
ADMIN_PASSWORD=yaodi2026
SESSION_SECRET=...
```

如果要重新生成，复制 `.dev.vars.example` 改名或直接创建 `.dev.vars`。

### 3. 启动

```bash
npm run dev
```

会先构建前台，再启动本地 Worker：

- 网站：<http://127.0.0.1:8790>
- 后台：<http://127.0.0.1:8790/admin>
- 本地后台密码：`.dev.vars` 中的 `ADMIN_PASSWORD`

本地 Worker 使用模拟 KV，和线上数据互不影响。

### 4. 只构建前台

```bash
npm run build
```

输出目录：

```text
frontend/dist/
```

---

## 线上部署（免费）

完整步骤见 [CLOUDFLARE.md](CLOUDFLARE.md)。

核心命令：

```bash
npx wrangler login
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
npm run cf:deploy
```

部署后：

- 网站：`https://你的地址.workers.dev`
- 后台：`https://你的地址.workers.dev/admin`
- KV 会自动保存内容和上传图片
- 如果 Cloudflare 绑定了 GitHub，推送代码后会自动重新部署

### 直接上传前端静态包

如果只需要一个纯展示网址，不需要在线后台：

```bash
npm run package:pages
```

会生成：

```text
yaodi-portfolio-pages.zip
```

上传步骤见 [STATIC_UPLOAD.md](STATIC_UPLOAD.md)。

> 纯静态包不包含 Worker 后端，`/admin` 登录和保存不可用。

---

## 内容维护

唯一的内容种子：

```text
shared/content.json
```

线上修改内容时：

1. 登录 `/admin`
2. 修改并保存
3. 内容写入 Cloudflare KV
4. 前台刷新即可

本地修改 `shared/content.json` 后，需要重新构建前台才会进入静态兜底数据：

```bash
npm run build
```

### 图片

- 前台固定图片：`frontend/public/images/`
- 后台上传图片：Cloudflare KV，通过 `/uploads/...` 访问
- 单张图片限制 10MB

---

## 安全说明

- 线上后台密码保存在 Cloudflare Secret 中，不写入代码
- 登录 Token 使用 HMAC 签名，12 小时过期
- 图片上传限制类型与大小
- `.dev.vars`、`.env`、`.wrangler` 均已忽略
- 正式上线前请修改默认密码

---

## 设计与内容说明

视觉延续原作品集 PDF：

- 深墨绿底、荧光青柠、虚线网格、描边英文标题、三角形
- 首屏 → 关于我 → 工作经历 → 作品 → 联系
- 头像为 PDF 风格的正方形
- 后台使用独立的浅色管理系统，不复用前台视觉

PDF 裁切的项目图位于 `frontend/public/images/`，后续可直接替换为高清原图。

「博闻智数」的界面为交互概念示意，不是客户真实系统截图，页面已标注演示数据。

---

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 构建前台 + 本地 Worker |
| `npm run build` | 类型检查 + 构建前台 |
| `npm run check` | 只做 TypeScript 检查 |
| `npm run cf:dev` | 构建 + 本地 Worker |
| `npm run cf:deploy` | 构建 + 部署 Cloudflare Worker |
| `npm run package:pages` | 构建 + 生成 Pages 静态 zip |

---

**Designed & built with care.**
姚迪 · UI/UX Designer · Wuhan
