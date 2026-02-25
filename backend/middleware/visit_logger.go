package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"tapspot/models"
)

// VisitLogger 记录访客访问
func VisitLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 异步记录，不阻塞请求
		go recordVisit(c)
		c.Next()
	}
}

// recordVisit 记录访问记录
func recordVisit(c *gin.Context) {
	// 跳过静态资源和 API 健康检查
	path := c.Request.URL.Path
	if isStaticResource(path) || path == "/api/health" {
		return
	}

	// 获取 IP 地址
	ip := c.ClientIP()
	if ip == "" {
		ip = c.GetHeader("X-Real-IP")
	}
	if ip == "" {
		ip = c.GetHeader("X-Forwarded-For")
	}

	// 获取用户 ID（如果已登录）
	var userID *uint
	if id, exists := c.Get("userID"); exists {
		uid := id.(uint)
		userID = &uid
	}

	// 创建访问记录
	visit := models.Visit{
		IPAddress: ip,
		UserAgent: c.Request.UserAgent(),
		Path:      path,
		Method:    c.Request.Method,
		UserID:    userID,
		Referer:   c.Request.Referer(),
		CreatedAt: time.Now(),
	}

	models.DB.Create(&visit)
}

// isStaticResource 判断是否为静态资源
func isStaticResource(path string) bool {
	staticPrefixes := []string{
		"/assets/",
		"/static/",
		"/css/",
		"/js/",
		"/images/",
		"/favicon.ico",
	}

	for _, prefix := range staticPrefixes {
		if len(path) >= len(prefix) && path[:len(prefix)] == prefix {
			return true
		}
	}
	return false
}
