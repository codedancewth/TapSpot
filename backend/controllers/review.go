package controllers

import (
	"net/http"
	"strconv"
	"tapspot/models"

	"github.com/gin-gonic/gin"
)

// GetSpotReviews 获取某个位置的所有评论
func GetSpotReviews(c *gin.Context) {
	spotID := c.Param("id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var reviews []models.Review
	var total int64

	models.DB.Model(&models.Review{}).Where("spot_id = ?", spotID).Count(&total)

	models.DB.Where("spot_id = ?", spotID).
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Order("created_at desc").
		Find(&reviews)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"reviews":   reviews,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// CreateReview 创建新评论
func CreateReview(c *gin.Context) {
	spotID := c.Param("id")

	// 验证 spot 是否存在
	var spot models.Spot
	if err := models.DB.First(&spot, spotID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Spot not found",
		})
		return
	}

	var review models.Review
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	review.SpotID = spot.ID

	// 验证评分范围
	if review.Rating < 1 || review.Rating > 5 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Rating must be between 1 and 5",
		})
		return
	}

	if err := models.DB.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create review",
		})
		return
	}

	// 更新 spot 的评分和评论数
	updateSpotRating(spot.ID)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    review,
	})
}

// UpdateReview 更新评论
func UpdateReview(c *gin.Context) {
	id := c.Param("id")

	var review models.Review
	if err := models.DB.First(&review, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Review not found",
		})
		return
	}

	var updateData models.Review
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	// 验证评分范围
	if updateData.Rating < 1 || updateData.Rating > 5 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Rating must be between 1 and 5",
		})
		return
	}

	models.DB.Model(&review).Updates(updateData)

	// 更新 spot 的评分
	updateSpotRating(review.SpotID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    review,
	})
}

// DeleteReview 删除评论
func DeleteReview(c *gin.Context) {
	id := c.Param("id")

	var review models.Review
	if err := models.DB.First(&review, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Review not found",
		})
		return
	}

	spotID := review.SpotID
	models.DB.Delete(&review)

	// 更新 spot 的评分
	updateSpotRating(spotID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Review deleted successfully",
	})
}

// LikeReview 点赞评论
func LikeReview(c *gin.Context) {
	id := c.Param("id")

	var review models.Review
	if err := models.DB.First(&review, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Review not found",
		})
		return
	}

	models.DB.Model(&review).Update("likes", review.Likes+1)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    review,
	})
}

// updateSpotRating 更新位置的评分统计
func updateSpotRating(spotID uint) {
	var avgRating float64
	var count int64

	models.DB.Model(&models.Review{}).
		Where("spot_id = ?", spotID).
		Select("AVG(rating)").
		Scan(&avgRating)

	models.DB.Model(&models.Review{}).
		Where("spot_id = ?", spotID).
		Count(&count)

	models.DB.Model(&models.Spot{}).
		Where("id = ?", spotID).
		Updates(map[string]interface{}{
			"rating":       avgRating,
			"review_count": count,
		})
}

// GetStats 获取统计信息
func GetStats(c *gin.Context) {
	var spotCount, reviewCount int64
	var countryCount int64

	models.DB.Model(&models.Spot{}).Count(&spotCount)
	models.DB.Model(&models.Review{}).Count(&reviewCount)
	models.DB.Model(&models.Spot{}).Distinct("country").Count(&countryCount)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"total_spots":    spotCount,
			"total_reviews":  reviewCount,
			"total_countries": countryCount,
		},
	})
}

// GetCountries 获取所有国家列表
func GetCountries(c *gin.Context) {
	var countries []struct {
		Country string `json:"country"`
		Count   int    `json:"count"`
	}

	models.DB.Model(&models.Spot{}).
		Select("country, count(*) as count").
		Where("country != ''").
		Group("country").
		Order("count desc").
		Find(&countries)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    countries,
	})
}
