package services

import (
	"log"
	"time"
	"tapspot/models"
)

// InitTaskSystem 初始化任务系统数据
func InitTaskSystem() {
	// 检查是否已有任务
	var count int64
	models.DB.Model(&models.Task{}).Count(&count)
	if count > 0 {
		log.Printf("📍 任务系统已初始化，共 %d 个任务", count)
		return
	}

	log.Println("📍 正在初始化任务系统...")

	// 创建示例任务
	sampleTasks := []models.Task{
		{
			Title:        "📍 天安门广场签到",
			Description:  "来天安门广场完成签到，感受祖国的庄严",
			Type:         models.TaskTypeCheckin,
			Latitude:     39.9073,
			Longitude:    116.3910,
			LocationName:  "天安门广场",
			Radius:       200,
			Points:       30,
			BonusPoints:  10,
			Status:       models.TaskStatusActive,
			PublisherType: models.PublisherTypeSystem,
			PublisherID:   1, // 系统任务，使用管理员用户ID
		},
		{
			Title:        "📍 故宫博物院签到",
			Description:  "探访紫禁城，了解历史文化",
			Type:         models.TaskTypeCheckin,
			Latitude:     39.9163,
			Longitude:    116.3972,
			LocationName:  "故宫博物院",
			Radius:       150,
			Points:       50,
			BonusPoints:  20,
			Status:       models.TaskStatusActive,
			PublisherType: models.PublisherTypeSystem,
			PublisherID:   1,
		},
		{
			Title:        "📍 三里屯酒吧街签到",
			Description:  "时尚地标，体验夜生活",
			Type:         models.TaskTypeCheckin,
			Latitude:     39.9365,
			Longitude:    116.4537,
			LocationName:  "三里屯",
			Radius:       100,
			Points:       20,
			BonusPoints:  5,
			Status:       models.TaskStatusActive,
			PublisherType: models.PublisherTypeSystem,
			PublisherID:   1,
		},
		{
			Title:        "📸 拍摄一张胡同照片",
			Description:  "用相机记录老北京胡同",
			Type:         models.TaskTypePhoto,
			Latitude:     39.9289,
			Longitude:    116.4175,
			LocationName:  "南锣鼓巷",
			Radius:       100,
			Points:       40,
			BonusPoints:  15,
			Status:       models.TaskStatusActive,
			PublisherType: models.PublisherTypeSystem,
			PublisherID:   1,
		},
		{
			Title:        "📸 拍摄外滩夜景",
			Description:  "记录上海的璀璨夜景",
			Type:         models.TaskTypePhoto,
			Latitude:     31.2405,
			Longitude:    121.4900,
			LocationName:  "外滩",
			Radius:       150,
			Points:       60,
			BonusPoints:  20,
			Status:       models.TaskStatusActive,
			PublisherType: models.PublisherTypeSystem,
			PublisherID:   1,
		},
		{
			Title:        "❓ 故宫有多少间房？",
			Description:  "回答关于故宫的知识问题",
			Type:         models.TaskTypeQA,
			Latitude:     39.9163,
			Longitude:    116.3972,
			LocationName:  "故宫博物院",
			Radius:       100,
			Points:       50,
			BonusPoints:  20,
			Question:     "故宫有多少间房？",
			Answer:       "9999",
			Status:       models.TaskStatusActive,
			PublisherType: models.PublisherTypeSystem,
			PublisherID:   1,
		},
		{
			Title:        "🗺️ 发现一个新地点",
			Description:  "探索并签到一个你从未去过的地方",
			Type:         models.TaskTypeExplore,
			Latitude:     0,
			Longitude:    0,
			LocationName:  "任意地点",
			Radius:       0,
			Points:       100,
			BonusPoints:  50,
			Status:       models.TaskStatusActive,
			PublisherType: models.PublisherTypeSystem,
			PublisherID:   1,
		},
		{
			Title:        "🔥 登顶长城",
			Description:  "完成一次长城签到，挑战自我",
			Type:         models.TaskTypeChallenge,
			Latitude:     40.4319,
			Longitude:    116.5704,
			LocationName:  "八达岭长城",
			Radius:       300,
			Points:       200,
			BonusPoints:  100,
			Status:       models.TaskStatusActive,
			PublisherType: models.PublisherTypeSystem,
			PublisherID:   1,
		},
	}

	now := time.Now()
	for i := range sampleTasks {
		sampleTasks[i].CreatedAt = now
		sampleTasks[i].UpdatedAt = now
	}

	// 批量插入
	if err := models.DB.Create(&sampleTasks); err != nil {
		log.Printf("❌ 初始化任务失败: %v", err)
		return
	}

	log.Printf("✅ 任务系统初始化完成，共创建 %d 个示例任务", len(sampleTasks))
}
