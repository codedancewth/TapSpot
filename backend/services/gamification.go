package services

import (
	"tapspot/models"
	"time"
	"encoding/json"
	"errors"
)

// GamificationService 游戏化服务
type GamificationService struct {
}

func NewGamificationService() *GamificationService {
	return &GamificationService{}
}

// GetOrCreatePlayerLevel 获取或创建玩家等级
func (s *GamificationService) GetOrCreatePlayerLevel(userID uint) (*models.PlayerLevel, error) {
	var level models.PlayerLevel
	result := models.DB.Where("user_id = ?", userID).First(&level)
	
	if result.Error != nil {
		// 创建新玩家等级
		level = models.PlayerLevel{
			UserID:      userID,
			Level:       1,
			Experience:  0,
			Title:       "新手游客",
			UpdatedAt:   time.Now(),
		}
		if err := models.DB.Create(&level).Error; err != nil {
			return nil, err
		}
	}
	
	return &level, nil
}

// AddExperience 添加经验值
func (s *GamificationService) AddExperience(userID uint, exp int64, reason string) (*models.PlayerLevel, error) {
	level, err := s.GetOrCreatePlayerLevel(userID)
	if err != nil {
		return nil, err
	}
	
	level.Experience += exp
	oldLevel := level.Level
	
	// 计算新等级（每 100 点经验升一级，指数增长）
	requiredExp := int64(100 * level.Level * level.Level)
	for level.Experience >= requiredExp {
		level.Level++
		level.Title = s.getTitleForLevel(level.Level)
		requiredExp = int64(100 * level.Level * level.Level)
	}
	
	level.UpdatedAt = time.Now()
	
	if err := models.DB.Save(level).Error; err != nil {
		return nil, err
	}
	
	// 如果升级了，发送通知（后续实现）
	if level.Level > oldLevel {
		// TODO: 发送升级通知
	}
	
	return level, nil
}

// getTitleForLevel 根据等级获取称号
func (s *GamificationService) getTitleForLevel(level int) string {
	titles := map[int]string{
		1:  "新手游客",
		5:  "探索者",
		10: "旅行家",
		15: "冒险家",
		20: "探险大师",
		25: "城市向导",
		30: "传奇旅行者",
		40: "世界探索者",
		50: "旅行传奇",
	}
	
	for l, title := range titles {
		if level >= l {
			return title
		}
	}
	return "新手游客"
}

// GetOrCreateWallet 获取或创建玩家钱包
func (s *GamificationService) GetOrCreateWallet(userID uint) (*models.PlayerWallet, error) {
	var wallet models.PlayerWallet
	result := models.DB.Where("user_id = ?", userID).First(&wallet)
	
	if result.Error != nil {
		wallet = models.PlayerWallet{
			UserID:     userID,
			GoldCoins:  100, // 新用户送 100 金币
			Gems:       0,
			UpdatedAt:  time.Now(),
		}
		if err := models.DB.Create(&wallet).Error; err != nil {
			return nil, err
		}
	}
	
	return &wallet, nil
}

// AddGoldCoins 添加金币
func (s *GamificationService) AddGoldCoins(userID uint, amount int64, reason string) (*models.PlayerWallet, error) {
	wallet, err := s.GetOrCreateWallet(userID)
	if err != nil {
		return nil, err
	}
	
	wallet.GoldCoins += amount
	wallet.UpdatedAt = time.Now()
	
	if err := models.DB.Save(wallet).Error; err != nil {
		return nil, err
	}
	
	return wallet, nil
}

// SpendGoldCoins 消费金币
func (s *GamificationService) SpendGoldCoins(userID uint, amount int64) (*models.PlayerWallet, error) {
	wallet, err := s.GetOrCreateWallet(userID)
	if err != nil {
		return nil, err
	}
	
	if wallet.GoldCoins < amount {
		return nil, errors.New("金币不足")
	}
	
	wallet.GoldCoins -= amount
	wallet.UpdatedAt = time.Now()
	
	if err := models.DB.Save(wallet).Error; err != nil {
		return nil, err
	}
	
	return wallet, nil
}

