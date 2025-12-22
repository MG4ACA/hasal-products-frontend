# 🚀 Hostinger VPS Deployment Guide

## Hasala Products POS (MEVN Stack)

This guide covers deploying the Hasala Products POS application (Vue 3 + Express/Sequelize API) on a Hostinger VPS using the MEVN stack template.

---

## 📋 Prerequisites

- Hostinger VPS with Ubuntu 22.04 + MEVN Stack template
- SSH access to the VPS (root or sudo user)
- VPS public IP
- Domain name pointing to the VPS (optional but recommended)

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────┐
│         Hostinger VPS Server            │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  Nginx (Reverse Proxy)         │    │
│  │  Port 80/443                   │    │
│  └──────────┬─────────────────────┘    │
│             │                           │
│  ┌──────────▼──────────┐  ┌──────────┐ │
│  │  Vue.js Frontend    │  │  Backend │ │
│  │  (Static Files)     │  │  API     │ │
│  │                     │  │  Port    │ │
│  │                     │  │  5000    │ │
│  └─────────────────────┘  └────┬─────┘ │
│                                 │       │
│                          ┌──────▼─────┐ │
│                          │   MySQL    │ │
│                          │  Database  │ │
│                          └────────────┘ │
└─────────────────────────────────────────┘
```

---

## 📦 Step 1: Connect to Your VPS

```bash
ssh root@your_vps_ip
# or
ssh username@your_vps_ip
```

---

## 🔧 Step 2: Initial Server Setup

### 2.1 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Required Tools

```bash
# Git
sudo apt install git -y

# PM2
sudo npm install -g pm2

# Nginx
sudo apt install nginx -y

# MySQL client (if needed)
sudo apt install mysql-client -y
sudo systemctl status mysql
sudo systemctl start mysql
```

### 2.3 Configure Firewall

```bash
sudo ufw allow 22   # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS
sudo ufw enable
```

---

## 🗄️ Step 3: Set Up MySQL Database

### 3.1 Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow prompts to set root password, remove anonymous users, disallow remote root login, and remove the test DB.

### 3.2 Create Database and User

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE hasala_pos;
CREATE USER 'hasala_user'@'localhost' IDENTIFIED BY 'REPLACE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON hasala_pos.* TO 'hasala_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 📥 Step 4: Deploy Your Application

### 4.1 Create Application Directory

```bash
sudo mkdir -p /var/www/hasala-products
cd /var/www/hasala-products
```

### 4.2 Pull Code

```bash
sudo git clone https://github.com/your-username/hasala-products.git
# or push code via scp/rsync

cd hasala-products
sudo chown -R $USER:$USER .
sudo chmod -R 755 .
```

If your backend lives in a separate repo, clone it into `/var/www/hasala-products/hasal-pos-backend`.

---

## 🔨 Step 5: Set Up Backend (Express/Sequelize)

### 5.1 Install Dependencies

```bash
cd /var/www/hasala-products/hasal-pos-backend
npm install --production
```

### 5.2 Configure Environment

Create `.env`:

```bash
cat > .env <<'EOF'
NODE_ENV=production
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=hasala_pos
DB_USER=hasala_user
DB_PASSWORD=REPLACE_ME_STRONG_PASSWORD

CORS_ORIGIN=http://your_vps_ip
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
EOF
```

Adjust `CORS_ORIGIN` to your domain once DNS/SSL is ready.

### 5.3 Initialize Database

```bash
npm run db:create    # creates DB tables (uses Sequelize models)
npm run db:seed      # optional: loads seed data if configured
# or: npm run db:setup
```

### 5.4 Smoke-Test Backend

```bash
npm start
# Health: http://localhost:5000/health
# API base: http://localhost:5000/api
```

Stop with `Ctrl+C` after verifying.

### 5.5 Run with PM2

```bash
pm2 start server.js --name hasala-pos-backend
pm2 save
pm2 startup
pm2 status
```

Logs and control:

```bash
pm2 logs hasala-pos-backend
pm2 restart hasala-pos-backend
pm2 stop hasala-pos-backend
```

---

## 🎨 Step 6: Set Up Frontend (Vue 3 + Vite)

### 6.1 Configure API Base URL

Create production env file in the frontend root (same level as `src/`):

```bash
cd /var/www/hasala-products
cat > .env.production <<'EOF'
VITE_API_BASE_URL=http://your_vps_ip/api
EOF
```

After SSL + domain, change to `https://yourdomain.com/api` and rebuild.

