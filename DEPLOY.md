# 上线发布清单

这份清单只讲「怎么把现在的本地网站变成一个别人能打开的网址」。

项目代码已经完成本地 Git 初始化并提交，接下来主要是**注册账号、创建仓库、部署、挂磁盘、绑域名**。账号和支付需要你本人完成。

---

## 你需要准备的

| 项目 | 用途 | 大概时间 |
| --- | --- | --- |
| GitHub 账号 | 存放代码，部署平台从仓库拉取 | 5 分钟 |
| Railway 账号 | 推荐方案，自动部署 + 免费域名 | 5 分钟 |
| 支付方式 | Railway 可能需要绑定银行卡，以平台当前方案为准 | — |
| 后台密码 | 上线后登录 `/admin` | 1 分钟 |
| 域名（可选） | 把 `xxx.up.railway.app` 换成自己的域名 | 10 分钟 |

**总耗时：约 20–30 分钟。**  
最快可以先不买域名，用平台送的二级域名发给别人。

---

# 方案 A：Railway（推荐，最省事）

## 第 1 步：把代码推到 GitHub

1. 打开 <https://github.com/new>。
2. Repository name 填 `yaodi-portfolio`。
3. 选择 Private 或 Public 都可以。
4. **不要**勾选 “Add a README file / .gitignore / license”。
5. 点击 Create repository。

本地项目已经是 Git 仓库，直接推送：

```bash
cd /Users/yaodi/Documents/deepseek-harness/default-workspace/portfolio-website

git remote add origin https://github.com/你的用户名/yaodi-portfolio.git
git push -u origin main
```

第一次推送如果提示登录，按 GitHub 的提示完成授权即可。  
不习惯命令行也可以用 GitHub Desktop：Add local repository → 选择 `portfolio-website` → Publish repository。

> `.env`、上传图片、会话密钥、`node_modules` 已被 `.gitignore` 排除，不会上传。

## 第 2 步：Railway 部署

1. 打开 <https://railway.com>，用 GitHub 登录。
2. New Project → Deploy from GitHub repo。
3. 选择 `yaodi-portfolio`，Railway 会自动读取项目里的 `Dockerfile`。
4. 如果它询问启动方式，选择 **Dockerfile**。

## 第 3 步：设置环境变量

进入服务的 Variables，添加：

```text
ADMIN_PASSWORD=换成一个只有你知道的后台密码
SESSION_SECRET=用下面的命令生成
```

在 Mac 终端运行：

```bash
openssl rand -hex 32
```

把输出整串复制给 `SESSION_SECRET`。  
`PORT` 不需要手动设置，`Dockerfile` 已经声明 `8787`；如果平台要求填，就填 `8787`。

## 第 4 步：挂载持久化磁盘（非常重要）

进入服务 → Settings → Volumes → Add Volume：

```text
Mount Path: /app/storage
```

内容文件、自动备份、上传图片都会存在这里。

- 如果不挂载，重新部署后后台修改和图片会丢失。
- 第一次挂载空磁盘时，服务会自动从 `server/seed-content.json` 写入初始内容，*不需要*手动上传 JSON。

## 第 5 步：生成公开网址

Settings → Networking → Generate Domain。

你会得到一个类似这样的地址：

```text
https://yaodi-portfolio-production.up.railway.app
```

打开：

- 网站：`https://你的域名`
- 后台：`https://你的域名/admin`

用 `ADMIN_PASSWORD` 登录，修改一条内容并保存，确认前台刷新后同步。再上传一张图片测试。

## 第 6 步：绑定自己的域名（可选）

1. Railway → Settings → Networking → Custom Domain。
2. 输入你的域名，例如 `portfolio.yourdomain.com`。
3. 按提示去域名服务商添加 CNAME 记录。
4. 等几分钟，Railway 会自动签发 HTTPS 证书。

---

# 方案 B：香港 / 海外服务器（国内访问更稳）

如果你主要把作品集发给国内 HR，且希望访问速度更稳定，可以用腾讯云 / 阿里云的**香港轻量应用服务器**。香港服务器不需要大陆 ICP 备案。

大致流程：

1. 购买 Ubuntu 22.04 轻量服务器，开放 80 / 443 / 8787 端口。
2. 域名 A 记录指向服务器 IP。
3. SSH 登录服务器，安装 Docker：

```bash
curl -fsSL https://get.docker.com | sh
```

4. 拉取代码并启动：

```bash
git clone https://github.com/你的用户名/yaodi-portfolio.git
cd yaodi-portfolio
cp .env.example .env
nano .env
docker compose up -d --build
```

5. 在 `.env` 里改好 `ADMIN_PASSWORD` 和 `SESSION_SECRET`。
6. 用 Caddy 配 HTTPS：

```caddy
portfolio.yourdomain.com {
    reverse_proxy 127.0.0.1:8787
}
```

> 国内服务器（北京/上海/广州等）使用域名必须完成 ICP 备案；香港服务器不需要。

---

# 上线前检查

- [ ] GitHub 仓库里没有 `.env`、`.session-secret`
- [ ] `ADMIN_PASSWORD` 已改成强密码
- [ ] `SESSION_SECRET` 是随机长字符串
- [ ] 已挂载 `/app/storage` 持久化磁盘
- [ ] 首页、作品详情页、手机端都能打开
- [ ] `/admin` 能登录、修改、保存
- [ ] 上传一张图片后前台能显示
- [ ] 重新部署一次，确认内容和图片还在

---

# 发布后如何更新

**改作品、文案、经历：** 直接登录线上 `/admin` 修改并保存，不需要重新部署。

**改代码 / 改样式：** 本地修改后执行：

```bash
git add .
git commit -m "update portfolio"
git push
```

Railway 会自动重新部署；`/app/storage` 里的内容不会丢。

---

# 常见问题

**Q：打开网址显示 502 / Application failed to respond**  
A：检查 Railway 日志，确认服务监听的是 `0.0.0.0`，并且 Dockerfile 构建成功。

**Q：后台能打开，但保存时报错**  
A：通常是没有挂载 `/app/storage`，或该目录不可写。

**Q：后台没有内容 / 首页数据为空**  
A：首次启动会自动 seed。检查日志有没有 `Initial content → seeded from server/seed-content.json`。

**Q：上传图片失败**  
A：确认 `/app/storage` 已挂载且可写；图片单张不超过 10MB。

**Q：可以部署到 Vercel 吗？**  
A：不建议直接部署。这个项目包含后台 API、登录、文件上传和持久化存储，需要 Node 服务 + 磁盘；Railway / Render / 自己的服务器更合适。

---

## 我还可以帮你做什么

你可以把下面任意一项发给我：

- GitHub 仓库地址
- Railway 部署后的网址
- 部署失败的截图 / 日志

我可以继续帮你检查部署、排查 404/502、验证后台保存和图片上传，或者把域名和访问路径一起配置好。
