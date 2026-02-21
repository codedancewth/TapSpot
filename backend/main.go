package main

import (
	"fmt"
	"log"
	"tapspot/config"
	"tapspot/controllers"
	"tapspot/models"
	"tapspot/routes"
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
	models.DB = config.DB // 设置全局DB

	// 自动迁移数据库表
	migrateDB()

	// 创建WebSocket Hub
	wsHub := websocket.NewHub()
	go wsHub.Run()

	// 设置token验证函数（解决循环导入问题）
	websocket.ValidateTokenFunc = func(tokenString string) (uint, error) {
		// 复用controllers中的JWT验证逻辑
		return validateTokenAndGetUserID(tokenString)
	}

	// 创建Gin引擎
	r := gin.Default()

	// 配置CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 注册路由
	routes.SetupRoutes(r, wsHub)

	// 创建测试用户 root/root
	controllers.CreateTestUser()

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
		&models.Conversation{},
		&models.Message{},
	)
	log.Println("✅ 数据库迁移完成")
}

// validateTokenAndGetUserID 验证token并返回userID
func validateTokenAndGetUserID(tokenString string) (uint, error) {
	// Bearer token格式
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	// 使用controllers中的Claims结构体验证token
	token, err := jwt.ParseWithClaims(tokenString, &controllers.Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte("tapspot-secret-key-2026"), nil
	})

	if err != nil || !token.Valid {
		return 0, fmt.Errorf("invalid token")
	}

	if claims, ok := token.Claims.(*controllers.Claims); ok {
		return claims.UserID, nil
	}

	return 0, fmt.Errorf("invalid claims")
}