### 6.2 Install and Build

```bash
npm install
npm run build
```

The build outputs to `dist/`.

### 6.3 Publish Static Files for Nginx

```bash
sudo mkdir -p /var/www/hasala-products/frontend
sudo cp -r dist/* /var/www/hasala-products/frontend/
sudo chown -R www-data:www-data /var/www/hasala-products/frontend
sudo chmod -R 755 /var/www/hasala-products/frontend
```

---

## 🌐 Step 7: Configure Nginx

### 7.1 Site Config

```bash
sudo nano /etc/nginx/sites-available/hasala-products
```

Use this as a starting point (replace domain/IP):

```nginx
upstream hasala_backend {
    server localhost:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name your_vps_ip yourdomain.com www.yourdomain.com;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        root /var/www/hasala-products/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api/ {
        proxy_pass http://hasala_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://hasala_backend/health;
        access_log off;
    }

    access_log /var/log/nginx/hasala-products-access.log;
    error_log /var/log/nginx/hasala-products-error.log;
}
```

### 7.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/hasala-products /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 Step 8: SSL with Certbot (Optional)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot renew --dry-run
```

Update frontend env after SSL:

```bash
cd /var/www/hasala-products
printf "VITE_API_BASE_URL=https://yourdomain.com/api\n" | sudo tee .env.production
npm run build
sudo cp -r dist/* /var/www/hasala-products/frontend/
sudo systemctl restart nginx
```

---

## ✅ Step 9: Verify Deployment

```bash
pm2 status
pm2 logs hasala-pos-backend
curl http://localhost:5000/health
sudo systemctl status nginx
sudo tail -f /var/log/nginx/hasala-products-error.log
```

Browse to `http://your_vps_ip` (or your domain) to confirm the UI loads and API calls succeed.

---

## 🔄 Step 10: Quick Deployment Script (Updates)

```bash
cat > /var/www/hasala-products/deploy.sh <<'EOF'
#!/bin/bash
set -e
cd /var/www/hasala-products

echo "📥 Pulling latest code..."
git pull origin main || true

echo "🔨 Backend"
cd hasal-pos-backend
npm install --production
pm2 restart hasala-pos-backend

cd ..
echo "🎨 Frontend"
npm install
npm run build
sudo cp -r dist/* /var/www/hasala-products/frontend/

echo "🌐 Restarting Nginx"
sudo systemctl restart nginx

echo "✅ Done"
EOF

sudo chmod +x /var/www/hasala-products/deploy.sh
```

Run with:

```bash
/var/www/hasala-products/deploy.sh
```

---

## 🛠️ Maintenance

- Services: `pm2 status`, `sudo systemctl status nginx`, `sudo systemctl status mysql`
- Logs: `pm2 logs hasala-pos-backend`, `sudo tail -f /var/log/nginx/hasala-products-error.log`
- Disk/Memory: `df -h`, `free -m`

### Database Backup (manual example)

```bash
mkdir -p ~/backups
mysqldump -u hasala_user -p hasala_pos > ~/backups/hasala_pos_$(date +%Y%m%d_%H%M%S).sql
```

Add a simple rotation script and cron if needed (similar to the pharmacy guide).

---

## 🐛 Troubleshooting

- **Backend down / 502**: `pm2 status`, `pm2 restart hasala-pos-backend`, ensure port 5000 is free.
- **DB errors**: verify `.env` credentials; `mysql -u hasala_user -p hasala_pos`.
- **Frontend not updating**: rebuild + recopy `dist`, then `sudo systemctl restart nginx`.
- **CORS issues**: set `CORS_ORIGIN` to your domain and restart backend.

---

## 📚 References

- Hostinger VPS docs
- PM2 docs
- Nginx docs
- Certbot docs

---

## 📝 Post-Deployment Checklist

- [ ] PM2 process `hasala-pos-backend` running
- [ ] Database created and reachable
- [ ] Frontend built and served by Nginx
- [ ] API reachable at `/api` and health at `/health`
- [ ] SSL installed (if domain)
- [ ] Firewall allows 80/443 (and 22 for SSH)
- [ ] Backups scheduled
- [ ] Deployment script ready

---

**Last Updated:** December 2025
**Version:** 1.0.0
