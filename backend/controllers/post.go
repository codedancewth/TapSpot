package controllers

import (
	"net/http"
	"tapspot/models"

	"github.com/gin-gonic/gin"
)

// CreatePostRequest 创建帖子请求
type CreatePostRequest struct {
	Title        string  `json:"title" binding:"required"`
	Content      string  `json:"content" binding:"required"`
	Type         string  `json:"type"`
	LocationName string  `json:"location_name"`
	Latitude     float64 `json:"latitude" binding:"required"`
	Longitude    float64 `json:"longitude" binding:"required"`
}

// GetPosts 获取所有帖子
func GetPosts(c *gin.Context) {
	var posts []models.Post

	// 预加载作者信息
	if err := models.DB.Preload("Author").Order("created_at desc").Limit(100).Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取帖子失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    posts,
	})
}

// GetMyPosts 获取当前用户的帖子
func GetMyPosts(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "未登录",
		})
		return
	}

	var posts []models.Post
	if err := models.DB.Where("author_id = ?", userID).Order("created_at desc").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取帖子失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    posts,
	})
}

// CreatePost 创建帖子
func CreatePost(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "请先登录",
		})
		return
	}

	var req CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请填写完整信息: " + err.Error(),
		})
		return
	}

	postType := req.Type
	if postType == "" {
		postType = "post"
	}

	post := models.Post{
		AuthorID:     userID.(uint),
		Title:        req.Title,
		Content:      req.Content,
		Type:         postType,
		LocationName: req.LocationName,
		Latitude:     req.Latitude,
		Longitude:    req.Longitude,
	}

	if err := models.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "发布失败",
		})
		return
	}

	// 加载作者信息
	models.DB.Preload("Author").First(&post, post.ID)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "发布成功",
		"data":    post,
	})
}

// LikePost 点赞帖子
func LikePost(c *gin.Context) {
	id := c.Param("id")

	var post models.Post
	if err := models.DB.First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "帖子不存在",
		})
		return
	}

	models.DB.Model(&post).Update("likes", post.Likes+1)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "点赞成功",
		"data": gin.H{
			"likes": post.Likes + 1,
		},
	})
}

// DeletePost 删除帖子
func DeletePost(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")

	var post models.Post
	if err := models.DB.First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "帖子不存在",
		})
		return
	}

	// 只能删除自己的帖子
	if post.AuthorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "无权删除此帖子",
		})
		return
	}

	models.DB.Delete(&post)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "删除成功",
	})
}
