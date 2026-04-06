package services

import (
	"math"
	"time"
	"tapspot/models"
	
	"gorm.io/gorm"
)

type TaskService struct {
	db *gorm.DB
}

func NewTaskService() *TaskService {
	return &TaskService{db: models.DB}
}

// GetOrCreateUserPoints 获取或创建用户积分记录
func (s *TaskService) GetOrCreateUserPoints(userID uint) (*models.UserPoints, error) {
	var points models.UserPoints
	err := s.db.First(&points, "user_id = ?", userID).Error
	if err == gorm.ErrRecordNotFound {
		// 新用户初始赠送100积分
		points = models.UserPoints{
			UserID:           userID,
			TotalPoints:      100,
			AvailablePoints:   100,
			WeeklyPoints:      0,
			MonthlyPoints:     0,
			TotalTasks:        0,
		}
		err = s.db.Create(&points).Error
	}
	return &points, err
}

// AddPoints 增加用户积分
func (s *TaskService) AddPoints(userID uint, points int, reason string) (*models.UserPoints, error) {
	up, err := s.GetOrCreateUserPoints(userID)
	if err != nil {
		return nil, err
	}
	
	now := time.Now()
	weekStart := getWeekStart(now)
	monthStart := getMonthStart(now)
	
	// 更新积分
	up.TotalPoints += points
	up.AvailablePoints += points
	up.TotalTasks++
	
	// 检查是否需要重置周积分/月积分
	if up.UpdatedAt.Before(weekStart) {
		up.WeeklyPoints = points
	} else {
		up.WeeklyPoints += points
	}
	
	if up.UpdatedAt.Before(monthStart) {
		up.MonthlyPoints = points
	} else {
		up.MonthlyPoints += points
	}
	
	up.UpdatedAt = now
	err = s.db.Save(up).Error
	
	// 更新用户等级
	s.UpdateUserLevel(userID, up.TotalPoints)
	
	return up, err
}

// ConsumePoints 消耗用户积分
func (s *TaskService) ConsumePoints(userID uint, points int, reason string) error {
	up, err := s.GetOrCreateUserPoints(userID)
	if err != nil {
		return err
	}
	
	if up.AvailablePoints < points {
		return gorm.ErrRecordNotFound // 用这个表示积分不足
	}
	
	up.AvailablePoints -= points
	up.UpdatedAt = time.Now()
	
	return s.db.Save(up).Error
}

// UpdateUserLevel 根据总积分更新用户等级
func (s *TaskService) UpdateUserLevel(userID uint, totalPoints int) error {
	var level models.UserLevel
	err := s.db.First(&level, "user_id = ?", userID).Error
	if err == gorm.ErrRecordNotFound {
		level = models.UserLevel{UserID: userID, Level: 1, Title: "探索者"}
		err = s.db.Create(&level).Error
	}
	
	if err != nil {
		return err
	}
	
	// 根据总积分计算等级
	newLevel := 1
	newTitle := "探索者"
	for _, cfg := range models.LevelConfig {
		if totalPoints >= cfg.MinPoints {
			newLevel = cfg.Level
			newTitle = cfg.Title
		}
	}
	
	if newLevel != level.Level {
		level.Level = newLevel
		level.Title = newTitle
		return s.db.Save(&level).Error
	}
	
	return nil
}

// GetUserLevel 获取用户等级
func (s *TaskService) GetUserLevel(userID uint) (*models.UserLevel, error) {
	var level models.UserLevel
	err := s.db.First(&level, "user_id = ?", userID).Error
	if err == gorm.ErrRecordNotFound {
		level = models.UserLevel{UserID: userID, Level: 1, Title: "探索者"}
		err = s.db.Create(&level).Error
	}
	return &level, err
}

