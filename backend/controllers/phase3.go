package controllers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"tapspot/models"
	"tapspot/services"
)

// ========== Item Shop ==========

type ItemController struct {
	gamService *services.GamificationService
}

func NewItemController() *ItemController {
	return &ItemController{
		gamService: services.NewGamificationService(),
	}
}

// GetItems 获取商城道具列表
func (ic *ItemController) GetItems(c *gin.Context) {
	var items []models.Item
	models.DB.Where("is_active = ?", true).Find(&items)
	c.JSON(http.StatusOK, gin.H{"items": items})
}

// BuyItem 购买道具
func (ic *ItemController) BuyItem(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	var req struct {
		ItemID uint `json:"item_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	var item models.Item
	if err := models.DB.First(&item, req.ItemID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "道具不存在"})
		return
	}

	if !item.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "道具已下架"})
		return
	}

	wallet, err := ic.gamService.GetOrCreateWallet(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if wallet.GoldCoins < int64(item.Price) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "金币不足"})
		return
	}

	_, err = ic.gamService.SpendGoldCoins(uid, int64(item.Price))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var playerItem models.PlayerItem
	result := models.DB.Where("user_id = ? AND item_id = ?", uid, req.ItemID).First(&playerItem)

	if result.Error == nil {
		playerItem.Quantity++
		models.DB.Save(&playerItem)
	} else {
		playerItem = models.PlayerItem{
			UserID:    uid,
			ItemID:    req.ItemID,
			Quantity:  1,
			CreatedAt: time.Now(),
		}
		if item.Duration > 0 {
			playerItem.ExpiresAt = time.Now().Add(time.Duration(item.Duration) * time.Minute)
		}
		models.DB.Create(&playerItem)
	}

	wallet, _ = ic.gamService.GetOrCreateWallet(uid)

	c.JSON(http.StatusOK, gin.H{
		"message":    "购买成功",
		"item":       item,
		"quantity":   playerItem.Quantity,
		"gold_coins": wallet.GoldCoins,
	})
}

// GetMyItems 获取我的道具
func (ic *ItemController) GetMyItems(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	var playerItems []models.PlayerItem
	models.DB.Where("user_id = ? AND quantity > 0", uid).Find(&playerItems)

	type PlayerItemWithDetail struct {
		models.PlayerItem
		Item models.Item `json:"item"`
	}

	result := []PlayerItemWithDetail{}
	for _, pi := range playerItems {
		var item models.Item
		models.DB.First(&item, pi.ItemID)
		result = append(result, PlayerItemWithDetail{
			PlayerItem: pi,
			Item:        item,
		})
	}

	c.JSON(http.StatusOK, gin.H{"items": result})
}

// UseItem 使用道具
func (ic *ItemController) UseItem(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	itemIDStr := c.Param("id")
	itemID, err := strconv.ParseUint(itemIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的道具 ID"})
		return
	}

	var playerItem models.PlayerItem
	if err := models.DB.Where("user_id = ? AND item_id = ? AND quantity > 0", uid, uint(itemID)).First(&playerItem).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "道具不存在或已用完"})
		return
	}

	var item models.Item
	models.DB.First(&item, uint(itemID))

	if !playerItem.ExpiresAt.IsZero() && playerItem.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "道具已过期"})
		return
	}

	if item.Type == "card" || item.Type == "teleport" || item.Type == "revive" {
		playerItem.Quantity--
		if playerItem.Quantity <= 0 {
			models.DB.Delete(&playerItem)
		} else {
			models.DB.Save(&playerItem)
		}
	}

	if item.Type == "boost" && playerItem.ExpiresAt.IsZero() {
		playerItem.ExpiresAt = time.Now().Add(time.Duration(item.Duration) * time.Minute)
		models.DB.Save(&playerItem)
	}

	message := "使用成功"
	switch item.Type {
	case "card":
		if item.Name == "金币卡" {
			wallet, _ := ic.gamService.AddGoldCoins(uid, 500, "使用金币卡")
			message = fmt.Sprintf("获得 500 金币！当前金币: %d", wallet.GoldCoins)
		}
	case "boost":
		message = fmt.Sprintf("激活 %s 效果！", item.Effect)
	case "teleport":
		message = "传送卡已激活，下次远程打卡有效"
	case "revive":
		message = "复活卡已激活"
	}

	c.JSON(http.StatusOK, gin.H{
		"message": message,
		"item":    item,
	})
}

// ========== Team Check-in ==========

type TeamController struct {
	gamService *services.GamificationService
}

func NewTeamController() *TeamController {
	return &TeamController{
		gamService: services.NewGamificationService(),
	}
}

// GetMyTeams 获取我的队伍列表
func (tc *TeamController) GetMyTeams(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	var ledTeams []models.Team
	models.DB.Where("leader_id = ?", uid).Find(&ledTeams)

	var memberTeams []models.Team
	var memberTeamIDs []uint
	models.DB.Model(&models.TeamMember{}).Where("user_id = ? AND is_active = ?", uid, true).Pluck("team_id", &memberTeamIDs)
	if len(memberTeamIDs) > 0 {
		models.DB.Where("id IN ? AND leader_id != ?", memberTeamIDs, uid).Find(&memberTeams)
	}

	allTeams := append(ledTeams, memberTeams...)

	result := []map[string]interface{}{}
	for _, t := range allTeams {
		var memberCount int64
		models.DB.Model(&models.TeamMember{}).Where("team_id = ? AND is_active = ?", t.ID, true).Count(&memberCount)
		result = append(result, map[string]interface{}{
			"id":           t.ID,
			"name":         t.Name,
			"leader_id":    t.LeaderID,
			"invite_code":  t.InviteCode,
			"member_count": memberCount,
			"created_at":   t.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"teams": result})
}

// CreateTeam 创建队伍
func (tc *TeamController) CreateTeam(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	var req struct {
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请输入队名"})
		return
	}

	inviteCode := fmt.Sprintf("%06d", rand.Intn(1000000))

	team := models.Team{
		Name:        req.Name,
		LeaderID:    uid,
		InviteCode:  inviteCode,
		MemberCount: 1,
	}
	if err := models.DB.Create(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建队伍失败"})
		return
	}

	member := models.TeamMember{
		TeamID:   team.ID,
		UserID:   uid,
		JoinedAt: time.Now(),
		IsActive: true,
	}
	models.DB.Create(&member)

	var user models.User
	models.DB.First(&user, uid)
	member.Nickname = user.Nickname
	member.Avatar = user.Avatar
	var level models.PlayerLevel
	models.DB.Where("user_id = ?", uid).First(&level)
	member.Level = level.Level

	c.JSON(http.StatusOK, gin.H{
		"team": map[string]interface{}{
			"id":           team.ID,
			"name":         team.Name,
			"leader_id":    team.LeaderID,
			"invite_code":  team.InviteCode,
			"member_count": 1,
		},
	})
}

// JoinTeam 加入队伍
func (tc *TeamController) JoinTeam(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	teamIDStr := c.Param("id")
	teamID, err := strconv.ParseUint(teamIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的队伍 ID"})
		return
	}

	var team models.Team
	if err := models.DB.First(&team, uint(teamID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "队伍不存在"})
		return
	}

	var existing models.TeamMember
	if err := models.DB.Where("team_id = ? AND user_id = ? AND is_active = ?", teamID, uid, true).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "已在队伍中"})
		return
	}

	member := models.TeamMember{
		TeamID:   uint(teamID),
		UserID:   uid,
		JoinedAt: time.Now(),
		IsActive: true,
	}
	models.DB.Create(&member)

	team.MemberCount++
	models.DB.Save(&team)

	c.JSON(http.StatusOK, gin.H{
		"message": "加入成功",
		"team": map[string]interface{}{
			"id":           team.ID,
			"name":         team.Name,
			"leader_id":    team.LeaderID,
			"invite_code":  team.InviteCode,
			"member_count": team.MemberCount,
		},
	})
}

// JoinTeamByCode 通过邀请码加入队伍
func (tc *TeamController) JoinTeamByCode(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	var req struct {
		InviteCode string `json:"invite_code"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.InviteCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请输入邀请码"})
		return
	}

	var team models.Team
	if err := models.DB.Where("invite_code = ?", req.InviteCode).First(&team).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "邀请码无效"})
		return
	}

	var existing models.TeamMember
	if err := models.DB.Where("team_id = ? AND user_id = ? AND is_active = ?", team.ID, uid, true).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "已在队伍中"})
		return
	}

	member := models.TeamMember{
		TeamID:   team.ID,
		UserID:   uid,
		JoinedAt: time.Now(),
		IsActive: true,
	}
	models.DB.Create(&member)

	team.MemberCount++
	models.DB.Save(&team)

	c.JSON(http.StatusOK, gin.H{
		"message": "加入成功",
		"team": map[string]interface{}{
			"id":           team.ID,
			"name":         team.Name,
			"leader_id":    team.LeaderID,
			"invite_code":  team.InviteCode,
			"member_count": team.MemberCount,
		},
	})
}

