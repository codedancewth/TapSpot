# TapSpot 后端 Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 安装依赖
RUN apk add --no-cache git

# 复制 go.mod 和 go.sum
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# 复制后端代码
COPY backend/ ./

# 编译
RUN CGO_ENABLED=0 GOOS=linux go build -o tapspot .

# 运行阶段
FROM alpine:latest

WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache ca-certificates tzdata

# 从 builder 复制编译好的二进制
COPY --from=builder /app/tapspot .
COPY --from=builder /app/.env .

# 设置时区
ENV TZ=Asia/Shanghai

# 暴露端口
EXPOSE 8080

# 启动服务
CMD ["./tapspot"]
