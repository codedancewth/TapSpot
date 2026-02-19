package controllers

import (
	"net/http"
	"tapspot/models"

	"github.com/gin-gonic/gin"
)

// PostLike 点赞/取消点赞帖子
func PostLike(c *gin.Context) {
	userID := c.GetUint("userID")
	postID := c.Param("id")

	postIDUint := parseUint(postID)

	// 检查帖子是否存在
	var post models.Post
	if err := models.DB.First(&post, postIDUint).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "帖子不存在"})
		return
	}

	// 检查是否已点赞
	var existing models.Like
	result := models.DB.Where("user_id = ? AND post_id = ?", userID, postIDUint).First(&existing)

	if result.Error == nil {
		// 已点赞，取消
		models.DB.Delete(&existing)
		c.JSON(http.StatusOK, gin.H{"success": true, "liked": false})
	} else {
		// 未点赞，添加
		like := models.Like{
			UserID: userID,
			PostID: postIDUint,
		}
		models.DB.Create(&like)
		c.JSON(http.StatusOK, gin.H{"success": true, "liked": true})
	}
}

// CheckPostLikes 检查用户是否点赞了某些帖子
func CheckPostLikes(c *gin.Context) {
	userID := c.GetUint("userID")
	postIDs := c.Query("postIds")

	if postIDs == "" {
		c.JSON(http.StatusOK, gin.H{"liked": []uint{}})
		return
	}

	var ids []uint
	for _, id := range splitIDs(postIDs) {
		ids = append(ids, uint(id))
	}

	if len(ids) == 0 {
		c.JSON(http.StatusOK, gin.H{"liked": []uint{}})
		return
	}

	var likes []models.Like
	models.DB.Where("user_id = ? AND post_id IN ?", userID, ids).Find(&likes)

	var likedIDs []uint
	for _, like := range likes {
		likedIDs = append(likedIDs, like.PostID)
	}

	c.JSON(http.StatusOK, gin.H{"liked": likedIDs})
}

// GetMyLikes 获取用户点赞的帖子列表
func GetMyLikes(c *gin.Context) {
	userID := c.GetUint("userID")

	var likes []models.Like
	models.DB.Where("user_id = ?", userID).Find(&likes)

	var postIDs []uint
	for _, like := range likes {
		postIDs = append(postIDs, like.PostID)
	}

	c.JSON(http.StatusOK, gin.H{"liked": postIDs})
}
