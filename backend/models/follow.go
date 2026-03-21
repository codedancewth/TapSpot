package models

import (
	"time"
)

// Follow 关注关系
type Follow struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	FollowerID  uint      `json:"follower_id" gorm:"not null;index;uniqueIndex:idx_follow_relationship"` // 关注者
	FollowingID uint      `json:"following_id" gorm:"not null;index;uniqueIndex:idx_follow_relationship"` // 被关注者
	CreatedAt   time.Time `json:"created_at"`
	
	// 关联
	Follower  User `json:"-" gorm:"foreignKey:FollowerID"`
	Following User `json:"-" gorm:"foreignKey:FollowingID"`
}

// FollowStats 关注统计数据
type FollowStats struct {
	FollowersCount int `json:"followers_count"` // 粉丝数
	FollowingCount int `json:"following_count"` // 关注数
}
