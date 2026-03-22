package services

import (
	"tapspot/models"
	"encoding/json"
	"log"
)

// InitGamificationData 初始化游戏化数据（成就和任务）
func InitGamificationData() {
	log.Println("🎮 初始化游戏化数据...")
	
	initAchievements()
	initQuests()
	initItems()
	
	log.Println("✅ 游戏化数据初始化完成")
}

// initAchievements 初始化成就数据
func initAchievements() {
	achievements := []models.Achievement{
		// 探索类成就
		{
			Name:        "新手上路",
			Description: "完成第一次打卡",
			IconURL:     "📍",
			Category:    "exploration",
			Requirement: json.RawMessage(`{"type":"checkin_count","value":1}`),
			RewardJSON:  json.RawMessage(`{"gold":50,"exp":20}`),
		},
		{
			Name:        "探索者",
			Description: "累计打卡 10 次",
			IconURL:     "🗺️",
			Category:    "exploration",
			Requirement: json.RawMessage(`{"type":"checkin_count","value":10}`),
			RewardJSON:  json.RawMessage(`{"gold":200,"exp":50}`),
		},
		{
			Name:        "旅行家",
			Description: "累计打卡 50 次",
			IconURL:     "✈️",
			Category:    "exploration",
			Requirement: json.RawMessage(`{"type":"checkin_count","value":50}`),
			RewardJSON:  json.RawMessage(`{"gold":500,"exp":100}`),
		},
		{
			Name:        "城市达人",
			Description: "累计打卡 100 次",
			IconURL:     "🏙️",
			Category:    "exploration",
			Requirement: json.RawMessage(`{"type":"checkin_count","value":100}`),
			RewardJSON:  json.RawMessage(`{"gold":1000,"exp":200}`),
		},
		
		// 社交类成就
		{
			Name:        "人气新星",
			Description: "获得 10 个赞",
			IconURL:     "⭐",
			Category:    "social",
			Requirement: json.RawMessage(`{"type":"like_count","value":10}`),
			RewardJSON:  json.RawMessage(`{"gold":100,"exp":30}`),
		},
		{
			Name:        "社交达人",
			Description: "获得 100 个赞",
			IconURL:     "🌟",
			Category:    "social",
			Requirement: json.RawMessage(`{"type":"like_count","value":100}`),
			RewardJSON:  json.RawMessage(`{"gold":300,"exp":80}`),
		},
		
		// 坚持类成就
		{
			Name:        "坚持不懈",
			Description: "连续打卡 7 天",
			IconURL:     "🔥",
			Category:    "special",
			Requirement: json.RawMessage(`{"type":"streak","value":7}`),
			RewardJSON:  json.RawMessage(`{"gold":300,"exp":100}`),
		},
		{
			Name:        "毅力王者",
			Description: "连续打卡 30 天",
			IconURL:     "💎",
			Category:    "special",
			Requirement: json.RawMessage(`{"type":"streak","value":30}`),
			RewardJSON:  json.RawMessage(`{"gold":1000,"exp":300}`),
		},
		
		// 等级成就
		{
			Name:        "初出茅庐",
			Description: "达到 5 级",
			IconURL:     "🎖️",
			Category:    "special",
			Requirement: json.RawMessage(`{"type":"level","value":5}`),
			RewardJSON:  json.RawMessage(`{"gold":200,"exp":50}`),
		},
		{
			Name:        "渐入佳境",
			Description: "达到 10 级",
			IconURL:     "🎗️",
			Category:    "special",
			Requirement: json.RawMessage(`{"type":"level","value":10}`),
			RewardJSON:  json.RawMessage(`{"gold":500,"exp":100}`),
		},
		{
			Name:        "登堂入室",
			Description: "达到 20 级",
			IconURL:     "👑",
			Category:    "special",
			Requirement: json.RawMessage(`{"type":"level","value":20}`),
			RewardJSON:  json.RawMessage(`{"gold":1000,"exp":200}`),
		},
	}
	
	for _, achievement := range achievements {
		// 检查是否已存在
		var existing models.Achievement
		if err := models.DB.Where("name = ?", achievement.Name).First(&existing).Error; err != nil {
			// 不存在则创建
			models.DB.Create(&achievement)
		} else {
			// 已存在则更新 IconURL
			models.DB.Model(&existing).Update("icon_url", achievement.IconURL)
		}
	}
}

