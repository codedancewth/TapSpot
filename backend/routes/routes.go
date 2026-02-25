package routes

import (
	"tapspot/controllers"
	"tapspot/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes 设置所有路由
func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// 认证控制器
		authController := controllers.NewAuthController()

		// 公开路由
		api.POST("/register", authController.Register)
		api.POST("/login", authController.Login)

		// 需要认证的路由
		auth := api.Group("")
		auth.Use(middleware.AuthMiddleware())
		{
			// 用户相关
			auth.GET("/me", authController.GetCurrentUser)
			auth.PUT("/me", authController.UpdateProfile)
			auth.POST("/change-password", authController.ChangePassword)
			auth.GET("/users/:id", authController.GetUserProfile)
		auth.GET("/users/:id/posts", controllers.GetUserPosts)
		auth.GET("/users/stats", controllers.GetUserStats)

			// 帖子路由
			auth.POST("/posts", controllers.CreatePost)
			auth.DELETE("/posts/:id", controllers.DeletePost)
			auth.POST("/posts/:id/like", controllers.PostLike)
			auth.GET("/likes/check", controllers.CheckPostLikes)
			auth.GET("/likes/my", controllers.GetMyLikes)

			// 评论路由
			auth.POST("/posts/:id/comments", controllers.CreateComment)
			auth.DELETE("/comments/:id", controllers.DeleteComment)
			auth.POST("/comments/:id/like", controllers.CommentLike)
			auth.GET("/comments/likes/check", controllers.CheckCommentLikes)

			// 消息路由
			auth.GET("/conversations", controllers.GetConversations)
			auth.GET("/conversations/with", controllers.GetOrCreateConversation)
			auth.POST("/conversations/:id/read", controllers.MarkConversationAsRead)
			auth.GET("/conversations/:id/messages", controllers.GetMessages)
			auth.POST("/messages", controllers.SendMessage)
			auth.GET("/messages/unread", controllers.GetUnreadCount)
		}

		// 公开路由
		api.GET("/posts", controllers.GetPosts)
		api.GET("/posts/:id", controllers.GetPost)
		api.GET("/posts/:id/comments", controllers.GetComments)
		api.GET("/posts/:id/best-comment", controllers.GetBestComment)
		api.GET("/posts/comments/count", controllers.GetCommentCounts)
		api.GET("/users/search", controllers.SearchUsers)

		// 地理服务
		api.GET("/pois", controllers.GetPOIs)
		api.GET("/geocode/reverse", controllers.ReverseGeocode)

		// WebSocket
		api.GET("/ws", controllers.WebSocketHandler)

		// 统计 API（需要认证）
		auth.GET("/stats/visits", controllers.GetVisitStats)
		auth.GET("/stats/realtime", controllers.GetRealTimeVisitors)

		// AI 分析 API（公开）
		api.POST("/ai/analyze", controllers.AnalyzeLocation)

		// 聊天 API
		api.POST("/chat", controllers.ChatWithAnya)
		auth.GET("/chat/history/:user_id", controllers.GetChatHistory)
	}
}
