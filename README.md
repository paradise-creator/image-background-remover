# 🖼️ Image Background Remover

A simple, beautiful web app to remove image backgrounds using Remove.bg API. Deploys to Cloudflare Pages for free!

![Demo](https://via.placeholder.com/800x400/1a1a2e/00d2ff?text=Image+Background+Remover)

## ✨ Features

- 🚀 Instant background removal
- 🎨 Beautiful, modern UI
- 📱 Mobile-friendly (drag & drop)
- ☁️ Serverless - no storage needed
- ⚡ Fast - processes in memory

## 🚀 Deploy to Cloudflare Pages

### Method 1: GitHub Integration (Recommended)

1. **Create GitHub Repository**
   - Go to [GitHub](https://github.com/new)
   - Repository name: `image-background-remover`
   - Public or Private

2. **Push Code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/image-background-remover.git
   git push -u origin main
   ```

3. **Deploy on Cloudflare**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Pages → Create project → Connect to Git
   - Select your repository
   - Build settings:
     - Build command: (leave empty)
     - Build output directory: (leave empty)
   - Environment variables:
     - Add `REMOVEBG_API_KEY` = your Remove.bg API key
   - Click "Save and Deploy"

### Method 2: CLI

```bash
# Install Wrangler
npm install -g wrangler

# Set API key
wrangler secret put REMOVEBG_API_KEY
# Enter your Remove.bg API key when prompted

# Deploy
npx wrangler pages deploy .
```

## 🔧 Configuration

### Remove.bg API Key

Get your free API key at: https://www.remove.bg/api

- Free tier: 50 images/month
- Paid: $0.019/image

## 📁 Project Structure

```
image-background-remover/
├── index.html          # Frontend UI
├── api/
│   └── remove-bg.js   # Cloudflare Worker function
├── wrangler.toml      # Cloudflare config
└── _headers           # CORS headers
```

## 🛠️ Development

```bash
# Local development with Cloudflare
npx wrangler pages dev .
```

## 📝 License

MIT
