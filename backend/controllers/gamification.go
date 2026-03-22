package controllers

import (
	"tapspot/models"
	"tapspot/services"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"time"
	"encoding/json"
)

type GamificationController struct {
	gamificationService *services.GamificationService
}

func NewGamificationController() *GamificationController {
	return &GamificationController{
		gamificationService: services.NewGamificationService(),
	}
}

// GetPlayerProfile 获取玩家档案（等级、金币等）
func (gc *GamificationController) GetPlayerProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	uid := userID.(uint)
	
	// 获取玩家等级
	level, err := gc.gamificationService.GetOrCreatePlayerLevel(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// 获取钱包
	wallet, err := gc.gamificationService.GetOrCreateWallet(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// 获取打卡连续记录
	streak, err := gc.gamificationService.GetOrCreateCheckinStreak(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// 获取已获得的成就数量
	var achievementCount int64
	models.DB.Model(&models.PlayerAchievement{}).Where("user_id = ?", uid).Count(&achievementCount)
	
	// 获取进行中任务数量
	var questCount int64
	models.DB.Model(&models.PlayerQuest{}).Where("user_id = ? AND status = ?", uid, "active").Count(&questCount)
	
	c.JSON(http.StatusOK, gin.H{
		"level":         level.Level,
		"experience":    level.Experience,
		"title":         level.Title,
		"gold_coins":    wallet.GoldCoins,
		"gems":          wallet.Gems,
		"current_streak": streak.CurrentStreak,
		"longest_streak": streak.LongestStreak,
		"achievements":  achievementCount,
		"active_quests": questCount,
	})
}

// GetLeaderboard 获取排行榜
func (gc *GamificationController) GetLeaderboard(c *gin.Context) {
	leaderboardType := c.DefaultQuery("type", "level") // level, checkins, likes
	period := c.DefaultQuery("period", "weekly")       // daily, weekly, monthly, alltime
	limitStr := c.DefaultQuery("limit", "10")
	
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}
	
	// 从缓存获取排行榜
	var leaderboard models.Leaderboard
	err = models.DB.Where("type = ? AND period = ?", leaderboardType, period).
		Order("updated_at DESC").First(&leaderboard).Error
	
	if err != nil {
		// 如果没有缓存，实时生成
		data := gc.generateLeaderboard(leaderboardType, period, limit)
		c.JSON(http.StatusOK, gin.H{
			"type":    leaderboardType,
			"period":  period,
			"entries": data,
		})
		return
	}
	
	var data []map[string]interface{}
	json.Unmarshal(leaderboard.Data, &data)
	
	c.JSON(http.StatusOK, gin.H{
		"type":    leaderboardType,
		"period":  period,
		"entries": data,
	})
}

// generateLeaderboard 实时生成排行榜
func (gc *GamificationController) generateLeaderboard(leaderboardType string, period string, limit int) []map[string]interface{} {
	var entries []map[string]interface{}
	
	switch leaderboardType {
	case "level":
		var levels []models.PlayerLevel
		models.DB.Order("level DESC, experience DESC").Limit(limit).Find(&levels)
		for _, l := range levels {
			var user models.User
			models.DB.First(&user, l.UserID)
			entries = append(entries, map[string]interface{}{
				"user_id":    l.UserID,
				"username":   user.Username,
				"avatar":     user.Avatar,
				"level":      l.Level,
				"experience": l.Experience,
				"title":      l.Title,
			})
		}
	case "checkins":
		// 按打卡数量排名
		rows, _ := models.DB.Raw(`
			SELECT user_id, COUNT(*) as checkin_count 
			FROM posts 
			GROUP BY user_id 
			ORDER BY checkin_count DESC 
			LIMIT ?`, limit).Rows()
		defer rows.Close()
		
		for rows.Next() {
			var userID uint
			var count int
			rows.Scan(&userID, &count)
			var user models.User
			models.DB.First(&user, userID)
			entries = append(entries, map[string]interface{}{
				"user_id":      userID,
				"username":     user.Username,
				"avatar":       user.Avatar,
				"checkin_count": count,
			})
		}
	case "likes":
		// 按获得的点赞数排名
		rows, _ := models.DB.Raw(`
			SELECT p.user_id, COUNT(l.id) as like_count 
			FROM posts p
			LEFT JOIN likes l ON p.id = l.post_id
			GROUP BY p.user_id
			ORDER BY like_count DESC
			LIMIT ?`, limit).Rows()
		defer rows.Close()
		
		for rows.Next() {
			var userID uint
			var count int
			rows.Scan(&userID, &count)
			var user models.User
			models.DB.First(&user, userID)
			entries = append(entries, map[string]interface{}{
				"user_id":   userID,
				"username":  user.Username,
				"avatar":    user.Avatar,
				"like_count": count,
			})
		}
	}
	
	return entries
}

// GetAchievements 获取成就列表
func (gc *GamificationController) GetAchievements(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	uid := userID.(uint)
	category := c.Query("category") // 可选筛选
	
	var achievements []models.Achievement
	query := models.DB.Model(&models.Achievement{})
	
	if category != "" {
		query = query.Where("category = ?", category)
	}
	query.Find(&achievements)
	
	// 获取玩家已获得的成就
	var obtainedIDs []uint
	models.DB.Model(&models.PlayerAchievement{}).
		Where("user_id = ?", uid).
		Pluck("achievement_id", &obtainedIDs)
	
	obtainedMap := make(map[uint]bool)
	for _, id := range obtainedIDs {
		obtainedMap[id] = true
	}
	
	// 标记已获得的成就
	type AchievementWithStatus struct {
		models.Achievement
		Obtained    bool      `json:"obtained"`
		CompletedAt time.Time `json:"completed_at,omitempty"`
	}
	
	result := []AchievementWithStatus{}
	for _, a := range achievements {
		aws := AchievementWithStatus{
			Achievement: a,
			Obtained:    obtainedMap[a.ID],
		}
		if aws.Obtained {
			var pa models.PlayerAchievement
			if err := models.DB.Where("user_id = ? AND achievement_id = ?", uid, a.ID).First(&pa).Error; err == nil {
				aws.CompletedAt = pa.CompletedAt
			}
		}
		result = append(result, aws)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"achievements": result,
	})
}

