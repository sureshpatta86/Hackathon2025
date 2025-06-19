# HealthComm Deployment Guide

## 🚀 Production Deployment Options

### Option 1: Vercel Deployment (Recommended)

**Prerequisites:**
- Vercel account (free tier available)
- GitHub repository

**Steps:**
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Configure environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your_production_database_url
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   NEXT_PUBLIC_APP_NAME=HealthComm
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
4. Deploy automatically with each push

**Database Options for Production:**
- **SQLite**: Works for small deployments (included)
- **PostgreSQL**: Recommended for production (Railway, Supabase, or Vercel Postgres)
- **MySQL**: Alternative option (PlanetScale)

### Option 2: Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  healthcomm:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./prod.db
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
    volumes:
      - ./data:/app/data
```

### Option 3: Traditional VPS/Server Deployment

**Requirements:**
- Node.js 18+
- PM2 (process manager)
- Nginx (reverse proxy)

**Setup Steps:**
```bash
# Install dependencies
npm install --production

# Build the application
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Configure Nginx reverse proxy
# /etc/nginx/sites-available/healthcomm
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Production Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Twilio Configuration
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Application Settings
NEXT_PUBLIC_APP_NAME="HealthComm"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# Security (add these for production)
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Database Migration for Production

**PostgreSQL Setup:**
1. Update `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Run migrations:
```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

### Security Considerations

**HTTPS Setup:**
- Use Let's Encrypt for free SSL certificates
- Configure HTTPS redirects in your reverse proxy

**Rate Limiting:**
```javascript
// Add to your API routes
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

**Input Validation:**
- All API endpoints include validation
- Phone numbers are sanitized and formatted
- SQL injection protection via Prisma

## 📊 Monitoring & Analytics

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics or Google Analytics
- **Uptime Monitoring**: Uptimerobot
- **Performance**: Vercel Speed Insights

### Health Check Endpoint
Add this to your API routes:
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}
```

## 🔐 HIPAA Compliance (Important!)

### Required Enhancements for Healthcare Use
1. **User Authentication**: Implement NextAuth.js
2. **Data Encryption**: Encrypt sensitive data at rest
3. **Audit Logging**: Log all data access and modifications
4. **Access Controls**: Role-based permissions
5. **Data Backup**: Regular encrypted backups
6. **Business Associate Agreement**: With Twilio

### Additional Security Measures
```javascript
// Add these headers for security
export default function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=63072000')
  
  // Your API logic here
}
```

## 📈 Scaling Considerations

### Performance Optimizations
- **Database Indexing**: Add indexes on frequently queried fields
- **Caching**: Implement Redis for session and data caching
- **CDN**: Use Vercel's CDN or Cloudflare
- **Image Optimization**: Next.js built-in image optimization

### Horizontal Scaling
- **Database**: Read replicas for heavy read workloads
- **Application**: Multiple instances behind a load balancer
- **Message Queue**: Add Redis/Bull for background job processing

## 🛟 Backup & Disaster Recovery

### Database Backups
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/healthcomm"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Environment Backup
- Store environment variables securely
- Document all configuration settings
- Keep deployment scripts in version control

## 📞 Support & Maintenance

### Twilio Configuration
- Set up webhook endpoints for delivery tracking
- Configure phone number capabilities
- Monitor usage and billing

### Regular Maintenance Tasks
- Monitor error logs
- Update dependencies monthly
- Review and rotate API keys quarterly
- Backup verification tests

---

**Note**: This deployment guide provides production-ready configurations. For healthcare applications, additional compliance measures may be required based on your specific regulatory requirements.
