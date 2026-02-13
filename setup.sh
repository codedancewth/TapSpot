#!/bin/bash

# TapSpot Development Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up TapSpot development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Go
if command -v go &> /dev/null; then
    echo -e "${GREEN}✓ Go is installed: $(go version)${NC}"
else
    echo -e "${RED}✗ Go is not installed${NC}"
    echo "Please install Go 1.21+ from https://golang.org/dl/"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js is installed: $(node --version)${NC}"
else
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✓ MySQL client is installed${NC}"
else
    echo -e "${YELLOW}⚠ MySQL client is not installed${NC}"
    echo "You may need to install MySQL separately"
fi

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is installed: $(docker --version)${NC}"
fi

echo ""
echo "📦 Installing dependencies..."

# Backend dependencies
echo "📁 Backend dependencies..."
cd backend
if [ -f "go.mod" ]; then
    go mod download
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ go.mod not found${NC}"
    exit 1
fi
cd ..

# Frontend dependencies
echo "📁 Frontend dependencies..."
cd frontend
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ package.json not found${NC}"
    exit 1
fi
cd ..

echo ""
echo "⚙️ Setting up environment..."

# Create backend .env file
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠ Created backend/.env from example${NC}"
    echo -e "${YELLOW}⚠ Please edit backend/.env with your database credentials${NC}"
else
    echo -e "${GREEN}✓ Backend .env file exists${NC}"
fi

# Create database directory
mkdir -p database

echo ""
echo "📊 Database setup..."

# Check if MySQL is running
if mysqladmin ping &> /dev/null; then
    echo -e "${GREEN}✓ MySQL is running${NC}"
    
    # Ask if user wants to initialize database
    read -p "Do you want to initialize the database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Initializing database..."
        mysql -u root -p < database/init.sql
        echo -e "${GREEN}✓ Database initialized${NC}"
    fi
else
    echo -e "${YELLOW}⚠ MySQL is not running or credentials are needed${NC}"
    echo "You can start MySQL with:"
    echo "  sudo systemctl start mysql"
    echo "Or use Docker:"
    echo "  docker run --name tapspot-mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend:"
echo "   cd backend && go run main.go"
echo ""
echo "2. Start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "📝 Notes:"
echo "- Make sure MySQL is running on port 3306"
echo "- Update backend/.env with your database credentials"
echo "- The backend will auto-create tables on first run"
echo ""
echo "🐳 Docker option:"
echo "You can also use Docker Compose:"
echo "  docker-compose up -d"
echo ""

# Create docker-compose.yml if it doesn't exist
if [ ! -f "docker-compose.yml" ]; then
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: tapspot-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: tapspot
      MYSQL_USER: tapspot_user
      MYSQL_PASSWORD: tapspot_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build: ./backend
    container_name: tapspot-backend
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: tapspot_user
      DB_PASSWORD: tapspot_password
      DB_NAME: tapspot
    ports:
      - "8080:8080"
    volumes:
      - ./backend:/app
    command: go run main.go

  frontend:
    build: ./frontend
    container_name: tapspot-frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  mysql_data:
EOF
    echo -e "${GREEN}✓ Created docker-compose.yml${NC}"
fi

# Create Dockerfiles
if [ ! -f "backend/Dockerfile" ]; then
    cat > backend/Dockerfile << 'EOF'
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o tapspot

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/tapspot .

EXPOSE 8080

CMD ["./tapspot"]
EOF
    echo -e "${GREEN}✓ Created backend/Dockerfile${NC}"
fi

if [ ! -f "frontend/Dockerfile" ]; then
    cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
EOF
    echo -e "${GREEN}✓ Created frontend/Dockerfile${NC}"
fi

echo ""
echo "✅ All done! Happy coding! 🎉"
