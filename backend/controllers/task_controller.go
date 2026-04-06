package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"
	"tapspot/models"
	"tapspot/services"
	
	"github.com/gin-gonic/gin"
)

type TaskController struct {
	taskService *services.TaskService
}

func NewTaskController() *TaskController {
	return &TaskController{
		taskService: services.NewTaskService(),
	}
}

// GetTasks 获取任务列表
func (tc *TaskController) GetTasks(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")
	taskType := c.Query("type")      // 1-5
	status := c.DefaultQuery("status", "1") // 默认只查进行中的
	
	page, _ := strconv.Atoi(pageStr)
	pageSize, _ := strconv.Atoi(pageSizeStr)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	
	offset := (page - 1) * pageSize
	
	query := models.DB.Model(&models.Task{}).Where("status = ?", status)
	
	if taskType != "" {
		query = query.Where("type = ?", taskType)
	}
	
	var tasks []models.Task
	var total int64
	
	query.Count(&total)
	err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&tasks).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"tasks": tasks,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

// GetTask 获取任务详情
func (tc *TaskController) GetTask(c *gin.Context) {
	taskIDStr := c.Param("id")
	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的任务ID"})
		return
	}
	
	var task models.Task
	err = models.DB.Preload("Publisher").First(&task, taskID).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"task": task,
	})
}

// GetNearbyTasks 获取附近任务
func (tc *TaskController) GetNearbyTasks(c *gin.Context) {
	latStr := c.Query("lat")
	lngStr := c.Query("lng")
	radiusStr := c.DefaultQuery("radius", "5") // 默认5公里
	limitStr := c.DefaultQuery("limit", "20")
	
	if latStr == "" || lngStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少位置参数"})
		return
	}
	
	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的纬度"})
		return
	}
	
	lng, err := strconv.ParseFloat(lngStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的经度"})
		return
	}
	
	radius, _ := strconv.ParseFloat(radiusStr, 64)
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	
	tasks, err := tc.taskService.GetNearbyTasks(lat, lng, radius, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// 计算每个任务与用户的距离
	userLat := lat
	userLng := lng
	result := make([]map[string]interface{}, 0)
	for _, task := range tasks {
		distance := services.CalculateDistance(userLat, userLng, task.Latitude, task.Longitude)
		taskMap := map[string]interface{}{
			"id":               task.ID,
			"title":            task.Title,
			"description":      task.Description,
			"type":             task.Type,
			"type_name":        models.TaskTypeName(task.Type),
			"type_icon":        models.TaskIcon(task.Type),
			"latitude":         task.Latitude,
			"longitude":        task.Longitude,
			"location_name":    task.LocationName,
			"radius":           task.Radius,
			"points":           task.Points,
			"bonus_points":     task.BonusPoints,
			"distance":         distance,
			"distance_text":    formatDistance(distance),
			"max_participants": task.MaxParticipants,
			"participant_count": task.ParticipantCount,
			"publisher_type":   task.PublisherType,
			"status":           task.Status,
		}
		result = append(result, taskMap)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"tasks": result,
		"count": len(result),
	})
}

// CompleteTask 完成任务
func (tc *TaskController) CompleteTask(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	taskIDStr := c.Param("id")
	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的任务ID"})
		return
	}
	
	var req struct {
		ActualLat  float64 `json:"actual_lat"`
		ActualLng  float64 `json:"actual_lng"`
		ProofPhoto string  `json:"proof_photo"` // 照片URL
		Answer     string  `json:"answer"`      // 问答答案
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}
	
	// 获取任务信息
	var task models.Task
	if err := models.DB.First(&task, taskID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}
	
	// 签到类任务需要位置校验
	if task.Type == models.TaskTypeCheckin || task.Type == models.TaskTypeExplore || task.Type == models.TaskTypeChallenge {
		if req.ActualLat == 0 || req.ActualLng == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "签到任务需要提供位置"})
			return
		}
		
		valid, distance, err := tc.taskService.ValidateCheckIn(uint(taskID), req.ActualLat, req.ActualLng)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		if !valid {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":     "不在签到范围内",
				"distance":  distance,
				"required":  task.Radius,
				"distance_text": formatDistance(distance),
			})
			return
		}
	}
	
	// 拍照任务需要照片
	if task.Type == models.TaskTypePhoto && req.ProofPhoto == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "拍照任务需要上传照片"})
		return
	}
	
	// 问答任务需要答案
	if task.Type == models.TaskTypeQA && req.Answer == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "问答任务需要填写答案"})
		return
	}
	
	// 创建完成记录
	completion := &models.TaskCompletion{
		ActualLat:     req.ActualLat,
		ActualLng:     req.ActualLng,
		ProofPhotoURL: req.ProofPhoto,
		Answer:        req.Answer,
	}
	
	err = tc.taskService.CompleteTask(uint(taskID), userID.(uint), completion)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("完成任务失败: %v", err)})
		return
	}
	
	// 获取更新后的用户积分
	points, _ := tc.taskService.GetOrCreateUserPoints(userID.(uint))
	level, _ := tc.taskService.GetUserLevel(userID.(uint))
	
	c.JSON(http.StatusOK, gin.H{
		"message":       "任务完成",
		"points_earned": completion.PointsEarned,
		"total_points": points.TotalPoints,
		"level":         level.Level,
		"title":         level.Title,
	})
}

