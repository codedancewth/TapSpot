package models

import (
	"encoding/json"
	"time"
)

// Notification 通知
type Notification struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"` // 通知接收者
	Type      string         `json:"type" gorm:"size:50;not null;index"` // like, comment, follow, achievement, quest_complete
	Data      json.RawMessage `json:"data" gorm:"type:text"` // 通知数据 JSON
	Read      bool           `json:"read" gorm:"default:false;index"`
	CreatedAt time.Time      `json:"created_at" gorm:"index"`
	UpdatedAt time.Time      `json:"updated_at"`
}

// NotificationData 通知数据结构
type NotificationData struct {
	// 通用字段
	ActorID      uint   `json:"actor_id,omitempty"`      // 触发通知的用户ID
	ActorName    string `json:"actor_name,omitempty"`    // 触发通知的用户名
	ActorAvatar  string `json:"actor_avatar,omitempty"` // 触发通知的用户头像
	
	// like 通知
	PostID   uint   `json:"post_id,omitempty"`
	PostTitle string `json:"post_title,omitempty"`
	
	// comment 通知
	CommentID   uint   `json:"comment_id,omitempty"`
	CommentText string `json:"comment_text,omitempty"`
	
	// follow 通知
	FollowerID   uint   `json:"follower_id,omitempty"`
	FollowerName string `json:"follower_name,omitempty"`
	
	// achievement 通知
	AchievementID   uint   `json:"achievement_id,omitempty"`
	AchievementName string `json:"achievement_name,omitempty"`
	
	// quest_complete 通知
	QuestID   uint   `json:"quest_id,omitempty"`
	QuestName string `json:"quest_name,omitempty"`
}