// GetOrCreateCheckinStreak 获取或创建打卡连续记录
func (s *GamificationService) GetOrCreateCheckinStreak(userID uint) (*models.CheckinStreak, error) {
	var streak models.CheckinStreak
	result := models.DB.Where("user_id = ?", userID).First(&streak)
	
	if result.Error != nil {
		streak = models.CheckinStreak{
			UserID:        userID,
			CurrentStreak: 0,
			LongestStreak: 0,
			UpdatedAt:     time.Now(),
		}
		if err := models.DB.Create(&streak).Error; err != nil {
			return nil, err
		}
	}
	
	return &streak, nil
}

// UpdateCheckinStreak 更新打卡连续记录
func (s *GamificationService) UpdateCheckinStreak(userID uint) (*models.CheckinStreak, error) {
	streak, err := s.GetOrCreateCheckinStreak(userID)
	if err != nil {
		return nil, err
	}
	
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	
	// 如果今天已经打卡过，不重复计算
	if streak.LastCheckin != nil && !streak.LastCheckin.IsZero() && streak.LastCheckin.After(today) {
		return streak, nil
	}
	
	// 检查是否是连续打卡
	if streak.LastCheckin != nil {
		yesterday := today.AddDate(0, 0, -1)
		if streak.LastCheckin.Before(yesterday) {
			// 断签了，重置连续天数
			streak.CurrentStreak = 1
		} else {
			// 连续打卡
			streak.CurrentStreak++
		}
	} else {
		// 第一次打卡
		streak.CurrentStreak = 1
	}
	
	// 更新最长连续记录
	if streak.CurrentStreak > streak.LongestStreak {
		streak.LongestStreak = streak.CurrentStreak
	}
	
	streak.LastCheckin = &now
	streak.UpdatedAt = now
	
	if err := models.DB.Save(streak).Error; err != nil {
		return nil, err
	}
	
	return streak, nil
}

// CheckAndAwardAchievements 检查并授予成就
func (s *GamificationService) CheckAndAwardAchievements(userID uint) ([]models.Achievement, error) {
	var awarded []models.Achievement
	
	// 获取所有成就
	var achievements []models.Achievement
	if err := models.DB.Find(&achievements).Error; err != nil {
		return nil, err
	}
	
	// 获取玩家已获得的成就
	var playerAchievements []models.PlayerAchievement
	models.DB.Where("user_id = ?", userID).Find(&playerAchievements)
	
	obtainedIDs := make(map[uint]bool)
	for _, pa := range playerAchievements {
		obtainedIDs[pa.AchievementID] = true
	}
	
	// 检查每个成就
	for _, achievement := range achievements {
		if obtainedIDs[achievement.ID] {
			continue
		}
		
		if s.checkAchievementRequirement(userID, achievement) {
			// 授予成就
			pa := models.PlayerAchievement{
				UserID:        userID,
				AchievementID: achievement.ID,
				CompletedAt:   time.Now(),
			}
			if err := models.DB.Create(&pa).Error; err != nil {
				continue
			}
			
			awarded = append(awarded, achievement)
			
			// 发放奖励
			s.awardAchievementReward(userID, achievement.RewardJSON)
		}
	}
	
	return awarded, nil
}

// checkAchievementRequirement 检查成就是否完成
func (s *GamificationService) checkAchievementRequirement(userID uint, achievement models.Achievement) bool {
	var req map[string]interface{}
	if err := json.Unmarshal(achievement.Requirement, &req); err != nil {
		return false
	}
	
	reqType, ok := req["type"].(string)
	if !ok {
		return false
	}
	
	switch reqType {
	case "checkin_count":
		value, _ := req["value"].(float64)
		var count int64
		models.DB.Model(&models.Post{}).Where("user_id = ?", userID).Count(&count)
		return count >= int64(value)
	case "like_count":
		value, _ := req["value"].(float64)
		var count int64
		models.DB.Model(&models.Like{}).Where("user_id = ?", userID).Count(&count)
		return count >= int64(value)
	case "level":
		value, _ := req["value"].(float64)
		var level models.PlayerLevel
		if err := models.DB.Where("user_id = ?", userID).First(&level).Error; err != nil {
			return false
		}
		return level.Level >= int(value)
	case "streak":
		value, _ := req["value"].(float64)
		var streak models.CheckinStreak
		if err := models.DB.Where("user_id = ?", userID).First(&streak).Error; err != nil {
			return false
		}
		return streak.LongestStreak >= int(value)
	}
	
	return false
}

