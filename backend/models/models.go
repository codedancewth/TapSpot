package models

import (
	"time"

	"gorm.io/gorm"
)

var DB *gorm.DB

// User 用户
type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"size:50;uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"size:255;not null"` // 不返回给前端
	Nickname  string         `json:"nickname" gorm:"size:50;not null"`
	Avatar    string         `json:"avatar" gorm:"size:500;default:''"`
	Gender    string         `json:"gender" gorm:"size:20;not null;default:'other'"` // male, female, other
	Bio       string         `json:"bio" gorm:"size:500;default:''"`
	Email     string         `json:"email" gorm:"size:100;uniqueIndex;default:''"`
	Phone     string         `json:"phone" gorm:"size:20;uniqueIndex;default:''"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Posts     []Post         `json:"posts,omitempty" gorm:"foreignKey:UserID"`
}

// Post 用户发布的帖子
type Post struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	UserID       uint           `json:"user_id" gorm:"not null;index"`
	User         User           `json:"-" gorm:"foreignKey:UserID"`
	Title        string         `json:"title" gorm:"size:255;not null"`
	Content      string         `json:"content" gorm:"type:text;not null"`
	Type         string         `json:"type" gorm:"size:20;default:'post'"` // post, food, hotel, shop
	LocationName string         `json:"location_name" gorm:"size:255"`
	Latitude     float64        `json:"latitude" gorm:"not null;index"`
	Longitude    float64        `json:"longitude" gorm:"not null;index"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

// Comment 评论
type Comment struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	PostID      uint           `json:"post_id" gorm:"not null;index"`
	UserID      uint           `json:"user_id" gorm:"not null;index"`
	User        User           `json:"-" gorm:"foreignKey:UserID"`
	Content     string         `json:"content" gorm:"type:text;not null"`
	ReplyToID   *uint          `json:"reply_to_id"`
	ReplyToUser string         `json:"reply_to_user" gorm:"size:50"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// Like 帖子点赞
type Like struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;index;uniqueIndex:idx_user_post"`
	PostID    uint      `json:"post_id" gorm:"not null;index;uniqueIndex:idx_user_post"`
	CreatedAt time.Time `json:"created_at"`
}

// CommentLike 评论点赞
type CommentLike struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;index;uniqueIndex:idx_user_comment"`
	CommentID uint      `json:"comment_id" gorm:"not null;index;uniqueIndex:idx_user_comment"`
	CreatedAt time.Time `json:"created_at"`
}

// Spot 地图上的一个位置点（保留原有）
type Spot struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:255;not null"`
	Description string         `json:"description" gorm:"type:text"`
	Latitude    float64        `json:"latitude" gorm:"not null;index"`
	Longitude   float64        `json:"longitude" gorm:"not null;index"`
	Country     string         `json:"country" gorm:"size:100;index"`
	City        string         `json:"city" gorm:"size:100"`
	Address     string         `json:"address" gorm:"size:500"`
	Category    string         `json:"category" gorm:"size:50"`
	Rating      float64        `json:"rating" gorm:"default:0"`
	ReviewCount int            `json:"review_count" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Reviews     []Review       `json:"reviews,omitempty"`
}

// Review 用户评论（保留原有）
type Review struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	SpotID    uint           `json:"spot_id" gorm:"not null;index"`
	Spot      Spot           `json:"spot,omitempty" gorm:"foreignKey:SpotID"`
	Author    string         `json:"author" gorm:"size:100;not null"`
	Content   string         `json:"content" gorm:"type:text;not null"`
	Rating    int            `json:"rating" gorm:"not null;check:rating >= 1 AND rating <= 5"`
	Images    string         `json:"images" gorm:"type:text"`
	Likes     int            `json:"likes" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// Message 私信消息
type Message struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	SenderID   uint           `json:"sender_id" gorm:"not null;index"`
	Sender     User           `json:"sender,omitempty" gorm:"foreignKey:SenderID"`
	ReceiverID uint           `json:"receiver_id" gorm:"not null;index"`
	Receiver   User           `json:"receiver,omitempty" gorm:"foreignKey:ReceiverID"`
	Content    string         `json:"content" gorm:"type:text;not null"`
	PostID     *uint          `json:"post_id,omitempty"` // 关联的帖子ID（可选）
	IsRead     bool           `json:"is_read" gorm:"default:false"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

// Conversation 会话（用于快速获取用户的会话列表）
type Conversation struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"not null;index:idx_user_peer,unique"`
	PeerID      uint      `json:"peer_id" gorm:"not null;index:idx_user_peer,unique"`
	LastMessage string    `json:"last_message" gorm:"type:text"`
	LastMsgTime time.Time `json:"last_msg_time"`
	UnreadCount int       `json:"unread_count" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
