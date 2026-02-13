package models

import (
	"time"

	"gorm.io/gorm"
)

// Spot 地图上的一个位置点
type Spot struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:255;not null"`
	Description string         `json:"description" gorm:"type:text"`
	Latitude    float64        `json:"latitude" gorm:"not null;index"`
	Longitude   float64        `json:"longitude" gorm:"not null;index"`
	Country     string         `json:"country" gorm:"size:100;index"`
	City        string         `json:"city" gorm:"size:100"`
	Address     string         `json:"address" gorm:"size:500"`
	Category    string         `json:"category" gorm:"size:50"` // restaurant, hotel, attraction, etc.
	Rating      float64        `json:"rating" gorm:"default:0"`
	ReviewCount int            `json:"review_count" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Reviews     []Review       `json:"reviews,omitempty"`
}

// Review 用户评论
type Review struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	SpotID    uint           `json:"spot_id" gorm:"not null;index"`
	Spot      Spot           `json:"spot,omitempty" gorm:"foreignKey:SpotID"`
	Author    string         `json:"author" gorm:"size:100;not null"`
	Content   string         `json:"content" gorm:"type:text;not null"`
	Rating    int            `json:"rating" gorm:"not null;check:rating >= 1 AND rating <= 5"`
	Images    string         `json:"images" gorm:"type:text"` // JSON array of image URLs
	Likes     int            `json:"likes" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}
