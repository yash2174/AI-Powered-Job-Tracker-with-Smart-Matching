# Deployment Guide

This guide covers deploying the AI Job Tracker application to production.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Frontend)

#### Frontend Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel

# Follow prompts to configure
```

**Environment Variables (Vercel):**
- No frontend env vars needed (API calls go through Vite proxy)

#### Backend Deployment (Vercel Serverless)
Not ideal for this use case due to:
- File storage requirements
- Long-running AI operations
- Better suited for cloud VM

### Option 2: Railway (Recommended for Full-Stack)

Railway provides easy deployment for both frontend and backend.

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway up

# Deploy frontend (new project)
cd ../frontend
railway up
```

**Environment Variables (Railway):**
- `ADZUNA_APP_ID`
- `ADZUNA_API_KEY`
- `OPENAI_API_KEY`
- `PORT` (Railway auto-assigns)
- `NODE_ENV=production`

### Option 3: DigitalOcean Droplet / AWS EC2

For full control, deploy on a VPS:

#### 1. Provision Server
```bash
# Ubuntu 22.04 LTS
# Minimum: 2GB RAM, 2 vCPU
```

#### 2. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

#### 3. Upload Code
```bash
# Clone repository
git clone <your-repo-url>
cd job-tracker

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install && npm run build
```

#### 4. Configure Environment
```bash
# Create .env file
cd backend
nano .env

# Add your credentials
ADZUNA_APP_ID=xxx
ADZUNA_API_KEY=xxx
OPENAI_API_KEY=xxx
PORT=3001
NODE_ENV=production
```

#### 5. Start Services
```bash
# Start backend with PM2
cd backend
pm2 start server.js --name job-tracker-backend

# Serve frontend (using nginx or serve)
cd ../frontend
sudo npm install -g serve
pm2 start "serve -s dist -l 3000" --name job-tracker-frontend

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 6. Configure Nginx (Optional)
```nginx
# /etc/nginx/sites-available/job-tracker

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/job-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. SSL Certificate (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 4: Docker Deployment

#### Create Dockerfiles

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - ADZUNA_APP_ID=${ADZUNA_APP_ID}
      - ADZUNA_API_KEY=${ADZUNA_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PORT=3001
      - NODE_ENV=production
    volumes:
      - ./backend/data:/app/data
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

## 🔐 Production Considerations

### Security
1. **Environment Variables**
   - Never commit `.env` files
   - Use secure secret management (AWS Secrets Manager, Railway Variables)

2. **Authentication**
   - Replace hardcoded credentials with JWT
   - Implement proper password hashing (bcrypt)
   - Add rate limiting

3. **CORS**
   - Configure specific origins in production
   - Remove `origin: true` from Fastify CORS config

4. **API Keys**
   - Rotate keys regularly
   - Monitor usage and set budget alerts
   - Use environment-specific keys

### Performance
1. **Caching**
   - Cache job search results (Redis)
   - Implement CDN for frontend assets

2. **Database**
   - Migrate from JSON files to PostgreSQL/MongoDB
   - Add connection pooling
   - Implement proper indexing

3. **AI Optimization**
   - Batch AI requests when possible
   - Cache match scores for 24 hours
   - Implement request queuing

### Monitoring
1. **Logging**
   - Use structured logging (Winston, Pino)
   - Ship logs to centralized service (LogDNA, Datadog)

2. **Error Tracking**
   - Integrate Sentry or Rollbar
   - Monitor AI API failures

3. **Uptime Monitoring**
   - Use UptimeRobot or Pingdom
   - Set up health check endpoints

### Backup
1. **Data Backup**
   ```bash
   # Daily backup script
   #!/bin/bash
   DATE=$(date +%Y%m%d)
   tar -czf backup-$DATE.tar.gz backend/data/
   # Upload to S3 or similar
   ```

2. **Database Backup** (if migrated)
   - Automated daily backups
   - Point-in-time recovery
   - Test restore procedures

## 📊 Cost Estimates

### Minimal Setup (Railway/Render)
- **Hosting**: $5-15/month
- **OpenAI API**: ~$10-30/month (depends on usage)
- **Adzuna API**: Free tier (750 calls/month)
- **Total**: ~$20-50/month

### Production Setup (DigitalOcean)
- **Droplet**: $12/month (2GB RAM)
- **Domain**: $10/year
- **SSL**: Free (Let's Encrypt)
- **OpenAI API**: ~$20-50/month
- **Total**: ~$35-70/month

## 🚀 Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] SSL certificate installed
- [ ] Health check endpoint responding
- [ ] Error tracking configured
- [ ] Backup system in place
- [ ] Monitoring alerts set up
- [ ] Documentation updated
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] CI/CD pipeline configured

## 🔄 CI/CD Setup (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install and Test Backend
        run: |
          cd backend
          npm install
          npm test # if tests exist
      
      - name: Build Frontend
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy to Production
        run: |
          # Your deployment commands
          # e.g., rsync, Railway CLI, etc.
```

## 📞 Support

For deployment issues:
1. Check server logs: `pm2 logs job-tracker-backend`
2. Review nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables: `pm2 env 0`
4. Test API endpoints: `curl http://localhost:3001/api/health`

---

**Happy Deploying! 🚀**
