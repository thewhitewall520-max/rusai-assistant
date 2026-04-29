#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# 1. 构建前端
echo "📦 Building frontend..."
cd src/frontend
npm install
npm run build
cd ../..

# 2. 复制构建文件
mkdir -p html
cp -r src/frontend/build/* html/

# 3. 重启 Docker
echo "🐳 Restarting Docker containers..."
docker compose down
docker compose up -d

echo "✅ Deployment completed!"
echo "Website: http://www.rusai.cc"