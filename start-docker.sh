#!/bin/bash
# TapSpot 快速启动脚本

echo "🚀 启动 TapSpot..."

# 停止旧容器
docker rm -f tapspot-backend tapspot-frontend 2>/dev/null

# 启动后端（使用 host 网络，直接连接宿主机 MySQL）
echo "📦 启动后端服务..."
docker run -d \
  --name tapspot-backend \
  --network host \
  --restart unless-stopped \
  -e DB_HOST=127.0.0.1 \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=TapSpot@2026 \
  -e DB_NAME=tapspot \
  -e PORT=8080 \
  -e GIN_MODE=release \
  tapspot-backend:latest

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 5

# 启动前端
echo "📦 启动前端服务..."
docker run -d \
  --name tapspot-frontend \
  -p 8081:80 \
  --restart unless-stopped \
  tapspot-frontend:latest

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址:"
echo "  前端：http://$(hostname -I | awk '{print $1}'):8081"
echo "  后端API：http://$(hostname -I | awk '{print $1}'):8080/api"
echo ""
echo "📋 查看日志:"
echo "  docker logs -f tapspot-backend"
echo "  docker logs -f tapspot-frontend"
