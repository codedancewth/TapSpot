package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"tapspot/models"
	"tapspot/services"

	"github.com/gin-gonic/gin"
)

var notifService = services.NewNotificationService()

// GetNotifications 获取通知列表
func GetNotifications(c *gin.Context) {
	userID := c.GetUint("userID")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	notifications, total, err := notifService.GetNotifications(userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取通知失败"})
		return
	}

	// 格式化通知
	result := make([]gin.H, 0, len(notifications))
	for _, n := range notifications {
		var data models.NotificationData
		json.Unmarshal(n.Data, &data)

		result = append(result, gin.H{
			"id":         n.ID,
			"type":       n.Type,
			"data":       data,
			"read":       n.Read,
			"created_at": n.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"notifications": result,
		"total":        total,
		"page":         page,
		"page_size":    pageSize,
	})
}

// GetUnreadNotificationCount 获取未读通知数量
func GetUnreadNotificationCount(c *gin.Context) {
	userID := c.GetUint("userID")

	count, err := notifService.GetUnreadCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取未读数量失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

// MarkNotificationAsRead 标记单条通知为已读
func MarkNotificationAsRead(c *gin.Context) {
	userID := c.GetUint("userID")
	notificationID := parseUint(c.Param("id"))

	if err := notifService.MarkAsRead(notificationID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "标记已读失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// MarkAllNotificationsAsRead 标记所有通知为已读
func MarkAllNotificationsAsRead(c *gin.Context) {
	userID := c.GetUint("userID")

	if err := notifService.MarkAllAsRead(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "标记已读失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
