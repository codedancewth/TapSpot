package models

import (
	"time"
)

// Team 队伍
type Team struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"size:100;not null"`
	LeaderID    uint      `json:"leader_id" gorm:"not null;index"`
	InviteCode  string    `json:"invite_code" gorm:"size:20;uniqueIndex"`
	MemberCount int       `json:"member_count" gorm:"default:1"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TeamMember 队伍成员
type TeamMember struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	TeamID    uint      `json:"team_id" gorm:"not null;index"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	Nickname  string    `json:"nickname" gorm:"size:50"`
	Avatar    string    `json:"avatar" gorm:"size:500"`
	Level     int       `json:"level" gorm:"default:1"`
	JoinedAt  time.Time `json:"joined_at"`
	IsActive  bool      `json:"is_active" gorm:"default:true"`
}

// Season 赛季
type Season struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	Name       string    `json:"name" gorm:"size:100;not null"`
	Type       string    `json:"type" gorm:"size:20;not null"` // weekly, monthly
	StartDate  time.Time `json:"start_date"`
	EndDate    time.Time `json:"end_date"`
	Status     string    `json:"status" gorm:"size:20;default:'active'"` // active, ended
	RewardsJSON string   `json:"rewards_json" gorm:"type:text"` // 奖励配置
	CreatedAt  time.Time `json:"created_at"`
}

// SeasonScore 赛季积分
type SeasonScore struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	SeasonID  uint      `json:"season_id" gorm:"not null;index"`
	Score     int       `json:"score" gorm:"default:0"`
	Rank      int       `json:"rank" gorm:"default:0"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UserSeason 用户参与的赛季
type UserSeason struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	SeasonID  uint      `json:"season_id" gorm:"not null;index"`
	JoinedAt  time.Time `json:"joined_at"`
}

// DailyReward 每日/每周奖励记录
type DailyReward struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id" gorm:"uniqueIndex;not null"`
	LastDailyAt   *time.Time `json:"last_daily_at"`  // 上次领取每日礼包时间
	DailyStreak   int        `json:"daily_streak" gorm:"default:0"`   // 连续领取天数
	LastWeeklyAt  *time.Time `json:"last_weekly_at"` // 上次领取每周礼包时间
	WeeklyStreak  int        `json:"weekly_streak" gorm:"default:0"`  // 连续领取周数
	UpdatedAt     time.Time `json:"updated_at"`
}

// TeamCheckin 组队打卡记录
type TeamCheckin struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	TeamID    uint      `json:"team_id" gorm:"not null;index"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	CreatedAt time.Time `json:"created_at"`
}
