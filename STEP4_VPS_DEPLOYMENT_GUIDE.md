# Bharatpur Bites - VPS Deployment Guide (Budget Hosting)

**Version:** 1.0.0  
**Status:** Production-Ready  
**Hosting:** Hostinger / DigitalOcean / Linode  
**Cost:** ₹300-500/month ($4-6 USD)

---

## 📋 Quick Setup (15 minutes)

### 1. Buy VPS

**Hostinger:**
- Go to hostinger.com
- Select VPS (₹300/month)
- Choose: Ubuntu 22.04, 2GB RAM, 50GB SSD
- Create root password

**DigitalOcean:**
- Go to digitalocean.com
- Create Droplet: $5/month (1GB RAM, 25GB SSD)
- Choose: Ubuntu 22.04

### 2. Connect to VPS

```bash
# SSH into VPS
ssh root@your_vps_ip_address

# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Verify installations
node --version
npm --version
psql --version
pm2 --version
```

---

## 🗄️ Step 1: Setup PostgreSQL Database

```bash
# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database
sudo -u postgres psql << EOF
CREATE DATABASE bharatpur_bites;
CREATE USER app_user WITH PASSWORD 'strong_password_here';
ALTER ROLE app_user SET client_encoding TO 'utf8';
ALTER ROLE app_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE app_user SET default_transaction_deferrable TO on;
ALTER ROLE app_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE bharatpur_bites TO app_user;
\q
EOF

# Import SQL schema
sudo -u postgres psql bharatpur_bites < STEP1_POSTGRESQL_SCHEMA.sql

# Verify database
sudo -u postgres psql -d bharatpur_bites -c "\dt"
```

---

## 🚀 Step 2: Deploy Backend (Node.js)

### 2.1 Clone/Upload Backend Code

```bash
# Create app directory
mkdir -p /var/www/bharatpur-bites
cd /var/www/bharatpur-bites

# Upload your backend code (use SCP or Git)
# Option 1: Using Git
git clone https://github.com/your-repo/bharatpur-bites.git .

# Option 2: Using SCP
scp -r ./backend root@your_vps_ip:/var/www/bharatpur-bites/
```

### 2.2 Install Dependencies

```bash
cd /var/www/bharatpur-bites

# Install npm packages
npm install

# Verify installation
npm list
```

### 2.3 Create .env File

```bash
cat > .env << 'EOF'
# Server
PORT=3000
NODE_ENV=production
API_BASE_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://app_user:strong_password_here@localhost:5432/bharatpur_bites

# JWT & Auth
JWT_SECRET=your_super_secret_jwt_key_change_this_to_random_string
JWT_EXPIRY=7d
OAUTH_SERVER_URL=https://api.manus.im

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key_with_escaped_newlines"
FIREBASE_CLIENT_EMAIL=your_client_email

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Feature Toggles
AUTO_ASSIGN_ENABLED=true
OTP_VERIFICATION_ENABLED=true
RIDER_SEARCH_RADIUS_KM=5
RIDER_ASSIGNMENT_TIMEOUT_SEC=30
OTP_EXPIRY_MINUTES=30
MAX_OTP_ATTEMPTS=3
EOF

# Verify .env file
cat .env
```

### 2.4 Start Backend with PM2

```bash
# Start backend
pm2 start "npm start" --name "bharatpur-bites-api" --env production

# Save PM2 config
pm2 save

# Enable PM2 startup
pm2 startup

# Check status
pm2 status
pm2 logs bharatpur-bites-api
```

---

## 🌐 Step 3: Setup Nginx Reverse Proxy

### 3.1 Create Nginx Config

```bash
cat > /etc/nginx/sites-available/bharatpur-bites << 'EOF'
upstream backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Backend proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files (if any)
    location / {
        root /var/www/bharatpur-bites/public;
        try_files $uri $uri/ @backend;
    }

    location @backend {
        proxy_pass http://backend;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /\.env {
        deny all;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/bharatpur-bites /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 3.2 Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

# Verify renewal
certbot renew --dry-run
```

---

## 📊 Step 4: Monitoring & Logs

### 4.1 View Logs

```bash
# Backend logs
pm2 logs bharatpur-bites-api

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log
```

### 4.2 Monitor Performance

```bash
# CPU & Memory usage
top

# Disk usage
df -h

# Database size
sudo -u postgres psql -d bharatpur_bites -c "SELECT pg_size_pretty(pg_database_size('bharatpur_bites'));"

# PM2 monitoring
pm2 monit
```

### 4.3 Setup Backup

```bash
# Create backup script
cat > /home/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/bharatpur_bites_$DATE.sql"

mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump bharatpur_bites | gzip > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "bharatpur_bites_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

chmod +x /home/backup-db.sh

# Schedule daily backup (cron)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/backup-db.sh") | crontab -
```

---

## 🔧 Step 5: Maintenance & Updates

### 5.1 Update Backend Code

```bash
cd /var/www/bharatpur-bites

# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Restart backend
pm2 restart bharatpur-bites-api

# Check status
pm2 status
```

### 5.2 Update System

```bash
# Update packages
apt update && apt upgrade -y

# Restart services
systemctl restart nginx
systemctl restart postgresql
pm2 restart all
```

### 5.3 Troubleshooting

```bash
# Backend not starting?
pm2 logs bharatpur-bites-api --err

# Nginx error?
nginx -t

# Database connection issue?
sudo -u postgres psql -d bharatpur_bites -c "SELECT 1"

# Port already in use?
lsof -i :3000
```

---

## 📈 Scaling to AWS/Google Cloud

When you hit 1 lakh+ users, migrate to cloud:

### AWS EC2

```bash
# Same setup as VPS, but with:
# - Auto-scaling groups
# - RDS for managed PostgreSQL
# - CloudFront for CDN
# - S3 for file storage
```

### Google Cloud

```bash
# Use Cloud Run for serverless
# Cloud SQL for database
# Cloud Storage for files
# Load Balancer for traffic
```

### Migration Steps

1. **No code changes needed** (thanks to modular .env)
2. Update `.env` with new database URL
3. Update `.env` with new API endpoints
4. Restart backend
5. Done! ✅

---

## 💰 Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| VPS (2GB RAM) | ₹300-400 | Hostinger/DigitalOcean |
| Domain | ₹100-200 | .com domain |
| SSL Certificate | Free | Let's Encrypt |
| Backups | Free | Local storage |
| **Total** | **₹400-600** | **~$5-7 USD** |

---

## 🚨 Security Checklist

- [ ] Change root password
- [ ] Disable SSH password (use keys only)
- [ ] Enable firewall (ufw)
- [ ] Setup fail2ban (brute-force protection)
- [ ] Enable SSL/TLS
- [ ] Setup rate limiting
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Update system regularly

```bash
# Enable firewall
ufw enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Install fail2ban
apt install -y fail2ban
systemctl enable fail2ban
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** "Connection refused"
```bash
# Solution: Check if backend is running
pm2 status
pm2 logs bharatpur-bites-api
```

**Issue:** "502 Bad Gateway"
```bash
# Solution: Check Nginx config
nginx -t
systemctl restart nginx
```

**Issue:** "Database connection error"
```bash
# Solution: Check PostgreSQL
systemctl status postgresql
sudo -u postgres psql -d bharatpur_bites -c "SELECT 1"
```

---

## 🎯 Next Steps

1. ✅ Deploy backend
2. ✅ Setup database
3. ✅ Configure Nginx
4. ✅ Setup SSL
5. ⏭️ Deploy Flutter app (Step 5)
6. ⏭️ Generate APK (Step 5)

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0
