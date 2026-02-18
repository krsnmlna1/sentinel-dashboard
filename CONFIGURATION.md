# Monorepo Configuration Guide

This repository is configured as a **monorepo** with separate frontend and backend components that can be deployed independently.

## Repository Structure

```
sentinel-dashboard/                 # Repository root
├── .vercelignore                  # Files to exclude from Vercel deployment
├── vercel.json                    # Vercel deployment configuration
├── railway.json                   # Railway deployment configuration
├── railway.toml                   # Railway alternative configuration
├── nixpacks.toml                  # Railway build configuration
├── package.json                   # Root package with build scripts
├── .env.example                   # Environment variables template
├── VERCEL_DEPLOYMENT.md           # Vercel deployment guide
├── RAILWAY_DEPLOYMENT.md          # Railway deployment guide
├── sentinel-dashboard/            # Frontend application
│   ├── package.json              # Frontend dependencies
│   ├── next.config.ts            # Next.js configuration
│   ├── app/                      # Next.js app directory
│   ├── components/               # React components
│   ├── lib/                      # Utility functions
│   └── public/                   # Static assets
└── sentinel-workers/             # Backend application
    ├── package.json              # Backend dependencies
    ├── wrangler.toml             # Cloudflare Workers configuration
    └── src/                      # Worker source code
```

## Configuration Files Explained

### Root Configuration

#### `package.json`
- **Purpose**: Orchestrates builds and deployments for the monorepo
- **Key Scripts**:
  - `build`: Navigates to `sentinel-dashboard/` and runs production build
  - `start`: Starts the production server from `sentinel-dashboard/`
  - `postinstall`: Installs dependencies in `sentinel-dashboard/`
- **Note**: Uses `npm ci` for reproducible builds

#### `vercel.json`
- **Purpose**: Configures Vercel deployment for the frontend
- **Key Settings**:
  - `buildCommand`: Builds from the sentinel-dashboard subdirectory
  - `installCommand`: Installs dependencies using `npm ci`
  - `outputDirectory`: Points to `.next` build output
  - `framework`: Set to Next.js for automatic optimizations
  - `env`: References environment variable secrets
  - `headers`: Security headers for all routes

#### `railway.json` / `railway.toml`
- **Purpose**: Configures Railway deployment
- **Key Settings**:
  - Uses NIXPACKS builder for automatic detection
  - Executes root package.json build/start scripts
  - Watches `sentinel-dashboard/**` for changes

#### `nixpacks.toml`
- **Purpose**: Specifies build phases for Railway/Nixpacks
- **Phases**:
  - Setup: Node.js 20
  - Install: npm install
  - Build: npm run build
  - Start: npm start

### Frontend Configuration

#### `sentinel-dashboard/package.json`
- **Purpose**: Frontend application dependencies and scripts
- **Framework**: Next.js 16.1.4 with React 19
- **Key Dependencies**:
  - `next`: Framework
  - `react`, `react-dom`: UI library
  - `axios`: HTTP client
  - `openai`: AI integration
  - `recharts`: Data visualization
  - `framer-motion`: Animations

#### `sentinel-dashboard/next.config.ts`
- **Purpose**: Next.js configuration
- **Key Settings**:
  - `output: "standalone"`: Optimized for deployment
  - `reactStrictMode: false`: Disabled for compatibility
  - Turbopack/Webpack aliases for canvas module

### Backend Configuration

#### `sentinel-workers/package.json`
- **Purpose**: Backend dependencies and deployment scripts
- **Framework**: Cloudflare Workers
- **Key Scripts**:
  - `deploy`: Deploys to Cloudflare using Wrangler

#### `sentinel-workers/wrangler.toml`
- **Purpose**: Cloudflare Workers configuration
- **Key Settings**:
  - `name`: Worker name (sentinel-api)
  - `main`: Entry point (src/worker.js)
  - KV namespace bindings for data storage

## Deployment Strategies

