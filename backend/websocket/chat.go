package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"tapspot/models"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // 允许所有来源
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Client 表示一个 WebSocket 客户端
type Client struct {
	ID     uint
	Conn   *websocket.Conn
	Send   chan []byte
	Hub    *Hub
}

// Hub 管理所有 WebSocket 连接
type Hub struct {
	Clients    map[uint]*Client // userID -> Client
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *Message
	mu         sync.RWMutex
}

// Message WebSocket 消息格式
type Message struct {
	Type           string `json:"type"`           // "chat", "read", "typing"
	ConversationID uint   `json:"conversation_id"` // 会话ID
	SenderID       uint   `json:"sender_id"`
	SenderName     string `json:"sender_name"`    // 发送者昵称
	ReceiverID     uint   `json:"receiver_id"`
	Content        string `json:"content"`
	PostID         *uint  `json:"post_id,omitempty"`
	CreatedAt      string `json:"created_at"`
	IsMe           bool   `json:"is_me"`          // 是否是自己发的
}

// NewHub 创建一个新的 Hub
func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[uint]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Message),
	}
}

// Run 启动 Hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.Clients[client.ID] = client
			h.mu.Unlock()
			log.Printf("👤 用户 %d 已连接 WebSocket", client.ID)

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Clients[client.ID]; ok {
				delete(h.Clients, client.ID)
				close(client.Send)
			}
			h.mu.Unlock()
			log.Printf("👤 用户 %d 已断开 WebSocket", client.ID)

		case message := <-h.Broadcast:
			log.Printf("广播消息: sender=%d, receiver=%d", message.SenderID, message.ReceiverID)
			h.mu.RLock()
			// 发送给接收者
			if client, ok := h.Clients[message.ReceiverID]; ok {
				log.Printf("接收者 %d 在线，发送消息", message.ReceiverID)
				// 接收者收到的消息 is_me = false
				msgCopy := *message
				msgCopy.IsMe = false
				// 查找接收者的会话 ID（接收者与发送者的会话）
				var receiverConv models.Conversation
				if err := models.DB.Where("user_id = ? AND peer_id = ?", message.ReceiverID, message.SenderID).First(&receiverConv).Error; err == nil {
					msgCopy.ConversationID = receiverConv.ID
					log.Printf("接收者的会话 ID: %d", receiverConv.ID)
				} else {
					log.Printf("未找到接收者会话: user_id=%d, peer_id=%d, err=%v", message.ReceiverID, message.SenderID, err)
				}
				// 同时添加接收者需要用来匹配的字段
				msgBytes := h.serializeMessage(&msgCopy)
				log.Printf("发送给接收者的消息: %s", string(msgBytes))
				select {
				case client.Send <- msgBytes:
					log.Printf("消息已发送到接收者的 Send channel")
				default:
					close(client.Send)
					delete(h.Clients, client.ID)
					log.Printf("接收者 channel 满了，关闭连接")
				}
			} else {
				log.Printf("接收者 %d 不在线", message.ReceiverID)
			}
			// 也发送给发送者（用于同步）
			if client, ok := h.Clients[message.SenderID]; ok {
				log.Printf("发送者 %d 在线，发送消息同步", message.SenderID)
				// 发送者收到的消息 is_me = true
				msgCopy := *message
				msgCopy.IsMe = true
				msgBytes := h.serializeMessage(&msgCopy)
				log.Printf("发送给发送者的消息: %s", string(msgBytes))
				select {
				case client.Send <- msgBytes:
					log.Printf("消息已发送到发送者的 Send channel")
				default:
					close(client.Send)
					delete(h.Clients, client.ID)
					log.Printf("发送者 channel 满了，关闭连接")
				}
			}
			h.mu.RUnlock()
		}
	}
}

// serializeMessage 序列化消息
func (h *Hub) serializeMessage(msg *Message) []byte {
	data, _ := json.Marshal(msg)
	return data
}

// SendToUser 发送消息给特定用户
func (h *Hub) SendToUser(userID uint, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if client, ok := h.Clients[userID]; ok {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(h.Clients, userID)
		}
	}
}

// IsUserOnline 检查用户是否在线
func (h *Hub) IsUserOnline(userID uint) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	_, ok := h.Clients[userID]
	return ok
}