// LeaveTeam 离开队伍
func (tc *TeamController) LeaveTeam(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	teamIDStr := c.Param("id")
	teamID, err := strconv.ParseUint(teamIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的队伍 ID"})
		return
	}

	var team models.Team
	if err := models.DB.First(&team, uint(teamID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "队伍不存在"})
		return
	}

	if team.LeaderID == uid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "队长不能离开队伍，请先转让队长"})
		return
	}

	models.DB.Model(&models.TeamMember{}).Where("team_id = ? AND user_id = ?", teamID, uid).Update("is_active", false)

	team.MemberCount--
	if team.MemberCount < 1 {
		team.MemberCount = 1
	}
	models.DB.Save(&team)

	c.JSON(http.StatusOK, gin.H{"message": "已离开队伍"})
}

// GetTeamMembers 获取队员列表
func (tc *TeamController) GetTeamMembers(c *gin.Context) {
	teamIDStr := c.Param("id")
	teamID, err := strconv.ParseUint(teamIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的队伍 ID"})
		return
	}

	var members []models.TeamMember
	models.DB.Where("team_id = ? AND is_active = ?", teamID, true).Find(&members)

	type MemberWithUser struct {
		models.TeamMember
		IsLeader bool `json:"is_leader"`
	}

	result := []MemberWithUser{}
	for _, m := range members {
		var user models.User
		models.DB.First(&user, m.UserID)
		m.Nickname = user.Nickname
		m.Avatar = user.Avatar
		var level models.PlayerLevel
		models.DB.Where("user_id = ?", m.UserID).First(&level)
		m.Level = level.Level

		var team models.Team
		models.DB.First(&team, teamID)

		result = append(result, MemberWithUser{
			TeamMember: m,
			IsLeader:   m.UserID == team.LeaderID,
		})
	}

	c.JSON(http.StatusOK, gin.H{"members": result})
}

