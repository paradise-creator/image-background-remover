# Image Background Remover

使用 Cloudflare Workers + Remove.bg API 的图片去背工具。

## 功能

- 拖拽/点击上传图片
- 一键去除背景
- 预览对比
- 直接下载透明背景图片

## 部署

### 1. 克隆项目

```bash
git clone <this-repo>
cd image-bg-remover
```

### 2. 配置 Remove.bg API Key

在 Cloudflare Workers 后台添加环境变量：
- 变量名：`REMOVE_BG_API_KEY`
- 值：你的 Remove.bg API Key

或本地测试时在 `wrangler.toml` 中设置：

```toml
[vars]
REMOVE_BG_API_KEY = "your-api-key"
```

### 3. 部署

```bash
# 安装依赖
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
wrangler deploy
```

部署完成后会得到一个 `*.workers.dev` 域名。

## 获取 Remove.bg API Key

1. 访问 https://www.remove.bg/api
2. 注册账号
3. 免费版：50 张/月
4. 获取 API Key

## 本地开发

```bash
wrangler dev
```

访问 http://localhost:8787

## 配置说明

- Workers 计划：免费版足够个人使用
- 每月免费额度：10万请求 + 100万KV 操作
- Remove.bg 免费：50 张/月
