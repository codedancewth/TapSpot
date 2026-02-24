package controllers

import (
	"net/http"
	"strconv"
	"tapspot/models"
	"tapspot/websocket"
	"time"

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

	// 通过 WebSocket 广播消息（如果接收者在线）
	if websocket.GlobalHub != nil && websocket.GlobalHub.IsUserOnline(req.ReceiverID) {
		wsMsg := &websocket.Message{
			Type:       "chat",
			SenderID:   userID,
			ReceiverID: req.ReceiverID,
			Content:    req.Content,
			CreatedAt:  message.CreatedAt.Format("2006-01-02 15:04:05"),
		}
		// 获取发送者昵称
		var sender models.User
		if err := models.DB.First(&sender, userID).Error; err == nil {
			if sender.Nickname != "" {
				wsMsg.SenderName = sender.Nickname
			} else {
				wsMsg.SenderName = sender.Username
			}
		}
		// 获取会话 ID
		var conv models.Conversation
		if err := models.DB.Where("user_id = ? AND peer_id = ?", userID, req.ReceiverID).First(&conv).Error; err == nil {
			wsMsg.ConversationID = conv.ID
		}
		websocket.GlobalHub.Broadcast <- wsMsg
	}

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
	type OtherUser struct {
		ID       uint   `json:"id"`
		Nickname string `json:"nickname"`
		Avatar   string `json:"avatar"`
	}
	
	type ConversationResponse struct {
		ID          uint      `json:"id"`
		PeerID      uint      `json:"peer_id"`
		PeerName    string    `json:"peer_name"`
		PeerAvatar  string    `json:"peer_avatar"`
		LastMessage string    `json:"last_message"`
		LastMsgTime string    `json:"last_msg_time"`
		UnreadCount int       `json:"unread_count"`
		OtherUser   OtherUser `json:"other_user"`
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
			OtherUser: OtherUser{
				ID:       peer.ID,
				Nickname: peerName,
				Avatar:   peer.Avatar,
			},
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"conversations": result,
	})
}

// GetMessages 获取与某个用户的消息历史
func GetMessages(c *gin.Context) {
	userID := c.GetUint("userID")
	param := c.Param("userId")
	
	// 尝试解析为会话ID（优先）或用户ID
	var messages []models.Message
	var peerID uint
	
	// 首先尝试作为会话ID查找
	var conversation models.Conversation
	if err := models.DB.Where("id = ? AND user_id = ?", param, userID).First(&conversation).Error; err == nil {
		// 是会话ID，获取对方的用户ID
		peerID = conversation.PeerID
	} else {
		// 不是会话ID，尝试作为用户ID
		peerIDUint, err := strconv.ParseUint(param, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "参数格式错误"})
			return
		}
		peerID = uint(peerIDUint)
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

	// after_id 参数用于轮询新消息（获取 ID > after_id 的消息）
	afterID := c.Query("after_id")

	query := models.DB.Preload("Sender").Preload("Receiver").
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			userID, peerID, peerID, userID)
	
	// 如果有 after_id 参数，只获取新消息
	if afterID != "" {
		afterIDUint, err := strconv.ParseUint(afterID, 10, 32)
		if err == nil {
			query = query.Where("id > ?", afterIDUint)
		}
	}

	query.Order("created_at DESC").
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

// GetOrCreateConversation 获取或创建会话
func GetOrCreateConversation(c *gin.Context) {
	userID := c.GetUint("userID")
	peerIDStr := c.Query("user_id")
	
	peerID, err := strconv.ParseUint(peerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户ID格式错误"})
		return
	}
	
	// 不能和自己创建会话
	if uint(peerID) == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不能和自己聊天"})
		return
	}
	
	// 验证对方用户是否存在
	var peer models.User
	if err := models.DB.First(&peer, peerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}
	
	// 查找或创建会话
	var conversation models.Conversation
	err = models.DB.Where("user_id = ? AND peer_id = ?", userID, peerID).First(&conversation).Error
	
	if err != nil {
		// 创建新会话
		conversation = models.Conversation{
			UserID:      userID,
			PeerID:      uint(peerID),
			LastMessage: "",
			UnreadCount: 0,
		}
		models.DB.Create(&conversation)
	}
	
	peerName := peer.Nickname
	if peerName == "" {
		peerName = peer.Username
	}
	
	c.JSON(http.StatusOK, gin.H{
		"conversation": gin.H{
			"id":           conversation.ID,
			"peer_id":      peer.ID,
			"peer_name":    peerName,
			"peer_avatar":  peer.Avatar,
			"last_message": conversation.LastMessage,
			"last_msg_time": conversation.LastMsgTime.Format("2006-01-02 15:04:05"),
			"unread_count": conversation.UnreadCount,
			// 添加 other_user 对象，兼容前端格式
			"other_user": gin.H{
				"id":       peer.ID,
				"nickname": peerName,
				"avatar":   peer.Avatar,
			},
		},
	})
}

// MarkConversationAsRead 标记会话为已读
func MarkConversationAsRead(c *gin.Context) {
	userID := c.GetUint("userID")
	convID := c.Param("id")
	
	var conversation models.Conversation
	if err := models.DB.Where("id = ? AND user_id = ?", convID, userID).First(&conversation).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "会话不存在"})
		return
	}
	
	// 重置未读数
	models.DB.Model(&conversation).Update("unread_count", 0)
	
	// 标记消息为已读
	models.DB.Model(&models.Message{}).
		Where("sender_id = ? AND receiver_id = ? AND is_read = ?", conversation.PeerID, userID, false).
		Update("is_read", true)
	
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// updateConversationHTTP HTTP方式更新会话
func updateConversationHTTP(userID, peerID uint, lastMessage string) {
	now := time.Now()
	
	// 更新发送方的会话
	var conv models.Conversation
	err := models.DB.Where("user_id = ? AND peer_id = ?", userID, peerID).First(&conv).Error
	if err != nil {
		// 创建新会话
		conv = models.Conversation{
			UserID:      userID,
			PeerID:      peerID,
			LastMessage: lastMessage,
			LastMsgTime: now,
			UnreadCount: 0,
		}
		models.DB.Create(&conv)
	} else {
		// 更新会话
		models.DB.Model(&conv).Updates(map[string]interface{}{
			"last_message":  lastMessage,
			"last_msg_time": now,
		})
	}
	
	// 更新接收方的会话（增加未读数）
	var peerConv models.Conversation
	err = models.DB.Where("user_id = ? AND peer_id = ?", peerID, userID).First(&peerConv).Error
	if err != nil {
		// 为接收方创建会话
		peerConv = models.Conversation{
			UserID:      peerID,
			PeerID:      userID,
			LastMessage: lastMessage,
			LastMsgTime: now,
			UnreadCount: 1,
		}
		models.DB.Create(&peerConv)
	} else {
		// 更新接收方会话，增加未读数
		models.DB.Model(&peerConv).Updates(map[string]interface{}{
			"last_message":  lastMessage,
			"last_msg_time": now,
			"unread_count":  peerConv.UnreadCount + 1,
		})
	}
}
