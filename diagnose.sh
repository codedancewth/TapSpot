#!/bin/bash

# TapSpot 项目全面诊断和修复脚本

echo "🔍 TapSpot 项目全面诊断"
echo "========================================"
echo ""

# 1. 检查服务状态
echo "📊 1. 检查服务状态"
echo "--------------------"
echo "后端API: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/stats 2>/dev/null || echo "失败")"
echo "前端服务: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "失败")"
echo ""

# 2. 检查进程
echo "🔄 2. 检查进程状态"
echo "--------------------"
ps aux | grep -E "(vite|demo-server|node.*8080)" | grep -v grep | awk '{print $11, $12, $13, $14, $15}'
echo ""

# 3. 检查端口
echo "🌐 3. 检查端口监听"
echo "--------------------"
netstat -tlnp 2>/dev/null | grep -E ":(3000|8080|8000)" | awk '{print $4, $6}'
echo ""

# 4. 检查文件完整性
echo "📁 4. 检查关键文件"
echo "--------------------"
files=(
  "/root/.openclaw/workspace/TapSpot/frontend/src/App.jsx"
  "/root/.openclaw/workspace/TapSpot/frontend/src/main.jsx"
  "/root/.openclaw/workspace/TapSpot/frontend/src/styles/modern.css"
  "/root/.openclaw/workspace/TapSpot/frontend/src/components/ErrorBoundary.jsx"
  "/root/.openclaw/workspace/TapSpot/demo-server.js"
  "/root/.openclaw/workspace/TapSpot/frontend/index.html"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $(basename $file)"
  else
    echo "❌ 缺失: $file"
  fi
done
echo ""

# 5. 检查依赖
echo "📦 5. 检查依赖"
echo "--------------------"
if [ -d "/root/.openclaw/workspace/TapSpot/frontend/node_modules" ]; then
  echo "✅ node_modules 存在"
  echo "   大小: $(du -sh /root/.openclaw/workspace/TapSpot/frontend/node_modules 2>/dev/null | awk '{print $1}')"
else
  echo "❌ node_modules 缺失"
fi
echo ""

# 6. 测试API端点
echo "🧪 6. 测试API端点"
echo "--------------------"
echo "统计数据: $(curl -s http://localhost:8080/api/v1/stats 2>/dev/null | head -c 100)..."
echo "地点列表: $(curl -s "http://localhost:8080/api/v1/spots?page_size=1" 2>/dev/null | head -c 100)..."
echo "国家列表: $(curl -s http://localhost:8080/api/v1/countries 2>/dev/null | head -c 100)..."
echo ""

# 7. 检查构建
echo "🔨 7. 检查构建状态"
echo "--------------------"
if [ -d "/root/.openclaw/workspace/TapSpot/frontend/dist" ]; then
  echo "✅ 构建目录存在"
  ls -lh /root/.openclaw/workspace/TapSpot/frontend/dist/ 2>/dev/null | awk '{print $9, $5}'
else
  echo "⚠️ 构建目录不存在"
fi
echo ""

# 8. 网络测试
echo "🌐 8. 网络连接测试"
echo "--------------------"
echo "本地回环: $(ping -c 1 localhost 2>/dev/null | grep 'time=' | awk -F'=' '{print $4}' || echo "失败")"
echo "DNS解析: $(nslookup baidu.com 2>/dev/null | grep 'Address' | tail -1 | awk '{print $2}' || echo "失败")"
echo ""

# 9. 内存和磁盘
echo "💾 9. 系统资源"
echo "--------------------"
echo "内存使用: $(free -h 2>/dev/null | grep 'Mem:' | awk '{print $3 "/" $2}')"
echo "磁盘使用: $(df -h / 2>/dev/null | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
echo ""

# 10. 最近错误日志
echo "📋 10. 最近的错误日志"
echo "--------------------"
if [ -f "/root/.openclaw/workspace/TapSpot/backend.log" ]; then
  echo "后端日志（最后5行）:"
  tail -5 /root/.openclaw/workspace/TapSpot/backend.log 2>/dev/null
fi
echo ""

# 修复建议
echo "🔧 修复建议"
echo "========================================"
echo ""

# 检查是否需要重启服务
if ! curl -s http://localhost:8080/api/v1/stats > /dev/null 2>&1; then
  echo "⚠️ 后端服务未运行"
  echo "   执行: cd /root/.openclaw/workspace/TapSpot && node demo-server.js &"
fi

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "⚠️ 前端服务未运行"
  echo "   执行: cd /root/.openclaw/workspace/TapSpot/frontend && npm run dev &"
fi

echo ""
echo "✅ 诊断完成！"
echo ""
echo "📝 快速修复命令:"
echo "1. 重启所有服务: cd /root/.openclaw/workspace/TapSpot && ./start.sh"
echo "2. 只重启前端: cd /root/.openclaw/workspace/TapSpot/frontend && npm run dev"
echo "3. 只重启后端: cd /root/.openclaw/workspace/TapSpot && node demo-server.js"
echo "4. 重新构建: cd /root/.openclaw/workspace/TapSpot/frontend && npm run build"
echo "5. 清理并重装: cd /root/.openclaw/workspace/TapSpot/frontend && rm -rf node_modules && npm install"