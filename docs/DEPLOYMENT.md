# Deployment Guide

This guide covers deploying the Toddy Milk Delivery application to various platforms.

## Prerequisites

- Firebase project setup
- Environment variables configured
- Domain name (optional)

## Platform-Specific Deployments

### 1. Netlify

```bash
# Build command: (none - static files)
# Publish directory: /
# Environment variables: Set in Netlify dashboard
```

1. Connect GitHub repository
2. Set build settings
3. Configure environment variables
4. Deploy

### 2. Vercel

```bash
npm install -g vercel
vercel --prod
```

### 3. Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### 4. GitHub Pages

1. Enable GitHub Pages in repository settings
2. Set source to main branch
3. Configure custom domain (optional)

## Environment Configuration

### Production Environment Variables

Create production `.env` file with:
- Firebase production config
- Production UPI credentials
- Actual shop coordinates
- Secure owner credentials

### Security Checklist

- [ ] Firebase security rules configured
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Domain configured
- [ ] Error pages setup

## Post-Deployment

1. Test all functionality
2. Verify payment flows
3. Check mobile responsiveness
4. Monitor error logs
5. Set up analytics (optional)

## Monitoring

- Firebase Console for database monitoring
- Browser developer tools for client-side errors
- Payment gateway logs for transaction monitoring

## Backup Strategy

- Firebase automatic backups
- Code repository backups
- Environment configuration backups