# Railway Deployment Guide for Sentinel Dashboard

## 📋 Prerequisites

Before deploying to Railway, ensure you have:

1. A Railway account ([railway.app](https://railway.app))
2. Your Etherscan API key
3. Your Groq API key for AI features

## 🚀 Deployment Steps

### Step 1: Connect Your Repository

1. Log in to [Railway](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your forked repository (e.g., `your-username/sentinel-dashboard`)
5. Railway will automatically detect the configuration

### Step 2: Set Environment Variables

In the Railway dashboard, add the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `ETHERSCAN_API_KEY` | Your Etherscan API key for blockchain data | ✅ Yes |
| `GROQ_API_KEY` | Your Groq API key for AI features | ✅ Yes |
| `NODE_ENV` | Set to `production` | ⚠️ Auto-set by Railway |
| `PORT` | Application port | ⚠️ Auto-set by Railway |

**To add environment variables:**
1. Go to your project in Railway
2. Click on the service
3. Go to the **Variables** tab
4. Click **"Add Variable"**
5. Add each variable and its value

### Step 3: Deploy

Railway will automatically:
1. ✅ Detect the Node.js project
2. ✅ Install dependencies using `npm ci`
3. ✅ Build the Next.js application
4. ✅ Start the production server
5. ✅ Assign a public URL

The deployment process takes approximately 3-5 minutes.

## 📝 Configuration Files

This project includes the following Railway configuration files:

- **`railway.json`** - Railway service configuration (JSON format)
- **`railway.toml`** - Railway service configuration (TOML format)
- **`nixpacks.toml`** - Nixpacks builder configuration for Node.js 20

Railway will automatically use these files to configure the build and deployment process.

## 🏗️ Build Process

The monorepo structure is handled automatically:

```bash
# Railway runs these commands from the root directory:
npm ci                    # Install root dependencies
npm run build             # Executes: cd sentinel-dashboard && npm ci && npm run build
npm start                 # Executes: cd sentinel-dashboard && npm start
```

## 🔧 Troubleshooting

### Build Fails

**Problem**: Dependencies not installing correctly
**Solution**: 
- Ensure `package.json` and `package-lock.json` are committed
- Check Railway build logs for specific errors
- Verify Node.js version (requires Node.js 18+)

### Runtime Errors

**Problem**: Application crashes on startup
**Solution**:
- Verify all required environment variables are set
- Check Railway runtime logs
- Ensure `ETHERSCAN_API_KEY` and `GROQ_API_KEY` are valid

### Port Issues

**Problem**: Application not accessible
**Solution**:
- Railway automatically sets the `PORT` environment variable
- Next.js respects this automatically - no configuration needed
- Check if the service is running in Railway dashboard

### Environment Variable Issues

**Problem**: API keys not working
**Solution**:
1. Go to Railway dashboard → Your project → Variables tab
2. Verify the variables are set correctly (no extra spaces)
3. Restart the deployment after adding/updating variables

## 🎯 Expected Deployment Output

After successful deployment, you should see:

```
✓ Compiled successfully
✓ Generating static pages
✓ Finalizing page optimization

Route (app)
┌ ○ /
├ ○ /agent
├ ƒ /api/agent
├ ƒ /api/audit
├ ○ /auditor
├ ○ /dashboard
├ ○ /scout
└ ○ /settings
```

Your application will be available at: `https://your-project.railway.app`

## 📞 Support

If you encounter issues:

1. Check Railway build and runtime logs
2. Verify environment variables are set correctly
3. Ensure your API keys are valid
4. Check the [Railway documentation](https://docs.railway.app)
5. Open an issue in the GitHub repository

## 🔄 Redeployment

To redeploy after making changes:

1. Push changes to your GitHub repository
2. Railway will automatically detect the changes and redeploy
3. You can also manually trigger a redeployment in the Railway dashboard

## 💡 Tips

- Use Railway's **Preview Deployments** for testing changes before production
- Enable **Auto-deploy** for automatic deployments on push
- Monitor your **Resource Usage** in the Railway dashboard
- Set up **Custom Domain** for a professional URL

---

**Note**: Railway offers a free tier with limitations. For production use, consider upgrading to a paid plan for better performance and uptime.
