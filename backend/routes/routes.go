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

			// 关注相关
			auth.POST("/users/:id/follow", controllers.FollowUser)
			auth.DELETE("/users/:id/follow", controllers.UnfollowUser)
			auth.GET("/users/:id/followers", controllers.GetFollowers)
			auth.GET("/users/:id/following", controllers.GetFollowing)
			auth.GET("/users/:id/stats", controllers.GetFollowStats)
			auth.GET("/users/following/check", controllers.CheckFollowing)

			// 通知相关
			auth.GET("/notifications", controllers.GetNotifications)
			auth.GET("/notifications/unread-count", controllers.GetUnreadNotificationCount)
			auth.PUT("/notifications/:id/read", controllers.MarkNotificationAsRead)
			auth.PUT("/notifications/read-all", controllers.MarkAllNotificationsAsRead)

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

			// 文件上传
			auth.POST("/upload", controllers.UploadImage)
			auth.POST("/upload/post-image", controllers.UploadPostImage)
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
		api.GET("/pois/all", controllers.GetAllPOIs)
		api.GET("/pois/count", controllers.GetPOICount)
		api.GET("/pois/data", controllers.ServePoiFile)
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

		// 游戏化功能
		gamificationController := controllers.NewGamificationController()
		
		// 公开路由
		api.GET("/leaderboard", gamificationController.GetLeaderboard)
		
		// 任务系统公开接口
		taskController := controllers.NewTaskController()
		api.GET("/tasks", taskController.GetTasks)
		api.GET("/tasks/nearby", taskController.GetNearbyTasks)
		api.GET("/tasks/:id", taskController.GetTask)
		api.GET("/rankings", taskController.GetRankings)
		
		// 需要认证的路由
		auth.GET("/player/profile", gamificationController.GetPlayerProfile)
		auth.GET("/player/achievements", gamificationController.GetAchievements)
		auth.GET("/player/quests", gamificationController.GetQuests)
		auth.POST("/player/quests/:id/accept", gamificationController.AcceptQuest)
		auth.POST("/player/quests/:id/claim", gamificationController.ClaimQuestReward)
		auth.POST("/player/daily-checkin", gamificationController.DailyCheckin)

		// Phase 3: 道具商城
		itemController := controllers.NewItemController()
		auth.GET("/items", itemController.GetItems)
		auth.POST("/items/buy", itemController.BuyItem)
		auth.GET("/items/my", itemController.GetMyItems)
		auth.POST("/items/use/:id", itemController.UseItem)

		// Phase 3: 组队打卡
		teamController := controllers.NewTeamController()
		auth.GET("/teams", teamController.GetMyTeams)
		auth.POST("/teams", teamController.CreateTeam)
		auth.POST("/teams/join", teamController.JoinTeamByCode)
		auth.POST("/teams/:id/join", teamController.JoinTeam)
		auth.POST("/teams/:id/leave", teamController.LeaveTeam)
		auth.GET("/teams/:id/members", teamController.GetTeamMembers)
		auth.POST("/teams/:id/checkin", teamController.TeamCheckin)

		// Phase 3: 赛季系统
		seasonController := controllers.NewSeasonController()
		auth.GET("/seasons/current", seasonController.GetCurrentSeason)
		auth.POST("/seasons/:id/join", seasonController.JoinSeason)
		auth.GET("/seasons/:id/leaderboard", seasonController.GetSeasonLeaderboard)

		// Phase 3: 数据统计
		statsController := controllers.NewPhaseStatsController()
		auth.GET("/stats/me", statsController.GetMyStats)

		// Phase 3: 每日/每周礼包
		rewardController := controllers.NewRewardController()
		auth.GET("/reward/status", rewardController.GetDailyRewardStatus)
		auth.POST("/daily-reward", rewardController.ClaimDailyReward)
		auth.POST("/weekly-reward", rewardController.ClaimWeeklyReward)

		// 任务系统 API（需要认证）
		auth.POST("/tasks", taskController.CreateTask)
		auth.POST("/tasks/:id/complete", taskController.CompleteTask)
		auth.GET("/tasks/:id/completions", taskController.GetTaskCompletions)
		auth.GET("/tasks/check", taskController.CheckTaskCompleted)
		
		// 积分与排名（需要认证）
		auth.GET("/rankings/my", taskController.GetMyRanking)
		auth.GET("/user/points", taskController.GetUserPoints)
		auth.GET("/user/tasks", taskController.GetMyTasks)
		auth.GET("/user/daily-summary", taskController.GetDailySummary)
	}
}