// GetDailyTaskRecord 获取或创建每日任务记录
func (s *TaskService) GetDailyTaskRecord(userID uint, date time.Time) (*models.DailyTaskRecord, error) {
	dayStart := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	
	var record models.DailyTaskRecord
	err := s.db.First(&record, "user_id = ? AND task_date = ?", userID, dayStart).Error
	if err == gorm.ErrRecordNotFound {
		record = models.DailyTaskRecord{
			UserID:         userID,
			TaskDate:       dayStart,
			TasksCompleted: 0,
			PointsEarned:   0,
		}
		err = s.db.Create(&record).Error
	}
	return &record, err
}

// IncrementDailyTask 增加每日完成任务数
func (s *TaskService) IncrementDailyTask(userID uint, points int) error {
	record, err := s.GetDailyTaskRecord(userID, time.Now())
	if err != nil {
		return err
	}
	
	record.TasksCompleted++
	record.PointsEarned += points
	
	return s.db.Save(record).Error
}

// CompleteTask 完成任务的核心逻辑
func (s *TaskService) CompleteTask(taskID uint, userID uint, completion *models.TaskCompletion) error {
	var task models.Task
	if err := s.db.First(&task, taskID).Error; err != nil {
		return err
	}
	
	// 检查任务状态
	if task.Status != models.TaskStatusActive {
		return gorm.ErrRecordNotFound
	}
	
	// 检查时间范围
	now := time.Now()
	if task.StartDate != nil && now.Before(*task.StartDate) {
		return gorm.ErrRecordNotFound
	}
	if task.EndDate != nil && now.After(*task.EndDate) {
		return gorm.ErrRecordNotFound
	}
	
	// 检查参与人数限制
	if task.MaxParticipants > 0 {
		var count int64
		s.db.Model(&models.TaskCompletion{}).Where("task_id = ?", taskID).Count(&count)
		if int(count) >= task.MaxParticipants {
			return gorm.ErrRecordNotFound
		}
	}
	
	// 检查是否已完成（每个用户只能完成一次）
	var existing models.TaskCompletion
	err := s.db.First(&existing, "task_id = ? AND user_id = ?", taskID, userID).Error
	if err == nil {
		return gorm.ErrRecordNotFound // 已完成
	}
	
	// 如果是问答任务，验证答案
	if task.Type == models.TaskTypeQA && completion.Answer != "" {
		// 简单匹配（后续可以改进为模糊匹配）
		if completion.Answer != task.Answer {
			return gorm.ErrRecordNotFound
		}
	}
	
	// 计算实际发放积分
	earnedPoints := task.Points
	if task.BonusPoints > 0 {
		earnedPoints += task.BonusPoints
	}
	
	// 更新任务参与人数
	task.ParticipantCount++
	s.db.Save(&task)
	
	// 创建完成记录
	completion.TaskID = taskID
	completion.UserID = userID
	completion.CompletedAt = now
	completion.PointsEarned = earnedPoints
	if err := s.db.Create(completion).Error; err != nil {
		return err
	}
	
	// 增加用户积分
	if _, err := s.AddPoints(userID, earnedPoints, "完成任务"); err != nil {
		return err
	}
	
	// 更新每日记录
	if err := s.IncrementDailyTask(userID, earnedPoints); err != nil {
		// 不阻塞主要流程
	}
	
	return nil
}

// GetNearbyTasks 获取附近的任务
func (s *TaskService) GetNearbyTasks(lat, lng float64, radiusKm float64, limit int) ([]models.Task, error) {
	var tasks []models.Task
	
	// Haversine 公式计算距离
	// 简化：先取矩形范围，再过滤
	latDelta := radiusKm / 111.0 // 约111km per degree
	lngDelta := radiusKm / (111.0 * math.Cos(lat*math.Pi/180))
	
	minLat := lat - latDelta
	maxLat := lat + latDelta
	minLng := lng - lngDelta
	maxLng := lng + lngDelta
	
	now := time.Now()
	err := s.db.Where("latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ? AND status = ? AND (start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?)",
		minLat, maxLat, minLng, maxLng, models.TaskStatusActive, now, now).
		Order("created_at DESC").
		Limit(limit).
		Find(&tasks).Error
	
	return tasks, err
}

