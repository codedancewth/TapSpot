package controllers

import (
	"net/http"
	"strconv"
	"tapspot/models"

	"github.com/gin-gonic/gin"
)

// GetSpots 获取所有位置点（分页）
func GetSpots(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	country := c.Query("country")
	category := c.Query("category")

	var spots []models.Spot
	var total int64

	query := models.DB.Model(&models.Spot{})

	if country != "" {
		query = query.Where("country = ?", country)
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}

	query.Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("created_at desc").Find(&spots)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"spots": spots,
			"total": total,
			"page":  page,
			"page_size": pageSize,
		},
	})
}

// GetSpot 获取单个位置详情
func GetSpot(c *gin.Context) {
	id := c.Param("id")

	var spot models.Spot
	if err := models.DB.Preload("Reviews").First(&spot, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Spot not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    spot,
	})
}

// CreateSpot 创建新位置
func CreateSpot(c *gin.Context) {
	var spot models.Spot
	if err := c.ShouldBindJSON(&spot); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	if err := models.DB.Create(&spot).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create spot",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    spot,
	})
}

// UpdateSpot 更新位置信息
func UpdateSpot(c *gin.Context) {
	id := c.Param("id")

	var spot models.Spot
	if err := models.DB.First(&spot, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Spot not found",
		})
		return
	}

	var updateData models.Spot
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	models.DB.Model(&spot).Updates(updateData)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    spot,
	})
}

// DeleteSpot 删除位置
func DeleteSpot(c *gin.Context) {
	id := c.Param("id")

	var spot models.Spot
	if err := models.DB.First(&spot, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Spot not found",
		})
		return
	}

	models.DB.Delete(&spot)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Spot deleted successfully",
	})
}

// GetNearbySpots 获取附近的位置点
func GetNearbySpots(c *gin.Context) {
	lat, _ := strconv.ParseFloat(c.Query("lat"), 64)
	lng, _ := strconv.ParseFloat(c.Query("lng"), 64)
	radius, _ := strconv.ParseFloat(c.Query("radius"), 64) // 单位：公里

	if radius == 0 {
		radius = 10 // 默认10公里范围
	}

	var spots []models.Spot

	// 使用 Haversine 公式计算距离
	models.DB.Raw(`
		SELECT *, (
			6371 * acos(
				cos(radians(?)) * cos(radians(latitude)) * 
				cos(radians(longitude) - radians(?)) + 
				sin(radians(?)) * sin(radians(latitude))
			)
		) AS distance
		FROM spots
		HAVING distance < ?
		ORDER BY distance
		LIMIT 50
	`, lat, lng, lat, radius).Scan(&spots)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    spots,
	})
}

// GetSpotsInBounds 获取地图可视区域内的位置点
func GetSpotsInBounds(c *gin.Context) {
	minLat, _ := strconv.ParseFloat(c.Query("min_lat"), 64)
	maxLat, _ := strconv.ParseFloat(c.Query("max_lat"), 64)
	minLng, _ := strconv.ParseFloat(c.Query("min_lng"), 64)
	maxLng, _ := strconv.ParseFloat(c.Query("max_lng"), 64)

	var spots []models.Spot

	models.DB.Where("latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
		minLat, maxLat, minLng, maxLng).Find(&spots)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    spots,
	})
}