// TeamCheckin 组队打卡
func (tc *TeamController) TeamCheckin(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	teamIDStr := c.Param("id")
	teamID, err := strconv.ParseUint(teamIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的队伍 ID"})
		return
	}

	var req struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "位置信息错误"})
		return
	}

	var team models.Team
	if err := models.DB.First(&team, uint(teamID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "队伍不存在"})
		return
	}

	var member models.TeamMember
	if err := models.DB.Where("team_id = ? AND user_id = ? AND is_active = ?", teamID, uid, true).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "不在队伍中"})
		return
	}

	today := time.Now().Truncate(24 * time.Hour)
	var existing models.TeamCheckin
	if err := models.DB.Where("team_id = ? AND user_id = ? AND DATE(created_at) = ?", teamID, uid, today).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "今天已经组过队打卡了"})
		return
	}

	checkin := models.TeamCheckin{
		TeamID:    uint(teamID),
		UserID:    uid,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		CreatedAt: time.Now(),
	}
	models.DB.Create(&checkin)

	var activeMembers []models.TeamMember
	models.DB.Where("team_id = ? AND is_active = ?", teamID, true).Find(&activeMembers)

	var checkinCount int64
	models.DB.Model(&models.TeamCheckin{}).Where("team_id = ? AND DATE(created_at) = ?", teamID, today).Count(&checkinCount)

	reward := int64(0)
	if int(checkinCount) == len(activeMembers) {
		reward = 50
		for _, m := range activeMembers {
			tc.gamService.AddGoldCoins(m.UserID, reward, "组队打卡奖励")
			tc.gamService.AddExperience(m.UserID, 30, "组队打卡奖励")
			tc.addSeasonScore(m.UserID, 5)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "打卡成功",
		"checkin_count": checkinCount,
		"total_members": len(activeMembers),
		"all_checked_in": int(checkinCount) == len(activeMembers),
		"reward":        reward,
	})
}

