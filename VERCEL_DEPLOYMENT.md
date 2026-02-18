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
   Add the following environment variables in Vercel project settings (Settings → Environment Variables):
   
   | Variable Name | Description | Required |
   |---------------|-------------|----------|
   | `ETHERSCAN_API_KEY` | Your Etherscan API key for blockchain data | Yes |
   | `GROQ_API_KEY` | Your GROQ API key for AI features | Yes |
   
   **Note:** These can be added during the initial deployment or later in the project settings.
   
   For secret values, you can also use Vercel's Environment Variable secrets:
   - In your Vercel project settings, go to Settings → Environment Variables
   - Create secrets named `etherscan-api-key` and `groq-api-key`
   - The `vercel.json` file references these using the `@` prefix

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

### Connecting Frontend to Backend

After deploying the backend to Cloudflare Workers, you'll need to:

1. **Get your Worker URL** from the Cloudflare dashboard (e.g., `https://sentinel-api.your-subdomain.workers.dev`)

2. **Add the backend URL as an environment variable** in Vercel:
   - Go to your Vercel project settings
   - Add environment variable: `NEXT_PUBLIC_API_URL` with your Worker URL
   - Redeploy your frontend

3. **Update API calls** in the frontend to use the environment variable:
   ```typescript
   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
   ```

Refer to [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/) for detailed deployment instructions.

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
