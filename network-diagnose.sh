#!/bin/bash

# TapSpot 网络诊断脚本

echo "🔍 TapSpot 网络诊断工具"
echo "========================"
echo ""

# 服务器信息
echo "📊 服务器信息:"
echo "公网IP: 43.130.53.168"
echo "内网IP: $(hostname -I | awk '{print $1}')"
echo "主机名: $(hostname)"
echo ""

# 服务状态
echo "📡 服务状态:"
echo "前端 (3000): $(netstat -tln | grep ':3000' >/dev/null && echo '✅ 监听中' || echo '❌ 未监听')"
echo "后端 (8080): $(netstat -tln | grep ':8080' >/dev/null && echo '✅ 监听中' || echo '❌ 未监听')"
echo "指南 (8000): $(netstat -tln | grep ':8000' >/dev/null && echo '✅ 监听中' || echo '❌ 未监听')"
echo ""

# 进程状态
echo "🔄 进程状态:"
ps aux | grep -E "(vite|demo-server|python.*http.server)" | grep -v grep | while read line; do
  echo "  $line"
done
echo ""

# 本地测试
echo "🧪 本地连接测试:"
echo "测试前端 (3000): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo '失败')"
echo "测试后端 (8080): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/stats 2>/dev/null || echo '失败')"
echo "测试指南 (8000): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/network-access-guide.html 2>/dev/null || echo '失败')"
echo ""

# 网络配置
echo "🌐 网络配置:"
echo "监听地址:"
netstat -tln | grep -E ":(3000|8080|8000)" | awk '{print "  端口 "$4" -> "$6}'
echo ""

# 防火墙检查
echo "🔥 防火墙状态:"
if command -v ufw &> /dev/null; then
  ufw status | grep -E "(3000|8080|8000|Status)"
elif command -v firewall-cmd &> /dev/null; then
  firewall-cmd --list-ports | grep -E "(3000|8080|8000)" && echo "防火墙已配置" || echo "防火墙未找到相关端口"
else
  echo "未找到常用防火墙工具"
fi
echo ""

# 访问地址
echo "🚀 访问地址:"
echo "1. 前端应用: http://43.130.53.168:3000"
echo "2. 后端API: http://43.130.53.168:8080/api/v1/stats"
echo "3. 访问指南: http://43.130.53.168:8000/network-access-guide.html"
echo "4. 服务状态: http://43.130.53.168:8000/service-status.html"
echo ""

# 故障排除建议
echo "🔧 故障排除建议:"
echo "1. 检查云服务器安全组规则:"
echo "   - 确保端口 3000、8080、8000 已开放"
echo "   - 协议: TCP"
echo "   - 源IP: 0.0.0.0/0 (或你的IP段)"
echo ""
echo "2. 测试从外部访问:"
echo "   curl -v http://43.130.53.168:3000"
echo "   curl -v http://43.130.53.168:8080/api/v1/stats"
echo ""
echo "3. 重启服务:"
echo "   cd /root/.openclaw/workspace/TapSpot"
echo "   ./start.sh"
echo ""
echo "4. 查看日志:"
echo "   tail -f /root/.openclaw/workspace/TapSpot/backend.log"
echo "   tail -f /root/.openclaw/workspace/TapSpot/frontend.log"
echo ""

# 生成测试命令
echo "📋 测试命令:"
cat << 'EOF'
# 从外部测试（在另一台机器上运行）:
curl -v --connect-timeout 10 http://43.130.53.168:3000
curl -v --connect-timeout 10 http://43.130.53.168:8080/api/v1/stats

# 使用telnet测试端口:
telnet 43.130.53.168 3000
telnet 43.130.53.168 8080

# 使用nc测试:
nc -zv 43.130.53.168 3000
nc -zv 43.130.53.168 8080
EOF
echo ""
echo "💡 如果外部无法访问，最可能的原因是云服务器的安全组未开放相应端口。"