func (tc *TeamController) addSeasonScore(userID uint, score int) {
	var season models.Season
	if err := models.DB.Where("status = ?", "active").Order("start_date DESC").First(&season).Error; err != nil {
		return
	}

	var seasonScore models.SeasonScore
	if err := models.DB.Where("user_id = ? AND season_id = ?", userID, season.ID).First(&seasonScore).Error; err != nil {
		seasonScore = models.SeasonScore{
			UserID:   userID,
			SeasonID: season.ID,
			Score:    score,
		}
		models.DB.Create(&seasonScore)
	} else {
		seasonScore.Score += score
		models.DB.Save(&seasonScore)
	}
}

// ========== Season System ==========

type SeasonController struct {
	gamService *services.GamificationService
}

func NewSeasonController() *SeasonController {
	return &SeasonController{
		gamService: services.NewGamificationService(),
	}
}

// GetCurrentSeason 获取当前赛季
func (sc *SeasonController) GetCurrentSeason(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	var season models.Season
	if err := models.DB.Where("status = ?", "active").Order("start_date DESC").First(&season).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "当前没有进行中的赛季"})
		return
	}

	var seasonScore models.SeasonScore
	models.DB.Where("user_id = ? AND season_id = ?", uid, season.ID).First(&seasonScore)

	var userSeason models.UserSeason
	joined := models.DB.Where("user_id = ? AND season_id = ?", uid, season.ID).First(&userSeason).Error == nil

	var rewards []map[string]interface{}
	if season.RewardsJSON != "" {
		json.Unmarshal([]byte(season.RewardsJSON), &rewards)
	}

	remainSeconds := season.EndDate.Unix() - time.Now().Unix()
	if remainSeconds < 0 {
		remainSeconds = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"season": map[string]interface{}{
			"id":          season.ID,
			"name":        season.Name,
			"type":        season.Type,
			"start_date":  season.StartDate,
			"end_date":    season.EndDate,
			"status":      season.Status,
			"rewards":     rewards,
		},
		"score":           seasonScore.Score,
		"rank":            seasonScore.Rank,
		"joined":          joined,
		"remain_seconds":  remainSeconds,
	})
}

// JoinSeason 加入赛季
func (sc *SeasonController) JoinSeason(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	seasonIDStr := c.Param("id")
	seasonID, err := strconv.ParseUint(seasonIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的赛季 ID"})
		return
	}

	var season models.Season
	if err := models.DB.First(&season, uint(seasonID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "赛季不存在"})
		return
	}

	if season.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "赛季已结束"})
		return
	}

	var existing models.UserSeason
	if err := models.DB.Where("user_id = ? AND season_id = ?", uid, seasonID).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "已加入该赛季"})
		return
	}

	userSeason := models.UserSeason{
		UserID:   uid,
		SeasonID: uint(seasonID),
		JoinedAt: time.Now(),
	}
	models.DB.Create(&userSeason)

	seasonScore := models.SeasonScore{
		UserID:   uid,
		SeasonID: uint(seasonID),
		Score:    0,
	}
	models.DB.Create(&seasonScore)

	c.JSON(http.StatusOK, gin.H{"message": "加入成功"})
}

// GetSeasonLeaderboard 获取赛季排行榜
func (sc *SeasonController) GetSeasonLeaderboard(c *gin.Context) {
	seasonIDStr := c.Param("id")
	seasonID, err := strconv.ParseUint(seasonIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的赛季 ID"})
		return
	}

	limitStr := c.DefaultQuery("limit", "50")
	limit, _ := strconv.Atoi(limitStr)

	var scores []models.SeasonScore
	models.DB.Where("season_id = ?", seasonID).Order("score DESC").Limit(limit).Find(&scores)

	type LeaderboardEntry struct {
		Rank     int    `json:"rank"`
		UserID   uint   `json:"user_id"`
		Nickname string `json:"nickname"`
		Avatar   string `json:"avatar"`
		Level    int    `json:"level"`
		Score    int    `json:"score"`
	}

	entries := []LeaderboardEntry{}
	for i, s := range scores {
		var user models.User
		models.DB.First(&user, s.UserID)
		var level models.PlayerLevel
		models.DB.Where("user_id = ?", s.UserID).First(&level)
		entries = append(entries, LeaderboardEntry{
			Rank:     i + 1,
			UserID:   s.UserID,
			Nickname: user.Nickname,
			Avatar:   user.Avatar,
			Level:    level.Level,
			Score:    s.Score,
		})
	}

	c.JSON(http.StatusOK, gin.H{"leaderboard": entries})
}

// ========== Stats Dashboard ==========

type PhaseStatsController struct {
	gamService *services.GamificationService
}

