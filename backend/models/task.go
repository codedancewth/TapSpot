package models

import (
	"time"
)

// TaskType 任务类型
const (
	TaskTypeCheckin    = 1 // 签到任务
	TaskTypePhoto      = 2 // 拍照任务
	TaskTypeQA         = 3 // 问答任务
	TaskTypeExplore    = 4 // 探索任务
	TaskTypeChallenge  = 5 // 挑战任务
)

// TaskStatus 任务状态
const (
	TaskStatusDraft     = 0 // 草稿
	TaskStatusActive    = 1 // 进行中
	TaskStatusEnded     = 2 // 已结束
	TaskStatusCancelled = 3 // 已取消
)

// PublisherType 发布者类型
const (
	PublisherTypeSystem = 1 // 系统
	PublisherTypeUser   = 2 // 用户
)

// Task 任务
type Task struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	Title           string    `json:"title" gorm:"size:255;not null"`
	Description     string    `json:"description" gorm:"type:text"`
	Type            int       `json:"type" gorm:"not null"` // 1签到 2拍照 3问答 4探索 5挑战
	
	// 位置信息
	Latitude        float64   `json:"latitude" gorm:"not null;index"`
	Longitude       float64   `json:"longitude" gorm:"not null;index"`
	LocationName    string    `json:"location_name" gorm:"size:255"`
	Radius          int       `json:"radius" gorm:"default:100"` // 有效范围（米）
	
	// 积分与奖励
	Points          int       `json:"points" gorm:"not null;default:0"`
	BonusPoints     int       `json:"bonus_points" gorm:"default:0"`
	
	// 问答任务的题目（JSON格式）
	Question        string    `json:"question" gorm:"type:text"` // 问答任务的问题
	Answer          string    `json:"answer" gorm:"size:255"`   // 问答任务的答案
	
	// 限制条件
	MaxParticipants int       `json:"max_participants" gorm:"default:0"` // 0=无限制
	StartDate       *time.Time `json:"start_date"`
	EndDate         *time.Time `json:"end_date" gorm:"index"`
	DailyLimit      bool       `json:"daily_limit" gorm:"default:true"` // 是否每日限制
	
	// 发布者信息
	PublisherType   int       `json:"publisher_type" gorm:"default:1"` // 1=系统 2=用户
	PublisherID     uint      `json:"publisher_id" gorm:"index"`
	Publisher       User      `json:"publisher,omitempty" gorm:"foreignKey:PublisherID"`
	
	// 统计
	ParticipantCount int      `json:"participant_count" gorm:"default:0"`
	
	// 状态
	Status          int       `json:"status" gorm:"default:0;index"` // 0草稿 1进行中 2结束 3取消
	
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// TaskCompletion 任务完成记录
type TaskCompletion struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	TaskID        uint      `json:"task_id" gorm:"not null;index"`
	Task          Task      `json:"task,omitempty" gorm:"foreignKey:TaskID"`
	UserID        uint      `json:"user_id" gorm:"not null;index"`
	User          User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	
	// 完成情况
	CompletedAt    time.Time `json:"completed_at"`
	PointsEarned   int       `json:"points_earned" gorm:"not null"`
	ProofPhotoURL  string    `json:"proof_photo_url" gorm:"size:512"` // 证明照片
	Answer         string    `json:"answer" gorm:"size:255"`          // 问答答案
	
	// 位置验证
	ActualLat      float64   `json:"actual_lat" gorm:"decimal(10,8)"`
	ActualLng      float64   `json:"actual_lng" gorm:"decimal(11,8)"`
	Distance       float64   `json:"distance" gorm:"type:float"` // 与任务点的距离（米）
	
	CreatedAt      time.Time `json:"created_at"`
}

// UserPoints 用户积分
type UserPoints struct {
	UserID         uint      `json:"user_id" gorm:"primaryKey"`
	User           User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	TotalPoints    int       `json:"total_points" gorm:"default:0"`    // 历史总积分
	AvailablePoints int      `json:"available_points" gorm:"default:0"` // 可用积分
	WeeklyPoints   int       `json:"weekly_points" gorm:"default:0"`   // 本周积分
	MonthlyPoints  int       `json:"monthly_points" gorm:"default:0"` // 本月积分
	TotalTasks     int       `json:"total_tasks" gorm:"default:0"`    // 完成任务数
	UpdatedAt      time.Time `json:"updated_at"`
}

// DailyTaskRecord 每日任务记录
type DailyTaskRecord struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	UserID         uint      `json:"user_id" gorm:"not null;index"`
	TaskDate       time.Time `json:"task_date" gorm:"not null;index"` // 日期（只到日期）
	TasksCompleted int       `json:"tasks_completed" gorm:"default:0"`
	PointsEarned   int       `json:"points_earned" gorm:"default:0"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// UserLevel 用户等级
type UserLevel struct {
	UserID   uint   `json:"user_id" gorm:"primaryKey"`
	User     User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Level    int    `json:"level" gorm:"default:1"`
	Title    string `json:"title" gorm:"size:50;default:'探索者'"`
}

// LevelConfig 等级配置
var LevelConfig = []struct {
	Level     int
	Title     string
	MinPoints int
}{
	{1, "探索者", 0},
	{2, "冒险家", 500},
	{3, "旅行家", 2000},
	{4, "探险家", 5000},
	{5, "大师", 10000},
	{6, "传奇", 50000},
}

// TaskIcon 获取任务类型图标
func TaskIcon(taskType int) string {
	icons := map[int]string{
		TaskTypeCheckin:   "📍",
		TaskTypePhoto:     "📸",
		TaskTypeQA:        "❓",
		TaskTypeExplore:   "🗺️",
		TaskTypeChallenge: "🔥",
	}
	if icon, ok := icons[taskType]; ok {
		return icon
	}
	return "📍"
}

// TaskTypeName 获取任务类型名称
func TaskTypeName(taskType int) string {
	names := map[int]string{
		TaskTypeCheckin:   "签到任务",
		TaskTypePhoto:     "拍照任务",
		TaskTypeQA:        "问答任务",
		TaskTypeExplore:   "探索任务",
		TaskTypeChallenge: "挑战任务",
	}
	if name, ok := names[taskType]; ok {
		return name
	}
	return "未知"
}