// ValidateTokenFunc 外部传入的token验证函数
var ValidateTokenFunc func(string) (uint, error)

// GlobalHub 全局 Hub 实例
var GlobalHub *Hub

// InitHub 初始化全局 Hub
func InitHub() {
	GlobalHub = NewHub()
	go GlobalHub.Run()
}

// HandleWebSocket WebSocket 连接处理
func HandleWebSocket(w http.ResponseWriter, r *http.Request, userID uint) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket 升级失败: %v", err)
		return
	}

	client := &Client{
		ID:   userID,
		Conn: conn,
		Send: make(chan []byte, 256),
		Hub:  GlobalHub,
	}

	GlobalHub.Register <- client

	// 启动读写协程
	go client.writePump()
	go client.readPump()
}

// readPump 读取客户端消息
func (c *Client) readPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(512 * 1024) // 最大 512KB
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket 错误: %v", err)
			}
			break
		}

		log.Printf("收到 WebSocket 消息: %s", string(message))

		// 解析消息
		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("消息解析错误: %v", err)
			continue
		}

		log.Printf("解析后: type=%s, sender=%d, receiver=%d, content=%s", msg.Type, c.ID, msg.ReceiverID, msg.Content)

		// 设置发送者
		msg.SenderID = c.ID
		msg.CreatedAt = time.Now().Format("2006-01-02 15:04:05")

		// 处理不同类型的消息
		switch msg.Type {
		case "chat":
			log.Printf("处理聊天消息: %+v", msg)
			// 保存消息到数据库
			dbMsg := models.Message{
				SenderID:   msg.SenderID,
				ReceiverID: msg.ReceiverID,
				Content:    msg.Content,
				PostID:     msg.PostID,
				IsRead:     false,
			}
			if err := models.DB.Create(&dbMsg).Error; err != nil {
				log.Printf("保存消息失败: %v", err)
				continue
			}
			log.Printf("消息已保存到数据库, ID=%d", dbMsg.ID)

			// 更新或创建会话，并获取会话ID
			convID := updateConversation(msg.SenderID, msg.ReceiverID, msg.Content)
			msg.ConversationID = convID

			// 获取发送者昵称
			var sender models.User
			if err := models.DB.First(&sender, msg.SenderID).Error; err == nil {
				if sender.Nickname != "" {
					msg.SenderName = sender.Nickname
				} else {
					msg.SenderName = sender.Username
				}
			}

			// 广播消息
			log.Printf("准备广播消息: sender=%d, receiver=%d, convID=%d", msg.SenderID, msg.ReceiverID, msg.ConversationID)
			c.Hub.Broadcast <- &msg
			log.Printf("消息已加入广播队列")

		case "read":
			// 标记消息为已读
			models.DB.Model(&models.Message{}).
				Where("sender_id = ? AND receiver_id = ? AND is_read = ?", msg.ReceiverID, c.ID, false).
				Update("is_read", true)

			// 更新会话未读数
			models.DB.Model(&models.Conversation{}).
				Where("user_id = ? AND peer_id = ?", c.ID, msg.ReceiverID).
				Update("unread_count", 0)
		}
	}
}

// writePump 向客户端发送消息
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			c.Conn.WriteMessage(websocket.TextMessage, message)

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// updateConversation 更新会话，返回会话ID
func updateConversation(userID, peerID uint, lastMessage string) uint {
	now := time.Now()

	// 更新发送者的会话
	var conv models.Conversation
	result := models.DB.Where("user_id = ? AND peer_id = ?", userID, peerID).First(&conv)
	if result.Error != nil {
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
		conv.LastMessage = lastMessage
		conv.LastMsgTime = now
		models.DB.Save(&conv)
	}

	// 更新接收者的会话（增加未读数）
	var peerConv models.Conversation
	result = models.DB.Where("user_id = ? AND peer_id = ?", peerID, userID).First(&peerConv)
	if result.Error != nil {
		peerConv = models.Conversation{
			UserID:      peerID,
			PeerID:      userID,
			LastMessage: lastMessage,
			LastMsgTime: now,
			UnreadCount: 1,
		}
		models.DB.Create(&peerConv)
	} else {
		peerConv.LastMessage = lastMessage
		peerConv.LastMsgTime = now
		peerConv.UnreadCount++
		models.DB.Save(&peerConv)
	}

	return conv.ID
}
