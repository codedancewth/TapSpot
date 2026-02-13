#!/bin/bash

# TapSpot 服务启动脚本
# 用于快速启动TapSpot前端和后端服务

set -e

echo "🚀 TapSpot 服务启动脚本"
echo "========================"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务器信息
SERVER_IP="43.130.53.168"
FRONTEND_PORT="3000"
BACKEND_PORT="8080"
GUIDE_PORT="8000"

# 检查服务状态
check_status() {
    echo -e "${BLUE}🔍 检查服务状态...${NC}"
    
    # 检查前端
    if curl -s "http://${SERVER_IP}:${FRONTEND_PORT}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 前端服务运行中 (端口 ${FRONTEND_PORT})${NC}"
    else
        echo -e "${YELLOW}⚠ 前端服务未运行${NC}"
    fi
    
    # 检查后端
    if curl -s "http://${SERVER_IP}:${BACKEND_PORT}/api/v1/stats" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 后端API服务运行中 (端口 ${BACKEND_PORT})${NC}"
    else
        echo -e "${YELLOW}⚠ 后端API服务未运行${NC}"
    fi
    
    # 检查指南页面
    if curl -s "http://${SERVER_IP}:${GUIDE_PORT}/network-access-guide.html" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 访问指南运行中 (端口 ${GUIDE_PORT})${NC}"
    else
        echo -e "${YELLOW}⚠ 访问指南未运行${NC}"
    fi
}

# 停止服务
stop_services() {
    echo -e "${YELLOW}🛑 停止服务...${NC}"
    
    # 停止前端
    pkill -f "vite" 2>/dev/null || true
    echo "前端服务已停止"
    
    # 停止后端
    pkill -f "demo-server.js" 2>/dev/null || true
    echo "后端API服务已停止"
    
    # 停止指南页面
    pkill -f "http.server 8000" 2>/dev/null || true
    echo "访问指南已停止"
}

# 启动服务
start_services() {
    echo -e "${GREEN}🚀 启动服务...${NC}"
    
    # 启动后端API
    echo "启动后端API服务..."
    cd /root/.openclaw/workspace/TapSpot
    node demo-server.js > backend.log 2>&1 &
    echo "后端API服务启动完成"
    
    # 启动前端
    echo "启动前端服务..."
    cd frontend
    npm run dev > frontend.log 2>&1 &
    echo "前端服务启动完成"
    
    # 启动访问指南
    echo "启动访问指南..."
    cd ..
    python3 -m http.server 8000 > guide.log 2>&1 &
    echo "访问指南启动完成"
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 5
}

# 显示访问信息
show_access_info() {
    echo -e "\n${BLUE}🌐 访问信息${NC}"
    echo "========================================"
    echo -e "${GREEN}公网IP: ${SERVER_IP}${NC}"
    echo ""
    echo "🌐 前端应用:"
    echo "  http://${SERVER_IP}:${FRONTEND_PORT}"
    echo ""
    echo "🔧 后端API:"
    echo "  http://${SERVER_IP}:${BACKEND_PORT}/api/v1"
    echo ""
    echo "📋 访问指南:"
    echo "  http://${SERVER_IP}:${GUIDE_PORT}/network-access-guide.html"
    echo ""
    echo "📊 API测试:"
    echo "  http://${SERVER_IP}:${BACKEND_PORT}/api/v1/stats"
    echo "========================================"
}

# 查看日志
view_logs() {
    echo -e "${BLUE}📋 查看日志${NC}"
    echo "1) 前端日志"
    echo "2) 后端日志"
    echo "3) 指南日志"
    echo "4) 返回"
    
    read -p "请选择: " choice
    
    case $choice in
        1) tail -f /root/.openclaw/workspace/TapSpot/frontend.log ;;
        2) tail -f /root/.openclaw/workspace/TapSpot/backend.log ;;
        3) tail -f /root/.openclaw/workspace/TapSpot/guide.log ;;
        4) return ;;
        *) echo "无效选择" ;;
    esac
}

# 主菜单
main_menu() {
    while true; do
        echo -e "\n${BLUE}📋 主菜单${NC}"
        echo "1) 检查服务状态"
        echo "2) 启动所有服务"
        echo "3) 停止所有服务"
        echo "4) 重启所有服务"
        echo "5) 查看访问信息"
        echo "6) 查看日志"
        echo "7) 退出"
        
        read -p "请选择 (1-7): " choice
        echo ""
        
        case $choice in
            1) check_status ;;
            2) start_services; check_status ;;
            3) stop_services; check_status ;;
            4) stop_services; start_services; check_status ;;
            5) show_access_info ;;
            6) view_logs ;;
            7) echo "再见！"; exit 0 ;;
            *) echo -e "${RED}无效选择${NC}" ;;
        esac
    done
}

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}🔍 检查依赖...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js已安装${NC}"
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ npm已安装${NC}"
    
    if ! command -v python3 &> /dev/null; then
        echo -e "${YELLOW}⚠ Python3未安装，访问指南将不可用${NC}"
    else
        echo -e "${GREEN}✅ Python3已安装${NC}"
    fi
}

# 主函数
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}      TapSpot 服务管理工具 v1.0        ${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    check_dependencies
    main_menu
}

# 运行主函数
main "$@"
