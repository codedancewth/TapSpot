package services

import (
	"tapspot/models"
)

// FollowService 关注服务
type FollowService struct{}

func NewFollowService() *FollowService {
	return &FollowService{}
}

// Follow 关注用户
func (s *FollowService) Follow(followerID, followingID uint) error {
	// 不能关注自己
	if followerID == followingID {
		return nil
	}

	// 检查是否已经关注
	var existing models.Follow
	result := models.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&existing)
	if result.Error == nil {
		// 已经关注了
		return nil
	}

	follow := models.Follow{
		FollowerID:  followerID,
		FollowingID: followingID,
	}

	return models.DB.Create(&follow).Error
}

// Unfollow 取消关注
func (s *FollowService) Unfollow(followerID, followingID uint) error {
	return models.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).Delete(&models.Follow{}).Error
}

// IsFollowing 检查是否关注
func (s *FollowService) IsFollowing(followerID, followingID uint) bool {
	var existing models.Follow
	result := models.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&existing)
	return result.Error == nil
}

// GetFollowers 获取用户的粉丝列表
func (s *FollowService) GetFollowers(userID uint, page, pageSize int) ([]models.User, int64, error) {
	var follows []models.Follow
	var total int64

	// 获取总数
	models.DB.Model(&models.Follow{}).Where("following_id = ?", userID).Count(&total)

	// 分页查询
	offset := (page - 1) * pageSize
	if err := models.DB.Preload("Follower").
		Where("following_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&follows).Error; err != nil {
		return nil, 0, err
	}

	// 提取用户
	users := make([]models.User, 0, len(follows))
	for _, f := range follows {
		users = append(users, f.Follower)
	}

	return users, total, nil
}

// GetFollowing 获取用户关注的列表
func (s *FollowService) GetFollowing(userID uint, page, pageSize int) ([]models.User, int64, error) {
	var follows []models.Follow
	var total int64

	// 获取总数
	models.DB.Model(&models.Follow{}).Where("follower_id = ?", userID).Count(&total)

	// 分页查询
	offset := (page - 1) * pageSize
	if err := models.DB.Preload("Following").
		Where("follower_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&follows).Error; err != nil {
		return nil, 0, err
	}

	// 提取用户
	users := make([]models.User, 0, len(follows))
	for _, f := range follows {
		users = append(users, f.Following)
	}

	return users, total, nil
}

// GetStats 获取关注统计数据
func (s *FollowService) GetStats(userID uint) (*models.FollowStats, error) {
	var followersCount int64
	var followingCount int64

	models.DB.Model(&models.Follow{}).Where("following_id = ?", userID).Count(&followersCount)
	models.DB.Model(&models.Follow{}).Where("follower_id = ?", userID).Count(&followingCount)

	return &models.FollowStats{
		FollowersCount: int(followersCount),
		FollowingCount: int(followingCount),
	}, nil
}

// GetFollowingIDs 获取用户关注的所有用户ID
func (s *FollowService) GetFollowingIDs(userID uint) ([]uint, error) {
	var follows []models.Follow
	if err := models.DB.Where("follower_id = ?", userID).Find(&follows).Error; err != nil {
		return nil, err
	}

	ids := make([]uint, 0, len(follows))
	for _, f := range follows {
		ids = append(ids, f.FollowingID)
	}

	return ids, nil
}