// awardAchievementReward 发放成就奖励
func (s *GamificationService) awardAchievementReward(userID uint, rewardJSON json.RawMessage) {
	var reward map[string]interface{}
	if err := json.Unmarshal(rewardJSON, &reward); err != nil {
		return
	}
	
	if gold, ok := reward["gold"].(float64); ok {
		s.AddGoldCoins(userID, int64(gold), "成就奖励")
	}
	
	if exp, ok := reward["exp"].(float64); ok {
		s.AddExperience(userID, int64(exp), "成就奖励")
	}
}

// GetDailyQuests 获取每日任务
func (s *GamificationService) GetDailyQuests(userID uint) ([]models.Quest, error) {
	var quests []models.Quest
	today := time.Now().Truncate(24 * time.Hour)
	tomorrow := today.Add(24 * time.Hour)
	
	err := models.DB.Where("type = ? AND is_active = ? AND start_time <= ? AND end_time >= ?", 
		"daily", true, tomorrow, today).Find(&quests).Error
	
	return quests, err
}

// GetPlayerQuests 获取玩家任务进度
func (s *GamificationService) GetPlayerQuests(userID uint) ([]models.PlayerQuest, error) {
	var playerQuests []models.PlayerQuest
	err := models.DB.Where("user_id = ? AND status = ?", userID, "active").
		Preload("Quest").Find(&playerQuests).Error
	return playerQuests, err
}

// AcceptQuest 接受任务
func (s *GamificationService) AcceptQuest(userID uint, questID uint) (*models.PlayerQuest, error) {
	// 检查是否已接受
	var existing models.PlayerQuest
	if err := models.DB.Where("user_id = ? AND quest_id = ?", userID, questID).First(&existing).Error; err == nil {
		return &existing, nil
	}
	
	// 创建任务进度
	pq := models.PlayerQuest{
		UserID:    userID,
		QuestID:   questID,
		Status:    "active",
		Progress:  json.RawMessage("{}"),
		StartedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	
	if err := models.DB.Create(&pq).Error; err != nil {
		return nil, err
	}
	
	return &pq, nil
}

// UpdateQuestProgress 更新任务进度
func (s *GamificationService) UpdateQuestProgress(userID uint, questID uint, progressKey string, value int) error {
	var pq models.PlayerQuest
	if err := models.DB.Where("user_id = ? AND quest_id = ? AND status = ?", userID, questID, "active").First(&pq).Error; err != nil {
		return err
	}
	
	var progress map[string]interface{}
	if err := json.Unmarshal(pq.Progress, &progress); err != nil {
		progress = make(map[string]interface{})
	}
	
	progress[progressKey] = value
	
	progressJSON, _ := json.Marshal(progress)
	pq.Progress = progressJSON
	pq.UpdatedAt = time.Now()
	
	// 检查是否完成
	var quest models.Quest
	if err := models.DB.First(&quest, questID).Error; err != nil {
		return err
	}
	
	if s.checkQuestCompleted(progress, quest.Objectives) {
		pq.Status = "completed"
	}
	
	return models.DB.Save(&pq).Error
}

// checkQuestCompleted 检查任务是否完成
func (s *GamificationService) checkQuestCompleted(progress map[string]interface{}, objectives json.RawMessage) bool {
	var obj map[string]interface{}
	if err := json.Unmarshal(objectives, &obj); err != nil {
		return false
	}
	
	for key, targetValue := range obj {
		if target, ok := targetValue.(float64); ok {
			if current, exists := progress[key]; exists {
				if currVal, ok := current.(float64); ok {
					if currVal < target {
						return false
					}
				}
			} else {
				return false
			}
		}
	}
	
	return true
}

// ClaimQuestReward 领取任务奖励
func (s *GamificationService) ClaimQuestReward(userID uint, questID uint) error {
	var pq models.PlayerQuest
	if err := models.DB.Where("user_id = ? AND quest_id = ?", userID, questID).First(&pq).Error; err != nil {
		return err
	}
	
	if pq.Status != "completed" {
		return errors.New("任务未完成")
	}
	
	if pq.Status == "claimed" {
		return errors.New("奖励已领取")
	}
	
	// 发放奖励
	var quest models.Quest
	if err := models.DB.First(&quest, questID).Error; err != nil {
		return err
	}
	
	s.awardAchievementReward(userID, quest.RewardJSON)
	
	// 更新状态
	pq.Status = "claimed"
	return models.DB.Save(&pq).Error
}