### Vercel (Frontend Only)
1. Deploy frontend from root directory
2. Vercel reads `vercel.json` for configuration
3. Build command navigates to `sentinel-dashboard/`
4. Deploy backend separately to Cloudflare
5. Connect via `NEXT_PUBLIC_API_URL` environment variable

**Pros:**
- Automatic edge deployment
- Zero-config scaling
- Built-in CDN
- Preview deployments for PRs

**Cons:**
- Frontend only (backend needs separate deployment)
- Requires separate Cloudflare deployment

### Railway (Frontend Only)
1. Deploy frontend from root directory
2. Railway reads `railway.json` or `nixpacks.toml`
3. Build command navigates to `sentinel-dashboard/`
4. Deploy backend separately to Cloudflare
5. Connect via `NEXT_PUBLIC_API_URL` environment variable

**Pros:**
- Simple configuration
- Automatic deployment on push
- Built-in SSL

**Cons:**
- Frontend only (backend needs separate deployment)
- Requires separate Cloudflare deployment

### Cloudflare Workers (Backend Only)
1. Navigate to `sentinel-workers/` directory
2. Configure `wrangler.toml` with account details
3. Run `npm run deploy`
4. Workers deployed to Cloudflare edge network

**Pros:**
- Global edge deployment
- Low latency
- KV storage included
- Generous free tier

**Cons:**
- Separate from frontend deployment
- Requires Cloudflare account

## Environment Variables

All platforms require these environment variables:

| Variable | Description | Required For | Example |
|----------|-------------|--------------|---------|
| `ETHERSCAN_API_KEY` | Blockchain data access | Frontend | `ABC123...` |
| `GROQ_API_KEY` | AI features | Frontend | `gsk_...` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Frontend | `https://sentinel-api.workers.dev` |
| `NODE_ENV` | Environment mode | Both | `production` |

**Security Notes:**
- Never commit `.env` files to Git
- Use platform-specific secret management
- For Vercel: Use Environment Variables in project settings
- For Railway: Use Environment Variables in service settings
- For Cloudflare: Use wrangler secrets or environment variables

## Build Process

### Production Build Flow
```bash
# From root directory
npm run build
```

This executes:
1. `cd sentinel-dashboard` - Navigate to frontend
2. `npm ci` - Clean install dependencies (reproducible)
3. `npm run build` - Run Next.js production build

### Development Flow
```bash
# Frontend development
cd sentinel-dashboard
npm install
npm run dev

# Backend development
cd sentinel-workers
npm install
npx wrangler dev
```

## Common Issues and Solutions

### Issue: "Module not found" during build
**Solution**: Ensure all dependencies are listed in `sentinel-dashboard/package.json`

### Issue: Build fails on Vercel
**Solution**: 
- Check environment variables are set in Vercel dashboard
- Verify `vercel.json` paths are correct
- Check build logs for specific errors

### Issue: Frontend can't connect to backend
**Solution**: 
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- Verify Cloudflare Worker is deployed and accessible
- Check CORS settings in Worker if needed

### Issue: Railway build fails
**Solution**: 
- Verify `railway.json` or `railway.toml` is present
- Check that root `package.json` build script works locally
- Review Railway build logs for specific errors

## Best Practices

1. **Use `npm ci` instead of `npm install`** for production builds (already configured)
2. **Keep dependencies up to date** but test thoroughly
3. **Set environment variables** in deployment platform, not in code
4. **Test locally** before deploying: `npm run build && npm start`
5. **Monitor deployments** using platform-specific dashboards
6. **Use separate environments** for development, staging, and production
7. **Review security headers** in `vercel.json` and adjust as needed

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Monorepo Best Practices](https://monorepo.tools/)

## Support

For issues specific to:
- **Frontend/Deployment**: Open an issue on GitHub
- **Vercel**: Check Vercel docs or support
- **Railway**: Check Railway docs or support
- **Cloudflare Workers**: Check Cloudflare docs or community

---

**Last Updated**: 2026-02-18
