package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// AIAnalyzeRequest AI 分析请求
type AIAnalyzeRequest struct {
	LocationName string  `json:"location_name"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
}

// AIAnalyzeResponse AI 分析响应
type AIAnalyzeResponse struct {
	Analysis string `json:"analysis"`
	Success  bool   `json:"success"`
}

// AnalyzeLocation AI 分析位置
func AnalyzeLocation(c *gin.Context) {
	var req AIAnalyzeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	if req.LocationName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "位置名称不能为空"})
		return
	}

	// 调用 AI API 分析
	analysis, err := callAI(req.LocationName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI 分析失败：" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, AIAnalyzeResponse{
		Analysis: analysis,
		Success:  true,
	})
}

// callAI 调用 AI API（阿里云百炼 Qwen3-Coder-Plus）
func callAI(locationName string) (string, error) {
	// 获取 API Key（从环境变量）
	apiKey := os.Getenv("AI_API_KEY")
	if apiKey == "" {
		// 如果没有配置 API Key，返回模拟数据
		return generateMockAnalysis(locationName), nil
	}

	// API 端点（阿里云百炼）
	apiURL := "https://coding.dashscope.aliyuncs.com/v1/chat/completions"

	// 判断是地点名称还是文字描述
	isTextAnalysis := len(locationName) > 30 || strings.ContainsAny(locationName, "。！？，、；：")
	
	var prompt string
	var maxTokens int
	if isTextAnalysis {
		// 文字分析模式 - 解析可玩性（支持 800 字）
		prompt = fmt.Sprintf(`请非常详细地分析这段文字描述的地方的可玩性：%s

要求：
1. 详细分析该地方有什么好玩的、值得体验的项目（至少列举 3-5 个）
2. 给出推荐理由、特色亮点、适合人群
3. 提供详细的游玩建议、注意事项、最佳时间、交通方式等
4. 可以介绍周边美食、住宿、购物等配套信息
5. 语言生动有趣，吸引人，可以有适当的情感表达
6. 可以加适量的 emoji 增加趣味性
7. 字数控制在 400-800 字之间，内容要非常丰富详细
8. 不要使用 markdown 格式，直接输出纯文本
9. 确保输出完整，不要截断

请直接输出分析内容，不要有其他说明。`, locationName)
		maxTokens = 1500
	} else {
		// 地点名称模式 - 分析地方特色（详细版）
		prompt = fmt.Sprintf(`你是一名专业的旅游博主，请为游客详细介绍这个地方：%s

请按照以下结构详细描写（必须写满 200 字以上）：
【特色亮点】描述这个地方的独特之处（至少写 3 个亮点）
【游玩体验】在这里可以做什么、玩什么（至少列举 3 个体验项目）
【实用建议】最佳游览时间、注意事项、交通方式、门票信息等
【周边推荐】附近的美食、住宿、购物等配套信息

写作要求：
- 必须写满 200-400 字，内容要详细丰富
- 语言生动有趣，像朋友推荐一样亲切自然
- 可以加 2-3 个 emoji 增加趣味性
- 直接输出纯文本，不要用标题和 markdown 格式
- 确保内容完整，不要省略

开始介绍：`, locationName)
		maxTokens = 800
	}

	// 构建请求体（Qwen-Turbo 快速版）
	requestBody := map[string]interface{}{
		"model": "qwen-turbo",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"max_tokens": maxTokens,
		"temperature": 0.7,
		"top_p": 0.9,
		"stream": false,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	// 创建请求
	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	// 发送请求
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	// 解析响应
	var aiResp map[string]interface{}
	if err := json.Unmarshal(body, &aiResp); err != nil {
		return "", err
	}

	// 提取分析结果
	if choices, ok := aiResp["choices"].([]interface{}); ok && len(choices) > 0 {
		if choice, ok := choices[0].(map[string]interface{}); ok {
			if message, ok := choice["message"].(map[string]interface{}); ok {
				if content, ok := message["content"].(string); ok {
					// 清理文本，限制长度
					analysis := strings.TrimSpace(content)
					if len(analysis) > 80 {
						analysis = analysis[:80] + "..."
					}
					return analysis, nil
				}
			}
		}
	}

	return generateMockAnalysis(locationName), nil
}

// generateMockAnalysis 生成模拟分析（当 API 未配置时）
func generateMockAnalysis(locationName string) string {
	mocks := []string{
		fmt.Sprintf("🌟 %s 是个值得一去的好地方！建议早上去，人少景美。记得带上相机，随手一拍都是大片！", locationName),
		fmt.Sprintf("✨ %s 超有特色！周边美食超多，游玩时间建议 2-3 小时。周末人会比较多哦～", locationName),
		fmt.Sprintf("🎯 %s 打卡必去！这里的风景绝美，适合放松心情。最佳拍摄时间是傍晚时分！", locationName),
		fmt.Sprintf("📍 %s 本地人推荐！隐藏玩法：从侧门进人更少。附近停车方便，门票性价比超高！", locationName),
		fmt.Sprintf("🔥 %s 网红打卡地！建议穿浅色衣服更出片。周边有咖啡厅可以休息，非常适合约会！", locationName),
	}

	// 根据位置名称选择一个模拟文案
	idx := len(locationName) % len(mocks)
	return mocks[idx]
}
