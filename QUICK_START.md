# Quick Start: Deploying Sentinel Dashboard

## For Vercel (Recommended for Frontend)

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/krsnmlna1/sentinel-dashboard)

1. Click the button above
2. Connect your GitHub account
3. Add environment variables:
   - `ETHERSCAN_API_KEY`
   - `GROQ_API_KEY`
4. Deploy!

### Option 2: Manual Deploy
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Vercel auto-detects configuration from `vercel.json`
4. Add environment variables in project settings
5. Deploy

**Configuration is automatic!** The `vercel.json` file handles:
- ✅ Build commands
- ✅ Output directory
- ✅ Framework detection
- ✅ Security headers

## For Railway

1. Connect repository to Railway
2. Add environment variables in service settings
3. Railway auto-detects configuration from `railway.json`
4. Deploy!

## For Cloudflare Workers (Backend)

```bash
cd sentinel-workers
npm install
npx wrangler login
npx wrangler deploy
```

Then add the Worker URL to your frontend environment variables as `NEXT_PUBLIC_API_URL`.

## Required Environment Variables

| Variable | Where to Get It | Platform |
|----------|-----------------|----------|
| `ETHERSCAN_API_KEY` | [etherscan.io/myapikey](https://etherscan.io/myapikey) | Frontend |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | Frontend |
| `NEXT_PUBLIC_API_URL` | Your Cloudflare Worker URL | Frontend |

## Monorepo Structure

```
sentinel-dashboard/           # Root (deploy from here)
├── vercel.json              # Vercel config ← points to subfolder
├── railway.json             # Railway config ← points to subfolder
├── sentinel-dashboard/      # Frontend (Next.js)
└── sentinel-workers/        # Backend (Cloudflare Workers)
```

**Key Point**: Deploy frontend from root directory. The configuration files handle navigating to the `sentinel-dashboard/` subfolder automatically.

## Local Development

```bash
# Frontend
cd sentinel-dashboard
npm install
npm run dev
# Opens at http://localhost:3000

# Backend
cd sentinel-workers
npm install
npx wrangler dev
# Opens at http://localhost:8787
```

## Detailed Documentation

- **Vercel**: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Railway**: See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
- **Configuration**: See [CONFIGURATION.md](./CONFIGURATION.md)

## Troubleshooting

**Build fails?**
- Check environment variables are set
- Verify `npm run build` works locally
- Check platform build logs

**Can't connect to backend?**
- Ensure backend is deployed to Cloudflare
- Set `NEXT_PUBLIC_API_URL` in frontend environment variables
- Verify backend URL is accessible

**Need help?**
- Check the detailed documentation files above
- Open an issue on GitHub
- Review platform-specific documentation

---

**That's it!** Your Sentinel Dashboard should now be live. 🎉
