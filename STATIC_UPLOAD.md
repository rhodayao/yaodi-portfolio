# 直接上传 Cloudflare Pages

已经为你打包好：

```text
portfolio-website/yaodi-portfolio-pages.zip
```

约 1.7MB，解压后的内容就是网站根目录。

以后内容或样式有更新，重新生成：

```bash
cd /Users/yaodi/Documents/deepseek-harness/default-workspace/portfolio-website
npm run package:pages
```

## 上传步骤

1. 打开 <https://dash.cloudflare.com/>
2. 左侧 **Workers & Pages** → **Create** → **Pages** → **Upload assets**
3. 项目名填 `yaodi-portfolio`（或你喜欢的名字）
4. 把 `yaodi-portfolio-pages.zip` 直接拖进去；如果页面不接受 zip，就先解压，再拖入解压后的文件夹
5. 点击 **Deploy site**
6. 获得网址，例如：

```text
https://yaodi-portfolio.pages.dev
```

## 这个包包含什么

- 首页、关于我、工作经历、作品列表
- 5 个作品详情页
- AI 交互演示
- 手机端布局
- `_redirects`：保证直接打开 `/work/bown-ai` 这类深层链接不会 404
- `_headers`：静态资源缓存规则
- `404.html`：自定义错误页

## 注意：这是纯前端包

这个包**不包含 Node 后端**，所以：

- 前台展示正常
- `/admin` 页面能打开，但**登录和保存不可用**
- 在线修改内容、上传图片，需要另外部署 Cloudflare Workers + KV 后端

如果你需要在线后台，请使用 [CLOUDFLARE.md](CLOUDFLARE.md) 的 Worker 部署方式，不要只用这个静态包。

## 绑定自己的域名

Cloudflare Pages 项目 → **Custom domains** → Set up a custom domain，按提示添加 DNS 记录即可，HTTPS 会自动配置。