// GetQuests 获取任务列表
func (gc *GamificationController) GetQuests(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	uid := userID.(uint)
	questType := c.Query("type") // daily, weekly, event, main, side
	
	// 获取玩家任务进度
	playerQuests, err := gc.gamificationService.GetPlayerQuests(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// 如果没有任务，返回每日任务
	if len(playerQuests) == 0 {
		dailyQuests, err := gc.gamificationService.GetDailyQuests(uid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		// 自动接受每日任务
		for _, q := range dailyQuests {
			gc.gamificationService.AcceptQuest(uid, q.ID)
		}
		
		playerQuests, _ = gc.gamificationService.GetPlayerQuests(uid)
	}
	
	// 筛选类型
	if questType != "" {
		filtered := []models.PlayerQuest{}
		for _, pq := range playerQuests {
			if pq.Quest.Type == questType {
				filtered = append(filtered, pq)
			}
		}
		playerQuests = filtered
	}
	
	c.JSON(http.StatusOK, gin.H{
		"quests": playerQuests,
	})
}

// AcceptQuest 接受任务
func (gc *GamificationController) AcceptQuest(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	questIDStr := c.Param("id")
	questID, err := strconv.ParseUint(questIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的任务 ID"})
		return
	}
	
	pq, err := gc.gamificationService.AcceptQuest(userID.(uint), uint(questID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "任务已接受",
		"quest":   pq,
	})
}

// ClaimQuestReward 领取任务奖励
func (gc *GamificationController) ClaimQuestReward(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	questIDStr := c.Param("id")
	questID, err := strconv.ParseUint(questIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的任务 ID"})
		return
	}
	
	err = gc.gamificationService.ClaimQuestReward(userID.(uint), uint(questID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "奖励已领取",
	})
}

// DailyCheckin 每日签到
func (gc *GamificationController) DailyCheckin(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	uid := userID.(uint)
	
	// 更新打卡连续记录
	streak, err := gc.gamificationService.UpdateCheckinStreak(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// 检查是否已经打卡（LastCheckin 在今天零点之后说明今天已打卡）
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	already := streak.LastCheckin != nil && !streak.LastCheckin.IsZero() && streak.LastCheckin.After(today)
	
	// 奖励金币（连续天数越多奖励越多，但今天已打卡则不重复奖励）
	var reward, totalGold int64
	var wallet *models.PlayerWallet
	
	if !already {
		reward = int64(10 + streak.CurrentStreak*2)
		wallet, err = gc.gamificationService.AddGoldCoins(uid, reward, "每日签到")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		totalGold = wallet.GoldCoins
		
		// 奖励经验
		gc.gamificationService.AddExperience(uid, 20, "每日签到")
		
		// 检查成就
		gc.gamificationService.CheckAndAwardAchievements(uid)
	} else {
		wallet, _ = gc.gamificationService.GetOrCreateWallet(uid)
		totalGold = wallet.GoldCoins
	}
	
	message := "签到成功"
	if already {
		message = "今日已签到"
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message":    message,
		"already":   already,
		"streak":    streak.CurrentStreak,
		"longest":   streak.LongestStreak,
		"reward":    reward,
		"total_gold": totalGold,
	})
}
