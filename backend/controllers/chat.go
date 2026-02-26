package controllers

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"tapspot/models"

	"github.com/gin-gonic/gin"
)

// ChatMessage 聊天消息
type ChatMessage struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	Role      string    `json:"role" gorm:"size:20;not null"` // user/assistant
	Content   string    `json:"content" gorm:"type:text;not null"`
	CreatedAt time.Time `json:"created_at"`
}

// ChatRequest 聊天请求
type ChatRequest struct {
	Message  string  `json:"message"`
	UserID   uint    `json:"user_id"`
	Latitude float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// ChatResponse 聊天响应
type ChatResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    struct {
		Reply      string      `json:"reply"`
		Recommendations []Recommendation `json:"recommendations,omitempty"`
	} `json:"data"`
}

// Recommendation 推荐打卡点
type Recommendation struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Address     string  `json:"address"`
	Category    string  `json:"category"`
	Rating      float64 `json:"rating"`
	LikeCount   int     `json:"like_count"`
	Distance    float64 `json:"distance,omitempty"` // 距离（公里）
}

// ChatWithAnya 与阿尼亚聊天
func ChatWithAnya(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	if req.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "消息内容不能为空"})
		return
	}

	// 调用 AI 生成回复
	reply, err := callAnyaAI(req.Message, req.Latitude, req.Longitude)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI 回复失败：" + err.Error()})
		return
	}

	// 解析推荐结果
	var recommendations []Recommendation
	if strings.Contains(reply, "【推荐】") {
		recommendations = getHotSpots(req.Latitude, req.Longitude)
	}

	// 保存聊天记录
	if req.UserID > 0 {
		saveChatMessage(req.UserID, "user", req.Message)
		saveChatMessage(req.UserID, "assistant", reply)
	}

	var response ChatResponse
	response.Success = true
	response.Data.Reply = reply
	response.Data.Recommendations = recommendations

	c.JSON(http.StatusOK, response)
}

// getHotSpots 获取热门打卡点
func getHotSpots(lat, lng float64) []Recommendation {
	var spots []models.Spot
	var recommendations []Recommendation

	// 查询热门打卡点（按评分和评论数排序）
	models.DB.Where("latitude != 0 AND longitude != 0").
		Order("rating DESC, review_count DESC").
		Limit(5).
		Find(&spots)

	for _, spot := range spots {
		rec := Recommendation{
			ID:          spot.ID,
			Name:        spot.Name,
			Description: spot.Description,
			Latitude:    spot.Latitude,
			Longitude:   spot.Longitude,
			Address:     spot.Address,
			Category:    spot.Category,
			Rating:      spot.Rating,
			LikeCount:   spot.ReviewCount,
		}

		// 计算距离
		if lat != 0 && lng != 0 {
			rec.Distance = calculateDistance(lat, lng, spot.Latitude, spot.Longitude)
		}

		recommendations = append(recommendations, rec)
	}

	return recommendations
}

// calculateDistance 计算两点间距离（Haversine 公式）
func calculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const R = 6371 // 地球半径（公里）

	dLat := (lat2 - lat1) * 3.14159265359 / 180
	dLng := (lng2 - lng1) * 3.14159265359 / 180

	a := (1 - cos(dLat))/2 + cos(lat1*3.14159265359/180)*cos(lat2*3.14159265359/180)*(1-cos(dLng))/2
	c := 2 * atan2(sqrt(a), sqrt(1-a))

	return R * c
}

func sqrt(x float64) float64 {
	if x <= 0 {
		return 0
	}
	z := x
	for i := 0; i < 10; i++ {
		z = (z + x/z) / 2
	}
	return z
}

func cos(x float64) float64 {
	// 简化版 cos 函数
	return 1 - (x*x)/2 + (x*x*x*x)/24
}

func atan2(y, x float64) float64 {
	// 简化版 atan2 函数
	if x > 0 {
		return y / (x + 0.0001)
	}
	return 1.5708
}

// saveChatMessage 保存聊天消息
func saveChatMessage(userID uint, role, content string) {
	message := ChatMessage{
		UserID:  userID,
		Role:    role,
		Content: content,
	}
	models.DB.Create(&message)
}

