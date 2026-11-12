# 免费上线：Cloudflare Workers + KV

这是目前最适合这个项目的 **0 成本、保留在线后台** 方案。

前台静态页面、后台 API、作品内容和上传图片都会放在 Cloudflare 的免费额度内：

- 不需要服务器
- 不需要绑定银行卡（Workers / KV 免费计划）
- 后台仍然可以在线登录、改内容、上传图片
- 免费地址是 `https://rhodayao-portfolio.<你的子域>.workers.dev`
- 以后可以绑定自己的域名

> Cloudflare 免费额度对个人作品集足够：Workers 每天 10 万次请求，KV 1GB 存储、每天 1000 次写入。以 Cloudflare 当前定价页为准。

---

## 你需要做的 3 件事

### 第 1 步：登录 Cloudflare

在项目目录执行：

```bash
cd /Users/yaodi/Documents/deepseek-harness/default-workspace/portfolio-website

npm install
npx wrangler login
```

浏览器会打开 Cloudflare 授权页，登录并点击允许。

### 第 2 步：设置两个后台密钥

```bash
npx wrangler secret put ADMIN_PASSWORD
```

按提示输入你的后台密码，回车。

```bash
npx wrangler secret put SESSION_SECRET
```

先生成一串随机值：

```bash
openssl rand -hex 32
```

把输出粘贴进去，回车。

> 这两个值不会写进 GitHub，也不会出现在代码里。

### 第 3 步：部署

```bash
npm run cf:deploy
```

它会自动完成：

1. 构建前台静态文件；
2. 打包 Worker API；
3. 创建免费的 KV 存储；
4. 上传到 Cloudflare；
5. 返回一个 `workers.dev` 网址。

第一次部署如果提示选择 `workers.dev` 子域，按提示取一个名字即可。

### 如果使用 Cloudflare 的 GitHub 自动部署

在 Cloudflare Worker 的 Build 设置里使用：

```text
Root directory: /
Build command: npm run build
Deploy command: npx wrangler deploy
```

不要额外填写 `dist` 作为发布目录：静态资源路径已经写在 `wrangler.jsonc` 的 `assets.directory` 中，指向 `frontend/dist`。

---

## 部署后验证

打开：

- 网站：`https://你的地址.workers.dev`
- 后台：`https://你的地址.workers.dev/admin`

用第 2 步设置的 `ADMIN_PASSWORD` 登录，然后：

1. 修改一条文案，保存；
2. 刷新前台确认更新；
3. 上传一张图片，确认能显示；
4. 手机打开一次。

> Cloudflare KV 是全球分发的，写入后通常几秒生效，极端情况下不同地区最多约 1 分钟同步。遇到旧内容时等一会儿再刷新。

---

## 以后怎么更新

**改作品、文案、经历：** 直接登录线上 `/admin` 修改并保存，不需要重新部署。

**改代码 / 改样式：**

```bash
npm run cf:deploy
```

会重新构建并发布；KV 里的内容、图片、备份不会被覆盖。

---

## 绑定自己的域名（可选）

1. 域名需要先接入 Cloudflare（免费计划即可）。
2. 打开 Cloudflare Dashboard → Workers & Pages。
3. 选择 `yaodi-portfolio` → Settings → Domains & Routes。
4. Add → Custom Domain。
5. 输入 `portfolio.你的域名.com`，按提示确认。
6. Cloudflare 自动签发 HTTPS 证书。

绑定后：

```text
https://portfolio.你的域名.com
https://portfolio.你的域名.com/admin
```

> `workers.dev` 在中国大陆的访问速度不稳定。如果主要发给国内 HR，建议绑定自己的域名，或后续换成香港服务器方案。

---

## 本地预览 Worker

项目已带本地开发密钥文件 `.dev.vars`（不会提交到 Git）：

```bash
npm run cf:dev
```

打开 <http://127.0.0.1:8790>。

本地 Worker 的 KV 是模拟数据，重新启动不会带入线上内容；线上和本地互不影响。

---

## 常见问题

**Q：`wrangler login` 没有反应？**  
A：把终端里出现的链接复制到浏览器打开；或先运行 `npx wrangler whoami` 检查登录状态。

**Q：部署时报 `Authentication error`？**  
A：重新执行 `npx wrangler login`，确认登录的是正确的 Cloudflare 账号。

**Q：后台登录提示“后台密码或签名密钥未配置”？**  
A：重新执行：

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
```

**Q：部署后页面 404 / 空白？**  
A：先运行 `npm run build`，确认 `frontend/dist/` 生成成功，再执行 `npx wrangler deploy`。

**Q：第一次部署没有创建 KV？**  
A：Wrangler 正常会自动创建，并把 namespace id 写回 `wrangler.jsonc`。如果没有，执行：

```bash
npx wrangler kv namespace create PORTFOLIO_KV
```

把返回的 `id` 填进 `wrangler.jsonc` 的 `kv_namespaces` 中，再部署一次。

**Q：图片上传失败？**  
A：单张不能超过 10MB；只支持 JPG / PNG / WebP / GIF / AVIF。

**Q：KV 数据会丢吗？**  
A：Cloudflare 托管存储；后台每次保存还会写一份备份键。建议定期在后台导出/保存一次 `content.json` 到本地。

---

## 需要我继续做什么

你完成 `wrangler login` 和两个 secret 后，把部署输出的网址发给我，我可以继续帮你：

- 打开线上站点做完整检查
- 验证后台保存、图片上传
- 排查 Workers 日志错误
- 配置自定义域名
- 如果你愿意，也可以把 Cloudflare 授权后的终端会话保持打开，我继续执行部署命令
