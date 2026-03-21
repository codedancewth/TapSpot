package services

import (
	"encoding/json"
	"tapspot/models"
	"time"
)

// NotificationService 通知服务
type NotificationService struct{}

func NewNotificationService() *NotificationService {
	return &NotificationService{}
}

// CreateNotification 创建通知
func (s *NotificationService) CreateNotification(userID uint, notifType string, data interface{}) error {
	dataJSON, err := json.Marshal(data)
	if err != nil {
		return err
	}

	notification := models.Notification{
		UserID:    userID,
		Type:      notifType,
		Data:      dataJSON,
		Read:      false,
		CreatedAt: time.Now(),
	}

	return models.DB.Create(&notification).Error
}

// CreateLikeNotification 创建点赞通知
func (s *NotificationService) CreateLikeNotification(postOwnerID, likerID uint, postID uint, postTitle string) error {
	if postOwnerID == likerID {
		return nil // 不能给自己点赞通知
	}

	var liker models.User
	if err := models.DB.First(&liker, likerID).Error; err != nil {
		return err
	}

	data := models.NotificationData{
		ActorID:     likerID,
		ActorName:   liker.Nickname,
		ActorAvatar: liker.Avatar,
		PostID:      postID,
		PostTitle:   postTitle,
	}

	return s.CreateNotification(postOwnerID, "like", data)
}

// CreateCommentNotification 创建评论通知
func (s *NotificationService) CreateCommentNotification(postOwnerID, commenterID uint, postID uint, postTitle string, commentID uint, commentText string) error {
	if postOwnerID == commenterID {
		return nil // 不能给自己评论通知
	}

	var commenter models.User
	if err := models.DB.First(&commenter, commenterID).Error; err != nil {
		return err
	}

	data := models.NotificationData{
		ActorID:     commenterID,
		ActorName:   commenter.Nickname,
		ActorAvatar: commenter.Avatar,
		PostID:      postID,
		PostTitle:   postTitle,
		CommentID:   commentID,
		CommentText: commentText,
	}

	return s.CreateNotification(postOwnerID, "comment", data)
}

// CreateFollowNotification 创建关注通知
func (s *NotificationService) CreateFollowNotification(userID, followerID uint) error {
	if userID == followerID {
		return nil // 不能给自己关注通知
	}

	var follower models.User
	if err := models.DB.First(&follower, followerID).Error; err != nil {
		return err
	}

	data := models.NotificationData{
		ActorID:      followerID,
		ActorName:    follower.Nickname,
		ActorAvatar:  follower.Avatar,
		FollowerID:   followerID,
		FollowerName: follower.Nickname,
	}

	return s.CreateNotification(userID, "follow", data)
}

// CreateAchievementNotification 创建成就通知
func (s *NotificationService) CreateAchievementNotification(userID uint, achievementID uint, achievementName string) error {
	data := models.NotificationData{
		AchievementID:   achievementID,
		AchievementName: achievementName,
	}

	return s.CreateNotification(userID, "achievement", data)
}

// CreateQuestCompleteNotification 创建任务完成通知
func (s *NotificationService) CreateQuestCompleteNotification(userID uint, questID uint, questName string) error {
	data := models.NotificationData{
		QuestID:   questID,
		QuestName: questName,
	}

	return s.CreateNotification(userID, "quest_complete", data)
}

// GetNotifications 获取用户通知列表
func (s *NotificationService) GetNotifications(userID uint, page, pageSize int) ([]models.Notification, int64, error) {
	var notifications []models.Notification
	var total int64

	// 获取总数
	models.DB.Model(&models.Notification{}).Where("user_id = ?", userID).Count(&total)

	// 分页查询
	offset := (page - 1) * pageSize
	if err := models.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&notifications).Error; err != nil {
		return nil, 0, err
	}

	return notifications, total, nil
}

// GetUnreadCount 获取未读通知数量
func (s *NotificationService) GetUnreadCount(userID uint) (int64, error) {
	var count int64
	err := models.DB.Model(&models.Notification{}).Where("user_id = ? AND read = ?", userID, false).Count(&count).Error
	return count, err
}

// MarkAsRead 标记通知为已读
func (s *NotificationService) MarkAsRead(notificationID, userID uint) error {
	return models.DB.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Update("read", true).Error
}

// MarkAllAsRead 标记所有通知为已读
func (s *NotificationService) MarkAllAsRead(userID uint) error {
	return models.DB.Model(&models.Notification{}).
		Where("user_id = ? AND read = ?", userID, false).
		Update("read", true).Error
}

// ParseNotificationData 解析通知数据
func (s *NotificationService) ParseNotificationData(notification models.Notification) (*models.NotificationData, error) {
	var data models.NotificationData
	if err := json.Unmarshal(notification.Data, &data); err != nil {
		return nil, err
	}
	return &data, nil
}