// CreateTask 创建任务（需要管理员权限或特定等级）
func (tc *TaskController) CreateTask(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	var req struct {
		Title           string     `json:"title" binding:"required"`
		Description     string     `json:"description"`
		Type            int        `json:"type" binding:"required"` // 1-5
		Latitude        float64    `json:"latitude" binding:"required"`
		Longitude       float64    `json:"longitude" binding:"required"`
		LocationName    string     `json:"location_name"`
		Radius          int        `json:"radius"` // 默认100
		Points          int        `json:"points" binding:"required"`
		BonusPoints     int        `json:"bonus_points"`
		Question        string     `json:"question"` // 问答任务问题
		Answer          string     `json:"answer"`   // 问答任务答案
		MaxParticipants int        `json:"max_participants"`
		StartDate       *time.Time `json:"start_date"`
		EndDate         *time.Time `json:"end_date"`
		DailyLimit      bool       `json:"daily_limit"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// 检查用户等级
	level, _ := tc.taskService.GetUserLevel(userID.(uint))
	
	// 根据任务类型检查权限
	if req.Type == models.TaskTypeCheckin && level.Level < 2 {
		c.JSON(http.StatusForbidden, gin.H{"error": "等级不足，需要冒险家以上才能发布签到任务"})
		return
	}
	
	// 检查积分余额
	points, _ := tc.taskService.GetOrCreateUserPoints(userID.(uint))
	publishCost := getPublishCost(req.Type)
	if points.AvailablePoints < publishCost {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("积分不足，发布此类型任务需要%d积分", publishCost)})
		return
	}
	
	task := models.Task{
		Title:           req.Title,
		Description:     req.Description,
		Type:            req.Type,
		Latitude:        req.Latitude,
		Longitude:       req.Longitude,
		LocationName:    req.LocationName,
		Radius:          req.Radius,
		Points:          req.Points,
		BonusPoints:     req.BonusPoints,
		Question:        req.Question,
		Answer:          req.Answer,
		MaxParticipants: req.MaxParticipants,
		StartDate:       req.StartDate,
		EndDate:         req.EndDate,
		DailyLimit:      req.DailyLimit,
		PublisherType:   models.PublisherTypeUser,
		PublisherID:     userID.(uint),
		Status:          models.TaskStatusActive, // 直接发布
	}
	
	if task.Radius == 0 {
		task.Radius = 100
	}
	
	if err := models.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// 扣除积分
	tc.taskService.ConsumePoints(userID.(uint), publishCost, "发布任务")
	
	c.JSON(http.StatusOK, gin.H{
		"message": "任务创建成功",
		"task":    task,
		"cost":    publishCost,
	})
}

// GetRankings 获取排行榜
func (tc *TaskController) GetRankings(c *gin.Context) {
	rankType := c.DefaultQuery("type", "total")   // total, weekly, monthly, hot
	period := c.DefaultQuery("period", "alltime")   // daily, weekly, monthly, alltime
	limitStr := c.DefaultQuery("limit", "20")
	
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	
	// 对于 daily/weekly/monthly period，使用对应的字段
	if rankType == "total" && period == "weekly" {
		rankType = "weekly"
	} else if rankType == "total" && period == "monthly" {
		rankType = "monthly"
	}
	
	entries, err := tc.taskService.GetRankings(rankType, period, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"type":    rankType,
		"period":  period,
		"entries": entries,
	})
}

// GetMyRanking 获取我的排名
func (tc *TaskController) GetMyRanking(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	rank, err := tc.taskService.GetUserRank(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, rank)
}

// GetUserPoints 获取我的积分信息
func (tc *TaskController) GetUserPoints(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	points, err := tc.taskService.GetOrCreateUserPoints(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	level, _ := tc.taskService.GetUserLevel(userID.(uint))
	
	// 获取每日任务完成情况
	todayRecord, _ := tc.taskService.GetDailyTaskRecord(userID.(uint), time.Now())
	
	c.JSON(http.StatusOK, gin.H{
		"total_points":     points.TotalPoints,
		"available_points": points.AvailablePoints,
		"weekly_points":   points.WeeklyPoints,
		"monthly_points":  points.MonthlyPoints,
		"total_tasks":     points.TotalTasks,
		"level":            level.Level,
		"title":            level.Title,
		"today_tasks":      todayRecord.TasksCompleted,
		"today_points":     todayRecord.PointsEarned,
	})
}

// GetMyTasks 获取我的任务（进行中/已完成）
func (tc *TaskController) GetMyTasks(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	status := c.Query("status") // active, completed
	
	var completions []models.TaskCompletion
	query := models.DB.Preload("Task").Where("user_id = ?", userID)
	
	if status == "completed" {
		query = query.Order("completed_at DESC")
	} else {
		// 默认返回所有
		query = query.Order("created_at DESC")
	}
	
	err := query.Find(&completions).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	result := make([]map[string]interface{}, 0)
	for _, c := range completions {
		result = append(result, map[string]interface{}{
			"id":             c.ID,
			"task":           c.Task,
			"completed_at":   c.CompletedAt,
			"points_earned":  c.PointsEarned,
			"distance":       c.Distance,
			"distance_text":  formatDistance(c.Distance),
		})
	}
	
	c.JSON(http.StatusOK, gin.H{
		"tasks": result,
	})
}

// GetTaskCompletions 获取任务的所有完成记录
func (tc *TaskController) GetTaskCompletions(c *gin.Context) {
	taskIDStr := c.Param("id")
	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的任务ID"})
		return
	}
	
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")
	
	page, _ := strconv.Atoi(pageStr)
	pageSize, _ := strconv.Atoi(pageSizeStr)
	offset := (page - 1) * pageSize
	
	var completions []models.TaskCompletion
	var total int64
	
	models.DB.Model(&models.TaskCompletion{}).Where("task_id = ?", taskID).Count(&total)
	err = models.DB.Preload("User").
		Where("task_id = ?", taskID).
		Order("completed_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&completions).Error
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"completions": completions,
		"total":       total,
		"page":        page,
		"size":       pageSize,
	})
}

// CheckTaskCompleted 检查用户是否已完成任务
func (tc *TaskController) CheckTaskCompleted(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	taskIDStr := c.Query("task_id")
	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的任务ID"})
		return
	}
	
	var completion models.TaskCompletion
	err = models.DB.Where("task_id = ? AND user_id = ?", taskID, userID).First(&completion).Error
	
	completed := err == nil
	
	c.JSON(http.StatusOK, gin.H{
		"completed": completed,
		"completion": completion,
	})
}

// GetDailySummary 获取每日任务总结
func (tc *TaskController) GetDailySummary(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	
	today, _ := tc.taskService.GetDailyTaskRecord(userID.(uint), time.Now())
	points, _ := tc.taskService.GetOrCreateUserPoints(userID.(uint))
	level, _ := tc.taskService.GetUserLevel(userID.(uint))
	
	c.JSON(http.StatusOK, gin.H{
		"date":           today.TaskDate,
		"tasks_completed": today.TasksCompleted,
		"points_earned":  today.PointsEarned,
		"total_points":   points.TotalPoints,
		"weekly_points":  points.WeeklyPoints,
		"level":          level.Level,
		"title":          level.Title,
	})
}

// helper functions

func formatDistance(meters float64) string {
	if meters < 1000 {
		return fmt.Sprintf("%.0f米", meters)
	}
	return fmt.Sprintf("%.1f公里", meters/1000)
}

func getPublishCost(taskType int) int {
	costs := map[int]int{
		models.TaskTypeCheckin:   100,
		models.TaskTypePhoto:     150,
		models.TaskTypeQA:        200,
		models.TaskTypeExplore:   300,
		models.TaskTypeChallenge: 500,
	}
	if cost, ok := costs[taskType]; ok {
		return cost
	}
	return 100
}
