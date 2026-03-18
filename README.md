# 🖼️ Image Background Remover

A modern web app to remove image backgrounds using AI. Built with Next.js + Tailwind CSS.

![Demo](https://via.placeholder.com/800x400/1a1a2e/00d2ff?text=Image+Background+Remover)

## ✨ Features

- 🚀 Instant background removal
- 🎨 Beautiful, modern UI with Tailwind CSS
- 📱 Mobile-friendly (drag & drop)
- ⚡ Fast - Next.js App Router
- ☁️ Deploys anywhere (Vercel, Cloudflare, etc.)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/paradise-creator/image-background-remover.git
cd image-background-remover
npm install
```

### 2. Configure API Key

Create a `.env.local` file:

```bash
REMOVEBG_API_KEY=your-remove-bg-api-key
```

Get your free API key at: https://www.remove.bg/api

- Free tier: 50 images/month
- Paid: $0.019/image

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## 📁 Project Structure

```
image-background-remover/
├── src/
│   └── app/
│       ├── page.tsx           # Main UI
│       ├── layout.tsx         # Root layout
│       ├── globals.css        # Global styles
│       └── api/
│           └── remove-bg/
│               └── route.ts   # API endpoint
├── public/                    # Static assets
├── .env.local                 # Environment variables
└── package.json
```

## 🛠️ Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start
```

## ☁️ Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import repository
4. Add environment variable: `REMOVEBG_API_KEY`
5. Deploy!

### Cloudflare Pages

1. Connect GitHub repository
2. Build command: `npm run build`
3. Output directory: `.next`
4. Add environment variable: `REMOVEBG_API_KEY`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 License

MIT
