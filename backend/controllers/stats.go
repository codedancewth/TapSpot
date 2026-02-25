package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"tapspot/models"
)

// GetVisitStats 获取访客统计信息
func GetVisitStats(c *gin.Context) {
	// 总访问量
	var totalVisits int64
	models.DB.Model(&models.Visit{}).Count(&totalVisits)

	// 独立 IP 数（总访客数）
	var uniqueIPs int64
	models.DB.Table("visits").Distinct("ip_address").Count(&uniqueIPs)

	// 按日期统计访问量
	type DailyStats struct {
		Date      string `json:"date"`
		Visits    int64  `json:"visits"`
		UniqueIPs int64  `json:"unique_ips"`
	}

	var dailyStats []DailyStats
	models.DB.Table("visits").
		Select("DATE(created_at) as date, COUNT(*) as visits, COUNT(DISTINCT ip_address) as unique_ips").
		Group("DATE(created_at)").
		Order("date DESC").
		Limit(30).
		Scan(&dailyStats)

	// 热门页面统计
	type PageStats struct {
		Path  string `json:"path"`
		Count int64  `json:"count"`
	}

	var pageStats []PageStats
	models.DB.Table("visits").
		Select("path, COUNT(*) as count").
		Group("path").
		Order("count DESC").
		Limit(20).
		Scan(&pageStats)

	// IP 分布统计
	type IPStats struct {
		IP        string `json:"ip"`
		Visits    int64  `json:"visits"`
		LastVisit string `json:"last_visit"`
	}

	var ipStats []IPStats
	models.DB.Table("visits").
		Select("ip_address as ip, COUNT(*) as visits, MAX(created_at) as last_visit").
		Group("ip_address").
		Order("visits DESC").
		Limit(20).
		Scan(&ipStats)

	// 今日统计
	type TodayStats struct {
		Visits    int64 `json:"visits"`
		UniqueIPs int64 `json:"unique_ips"`
	}
	var todayStats TodayStats
	models.DB.Table("visits").
		Select("COUNT(*) as visits, COUNT(DISTINCT ip_address) as unique_ips").
		Where("DATE(created_at) = CURDATE()").
		Scan(&todayStats)

	c.JSON(http.StatusOK, gin.H{
		"total_visits": totalVisits,
		"total_unique": uniqueIPs,
		"today_stats":  todayStats,
		"daily_stats":  dailyStats,
		"page_stats":   pageStats,
		"ip_stats":     ipStats,
	})
}

// GetRealTimeVisitors 获取实时在线访客（最近 5 分钟）
func GetRealTimeVisitors(c *gin.Context) {
	type RealTimeVisitor struct {
		IP        string `json:"ip"`
		Path      string `json:"path"`
		UserAgent string `json:"user_agent"`
		LastVisit string `json:"last_visit"`
	}

	var visitors []RealTimeVisitor
	models.DB.Table("visits").
		Select("ip_address as ip, path, user_agent, MAX(created_at) as last_visit").
		Where("created_at > ?", time.Now().Add(-5*time.Minute)).
		Group("ip_address, path, user_agent").
		Order("last_visit DESC").
		Limit(50).
		Scan(&visitors)

	c.JSON(http.StatusOK, gin.H{
		"visitors": visitors,
		"count":    len(visitors),
	})
}
