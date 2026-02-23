package routes

import (
	"net/http"
	"tapspot/controllers"
	"tapspot/websocket"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// 使用 /api 而不是 /api/v1，与前端保持一致
	api := r.Group("/api")
	{
		// 健康检查
		api.GET("/health", controllers.HealthCheck)

		// 认证路由（不需要登录）
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)

		// WebSocket 路由（需要 token 验证）
		api.GET("/ws", func(c *gin.Context) {
			token := c.Query("token")
			if token == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "缺少 token"})
				return
			}
			
			userID, err := websocket.ValidateTokenFunc(token)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "token无效"})
				return
			}
			
			websocket.HandleWebSocket(c.Writer, c.Request, userID)
		})

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

		// 用户公开信息（不需要登录）
		api.GET("/users/:id", controllers.GetUserByID)
		api.GET("/users/:id/posts", controllers.GetUserPosts)

		// 需要登录的路由
		auth := api.Group("")
		auth.Use(controllers.AuthMiddleware())
		{
			// 用户信息
			auth.GET("/me", controllers.GetMe)
			auth.PUT("/me", controllers.UpdateCurrentUser)

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
			auth.GET("/conversations/with", controllers.GetOrCreateConversation)
			auth.POST("/conversations/:id/read", controllers.MarkConversationAsRead)
			auth.GET("/conversations/:userId/messages", controllers.GetMessages)
			auth.POST("/messages", controllers.SendMessage)
			auth.GET("/messages/unread", controllers.GetUnreadCount)
		}
	}
}