// CalculateDistance 计算两点之间的距离（米）
func CalculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const EarthRadius = 6371000 // 米
	
	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	deltaLat := (lat2 - lat1) * math.Pi / 180
	deltaLng := (lng2 - lng1) * math.Pi / 180
	
	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLng/2)*math.Sin(deltaLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	
	return EarthRadius * c
}

// ValidateCheckIn 验证签到是否在有效范围内
func (s *TaskService) ValidateCheckIn(taskID uint, userLat, userLng float64) (bool, float64, error) {
	var task models.Task
	if err := s.db.First(&task, taskID).Error; err != nil {
		return false, 0, err
	}
	
	distance := CalculateDistance(task.Latitude, task.Longitude, userLat, userLng)
	valid := distance <= float64(task.Radius)
	
	return valid, distance, nil
}

// GetRankings 获取排名
func (s *TaskService) GetRankings(rankingType string, period string, limit int) ([]map[string]interface{}, error) {
	type rankingData struct {
		UserID   uint
		Username string
		Avatar   string
		Points   int
		Nickname string
	}
	
	var results []rankingData
	
	switch rankingType {
	case "total":
		rows, err := s.db.Table("user_points").
			Select("user_points.user_id, users.username, users.avatar, users.nickname, user_points.total_points as points").
			Joins("LEFT JOIN users ON users.id = user_points.user_id").
			Order("user_points.total_points DESC").
			Limit(limit).
			Rows()
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		
		for rows.Next() {
			var r rankingData
			rows.Scan(&r.UserID, &r.Username, &r.Avatar, &r.Nickname, &r.Points)
			results = append(results, r)
		}
		
	case "weekly":
		rows, err := s.db.Table("user_points").
			Select("user_points.user_id, users.username, users.avatar, users.nickname, user_points.weekly_points as points").
			Joins("LEFT JOIN users ON users.id = user_points.user_id").
			Order("user_points.weekly_points DESC").
			Limit(limit).
			Rows()
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		
		for rows.Next() {
			var r rankingData
			rows.Scan(&r.UserID, &r.Username, &r.Avatar, &r.Nickname, &r.Points)
			results = append(results, r)
		}
		
	case "monthly":
		rows, err := s.db.Table("user_points").
			Select("user_points.user_id, users.username, users.avatar, users.nickname, user_points.monthly_points as points").
			Joins("LEFT JOIN users ON users.id = user_points.user_id").
			Order("user_points.monthly_points DESC").
			Limit(limit).
			Rows()
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		
		for rows.Next() {
			var r rankingData
			rows.Scan(&r.UserID, &r.Username, &r.Avatar, &r.Nickname, &r.Points)
			results = append(results, r)
		}
		
	case "hot":
		// 按任务完成数量排名
		rows, err := s.db.Table("user_points").
			Select("user_points.user_id, users.username, users.avatar, users.nickname, user_points.total_tasks as points").
			Joins("LEFT JOIN users ON users.id = user_points.user_id").
			Order("user_points.total_tasks DESC").
			Limit(limit).
			Rows()
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		
		for rows.Next() {
			var r rankingData
			rows.Scan(&r.UserID, &r.Username, &r.Avatar, &r.Nickname, &r.Points)
			results = append(results, r)
		}
	}
	
	// 转换为 map
	entries := make([]map[string]interface{}, 0)
	for i, r := range results {
		entries = append(entries, map[string]interface{}{
			"rank":      i + 1,
			"user_id":   r.UserID,
			"username":  r.Username,
			"nickname":  r.Nickname,
			"avatar":    r.Avatar,
			"points":    r.Points,
			"type":      rankingType,
		})
	}
	
	return entries, nil
}

