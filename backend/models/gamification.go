package models

import (
	"time"
	"encoding/json"
)

// PlayerLevel 玩家等级
type PlayerLevel struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"user_id" gorm:"uniqueIndex;not null"`
	User         User      `json:"-" gorm:"foreignKey:UserID"`
	Level        int       `json:"level" gorm:"default:1"`
	Experience   int64     `json:"experience" gorm:"default:0"`
	Title        string    `json:"title" gorm:"size:50;default:'新手游客'"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Achievement 成就徽章定义
type Achievement struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:100;not null"`
	Description string         `json:"description" gorm:"type:text"`
	IconURL     string         `json:"icon_url" gorm:"size:255"`
	Category    string         `json:"category" gorm:"size:50"` // exploration, social, content, special
	Requirement json.RawMessage `json:"requirement" gorm:"type:json"` // 完成条件 {"type":"checkin_count","value":10}
	RewardJSON  json.RawMessage `json:"reward_json" gorm:"type:json"` // 奖励 {"gold":100,"exp":50}
	CreatedAt   time.Time      `json:"created_at"`
}

// PlayerAchievement 玩家获得的成就
type PlayerAchievement struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id" gorm:"not null;index"`
	AchievementID uint      `json:"achievement_id" gorm:"not null"`
	Achievement   Achievement `json:"achievement,omitempty" gorm:"foreignKey:AchievementID"`
	CompletedAt   time.Time `json:"completed_at"`
}

// Quest 任务定义
type Quest struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"size:200;not null"`
	Description string         `json:"description" gorm:"type:text"`
	Type        string         `json:"type" gorm:"size:20;not null"` // daily, weekly, event, main, side
	Objectives  json.RawMessage `json:"objectives" gorm:"type:json"` // 任务目标
	RewardJSON  json.RawMessage `json:"reward_json" gorm:"type:json"` // 奖励
	StartTime   time.Time      `json:"start_time"`
	EndTime     time.Time      `json:"end_time"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
}

// PlayerQuest 玩家任务进度
type PlayerQuest struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	QuestID   uint      `json:"quest_id" gorm:"not null"`
	Quest     Quest     `json:"quest,omitempty" gorm:"foreignKey:QuestID"`
	Status    string    `json:"status" gorm:"size:20;default:'active'"` // active, completed, failed, claimed
	Progress  json.RawMessage `json:"progress" gorm:"type:json"` // 进度 {"checkin_count":5,"target":10}
	StartedAt time.Time `json:"started_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// PlayerWallet 玩家钱包
type PlayerWallet struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UserID     uint      `json:"user_id" gorm:"uniqueIndex;not null"`
	User       User      `json:"-" gorm:"foreignKey:UserID"`
	GoldCoins  int64     `json:"gold_coins" gorm:"default:0"` // 金币
	Gems       int64     `json:"gems" gorm:"default:0"`       // 钻石（付费货币）
	UpdatedAt  time.Time `json:"updated_at"`
}

// PlayerItem 玩家道具
type PlayerItem struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	ItemID    uint      `json:"item_id" gorm:"not null"`
	Quantity  int       `json:"quantity" gorm:"default:1"`
	ExpiresAt time.Time `json:"expires_at"` // 过期时间，永久道具为 null
	CreatedAt time.Time `json:"created_at"`
}

// Item 道具定义
type Item struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"size:100;not null"`
	Description string    `json:"description" gorm:"type:text"`
	IconURL     string    `json:"icon_url" gorm:"size:255"`
	Type        string    `json:"type" gorm:"size:50"` // card, boost, teleport, revive
	Effect      string    `json:"effect" gorm:"type:text"` // 效果描述
	Price       int       `json:"price" gorm:"default:0"` // 金币价格
	GemPrice    int       `json:"gem_price" gorm:"default:0"` // 钻石价格
	Duration    int       `json:"duration" gorm:"default:0"` // 持续时间（分钟），0=永久
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
}

// CheckinStreak 打卡连续记录
type CheckinStreak struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	UserID       uint           `json:"user_id" gorm:"uniqueIndex;not null"`
	User         User           `json:"-" gorm:"foreignKey:UserID"`
	CurrentStreak int           `json:"current_streak" gorm:"default:0"` // 当前连续天数
	LongestStreak int           `json:"longest_streak" gorm:"default:0"` // 最长连续天数
	LastCheckin  *time.Time     `json:"last_checkin"` // 上次打卡时间
	UpdatedAt    time.Time      `json:"updated_at"`
}

// Leaderboard 排行榜缓存
type Leaderboard struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Type      string    `json:"type" gorm:"size:50;not null"` // level, checkins, likes, posts
	Period    string    `json:"period" gorm:"size:20;not null"` // daily, weekly, monthly, alltime
	Data      json.RawMessage `json:"data" gorm:"type:json"` // 排名数据
	UpdatedAt time.Time `json:"updated_at" gorm:"index"`
}
