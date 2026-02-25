package main

import (
	"fmt"
	"log"
	"tapspot/config"
	"tapspot/middleware"
	"tapspot/models"
	"tapspot/routes"
	"tapspot/services"
	"tapspot/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

func main() {
	// 加载环境变量
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// 初始化数据库
	config.InitDB()
	models.DB = config.DB // 设置全局 DB

	// 自动迁移数据库表
	migrateDB()

	// 创建 WebSocket Hub 并设置为全局实例
	websocket.GlobalHub = websocket.NewHub()
	go websocket.GlobalHub.Run()

	// 设置 token 验证函数（解决循环导入问题）
	websocket.ValidateTokenFunc = func(tokenString string) (uint, error) {
		return validateTokenAndGetUserID(tokenString)
	}

	// 创建 Gin 引擎
	r := gin.Default()

	// 配置 CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 添加访客记录中间件
	r.Use(middleware.VisitLogger())

	// 注册路由
	routes.SetupRoutes(r)

	// 创建测试用户 root/root
	services.CreateTestUser()

	// 启动服务器
	log.Println("🚀 TapSpot API running on http://localhost:8080")
	log.Println("📡 WebSocket endpoint: ws://localhost:8080/api/ws")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// migrateDB 自动迁移数据库表
func migrateDB() {
	log.Println("🔄 正在迁移数据库...")
	config.DB.AutoMigrate(
		&models.User{},
		&models.Post{},
		&models.Comment{},
		&models.Like{},
		&models.CommentLike{},
		&models.Conversation{},
		&models.Message{},
		&models.Visit{}, // 访客记录
	)
	log.Println("✅ 数据库迁移完成")
}

// validateTokenAndGetUserID 验证 token 并返回 userID
func validateTokenAndGetUserID(tokenString string) (uint, error) {
	// Bearer token 格式
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	// 使用 services 中的 JWT 密钥验证
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return services.GetJWTSecret(), nil
	})

	if err != nil || !token.Valid {
		return 0, fmt.Errorf("invalid token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if userID, ok := claims["user_id"].(float64); ok {
			return uint(userID), nil
		}
	}

	return 0, fmt.Errorf("invalid claims")
}