// GetUserRank 获取用户排名
func (s *TaskService) GetUserRank(userID uint) (map[string]interface{}, error) {
	points, err := s.GetOrCreateUserPoints(userID)
	if err != nil {
		return nil, err
	}
	
	level, _ := s.GetUserLevel(userID)
	
	// 计算各维度排名
	totalRank := s.getRankPosition("total_points", points.TotalPoints)
	weeklyRank := s.getRankPosition("weekly_points", points.WeeklyPoints)
	monthlyRank := s.getRankPosition("monthly_points", points.MonthlyPoints)
	hotRank := s.getRankPosition("total_tasks", points.TotalTasks)
	
	return map[string]interface{}{
		"user_id":       userID,
		"total_points":  points.TotalPoints,
		"weekly_points": points.WeeklyPoints,
		"monthly_points": points.MonthlyPoints,
		"total_tasks":   points.TotalTasks,
		"level":         level.Level,
		"title":         level.Title,
		"total_rank":    totalRank,
		"weekly_rank":   weeklyRank,
		"monthly_rank": monthlyRank,
		"hot_rank":      hotRank,
	}, nil
}

// getRankPosition 获取排名位置
func (s *TaskService) getRankPosition(field string, value int) int {
	var count int64
	s.db.Model(&models.UserPoints{}).Where(field+" > ?", value).Count(&count)
	return int(count) + 1
}

// ResetWeeklyPoints 重置周积分（定时任务）
func (s *TaskService) ResetWeeklyPoints() error {
	return s.db.Model(&models.UserPoints{}).Updates(map[string]interface{}{
		"weekly_points": 0,
	}).Error
}

// ResetMonthlyPoints 重置月积分（定时任务）
func (s *TaskService) ResetMonthlyPoints() error {
	return s.db.Model(&models.UserPoints{}).Updates(map[string]interface{}{
		"monthly_points": 0,
	}).Error
}

// helper functions

func getWeekStart(t time.Time) time.Time {
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	return time.Date(t.Year(), t.Month(), t.Day()-weekday+1, 0, 0, 0, 0, t.Location())
}

func getMonthStart(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, t.Location())
}

// GetTaskStats 获取任务统计
func (s *TaskService) GetTaskStats() (map[string]interface{}, error) {
	var totalTasks int64
	var activeTasks int64
	var totalCompletions int64
	var totalPoints int64
	
	s.db.Model(&models.Task{}).Count(&totalTasks)
	s.db.Model(&models.Task{}).Where("status = ?", models.TaskStatusActive).Count(&activeTasks)
	s.db.Model(&models.TaskCompletion{}).Count(&totalCompletions)
	s.db.Model(&models.UserPoints{}).Select("COALESCE(SUM(total_points), 0)").Scan(&totalPoints)
	
	return map[string]interface{}{
		"total_tasks":       totalTasks,
		"active_tasks":      activeTasks,
		"total_completions": totalCompletions,
		"total_points":      totalPoints,
	}, nil
}

// AutoExpireTasks 自动过期任务
func (s *TaskService) AutoExpireTasks() error {
	now := time.Now()
	return s.db.Model(&models.Task{}).
		Where("status = ? AND end_date < ?", models.TaskStatusActive, now).
		Update("status", models.TaskStatusEnded).Error
}

// GenerateDailyTasks 生成每日任务
func (s *TaskService) GenerateDailyTasks() error {
	// 查找需要生成每日任务的系统任务
	var systemTasks []models.Task
	err := s.db.Where("publisher_type = ? AND daily_limit = ? AND status = ?", 
		models.PublisherTypeSystem, true, models.TaskStatusActive).Find(&systemTasks).Error
	if err != nil {
		return err
	}
	
	// 每日任务特殊处理：复制一份带今日日期的记录
	// 这里简化处理，实际上可以创建 task_daily 关联表
	_ = systemTasks
	
	return nil
}
