# Deployment Instructions

## Repository Setup Complete ✓

The repository has been initialized and is ready to push to GitHub.

## Push to GitHub

Run the following command to push your code:

```bash
git push -u origin main
```

If you encounter authentication issues, you may need to:
1. Set up a Personal Access Token (PAT) on GitHub
2. Use SSH authentication instead

### Using Personal Access Token
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/Abhigoyal213/Metro_Go.git
git push -u origin main
```

### Using SSH
```bash
git remote set-url origin git@github.com:Abhigoyal213/Metro_Go.git
git push -u origin main
```

## Deployment Options

### 1. Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel
```

### 2. Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### 3. GitHub Pages
1. Go to repository Settings → Pages
2. Select branch: `main`
3. Select folder: `/dist` (after building)
4. Save

Build command:
```bash
npm run build
```

### 4. Docker
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

Build and run:
```bash
docker build -t metro-go .
docker run -p 5173:5173 metro-go
```

## Environment Variables

For production, create `.env` file:
```
VITE_API_URL=your_api_url
VITE_SMS_GATEWAY=your_sms_gateway
```

## Post-Deployment Checklist

- [ ] Update README.md with live demo URL
- [ ] Test all features in production
- [ ] Verify mobile responsiveness
- [ ] Test authentication flow
- [ ] Verify admin panel access
- [ ] Check dark mode functionality
- [ ] Test route calculation
- [ ] Verify map interactions
- [ ] Test booking flow
- [ ] Check QR code generation

## Monitoring

Consider adding:
- Google Analytics
- Sentry for error tracking
- Performance monitoring
- User analytics

## Security Recommendations

Before production deployment:
1. Implement server-side OTP generation
2. Add rate limiting
3. Use HTTPS only
4. Implement CSRF protection
5. Add input validation
6. Secure admin credentials in database
7. Add session expiration
8. Implement proper authentication backend

## Support

For issues or questions:
- GitHub Issues: https://github.com/Abhigoyal213/Metro_Go/issues
- Email: Contact repository owner

## License

MIT License - See LICENSE file for details
