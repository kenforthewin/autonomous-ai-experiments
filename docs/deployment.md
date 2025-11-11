# Deployment Guide

This guide covers deploying the RAG Personal Notes Application to production environments.

## Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key
- Server or cloud platform (VPS, AWS, GCP, Azure, etc.)

## Deployment Options

### Option 1: Single Server Deployment (Recommended for Small Scale)

Deploy both frontend and backend on a single server with Nginx as reverse proxy.

#### Server Requirements
- 2 CPU cores minimum
- 4GB RAM minimum (8GB recommended)
- 20GB storage (more depending on document volume)
- Ubuntu 22.04 or similar Linux distribution

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx
sudo apt install nginx -y

# Install supervisor (for process management)
sudo apt install supervisor -y
```

#### Step 2: Clone Repository

```bash
cd /var/www
sudo git clone <your-repo-url> rag-notes
sudo chown -R $USER:$USER rag-notes
cd rag-notes
```

#### Step 3: Backend Setup

```bash
cd /var/www/rag-notes/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
nano .env
```

Add your configuration:
```env
OPENAI_API_KEY=sk-your-key-here
CHROMA_DB_PATH=/var/www/rag-notes/backend/data/chroma_db
UPLOAD_DIR=/var/www/rag-notes/backend/data/uploads
MAX_UPLOAD_SIZE=10485760
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4
```

#### Step 4: Frontend Build

```bash
cd /var/www/rag-notes/frontend

# Install dependencies
npm install

# Create production .env
echo "VITE_API_URL=https://your-domain.com" > .env

# Build for production
npm run build
```

#### Step 5: Configure Supervisor (Backend Process Manager)

Create supervisor config:
```bash
sudo nano /etc/supervisor/conf.d/rag-notes.conf
```

Add:
```ini
[program:rag-notes-backend]
directory=/var/www/rag-notes/backend
command=/var/www/rag-notes/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/rag-notes/backend.err.log
stdout_logfile=/var/log/rag-notes/backend.out.log
environment=PATH="/var/www/rag-notes/backend/venv/bin"
```

Create log directory:
```bash
sudo mkdir -p /var/log/rag-notes
sudo chown -R www-data:www-data /var/log/rag-notes
```

Update supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start rag-notes-backend
```

#### Step 6: Configure Nginx

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/rag-notes
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/rag-notes/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    # Docs
    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/rag-notes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

#### Step 8: Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Option 2: Docker Deployment

#### Docker Compose Setup

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CHROMA_DB_PATH=/app/data/chroma_db
      - UPLOAD_DIR=/app/data/uploads
    volumes:
      - ./backend/data:/app/data
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${VITE_API_URL}
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app ./app
COPY data ./data

# Create data directories
RUN mkdir -p /app/data/uploads /app/data/chroma_db

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Frontend Nginx Config

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10M;
    }
}
```

#### Deploy with Docker

```bash
# Create .env file
cat > .env << EOF
OPENAI_API_KEY=sk-your-key-here
VITE_API_URL=https://your-domain.com
EOF

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Cloud Platform Deployment

#### AWS Deployment (EC2 + S3)

1. **Launch EC2 Instance**:
   - AMI: Ubuntu 22.04
   - Instance type: t3.medium
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Follow Single Server Deployment** steps above

3. **Optional: S3 for Document Storage**:
   - Create S3 bucket
   - Update `StorageService` to use boto3
   - Store documents in S3 instead of local disk

#### Heroku Deployment

1. **Backend (Heroku)**:

Create `Procfile` in backend/:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Deploy:
```bash
cd backend
heroku create rag-notes-backend
heroku config:set OPENAI_API_KEY=sk-your-key-here
git push heroku main
```

2. **Frontend (Netlify/Vercel)**:

Netlify:
```bash
cd frontend
netlify deploy --prod
```

Vercel:
```bash
cd frontend
vercel --prod
```

## Environment-Specific Configuration

### Production Environment Variables

Backend `.env`:
```env
OPENAI_API_KEY=sk-prod-key
CHROMA_DB_PATH=/var/data/chroma_db
UPLOAD_DIR=/var/data/uploads
MAX_UPLOAD_SIZE=10485760
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4

# Production settings
LOG_LEVEL=INFO
CORS_ORIGINS=https://your-domain.com
```

Frontend `.env`:
```env
VITE_API_URL=https://api.your-domain.com
```

## Monitoring and Maintenance

### Log Management

View backend logs:
```bash
sudo supervisorctl tail -f rag-notes-backend stdout
```

View Nginx logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Strategy

Create backup script `/usr/local/bin/backup-rag-notes.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/rag-notes"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup uploaded documents
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/rag-notes/backend/data/uploads

# Backup ChromaDB
tar -czf $BACKUP_DIR/chroma_$DATE.tar.gz /var/www/rag-notes/backend/data/chroma_db

# Backup metadata
cp /var/www/rag-notes/backend/data/documents_metadata.json $BACKUP_DIR/metadata_$DATE.json

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

Schedule with cron:
```bash
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-rag-notes.sh
```

### Updates

Pull latest code:
```bash
cd /var/www/rag-notes
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo supervisorctl restart rag-notes-backend

# Update frontend
cd ../frontend
npm install
npm run build
```

## Performance Optimization

### Backend Optimizations

1. **Use Gunicorn with multiple workers**:

Update supervisor config:
```ini
command=/var/www/rag-notes/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000
```

2. **Enable response caching** for common queries

3. **Connection pooling** for ChromaDB

### Frontend Optimizations

1. **Enable Nginx gzip compression**:

```nginx
gzip on;
gzip_types text/css application/javascript application/json;
gzip_min_length 1000;
```

2. **Set cache headers**:

```nginx
location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting

### Common Issues

1. **Backend won't start**:
   - Check logs: `sudo supervisorctl tail -f rag-notes-backend stderr`
   - Verify OpenAI API key is set
   - Ensure data directories exist and are writable

2. **Frontend shows API errors**:
   - Check CORS configuration
   - Verify VITE_API_URL is correct
   - Check Nginx proxy configuration

3. **File uploads fail**:
   - Check `client_max_body_size` in Nginx
   - Verify upload directory permissions
   - Check disk space

4. **High memory usage**:
   - Reduce number of Gunicorn workers
   - Implement query result caching
   - Monitor ChromaDB memory usage

## Security Checklist

- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] CORS restricted to production domain
- [ ] OpenAI API key stored securely
- [ ] Regular backups scheduled
- [ ] Log rotation configured
- [ ] Security updates automated
- [ ] File upload validation enabled
- [ ] Rate limiting implemented
- [ ] Monitoring and alerts set up

