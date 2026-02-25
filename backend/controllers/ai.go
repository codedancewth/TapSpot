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
		// 文字分析模式 - 解析可玩性（支持 500 字）
		prompt = fmt.Sprintf(`请详细分析这段文字描述的地方的可玩性：%s

要求：
1. 详细分析该地方有什么好玩的、值得体验的项目
2. 给出推荐理由、特色亮点、适合人群
3. 可以提供游玩建议、注意事项、最佳时间等
4. 语言生动有趣，吸引人，可以有适当的情感表达
5. 可以加适量的 emoji 增加趣味性
6. 字数控制在 200-500 字之间，内容要丰富详细
7. 不要使用 markdown 格式，直接输出纯文本
8. 确保输出完整，不要截断

请直接输出分析内容，不要有其他说明。`, locationName)
		maxTokens = 1000
	} else {
		// 地点名称模式 - 分析地方特色（简洁版）
		prompt = fmt.Sprintf(`请分析这个地方：%s

要求：
1. 描述该地方的特色和亮点
2. 给出游玩建议或注意事项
3. 语言生动有趣，吸引人
4. 不超过 100 个字
5. 加 1-2 个 emoji 增加趣味性
6. 不要使用 markdown 格式，直接输出纯文本
7. 确保输出完整，不要截断

请直接输出分析内容，不要有其他说明。`, locationName)
		maxTokens = 300
	}

	// 构建请求体（Qwen-Plus 平衡版）
	requestBody := map[string]interface{}{
		"model": "qwen-plus",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"max_tokens": maxTokens,
		"temperature": 0.5,
		"top_p": 0.8,
		"stream": false,
		"enable_search": false,
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
