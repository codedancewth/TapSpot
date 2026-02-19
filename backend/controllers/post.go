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

// PostResponse 帖子响应格式
type PostResponse struct {
	ID           uint    `json:"id"`
	Title        string  `json:"title"`
	Content      string  `json:"content"`
	Type         string  `json:"type"`
	LocationName string  `json:"location_name"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	Likes        int     `json:"likes"`
	Author       string  `json:"author"`
	AuthorID     uint    `json:"authorId"`
	CreatedAt    string  `json:"createdAt"`
}

// formatPost 格式化帖子为响应格式
func formatPost(post models.Post) PostResponse {
	var likeCount int64
	models.DB.Model(&models.Like{}).Where("post_id = ?", post.ID).Count(&likeCount)

	author := post.User.Nickname
	if author == "" {
		author = post.User.Username
	}

	return PostResponse{
		ID:           post.ID,
		Title:        post.Title,
		Content:      post.Content,
		Type:         post.Type,
		LocationName: post.LocationName,
		Latitude:     post.Latitude,
		Longitude:    post.Longitude,
		Likes:        int(likeCount),
		Author:       author,
		AuthorID:     post.UserID,
		CreatedAt:    post.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

// GetPosts 获取所有帖子
func GetPosts(c *gin.Context) {
	postType := c.Query("type")
	userID := c.Query("userId")
	search := c.Query("search")

	query := models.DB.Preload("User")

	if postType != "" && postType != "all" {
		query = query.Where("type = ?", postType)
	}

	if userID != "" {
		query = query.Where("user_id = ?", parseUint(userID))
	}

	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Where("title LIKE ? OR content LIKE ? OR location_name LIKE ?", searchTerm, searchTerm, searchTerm)
	}

	var posts []models.Post
	if err := query.Order("created_at DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取帖子失败"})
		return
	}

	var result []PostResponse
	for _, post := range posts {
		result = append(result, formatPost(post))
	}

	c.JSON(http.StatusOK, gin.H{"posts": result})
}

// GetPost 获取单篇帖子
func GetPost(c *gin.Context) {
	postID := c.Param("id")

	var post models.Post
	if err := models.DB.Preload("User").First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "帖子不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"post": formatPost(post)})
}

// GetMyPosts 获取当前用户的帖子
func GetMyPosts(c *gin.Context) {
	userID := c.GetUint("userID")

	var posts []models.Post
	if err := models.DB.Preload("User").Where("user_id = ?", userID).Order("created_at DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取帖子失败"})
		return
	}

	var result []PostResponse
	for _, post := range posts {
		result = append(result, formatPost(post))
	}

	c.JSON(http.StatusOK, gin.H{"posts": result})
}

// CreatePost 创建帖子
func CreatePost(c *gin.Context) {
	userID := c.GetUint("userID")

	var req CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "标题和内容不能为空"})
		return
	}

	if req.Latitude == 0 || req.Longitude == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请选择位置"})
		return
	}

	postType := req.Type
	if postType == "" {
		postType = "post"
	}

	post := models.Post{
		UserID:       userID,
		Title:        req.Title,
		Content:      req.Content,
		Type:         postType,
		LocationName: req.LocationName,
		Latitude:     req.Latitude,
		Longitude:    req.Longitude,
	}

	if err := models.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "发布失败，请稍后重试"})
		return
	}

	// 加载用户信息
	models.DB.Preload("User").First(&post, post.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"post":    formatPost(post),
	})
}

// DeletePost 删除帖子
func DeletePost(c *gin.Context) {
	userID := c.GetUint("userID")
	postID := c.Param("id")

	var post models.Post
	if err := models.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "帖子不存在"})
		return
	}

	if post.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权删除此帖子"})
		return
	}

	models.DB.Delete(&post)
	c.JSON(http.StatusOK, gin.H{"success": true})
}
