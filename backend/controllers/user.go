package controllers

import (
	"net/http"
	"tapspot/models"

	"github.com/gin-gonic/gin"
)

// UserInfo 用户信息（用于搜索响应）
type UserInfo struct {
	ID        uint   `json:"id"`
	Username  string `json:"username"`
	Nickname  string `json:"nickname"`
	Avatar    string `json:"avatar"`
	Bio       string `json:"bio"`
	CreatedAt string `json:"created_at"`
}

// IPStats IP 统计信息
type IPStats struct {
	IP    string `json:"ip"`
	Count int64  `json:"count"`
}

// SearchUsers 搜索用户（按昵称模糊搜索）
func SearchUsers(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusOK, gin.H{"users": []UserInfo{}})
		return
	}

	var users []models.User
	// 只搜索昵称，不搜索用户名
	models.DB.Where("nickname LIKE ?", "%"+query+"%").
		Select("id, username, nickname, avatar, bio, created_at").
		Limit(20).
		Find(&users)

	// 返回简化用户信息
	type UserInfo struct {
		ID        uint   `json:"id"`
		Username  string `json:"username"`
		Nickname  string `json:"nickname"`
		Avatar    string `json:"avatar"`
		Bio       string `json:"bio"`
		CreatedAt string `json:"created_at"`
	}

	result := []UserInfo{}
	for _, user := range users {
		result = append(result, UserInfo{
			ID:        user.ID,
			Username:  user.Username,
			Nickname:  user.Nickname,
			Avatar:    user.Avatar,
			Bio:       user.Bio,
			CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	c.JSON(http.StatusOK, gin.H{"users": result})
}

// GetUserStats 获取用户统计信息
func GetUserStats(c *gin.Context) {
	// 总用户数
	var totalUsers int64
	models.DB.Model(&models.User{}).Count(&totalUsers)

	// 按日期统计用户增长
	type DailyStats struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
		IPs   int64  `json:"ips"`
	}

	var dailyStats []DailyStats
	models.DB.Table("users").
		Select("DATE(created_at) as date, COUNT(*) as count, COUNT(DISTINCT registration_ip) as ips").
		Group("DATE(created_at)").
		Order("date DESC").
		Limit(30).
		Scan(&dailyStats)

	// 按 IP 统计
	ipStats := []IPStats{}
	models.DB.Table("users").
		Select("registration_ip as ip, COUNT(*) as count").
		Where("registration_ip != ''").
		Group("registration_ip").
		Order("count DESC").
		Limit(20).
		Scan(&ipStats)

	// 计算自然增长
	var naturalGrowth int64
	for _, stat := range ipStats {
		if stat.Count == 1 {
			naturalGrowth++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"total_users":    totalUsers,
		"daily_stats":    dailyStats,
		"ip_stats":       ipStats,
		"natural_growth": naturalGrowth,
	})
}

// UpdateUserRequest 更新用户资料请求
type UpdateUserRequest struct {
	Nickname string `json:"nickname"`
	Avatar   string `json:"avatar"`
	Gender   string `json:"gender"`
	Bio      string `json:"bio"`
}

// GetMe 获取当前用户信息（API: GET /api/me）
func GetMe(c *gin.Context) {
	userID := c.GetUint("userID")

	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
			"gender":   user.Gender,
			"bio":      user.Bio,
		},
	})
}

// UpdateCurrentUser 更新当前用户资料
func UpdateCurrentUser(c *gin.Context) {
	userID := c.GetUint("userID")

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	// 验证
	if req.Nickname != "" && len(req.Nickname) > 20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "昵称不能超过20个字符"})
		return
	}
	if req.Bio != "" && len(req.Bio) > 200 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "个人简介不能超过200个字符"})
		return
	}
	if req.Gender != "" && req.Gender != "male" && req.Gender != "female" && req.Gender != "secret" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "性别参数无效"})
		return
	}

	// 更新
	updates := make(map[string]interface{})
	if req.Nickname != "" {
		updates["nickname"] = req.Nickname
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}
	if req.Gender != "" {
		updates["gender"] = req.Gender
	}
	if req.Bio != "" {
		updates["bio"] = req.Bio
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "没有需要更新的内容"})
		return
	}

	models.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates)

	// 返回更新后的用户信息
	var user models.User
	models.DB.First(&user, userID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
			"gender":   user.Gender,
			"bio":      user.Bio,
		},
	})
}

// GetUserByID 获取用户公开信息
func GetUserByID(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	// 获取用户帖子数
	var postCount int64
	models.DB.Model(&models.Post{}).Where("user_id = ?", user.ID).Count(&postCount)

	// 获取用户收到的点赞数
	type LikeCount struct {
		Count int
	}
	var likeResult LikeCount
	models.DB.Table("likes").
		Select("COUNT(*) as count").
		Joins("JOIN posts ON likes.post_id = posts.id").
		Where("posts.user_id = ?", user.ID).
		Scan(&likeResult)

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"nickname":   user.Nickname,
			"avatar":     user.Avatar,
			"gender":     user.Gender,
			"bio":        user.Bio,
			"createdAt":  user.CreatedAt.Format("2006-01-02 15:04:05"),
			"postsCount": postCount,
			"likesCount": likeResult.Count,
		},
	})
}

// GetUserPosts 获取用户的帖子列表
func GetUserPosts(c *gin.Context) {
	userID := c.Param("id")

	userIDUint := parseUint(userID)

	var posts []models.Post
	models.DB.Preload("User").Where("user_id = ?", userIDUint).Order("created_at DESC").Find(&posts)

	type PostWithLikes struct {
		ID           uint    `json:"id"`
		Title        string  `json:"title"`
		Content      string  `json:"content"`
		Type         string  `json:"type"`
		LocationName string  `json:"location_name"`
		Latitude     float64 `json:"latitude"`
		Longitude    float64 `json:"longitude"`
		Likes        int     `json:"likes"`
		Author       string  `json:"author"`
		AuthorID     uint    `json:"authorId"`
		CreatedAt    string  `json:"createdAt"`
	}

	result := []PostWithLikes{}
	if posts == nil {
		posts = []models.Post{}
	}
	for _, post := range posts {
		var likeCount int64
		models.DB.Model(&models.Like{}).Where("post_id = ?", post.ID).Count(&likeCount)

		author := post.User.Nickname
		if author == "" {
			author = post.User.Username
		}

		result = append(result, PostWithLikes{
			ID:           post.ID,
			Title:        post.Title,
			Content:      post.Content,
			Type:         post.Type,
			LocationName: post.LocationName,
			Latitude:     post.Latitude,
			Longitude:    post.Longitude,
			Likes:        int(likeCount),
			Author:       author,
			AuthorID:     post.UserID,
			CreatedAt:    post.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	c.JSON(http.StatusOK, gin.H{"posts": result})
}