func NewPhaseStatsController() *PhaseStatsController {
	return &PhaseStatsController{
		gamService: services.NewGamificationService(),
	}
}

// GetMyStats 获取个人统计
func (sc *PhaseStatsController) GetMyStats(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	var totalCheckins int64
	models.DB.Model(&models.Post{}).Where("user_id = ?", uid).Count(&totalCheckins)

	type CheckinDay struct {
		Date string `json:"date"`
	}
	var checkinDays []CheckinDay
	models.DB.Model(&models.Post{}).
		Select("DATE(created_at) as date").
		Where("user_id = ?", uid).
		Group("DATE(created_at)").
		Order("date DESC").
		Find(&checkinDays)

	uniqueDays := len(checkinDays)

	streak, _ := sc.gamService.GetOrCreateCheckinStreak(uid)

	type CityCount struct {
		City string `json:"city"`
	}
	var cityCounts []CityCount
	models.DB.Model(&models.Post{}).
		Select("city as city").
		Where("user_id = ? AND city != ''", uid).
		Group("city").
		Find(&cityCounts)
	uniqueCities := len(cityCounts)

	type TypeCount struct {
		Type  string `json:"type"`
		Count int    `json:"count"`
	}
	var typeCounts []TypeCount
	models.DB.Model(&models.Post{}).
		Select("type, COUNT(*) as count").
		Where("user_id = ?", uid).
		Group("type").
		Find(&typeCounts)

	typeDistribution := map[string]float64{}
	for _, tc := range typeCounts {
		if totalCheckins > 0 {
			typeDistribution[tc.Type] = float64(tc.Count) / float64(totalCheckins) * 100
		}
	}

	heatmap := []map[string]interface{}{}
	for i := 365; i >= 0; i-- {
		date := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
		var count int64
		models.DB.Model(&models.Post{}).
			Where("user_id = ? AND DATE(created_at) = ?", uid, date).
			Count(&count)
		heatmap = append(heatmap, map[string]interface{}{
			"date":  date,
			"count": count,
		})
	}

	calendar := []map[string]interface{}{}
	for i := 29; i >= 0; i-- {
		date := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
		var count int64
		models.DB.Model(&models.Post{}).
			Where("user_id = ? AND DATE(created_at) = ?", uid, date).
			Count(&count)
		weekday := time.Now().AddDate(0, 0, -i).Weekday()
		calendar = append(calendar, map[string]interface{}{
			"date":    date,
			"count":   count,
			"weekday": weekday.String(),
		})
	}

	type LocationEntry struct {
		LocationName string    `json:"location_name"`
		Latitude    float64   `json:"latitude"`
		Longitude   float64   `json:"longitude"`
		Count       int64     `json:"count"`
		CreatedAt   time.Time `json:"created_at"`
	}
	var locations []LocationEntry
	models.DB.Model(&models.Post{}).
		Select("location_name, latitude, longitude, COUNT(*) as count, MAX(created_at) as created_at").
		Where("user_id = ? AND location_name != ''", uid).
		Group("location_name").
		Order("count DESC").
		Limit(20).
		Find(&locations)

	c.JSON(http.StatusOK, gin.H{
		"total_checkins":     totalCheckins,
		"checkin_days":       uniqueDays,
		"current_streak":    streak.CurrentStreak,
		"longest_streak":    streak.LongestStreak,
		"unique_cities":      uniqueCities,
		"type_distribution": typeDistribution,
		"heatmap":            heatmap,
		"calendar":           calendar,
		"top_locations":      locations,
	})
}

// ========== Daily/Weekly Rewards ==========

type RewardController struct {
	gamService *services.GamificationService
}

func NewRewardController() *RewardController {
	return &RewardController{
		gamService: services.NewGamificationService(),
	}
}

func (rc *RewardController) getOrCreateReward(userID uint) (*models.DailyReward, error) {
	var reward models.DailyReward
	err := models.DB.Where("user_id = ?", userID).First(&reward).Error
	if err != nil {
		reward = models.DailyReward{
			UserID: userID,
		}
		if err := models.DB.Create(&reward).Error; err != nil {
			return nil, err
		}
	}
	return &reward, nil
}

