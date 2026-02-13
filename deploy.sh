#!/bin/bash

# TapSpot 部署脚本
# 用于将项目部署到公网服务器

set -e

echo "🚀 TapSpot 公网部署脚本"
echo "=========================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Docker和Docker Compose
check_dependencies() {
    echo -e "${BLUE}🔍 检查依赖...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker未安装${NC}"
        echo "请先安装Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker已安装${NC}"
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${YELLOW}⚠ Docker Compose未安装，尝试安装...${NC}"
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    echo -e "${GREEN}✓ Docker Compose已安装${NC}"
}

# 显示部署选项
show_options() {
    echo -e "\n${BLUE}📋 选择部署方式:${NC}"
    echo "1) 本地Docker部署（端口3000/8080）"
    echo "2) 生产环境部署（Nginx + HTTPS）"
    echo "3) 云服务器一键部署"
    echo "4) 使用内网穿透（ngrok）"
    echo "5) 退出"
    
    read -p "请选择 (1-5): " choice
    echo ""
    
    case $choice in
        1) deploy_local ;;
        2) deploy_production ;;
        3) deploy_cloud ;;
        4) deploy_ngrok ;;
        5) exit 0 ;;
        *) echo -e "${RED}无效选择${NC}"; show_options ;;
    esac
}

# 本地Docker部署
deploy_local() {
    echo -e "${BLUE}🚀 开始本地Docker部署...${NC}"
    
    # 构建镜像
    echo "📦 构建Docker镜像..."
    docker-compose build
    
    # 启动服务
    echo "🚀 启动服务..."
    docker-compose up -d
    
    echo -e "\n${GREEN}✅ 部署完成！${NC}"
    echo "🌐 访问地址:"
    echo "  前端: http://localhost:3000"
    echo "  后端API: http://localhost:8080/api/v1"
    echo "  数据库: localhost:3306 (用户: tapspot_user, 密码: tapspot_password)"
    echo ""
    echo "📋 管理命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
}

# 生产环境部署
deploy_production() {
    echo -e "${BLUE}🚀 开始生产环境部署...${NC}"
    
    # 检查SSL证书
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        echo -e "${YELLOW}⚠ 未找到SSL证书${NC}"
        echo "请将SSL证书文件放入 nginx/ssl/ 目录:"
        echo "  - cert.pem (证书文件)"
        echo "  - key.pem (私钥文件)"
        echo ""
        echo "或者使用Let's Encrypt生成免费证书:"
        echo "  sudo apt install certbot"
        echo "  sudo certbot certonly --standalone -d your-domain.com"
        read -p "是否继续使用自签名证书？(y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            generate_self_signed_cert
        else
            exit 1
        fi
    fi
    
    # 修改环境变量为生产环境
    echo "⚙️ 配置生产环境..."
    sed -i 's/GIN_MODE=debug/GIN_MODE=release/g' docker-compose.yml
    
    # 构建和启动
    echo "📦 构建生产镜像..."
    docker-compose build
    
    echo "🚀 启动生产服务..."
    docker-compose up -d
    
    echo -e "\n${GREEN}✅ 生产环境部署完成！${NC}"
    echo "🌐 访问地址:"
    echo "  HTTPS: https://你的域名或服务器IP"
    echo "  HTTP (自动重定向): http://你的域名或服务器IP"
    echo ""
    echo "🔧 生产环境配置:"
    echo "  1. 确保防火墙开放80和443端口"
    echo "  2. 配置域名DNS解析到服务器IP"
    echo "  3. 定期备份数据库: docker exec tapspot-mysql mysqldump -u root -p tapspot > backup.sql"
}

# 生成自签名证书
generate_self_signed_cert() {
    echo "🔐 生成自签名SSL证书..."
    mkdir -p nginx/ssl
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=TapSpot/CN=tapspot.local"
    
    echo -e "${GREEN}✓ 自签名证书已生成${NC}"
    echo "⚠ 注意: 自签名证书浏览器会显示不安全警告，仅用于测试"
}

# 云服务器部署
deploy_cloud() {
    echo -e "${BLUE}☁️ 云服务器部署指南${NC}"
    echo ""
    echo "1) 购买云服务器（推荐配置）:"
    echo "   - CPU: 2核"
    echo "   - 内存: 4GB"
    echo "   - 硬盘: 50GB SSD"
    echo "   - 系统: Ubuntu 22.04 LTS"
    echo ""
    echo "2) 连接服务器:"
    echo "   ssh root@你的服务器IP"
    echo ""
    echo "3) 在服务器上运行以下命令:"
    echo "   git clone https://github.com/codedancewth/TapSpot.git"
    echo "   cd TapSpot"
    echo "   git checkout momo"
    echo "   chmod +x deploy.sh"
    echo "   ./deploy.sh"
    echo ""
    echo "4) 选择部署方式（推荐选择2 - 生产环境部署）"
    echo ""
    echo "5) 配置域名和SSL证书"
    echo ""
    echo "推荐云服务商:"
    echo "  - 阿里云: https://www.aliyun.com"
    echo "  - 腾讯云: https://cloud.tencent.com"
    echo "  - AWS: https://aws.amazon.com"
    echo "  - DigitalOcean: https://www.digitalocean.com"
}

# 内网穿透部署
deploy_ngrok() {
    echo -e "${BLUE}🔗 内网穿透部署（ngrok）${NC}"
    echo ""
    echo "1) 安装ngrok:"
    echo "   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null"
    echo "   echo 'deb https://ngrok-agent.s3.amazonaws.com buster main' | sudo tee /etc/apt/sources.list.d/ngrok.list"
    echo "   sudo apt update && sudo apt install ngrok"
    echo ""
    echo "2) 添加authtoken（需要注册ngrok账号）:"
    echo "   ngrok config add-authtoken 你的token"
    echo ""
    echo "3) 启动本地服务:"
    echo "   ./deploy.sh  # 选择1 - 本地Docker部署"
    echo ""
    echo "4) 创建隧道:"
    echo "   # 前端隧道"
    echo "   ngrok http 3000"
    echo "   # 后端API隧道"
    echo "   ngrok http 8080"
    echo ""
    echo "5) 使用ngrok提供的公网地址访问"
    echo ""
    echo "替代方案:"
    echo "  - frp: https://github.com/fatedier/frp"
    echo "  - 花生壳: https://hsk.oray.com"
}

# 主函数
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}      TapSpot 公网部署工具 v1.0        ${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    check_dependencies
    show_options
}

# 运行主函数
main "$@"
