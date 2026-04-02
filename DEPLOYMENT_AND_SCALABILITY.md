# Bharatpur Bites - Deployment & Scalability Guide

**Version:** 1.0.0  
**Status:** ✅ Production-Ready  
**Last Updated:** 2026-03-29

---

## 📋 Overview

This guide covers:
- VPS deployment (DigitalOcean, Hostinger)
- Firebase hosting
- AWS migration strategy
- Cost optimization
- Monitoring & logging
- Scaling to 1 lakh+ users

---

## 🚀 PHASE 1: VPS DEPLOYMENT (Budget-Friendly)

### Option 1: DigitalOcean

#### Step 1: Create Droplet

```bash
# 1. Go to DigitalOcean console
# 2. Create new Droplet
# 3. Choose: Ubuntu 22.04 LTS
# 4. Size: $12/month (2GB RAM, 2 vCPU)
# 5. Add SSH key
# 6. Create Droplet
```

#### Step 2: Initial Setup

```bash
# SSH into droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Redis (for caching)
apt install -y redis-server

# Install Nginx (reverse proxy)
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

#### Step 3: Database Setup

```bash
# Create database
sudo -u postgres psql

CREATE DATABASE bharatpur_bites;
CREATE USER app_user WITH PASSWORD 'strong_password';
ALTER ROLE app_user SET client_encoding TO 'utf8';
ALTER ROLE app_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE app_user SET default_transaction_deferrable TO on;
ALTER ROLE app_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bharatpur_bites TO app_user;
\q
```

#### Step 4: Deploy Backend

```bash
# Clone repository
git clone https://github.com/your-repo/bharatpur-bites.git
cd bharatpur-bites

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://app_user:strong_password@localhost:5432/bharatpur_bites
REDIS_URL=redis://localhost:6379
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FCM_SERVER_KEY=your_fcm_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EOF

# Build application
npm run build

