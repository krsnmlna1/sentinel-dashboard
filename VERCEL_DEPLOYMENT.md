# Vercel Deployment Guide

This repository uses a monorepo structure with:
- **sentinel-dashboard** (frontend) - Next.js application
- **sentinel-workers** (backend) - Cloudflare Workers

## Deploying to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/krsnmlna1/sentinel-dashboard)

### Manual Deployment

1. **Connect your repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure the project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `sentinel-dashboard` (or leave as `.` since we have vercel.json)
   - **Build Command:** `cd sentinel-dashboard && npm ci && npm run build` (auto-configured via vercel.json)
   - **Output Directory:** `sentinel-dashboard/.next` (auto-configured via vercel.json)
   - **Install Command:** `cd sentinel-dashboard && npm ci` (auto-configured via vercel.json)

3. **Environment Variables:**
   Add the following environment variables in Vercel project settings:
   - `ETHERSCAN_API_KEY` - Your Etherscan API key
   - `GROQ_API_KEY` - Your GROQ API key
   - Any other environment variables from `.env.example`

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy your application

### Automatic Deployments

Once connected, Vercel will automatically:
- Deploy every push to the main/master branch (Production)
- Create preview deployments for pull requests
- Deploy every commit to other branches (Preview)

## Configuration Files

The repository includes:
- `vercel.json` - Vercel-specific configuration for the monorepo structure
- `package.json` - Root package configuration with build scripts
- `sentinel-dashboard/package.json` - Frontend application configuration

## Monorepo Structure

```
sentinel-dashboard/          # Repository root
├── vercel.json             # Vercel configuration
├── package.json            # Root package.json with build scripts
├── sentinel-dashboard/     # Frontend (Next.js)
│   ├── package.json
│   ├── next.config.ts
│   ├── app/
│   ├── components/
│   └── ...
└── sentinel-workers/       # Backend (Cloudflare Workers)
    ├── package.json
    ├── wrangler.toml
    └── src/
```

## Troubleshooting

### Build Failures

If the build fails:
1. Check that all required environment variables are set
2. Verify that `sentinel-dashboard/package.json` dependencies are correct
3. Check the build logs in Vercel dashboard

### Deployment Issues

- Ensure the `output: "standalone"` setting is in `next.config.ts` for optimal Vercel deployment
- Verify that the build completes successfully locally with: `npm run build`

## Backend Deployment (Cloudflare Workers)

The backend (`sentinel-workers`) should be deployed separately to Cloudflare:

```bash
cd sentinel-workers
npm install
npm run deploy
```

Refer to Cloudflare Workers documentation for detailed deployment instructions.

## Local Development

To run the frontend locally:

```bash
cd sentinel-dashboard
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
