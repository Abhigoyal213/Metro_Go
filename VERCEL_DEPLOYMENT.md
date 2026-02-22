# Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Code pushed to GitHub repository

## Method 1: Deploy via Vercel Dashboard (Recommended - Easiest)

### Step 1: Push to GitHub
```bash
git push -u origin main
```

If you need to authenticate, GitHub will prompt you for credentials or token.

### Step 2: Import to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Select your GitHub account and find "Metro_Go" repository
5. Click "Import"

### Step 3: Configure Project
Vercel will auto-detect the settings, but verify:
- **Framework Preset**: Vite
- **Root Directory**: ./
- **Build Command**: `npm run build`
- **Output Directory**: dist
- **Install Command**: `npm install`

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://metro-go-[random].vercel.app`

### Step 5: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Method 2: Deploy via Vercel CLI

### Step 1: Login to Vercel
```bash
vercel login
```

This will open a browser window for authentication.

### Step 2: Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project's name? **metro-go** (or press Enter)
- In which directory is your code located? **./** (press Enter)
- Want to override the settings? **N**

### Step 3: Deploy to Production
```bash
vercel --prod
```

Your app will be deployed and you'll get a production URL.

## Method 3: GitHub Integration (Automatic Deployments)

### Step 1: Connect GitHub
1. Go to https://vercel.com/dashboard
2. Import your Metro_Go repository (as in Method 1)

### Step 2: Automatic Deployments
Once connected, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Show deployment status in GitHub

## Environment Variables (If Needed)

If you need to add environment variables:

### Via Dashboard:
1. Go to Project Settings → Environment Variables
2. Add variables:
   - `VITE_API_URL` (if using external API)
   - `VITE_SMS_GATEWAY` (for production SMS)

### Via CLI:
```bash
vercel env add VITE_API_URL
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Run `npm run build` locally to test

### 404 on Routes
- Verify vercel.json has correct rewrites configuration
- Check that SPA routing is enabled

### Slow Build Times
- Vercel free tier has build time limits
- Consider upgrading if needed

## Post-Deployment

### Update README
Add your live URL to README.md:
```markdown
## Live Demo
🚀 [View Live Demo](https://your-app.vercel.app)
```

### Test Everything
- [ ] Test all routes
- [ ] Test authentication
- [ ] Test admin panel
- [ ] Test mobile responsiveness
- [ ] Test dark mode
- [ ] Test booking flow
- [ ] Test map interactions

## Vercel Features

### Analytics
Enable Vercel Analytics:
1. Go to Project Settings → Analytics
2. Enable Analytics
3. View real-time metrics

### Performance Monitoring
- Automatic performance insights
- Core Web Vitals tracking
- Real User Monitoring (RUM)

### Preview Deployments
- Every branch gets a unique URL
- Perfect for testing features
- Share with team for review

## Custom Domain Setup

### Step 1: Add Domain in Vercel
1. Project Settings → Domains
2. Add your domain (e.g., metrogo.com)

### Step 2: Configure DNS
Add these records to your DNS provider:

**For apex domain (metrogo.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for Verification
- DNS propagation takes 24-48 hours
- Vercel will auto-issue SSL certificate

## Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Open project in browser
vercel open
```

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- GitHub Issues: https://github.com/Abhigoyal213/Metro_Go/issues

## Cost

- **Free Tier**: Perfect for this project
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Preview deployments

- **Pro Tier** ($20/month): If you need more
  - Increased bandwidth
  - Advanced analytics
  - Team collaboration

## Next Steps

1. Push code to GitHub
2. Import to Vercel
3. Deploy
4. Share your live URL!

🎉 Your MetroGo app will be live in minutes!
