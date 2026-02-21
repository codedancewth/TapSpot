package controllers

import (
	"net/http"
	"strconv"
	"tapspot/models"

	"github.com/gin-gonic/gin"
)

// SendMessageRequest 发送消息请求
type SendMessageRequest struct {
	ReceiverID uint   `json:"receiver_id" binding:"required"`
	Content    string `json:"content" binding:"required"`
	PostID     *uint  `json:"post_id,omitempty"`
}

// SendMessage 发送消息（HTTP备用接口）
func SendMessage(c *gin.Context) {
	userID := c.GetUint("userID")

	var req SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	// 验证内容长度
	if len(req.Content) == 0 || len(req.Content) > 1000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "消息内容长度必须在1-1000字符之间"})
		return
	}

	// 不能给自己发消息
	if req.ReceiverID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不能给自己发送消息"})
		return
	}

	// 验证接收者是否存在
	var receiver models.User
	if err := models.DB.First(&receiver, req.ReceiverID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "接收者不存在"})
		return
	}

	// 创建消息
	message := models.Message{
		SenderID:   userID,
		ReceiverID: req.ReceiverID,
		Content:    req.Content,
		PostID:     req.PostID,
		IsRead:     false,
	}

	if err := models.DB.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "发送失败"})
		return
	}

	// 更新会话
	updateConversationHTTP(userID, req.ReceiverID, req.Content)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": gin.H{
			"id":          message.ID,
			"sender_id":   message.SenderID,
			"receiver_id": message.ReceiverID,
			"content":     message.Content,
			"post_id":     message.PostID,
			"is_read":     message.IsRead,
			"created_at":  message.CreatedAt.Format("2006-01-02 15:04:05"),
		},
	})
}

// GetConversations 获取会话列表
func GetConversations(c *gin.Context) {
	userID := c.GetUint("userID")

	var conversations []models.Conversation
	models.DB.Where("user_id = ?", userID).
		Order("last_msg_time DESC").
		Find(&conversations)

	// 获取对方用户信息
	type ConversationResponse struct {
		ID          uint   `json:"id"`
		PeerID      uint   `json:"peer_id"`
		PeerName    string `json:"peer_name"`
		PeerAvatar  string `json:"peer_avatar"`
		LastMessage string `json:"last_message"`
		LastMsgTime string `json:"last_msg_time"`
		UnreadCount int    `json:"unread_count"`
	}

	var result []ConversationResponse
	for _, conv := range conversations {
		var peer models.User
		models.DB.First(&peer, conv.PeerID)

		peerName := peer.Nickname
		if peerName == "" {
			peerName = peer.Username
		}

		result = append(result, ConversationResponse{
			ID:          conv.ID,
			PeerID:      conv.PeerID,
			PeerName:    peerName,
			PeerAvatar:  peer.Avatar,
			LastMessage: conv.LastMessage,
			LastMsgTime: conv.LastMsgTime.Format("2006-01-02 15:04:05"),
			UnreadCount: conv.UnreadCount,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"conversations": result,
	})
}

// GetMessages 获取与某个用户的消息历史
func GetMessages(c *gin.Context) {
	userID := c.GetUint("userID")
	peerIDStr := c.Param("userId")
	peerID, err := strconv.ParseUint(peerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户ID格式错误"})
		return
	}

	// 分页参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 50
	}
	offset := (page - 1) * pageSize

	var messages []models.Message
	models.DB.Preload("Sender").Preload("Receiver").
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			userID, peerID, peerID, userID).
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&messages)

	// 标记消息为已读
	models.DB.Model(&models.Message{}).
		Where("sender_id = ? AND receiver_id = ? AND is_read = ?", peerID, userID, false).
		Update("is_read", true)

	// 重置会话未读数
	models.DB.Model(&models.Conversation{}).
		Where("user_id = ? AND peer_id = ?", userID, peerID).
		Update("unread_count", 0)

	// 反转消息顺序（按时间正序）
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	type MessageResponse struct {
		ID         uint   `json:"id"`
		SenderID   uint   `json:"sender_id"`
		SenderName string `json:"sender_name"`
		Content    string `json:"content"`
		PostID     *uint  `json:"post_id"`
		IsRead     bool   `json:"is_read"`
		CreatedAt  string `json:"created_at"`
		IsMe       bool   `json:"is_me"`
	}

	var result []MessageResponse
	for _, msg := range messages {
		senderName := msg.Sender.Nickname
		if senderName == "" {
			senderName = msg.Sender.Username
		}

		result = append(result, MessageResponse{
			ID:         msg.ID,
			SenderID:   msg.SenderID,
			SenderName: senderName,
			Content:    msg.Content,
			PostID:     msg.PostID,
			IsRead:     msg.IsRead,
			CreatedAt:  msg.CreatedAt.Format("2006-01-02 15:04:05"),
			IsMe:       msg.SenderID == userID,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"messages": result,
		"page":     page,
		"pageSize": pageSize,
	})
}

// GetUnreadCount 获取未读消息数
func GetUnreadCount(c *gin.Context) {
	userID := c.GetUint("userID")

	var count int64
	models.DB.Model(&models.Message{}).
		Where("receiver_id = ? AND is_read = ?", userID, false).
		Count(&count)

	c.JSON(http.StatusOK, gin.H{
		"unread_count": count,
	})
}

// updateConversationHTTP HTTP方式更新会话
func updateConversationHTTP(userID, peerID uint, lastMessage string) {
	// 这个函数在 websocket/chat.go 中也有实现
	// 这里简化处理，实际项目中应该复用逻辑
}
