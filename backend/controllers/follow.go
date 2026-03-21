package controllers

import (
	"net/http"
	"strconv"
	"tapspot/models"
	"tapspot/services"

	"github.com/gin-gonic/gin"
)

var followService = services.NewFollowService()
var notificationService = services.NewNotificationService()

// FollowUser 关注用户
func FollowUser(c *gin.Context) {
	userID := c.GetUint("userID")
	targetUserID := parseUint(c.Param("id"))

	if userID == targetUserID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不能关注自己"})
		return
	}

	// 检查目标用户是否存在
	var targetUser models.User
	if err := models.DB.First(&targetUser, targetUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	// 关注
	if err := followService.Follow(userID, targetUserID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "关注失败"})
		return
	}

	// 创建关注通知
	notificationService.CreateFollowNotification(targetUserID, userID)

	c.JSON(http.StatusOK, gin.H{"success": true, "following": true})
}

// UnfollowUser 取消关注
func UnfollowUser(c *gin.Context) {
	userID := c.GetUint("userID")
	targetUserID := parseUint(c.Param("id"))

	if err := followService.Unfollow(userID, targetUserID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "取消关注失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "following": false})
}

// GetFollowers 获取用户的粉丝列表
func GetFollowers(c *gin.Context) {
	userID := parseUint(c.Param("id"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	users, total, err := followService.GetFollowers(userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取粉丝列表失败"})
		return
	}

	// 格式化用户信息
	userList := make([]gin.H, 0, len(users))
	for _, u := range users {
		userList = append(userList, formatUserBasic(u))
	}

	c.JSON(http.StatusOK, gin.H{
		"users": userList,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

// GetFollowing 获取用户关注的列表
func GetFollowing(c *gin.Context) {
	userID := parseUint(c.Param("id"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	users, total, err := followService.GetFollowing(userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取关注列表失败"})
		return
	}

	// 格式化用户信息
	userList := make([]gin.H, 0, len(users))
	for _, u := range users {
		userList = append(userList, formatUserBasic(u))
	}

	c.JSON(http.StatusOK, gin.H{
		"users":     userList,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetFollowStats 获取关注统计数据
func GetFollowStats(c *gin.Context) {
	userID := parseUint(c.Param("id"))

	stats, err := followService.GetStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取统计数据失败"})
		return
	}

	// 获取当前登录用户是否关注了此用户
	var isFollowing bool
	if currentUserID, exists := c.Get("userID"); exists {
		isFollowing = followService.IsFollowing(currentUserID.(uint), userID)
	}

	c.JSON(http.StatusOK, gin.H{
		"stats":       stats,
		"is_following": isFollowing,
	})
}

// CheckFollowing 检查是否关注了某些用户
func CheckFollowing(c *gin.Context) {
	userID := c.GetUint("userID")
	targetIDs := c.Query("ids")

	if targetIDs == "" {
		c.JSON(http.StatusOK, gin.H{"following": []uint{}})
		return
	}

	followingIDs, err := followService.GetFollowingIDs(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "检查关注状态失败"})
		return
	}

	followingSet := make(map[uint]bool)
	for _, id := range followingIDs {
		followingSet[id] = true
	}

	// 解析目标ID
	var result []uint
	for _, idStr := range splitIDs(targetIDs) {
		id := uint(idStr)
		if followingSet[id] {
			result = append(result, id)
		}
	}

	c.JSON(http.StatusOK, gin.H{"following": result})
}

// formatUserBasic 格式化用户基本信息
func formatUserBasic(user models.User) gin.H {
	nickname := user.Nickname
	if nickname == "" {
		nickname = user.Username
	}
	return gin.H{
		"id":       user.ID,
		"username": user.Username,
		"nickname": nickname,
		"avatar":   user.Avatar,
		"gender":   user.Gender,
		"bio":      user.Bio,
	}
}