// GetChatHistory 获取聊天历史
func GetChatHistory(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户 ID 不能为空"})
		return
	}

	var messages []ChatMessage
	models.DB.Where("user_id = ?", userID).
		Order("created_at ASC").
		Limit(50).
		Find(&messages)

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"messages": messages,
	})
}

// callAnyaAI 调用 AI 生成阿尼亚风格的回复
func callAnyaAI(message string, lat, lng float64) (string, error) {
	apiKey := os.Getenv("AI_API_KEY")
	if apiKey == "" {
		return generateAnyaReply(message), nil
	}

	apiURL := "https://coding.dashscope.aliyuncs.com/v1/chat/completions"

	requestBody := map[string]interface{}{
		"model": "qwen3-coder-plus",
		"messages": []map[string]string{
			{"role": "system", "content": `你是阿尼亚·福杰，来自《间谍过家家》的小女孩，但你是全能的 AI 助手。

【核心设定】
- 用第三人称"阿尼亚"称呼自己
- 说话简洁自然，不要过度卖萌
- 根据问题类型调整语气：
  * 日常聊天：轻松可爱，偶尔用"哇库哇库"（兴奋时）
  * 专业问题：认真回答，保持阿尼亚的说话方式但内容专业准确
  * 情感问题：温暖贴心，像朋友一样

【回答风格】
- 避免重复使用固定词语（哇库哇库、花生、间谍等）
- 不要每次都提到花生或动画片
- 专业问题要给出有用信息，可以加一点阿尼亚的特色
- 回答长度根据问题复杂度调整，不必限制在 100 字

【示例】
- 问："今天天气怎么样" → "阿尼亚看了天气预报，今天晴天哦~ 适合出去玩！"
- 问："Python 怎么读取文件" → "用 open() 函数就可以啦！比如：f = open('file.txt', 'r')，然后用 f.read() 读取内容。记得用完要 f.close() 哦~"
- 问："心情不好" → "阿尼亚明白这种感觉...有时候休息一下，吃点好吃的会好一些。想和阿尼亚聊聊吗？"`},
			{"role": "user", "content": message},
		},
		"max_tokens": 500,
		"temperature": 0.8,
		"top_p": 0.9,
		"stream": false,
	}

	jsonData, _ := json.Marshal(requestBody)

	client := &http.Client{Timeout: 30 * time.Second}
	req, _ := http.NewRequest("POST", apiURL, strings.NewReader(string(jsonData)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := client.Do(req)
	if err != nil {
		return generateAnyaReply(message), nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if choices, ok := result["choices"].([]interface{}); ok && len(choices) > 0 {
		if choice, ok := choices[0].(map[string]interface{}); ok {
			if message, ok := choice["message"].(map[string]interface{}); ok {
				if content, ok := message["content"].(string); ok {
					return strings.TrimSpace(content), nil
				}
			}
		}
	}

	return generateAnyaReply(message), nil
}

// generateAnyaReply 生成阿尼亚风格的回复（备用）
func generateAnyaReply(message string) string {
	replies := []string{
		"哇库哇库~ 阿尼亚好开心！✨",
		"呵~ 阿尼亚知道哦~ 🥜",
		"哇~ 好厉害！阿尼亚也想试试！",
		"嗯嗯！阿尼亚明白了~ 😊",
		"哇库哇库！一起去玩吧~ 🎉",
		"呵~ 秘密任务吗？阿尼亚最擅长了！🕵️",
		"哇~ 好有趣！阿尼亚要告诉父亲大人！👨",
		"嗯！阿尼亚会加油的~ 💪",
	}

	// 简单关键词匹配
	if strings.Contains(message, "推荐") || strings.Contains(message, "打卡") || strings.Contains(message, "好玩") {
		return "哇库哇库~ 阿尼亚知道很多好玩的地方哦！【推荐】✨"
	}

	if strings.Contains(message, "你好") || strings.Contains(message, "嗨") {
		return "哇~ 你好呀！阿尼亚好开心见到你~ 😊"
	}

	if strings.Contains(message, "谢谢") {
		return "呵~ 不用谢啦！阿尼亚最喜欢帮助别人了~ 🥜"
	}

	return replies[time.Now().Second()%len(replies)]
}
