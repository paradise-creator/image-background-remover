# Cloudflare Pages 配置

## 部署命令

| 设置 | 值 |
|------|-----|
| Production branch | main |
| Build command | `npm run build` |
| Build output directory | `.next` |

## 环境变量

在 Cloudflare Pages 设置中添加：

| 变量名 | 值 |
|--------|-----|
| `REMOVEBG_API_KEY` | `WUpxpLZaSP6DeAKMV8GDpk5x` |

## 重要配置

由于 Next.js 是 SSR，需要使用 **Cloudflare Pages Functions**

当前代码已支持 Cloudflare Pages！直接部署即可。

---

## 🚀 部署步骤

1. 打开 https://dash.cloudflare.com → Pages
2. Connect to GitHub
3. 选择仓库 `paradise-creator/image-background-remover`
4. 设置：
   - Build command: `npm run build`
   - Build output directory: `.next`
5. 添加环境变量 `REMOVEBG_API_KEY`
6. 点击 Deploy！

部署完成后会得到一个 `*.pages.dev` 的链接。
