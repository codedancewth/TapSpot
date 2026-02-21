package routes

import (
	"tapspot/controllers"
	"tapspot/websocket"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, wsHub *websocket.Hub) {
	// 使用 /api 而不是 /api/v1，与前端保持一致
	api := r.Group("/api")
	{
		// 健康检查
		api.GET("/health", controllers.HealthCheck)

		// 认证路由（不需要登录）
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)

		// 帖子路由（公开）
		api.GET("/posts", controllers.GetPosts)
		api.GET("/posts/:id", controllers.GetPost)
		api.GET("/posts/comments/count", controllers.GetCommentCounts)

		// 评论路由（公开）
		api.GET("/posts/:id/comments", controllers.GetComments)
		api.GET("/posts/:id/best-comment", controllers.GetBestComment)

		// 点赞相关（公开）
		api.GET("/comments/likes/count", controllers.GetCommentLikeCounts)

		// POI相关
		api.GET("/pois", controllers.GetPOIs)
		api.GET("/geocode/reverse", controllers.ReverseGeocode)

		// WebSocket端点（需要token验证）
		api.GET("/ws", websocket.HandleWebSocket(wsHub))

		// 需要登录的路由
		auth := api.Group("")
		auth.Use(controllers.AuthMiddleware())
		{
			// 用户信息
			auth.GET("/me", controllers.GetMe)
			auth.PUT("/me", controllers.UpdateCurrentUser)
			auth.GET("/users/:id", controllers.GetUserByID)
			auth.GET("/users/:id/posts", controllers.GetUserPosts)

			// 帖子操作
			auth.POST("/posts", controllers.CreatePost)
			auth.DELETE("/posts/:id", controllers.DeletePost)
			auth.GET("/posts/my", controllers.GetMyPosts)

			// 帖子点赞
			auth.POST("/posts/:id/like", controllers.PostLike)
			auth.GET("/likes/check", controllers.CheckPostLikes)
			auth.GET("/likes/my", controllers.GetMyLikes)

			// 评论操作
			auth.POST("/posts/:id/comments", controllers.CreateComment)
			auth.DELETE("/comments/:id", controllers.DeleteComment)

			// 评论点赞
			auth.POST("/comments/:id/like", controllers.CommentLike)
			auth.GET("/comments/likes/check", controllers.CheckCommentLikes)

			// 消息相关
			auth.GET("/conversations", controllers.GetConversations)
			auth.GET("/conversations/:id/messages", controllers.GetMessages)
			auth.POST("/conversations/:id/read", controllers.MarkMessagesAsRead)
			auth.POST("/messages", controllers.SendMessage)
			auth.GET("/conversations/with", controllers.GetOrCreateConversation)
			auth.GET("/messages/unread", controllers.GetUnreadCount)
			auth.DELETE("/conversations/:id", controllers.DeleteConversation)
		}
	}
}
