package controllers

import (
	"net/http"
	"tapspot/websocket"

	"github.com/gin-gonic/gin"
)

// WebSocketHandler 处理 WebSocket 连接
func WebSocketHandler(c *gin.Context) {
	userID := GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "请先登录",
		})
		return
	}

	// 使用 websocket 包中的 HandleWebSocket
	w := c.Writer
	r := c.Request
	websocket.HandleWebSocket(w, r, userID)
}
