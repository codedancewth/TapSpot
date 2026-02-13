#!/bin/bash

# TapSpot 快速公网访问脚本
# 使用ngrok提供临时公网访问

set -e

echo "🔗 TapSpot 快速公网访问"
echo "========================"

# 检查ngrok
check_ngrok() {
    if ! command -v ngrok &> /dev/null; then
        echo "❌ ngrok未安装"
        echo ""
        echo "安装方法:"
        echo "1. 访问 https://ngrok.com 注册账号"
        echo "2. 下载ngrok并添加到PATH"
        echo "3. 添加authtoken: ngrok config add-authtoken <你的token>"
        echo ""
        echo "或者使用以下命令安装:"
        echo "curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null"
        echo "echo 'deb https://ngrok-agent.s3.amazonaws.com buster main' | sudo tee /etc/apt/sources.list.d/ngrok.list"
        echo "sudo apt update && sudo apt install ngrok"
        exit 1
    fi
}

# 启动本地服务
start_local_services() {
    echo "🚀 启动本地服务..."
    
    # 检查是否已安装Node.js
    if ! command -v node &> /dev/null; then
        echo "⚠ Node.js未安装，尝试安装..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # 启动后端演示服务器
    echo "📡 启动后端API服务器..."
    cd /root/.openclaw/workspace/TapSpot
    node demo-server.js &
    BACKEND_PID=$!
    echo "✅ 后端启动完成 (PID: $BACKEND_PID)"
    
    # 启动前端
    echo "🎨 启动前端开发服务器..."
    cd frontend
    npm install --silent
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ 前端启动完成 (PID: $FRONTEND_PID)"
    
    # 等待服务启动
    echo "⏳ 等待服务启动..."
    sleep 5
    
    # 检查服务状态
    if curl -s http://localhost:8080/api/v1/stats > /dev/null; then
        echo "✅ 后端API服务运行正常"
    else
        echo "❌ 后端API服务启动失败"
        exit 1
    fi
    
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ 前端服务运行正常"
    else
        echo "⚠ 前端服务可能需要更多时间启动，继续..."
    fi
}

# 启动ngrok隧道
start_ngrok_tunnels() {
    echo ""
    echo "🔗 启动ngrok隧道..."
    
    # 前端隧道
    echo "🌐 创建前端隧道 (端口3000)..."
    ngrok http 3000 --log=stdout > ngrok-frontend.log &
    NGROK_FRONTEND_PID=$!
    
    # 后端隧道
    echo "🔧 创建后端API隧道 (端口8080)..."
    ngrok http 8080 --log=stdout > ngrok-backend.log &
    NGROK_BACKEND_PID=$!
    
    echo "⏳ 等待隧道建立..."
    sleep 8
    
    # 获取隧道URL
    FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | grep '3000' | cut -d'"' -f4)
    BACKEND_URL=$(curl -s http://localhost:4041/api/tunnels | grep -o '"public_url":"[^"]*"' | grep '8080' | cut -d'"' -f4)
    
    if [ -n "$FRONTEND_URL" ] && [ -n "$BACKEND_URL" ]; then
        echo ""
        echo "🎉 公网访问地址已创建！"
        echo "========================================"
        echo "🌐 前端访问地址: $FRONTEND_URL"
        echo "🔧 后端API地址: $BACKEND_URL"
        echo "========================================"
        echo ""
        echo "📋 使用说明:"
        echo "1. 前端地址可以直接在浏览器中打开"
        echo "2. 后端API可以用于测试和集成"
        echo "3. 按 Ctrl+C 停止所有服务"
        echo ""
        echo "⚠ 注意: ngrok免费版有使用限制"
        echo "   - 每个隧道2小时自动重启"
        echo "   - 带宽限制"
        echo "   - 适合临时测试使用"
    else
        echo "❌ 无法获取隧道URL，请检查ngrok配置"
        exit 1
    fi
}

# 清理函数
cleanup() {
    echo ""
    echo "🧹 清理服务..."
    kill $BACKEND_PID $FRONTEND_PID $NGROK_FRONTEND_PID $NGROK_BACKEND_PID 2>/dev/null || true
    echo "✅ 服务已停止"
    exit 0
}

# 设置退出信号处理
trap cleanup SIGINT SIGTERM

# 主函数
main() {
    echo "🔍 检查环境..."
    check_ngrok
    
    echo ""
    echo "选择部署方式:"
    echo "1) 快速启动（使用现有服务）"
    echo "2) 完整启动（启动本地服务 + ngrok）"
    read -p "请选择 (1-2): " choice
    
    case $choice in
        1)
            echo "使用现有服务..."
            ;;
        2)
            start_local_services
            ;;
        *)
            echo "无效选择，使用完整启动"
            start_local_services
            ;;
    esac
    
    start_ngrok_tunnels
    
    # 保持脚本运行
    echo ""
    echo "⏳ 服务运行中，按 Ctrl+C 停止..."
    while true; do
        sleep 60
    done
}

# 运行主函数
main "$@"