# Start with PM2
pm2 start npm --name "bharatpur-bites" -- start
pm2 save
pm2 startup
```

#### Step 5: Nginx Configuration

```bash
# Create Nginx config
cat > /etc/nginx/sites-available/bharatpur-bites << 'EOF'
upstream app {
    server localhost:3000;
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

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=200 nodelay;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/trpc {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/bharatpur-bites /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 6: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
systemctl enable certbot.timer
```

### Option 2: Hostinger VPS

**Similar setup but with Hostinger's control panel:**

1. Create VPS (2GB RAM, 2 vCPU)
2. SSH into server
3. Follow same Node.js, PostgreSQL, Nginx setup
4. Use Hostinger's SSL certificate or Let's Encrypt

---

## 🔥 PHASE 2: FIREBASE HOSTING

### Step 1: Setup Firebase Project

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init

# Select:
# - Hosting
# - Database
# - Functions
```

### Step 2: Deploy Backend Functions

```bash
# Create functions directory
mkdir functions
cd functions
npm init -y
npm install express cors

# Create function
cat > index.js << 'EOF'
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// Your routes here
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

exports.api = functions.https.onRequest(app);
EOF

# Deploy
firebase deploy --only functions
```

### Step 3: Deploy Frontend

```bash
# Build React app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 🌩️ PHASE 3: AWS MIGRATION STRATEGY

### Architecture for 1 Lakh+ Users

```
┌─────────────────────────────────────────────────────┐
│                   CloudFront CDN                     │
│              (Global content delivery)               │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────┐
│                 Application Load Balancer            │
│              (Distribute traffic across AZs)         │
└────────────────┬────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐    ┌───▼──┐    ┌───▼──┐
│ EC2  │    │ EC2  │    │ EC2  │
│Auto  │    │Auto  │    │Auto  │
│Scale │    │Scale │    │Scale │
└──────┘    └──────┘    └──────┘
    │            │            │
    └────────────┼────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐    ┌───▼──┐    ┌───▼──┐
│ RDS  │    │ElastiCache│S3   │
│Master│    │ (Redis)   │Bucket│
│      │    │           │      │
└──────┘    └───────────┘└──────┘
```

### Step 1: RDS Setup

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier bharatpur-bites-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password YourStrongPassword123 \
  --allocated-storage 100 \
  --storage-type gp3 \
  --multi-az \
  --backup-retention-period 30 \
  --enable-encryption
```

### Step 2: ElastiCache (Redis)

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id bharatpur-bites-cache \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --engine-version 7.0
```

### Step 3: S3 for File Storage

```bash
# Create S3 bucket
aws s3 mb s3://bharatpur-bites-files

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket bharatpur-bites-files \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket bharatpur-bites-files \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### Step 4: EC2 Auto Scaling

```bash
# Create launch template
aws ec2 create-launch-template \
  --launch-template-name bharatpur-bites-template \
  --version-description "Node.js app" \
  --launch-template-data '{
    "ImageId": "ami-0c55b159cbfafe1f0",
    "InstanceType": "t3.medium",
    "KeyName": "your-key-pair",
    "SecurityGroupIds": ["sg-xxxxxxxx"],
    "UserData": "IyEvYmluL2Jhc2gKY3VybCBmcy5zLi5jb20vYXBwLnNoIHwgYmFzaA=="
  }'

# Create Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name bharatpur-bites-asg \
  --launch-template LaunchTemplateName=bharatpur-bites-template \
  --min-size 3 \
  --max-size 10 \
  --desired-capacity 3 \
  --availability-zones us-east-1a us-east-1b us-east-1c
```

### Step 5: Load Balancer

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name bharatpur-bites-alb \
  --subnets subnet-xxxxx subnet-yyyyy subnet-zzzzz \
  --security-groups sg-xxxxxxxx \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name bharatpur-bites-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxxxxx
```

---

## 💰 COST OPTIMIZATION

### Image Compression Strategy

```typescript
// server/middleware/image-compression.ts
import sharp from 'sharp';
import { storagePut } from './storage';

export async function compressAndUploadImage(
  imageBuffer: Buffer,
  filename: string,
  maxWidth: number = 800,
  quality: number = 80
): Promise<string> {
  // Compress image
  const compressed = await sharp(imageBuffer)
    .resize(maxWidth, maxWidth, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality, progressive: true })
    .toBuffer();

  // Calculate savings
  const savings = ((imageBuffer.length - compressed.length) / imageBuffer.length * 100).toFixed(2);
  console.log(`✅ Image compressed: ${savings}% smaller`);

  // Upload to S3
  const { url } = await storagePut(
    `images/${filename}`,
    compressed,
    'image/jpeg'
  );

  return url;
}
```

### Cost Breakdown (Monthly)

| Service | Size | Cost |
|---------|------|------|
| VPS (DigitalOcean) | 2GB RAM | $12 |
| PostgreSQL | 100GB | $20 |
| Redis | 1GB | $5 |
| Bandwidth | 1TB | $10 |
| **Total** | | **$47/month** |

**For 1 Lakh Users:**

| Service | Cost |
|---------|------|
| RDS Multi-AZ | $500 |
| ElastiCache | $200 |
| EC2 (10 instances) | $1000 |
| S3 Storage | $100 |
| CloudFront CDN | $200 |
| **Total** | **$2000/month** |

---

## 📊 MONITORING & LOGGING

### CloudWatch Setup

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb

# Configure
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json << 'EOF'
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/app/*.log",
            "log_group_name": "/aws/ec2/bharatpur-bites",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "BharatpurBites",
    "metrics_collected": {
      "cpu": { "measurement": [{ "name": "cpu_usage_idle" }] },
      "mem": { "measurement": [{ "name": "mem_used_percent" }] },
      "disk": { "measurement": [{ "name": "used_percent" }] }
    }
  }
}
EOF

# Start agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

### Application Logging

```typescript
// server/_core/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

---

## 📈 SCALING TO 1 LAKH+ USERS

### Phase 1: 10K Users (Current Setup)
- Single VPS with PostgreSQL
- Redis for caching
- Nginx reverse proxy

### Phase 2: 50K Users
- AWS RDS Multi-AZ
- ElastiCache cluster
- Load balancer
- 3-5 EC2 instances

### Phase 3: 1 Lakh+ Users
- RDS with read replicas
- Redis cluster (Sentinel)
- CloudFront CDN
- 10+ EC2 instances
- Separate services (microservices)
- Message queue (SQS/RabbitMQ)

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_rider_id ON orders(riderId);
CREATE INDEX idx_riders_location ON riders(currentLatitude, currentLongitude);
CREATE INDEX idx_orders_created_at ON orders(createdAt DESC);

-- Partition large tables
CREATE TABLE orders_2024_q1 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

---

## ✅ Deployment Checklist

- [ ] Database backup strategy configured
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Monitoring alerts set up
- [ ] Log aggregation configured
- [ ] CDN configured
- [ ] Auto-scaling policies set
- [ ] Disaster recovery plan documented

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0