// GetDailyRewardStatus 获取每日礼包状态
func (rc *RewardController) GetDailyRewardStatus(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	reward, _ := rc.getOrCreateReward(uid)

	today := time.Now().Truncate(24 * time.Hour)
	canClaimDaily := reward.LastDailyAt == nil || reward.LastDailyAt.Before(today)

	now := time.Now()
	monday := now.AddDate(0, 0, -int(now.Weekday())+1).Truncate(24 * time.Hour)
	if now.Weekday() == time.Sunday {
		monday = monday.AddDate(0, 0, -6)
	}
	canClaimWeekly := reward.LastWeeklyAt == nil || reward.LastWeeklyAt.Before(monday)

	c.JSON(http.StatusOK, gin.H{
		"daily_streak":     reward.DailyStreak,
		"weekly_streak":    reward.WeeklyStreak,
		"can_claim_daily":  canClaimDaily,
		"can_claim_weekly": canClaimWeekly,
	})
}

// ClaimDailyReward 领取每日礼包
func (rc *RewardController) ClaimDailyReward(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	reward, _ := rc.getOrCreateReward(uid)

	today := time.Now().Truncate(24 * time.Hour)
	if reward.LastDailyAt != nil && !reward.LastDailyAt.Before(today) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "今日已领取"})
		return
	}

	reward.DailyStreak++
	if reward.LastDailyAt != nil {
		yesterday := today.AddDate(0, 0, -1)
		if reward.LastDailyAt.Before(yesterday) {
			reward.DailyStreak = 1
		}
	}

	baseGold := int64(20)
	goldReward := baseGold + int64(reward.DailyStreak*5)

	wallet, _ := rc.gamService.AddGoldCoins(uid, goldReward, "每日礼包")
	rc.gamService.AddExperience(uid, 10+int64(reward.DailyStreak), "每日礼包")

	now := time.Now()
	reward.LastDailyAt = &now
	reward.UpdatedAt = now
	models.DB.Save(reward)

	itemReward := ""
	items := []string{"双倍经验卡", "位置提示卡"}
	if reward.DailyStreak%7 == 0 {
		items = append(items, "金币卡")
	}
	chosen := items[rand.Intn(len(items))]
	var item models.Item
	if models.DB.Where("name = ?", chosen).First(&item).Error == nil {
		var playerItem models.PlayerItem
		if models.DB.Where("user_id = ? AND item_id = ?", uid, item.ID).First(&playerItem).Error == nil {
			playerItem.Quantity++
			models.DB.Save(&playerItem)
		} else {
			playerItem = models.PlayerItem{
				UserID:    uid,
				ItemID:    item.ID,
				Quantity:  1,
				CreatedAt: now,
			}
			if item.Duration > 0 {
				playerItem.ExpiresAt = now.Add(time.Duration(item.Duration) * time.Minute)
			}
			models.DB.Create(&playerItem)
		}
		itemReward = item.Name
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "领取成功",
		"gold_reward":  goldReward,
		"total_gold":   wallet.GoldCoins,
		"daily_streak": reward.DailyStreak,
		"item_reward":  itemReward,
		"exp_reward":   10 + int64(reward.DailyStreak),
	})
}

// ClaimWeeklyReward 领取每周礼包
func (rc *RewardController) ClaimWeeklyReward(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	uid := userID.(uint)

	reward, _ := rc.getOrCreateReward(uid)

	now := time.Now()
	monday := now.AddDate(0, 0, -int(now.Weekday())+1).Truncate(24 * time.Hour)
	if now.Weekday() == time.Sunday {
		monday = monday.AddDate(0, 0, -6)
	}

	if reward.LastWeeklyAt != nil && !reward.LastWeeklyAt.Before(monday) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "本周已领取"})
		return
	}

	reward.WeeklyStreak++
	if reward.LastWeeklyAt != nil {
		prevMonday := monday.AddDate(0, 0, -7)
		if reward.LastWeeklyAt.Before(prevMonday) {
			reward.WeeklyStreak = 1
		}
	}

	goldReward := int64(200 + reward.WeeklyStreak*50)
	wallet, _ := rc.gamService.AddGoldCoins(uid, goldReward, "每周礼包")
	rc.gamService.AddExperience(uid, 100+int64(reward.WeeklyStreak*20), "每周礼包")

	reward.LastWeeklyAt = &now
	reward.UpdatedAt = now
	models.DB.Save(reward)

	c.JSON(http.StatusOK, gin.H{
		"message":       "领取成功",
		"gold_reward":   goldReward,
		"total_gold":    wallet.GoldCoins,
		"weekly_streak": reward.WeeklyStreak,
		"exp_reward":    100 + int64(reward.WeeklyStreak)*20,
	})
}