// initQuests 初始化任务数据
func initQuests() {
	quests := []models.Quest{
		// 每日任务
		{
			Title:       "每日打卡",
			Description: "今天也要记得打卡哦！",
			Type:        "daily",
			Objectives:  json.RawMessage(`{"checkin_count":1}`),
			RewardJSON:  json.RawMessage(`{"gold":30,"exp":10}`),
			IsActive:    true,
		},
		{
			Title:       "社交互动",
			Description: "给别人的打卡点赞 3 次",
			Type:        "daily",
			Objectives:  json.RawMessage(`{"like_given":3}`),
			RewardJSON:  json.RawMessage(`{"gold":20,"exp":10}`),
			IsActive:    true,
		},
		{
			Title:       "探索发现",
			Description: "发现一个新的打卡地点",
			Type:        "daily",
			Objectives:  json.RawMessage(`{"new_location":1}`),
			RewardJSON:  json.RawMessage(`{"gold":40,"exp":15}`),
			IsActive:    true,
		},
		
		// 每周任务
		{
			Title:       "周打卡挑战",
			Description: "本周累计打卡 5 次",
			Type:        "weekly",
			Objectives:  json.RawMessage(`{"weekly_checkins":5}`),
			RewardJSON:  json.RawMessage(`{"gold":200,"exp":50}`),
			IsActive:    true,
		},
		{
			Title:       "人气挑战",
			Description: "本周获得 20 个赞",
			Type:        "weekly",
			Objectives:  json.RawMessage(`{"weekly_likes":20}`),
			RewardJSON:  json.RawMessage(`{"gold":150,"exp":40}`),
			IsActive:    true,
		},
		
		// 主线任务
		{
			Title:       "城市探索者",
			Description: "打卡 10 个不同的城市",
			Type:        "main",
			Objectives:  json.RawMessage(`{"unique_cities":10}`),
			RewardJSON:  json.RawMessage(`{"gold":500,"exp":100}`),
			IsActive:    true,
		},
		{
			Title:       "美食猎人",
			Description: "打卡 20 家餐厅",
			Type:        "main",
			Objectives:  json.RawMessage(`{"food_spots":20}`),
			RewardJSON:  json.RawMessage(`{"gold":400,"exp":80}`),
			IsActive:    true,
		},
		{
			Title:       "风景摄影师",
			Description: "打卡 15 个风景点",
			Type:        "main",
			Objectives:  json.RawMessage(`{"scenic_spots":15}`),
			RewardJSON:  json.RawMessage(`{"gold":400,"exp":80}`),
			IsActive:    true,
		},
	}
	
	for _, quest := range quests {
		// 检查是否已存在
		var existing models.Quest
		if err := models.DB.Where("title = ? AND type = ?", quest.Title, quest.Type).First(&existing).Error; err != nil {
			// 不存在则创建
			models.DB.Create(&quest)
		}
	}
}

// initItems 初始化道具数据
func initItems() {
	items := []models.Item{
		{
			Name:        "双倍经验卡",
			Description: "使用后 2 小时内获得双倍经验",
			IconURL:     "/items/exp_boost.png",
			Type:        "boost",
			Effect:      "2 小时双倍经验",
			Price:       200,
			Duration:    120,
			IsActive:    true,
		},
		{
			Name:        "位置提示卡",
			Description: "显示附近 3 公里内的隐藏打卡点",
			IconURL:     "/items/hint_card.png",
			Type:        "card",
			Effect:      "显示附近隐藏地点",
			Price:       100,
			IsActive:    true,
		},
		{
			Name:        "传送卡",
			Description: "允许远程打卡一次（无需到达现场）",
			IconURL:     "/items/teleport_card.png",
			Type:        "teleport",
			Effect:      "远程打卡一次",
			Price:       500,
			IsActive:    true,
		},
		{
			Name:        "复活卡",
			Description: "任务失败后可以使用复活卡重来",
			IconURL:     "/items/revive_card.png",
			Type:        "revive",
			Effect:      "任务复活一次",
			Price:       150,
			IsActive:    true,
		},
		{
			Name:        "金币卡",
			Description: "立即获得 500 金币",
			IconURL:     "/items/gold_card.png",
			Type:        "card",
			Effect:      "+500 金币",
			GemPrice:    50,
			IsActive:    true,
		},
	}
	
	for _, item := range items {
		// 检查是否已存在
		var existing models.Item
		if err := models.DB.Where("name = ?", item.Name).First(&existing).Error; err != nil {
			// 不存在则创建
			models.DB.Create(&item)
		}
	}
}
