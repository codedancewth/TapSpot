package controllers

import (
	"net/http"
	"sort"
	"tapspot/models"

	"github.com/gin-gonic/gin"
)

// GetComments 获取帖子评论
func GetComments(c *gin.Context) {
	postID := c.Param("id")

	// 获取评论及其点赞数
	var comments []models.Comment
	if err := models.DB.Preload("User").
		Where("post_id = ?", postID).
		Order("created_at ASC").
		Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取评论失败"})
		return
	}

	// 获取点赞数
	type CommentWithLikes struct {
		ID          uint   `json:"id"`
		Content     string `json:"content"`
		Author      string `json:"author"`
		AuthorID    uint   `json:"authorId"`
		ReplyToID   *uint  `json:"replyToId"`
		ReplyToUser string `json:"replyToUser"`
		Likes       int    `json:"likes"`
		CreatedAt   string `json:"createdAt"`
	}

	var result []CommentWithLikes
	for _, comment := range comments {
		var likeCount int64
		models.DB.Model(&models.CommentLike{}).Where("comment_id = ?", comment.ID).Count(&likeCount)

		author := comment.User.Nickname
		if author == "" {
			author = comment.User.Username
		}

		result = append(result, CommentWithLikes{
			ID:          comment.ID,
			Content:     comment.Content,
			Author:      author,
			AuthorID:    comment.UserID,
			ReplyToID:   comment.ReplyToID,
			ReplyToUser: comment.ReplyToUser,
			Likes:       int(likeCount),
			CreatedAt:   comment.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	// 按点赞数排序
	sort.Slice(result, func(i, j int) bool {
		return result[i].Likes > result[j].Likes
	})

	c.JSON(http.StatusOK, gin.H{"comments": result})
}

// CreateComment 发表评论
func CreateComment(c *gin.Context) {
	userID := c.GetUint("userID")
	postID := c.Param("id")

	var req struct {
		Content     string `json:"content" binding:"required"`
		ReplyToID   *uint  `json:"replyToId"`
		ReplyToUser string `json:"replyToUser"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "评论内容不能为空"})
		return
	}

	// 检查帖子是否存在
	var post models.Post
	if err := models.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "帖子不存在"})
		return
	}

	comment := models.Comment{
		PostID:      post.ID,
		UserID:      userID,
		Content:     req.Content,
		ReplyToID:   req.ReplyToID,
		ReplyToUser: req.ReplyToUser,
	}

	if err := models.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "评论失败"})
		return
	}

	// 获取用户信息
	var user models.User
	models.DB.First(&user, userID)

	author := user.Nickname
	if author == "" {
		author = user.Username
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"comment": gin.H{
			"id":          comment.ID,
			"content":     comment.Content,
			"author":      author,
			"authorId":    userID,
			"replyToId":   req.ReplyToID,
			"replyToUser": req.ReplyToUser,
			"createdAt":   comment.CreatedAt.Format("2006-01-02 15:04:05"),
		},
	})
}

// DeleteComment 删除评论
func DeleteComment(c *gin.Context) {
	userID := c.GetUint("userID")
	commentID := c.Param("id")

	var comment models.Comment
	if err := models.DB.First(&comment, commentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评论不存在"})
		return
	}

	if comment.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权删除此评论"})
		return
	}

	models.DB.Delete(&comment)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetCommentCounts 批量获取评论数
func GetCommentCounts(c *gin.Context) {
	postIDs := c.Query("postIds")
	if postIDs == "" {
		c.JSON(http.StatusOK, gin.H{"counts": gin.H{}})
		return
	}

	var ids []uint
	for _, idStr := range splitIDs(postIDs) {
		ids = append(ids, uint(idStr))
	}

	if len(ids) == 0 {
		c.JSON(http.StatusOK, gin.H{"counts": gin.H{}})
		return
	}

	type CountResult struct {
		PostID uint `json:"post_id"`
		Count  int  `json:"count"`
	}

	var results []CountResult
	models.DB.Model(&models.Comment{}).
		Select("post_id, count(*) as count").
		Where("post_id IN ?", ids).
		Group("post_id").
		Scan(&results)

	counts := make(map[uint]int)
	for _, r := range results {
		counts[r.PostID] = r.Count
	}

	c.JSON(http.StatusOK, gin.H{"counts": counts})
}

// CommentLike 点赞/取消点赞评论
func CommentLike(c *gin.Context) {
	userID := c.GetUint("userID")
	commentID := c.Param("id")

	// 检查评论是否存在
	var comment models.Comment
	if err := models.DB.First(&comment, commentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评论不存在"})
		return
	}

	// 检查是否已点赞
	var existing models.CommentLike
	result := models.DB.Where("user_id = ? AND comment_id = ?", userID, comment.ID).First(&existing)

	if result.Error == nil {
		// 已点赞，取消
		models.DB.Delete(&existing)
		c.JSON(http.StatusOK, gin.H{"success": true, "liked": false})
	} else {
		// 未点赞，添加
		like := models.CommentLike{
			UserID:    userID,
			CommentID: comment.ID,
		}
		models.DB.Create(&like)
		c.JSON(http.StatusOK, gin.H{"success": true, "liked": true})
	}
}

// CheckCommentLikes 检查用户是否点赞了某些评论
func CheckCommentLikes(c *gin.Context) {
	userID := c.GetUint("userID")
	commentIDs := c.Query("commentIds")

	if commentIDs == "" {
		c.JSON(http.StatusOK, gin.H{"liked": []uint{}})
		return
	}

	var ids []uint
	for _, id := range splitIDs(commentIDs) {
		ids = append(ids, uint(id))
	}

	if len(ids) == 0 {
		c.JSON(http.StatusOK, gin.H{"liked": []uint{}})
		return
	}

	var likes []models.CommentLike
	models.DB.Where("user_id = ? AND comment_id IN ?", userID, ids).Find(&likes)

	var likedIDs []uint
	for _, like := range likes {
		likedIDs = append(likedIDs, like.CommentID)
	}

	c.JSON(http.StatusOK, gin.H{"liked": likedIDs})
}

// GetCommentLikeCounts 获取评论点赞数
func GetCommentLikeCounts(c *gin.Context) {
	commentIDs := c.Query("commentIds")

	if commentIDs == "" {
		c.JSON(http.StatusOK, gin.H{"counts": gin.H{}})
		return
	}

	var ids []uint
	for _, id := range splitIDs(commentIDs) {
		ids = append(ids, uint(id))
	}

	if len(ids) == 0 {
		c.JSON(http.StatusOK, gin.H{"counts": gin.H{}})
		return
	}

	type CountResult struct {
		CommentID uint `json:"comment_id"`
		Count     int  `json:"count"`
	}

	var results []CountResult
	models.DB.Model(&models.CommentLike{}).
		Select("comment_id, count(*) as count").
		Where("comment_id IN ?", ids).
		Group("comment_id").
		Scan(&results)

	counts := make(map[uint]int)
	for _, r := range results {
		counts[r.CommentID] = r.Count
	}

	c.JSON(http.StatusOK, gin.H{"counts": counts})
}

// GetBestComment 获取最佳评论（PK逻辑）
func GetBestComment(c *gin.Context) {
	postID := c.Param("id")

	// 获取帖子点赞数
	var postLikeCount int64
	postIDUint := parseUint(postID)
	models.DB.Model(&models.Like{}).Where("post_id = ?", postIDUint).Count(&postLikeCount)

	// 获取该帖子下点赞最高的评论
	var comments []models.Comment
	models.DB.Preload("User").Where("post_id = ?", postIDUint).Find(&comments)

	var topComment *models.Comment
	var topCommentLikeCount int

	for i := range comments {
		var likeCount int64
		models.DB.Model(&models.CommentLike{}).Where("comment_id = ?", comments[i].ID).Count(&likeCount)
		if int(likeCount) > topCommentLikeCount {
			topCommentLikeCount = int(likeCount)
			topComment = &comments[i]
		}
	}

	// 获取帖子信息
	var post models.Post
	if err := models.DB.Preload("User").First(&post, postIDUint).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "帖子不存在"})
		return
	}

	postAuthor := post.User.Nickname
	if postAuthor == "" {
		postAuthor = post.User.Username
	}

	// 如果没有评论
	if topComment == nil {
		c.JSON(http.StatusOK, gin.H{
			"bestComment": gin.H{
				"id":        post.ID,
				"content":   post.Content,
				"title":     post.Title,
				"author":    postAuthor,
				"authorId":  post.UserID,
				"likeCount": postLikeCount,
				"type":      "post",
				"createdAt": post.CreatedAt.Format("2006-01-02 15:04:05"),
			},
			"pkResult": gin.H{
				"winner":          "post",
				"postLikes":       postLikeCount,
				"topCommentLikes": 0,
				"reason":          "暂无评论，帖子本身为最佳内容",
			},
		})
		return
	}

	commentAuthor := topComment.User.Nickname
	if commentAuthor == "" {
		commentAuthor = topComment.User.Username
	}

	// PK逻辑
	var winner string
	var reason string
	if postLikeCount > int64(topCommentLikeCount) {
		winner = "post"
		reason = "帖子点赞数更高，帖子胜出"
	} else if topCommentLikeCount > int(postLikeCount) {
		winner = "comment"
		reason = "评论点赞数更高，评论胜出"
	} else {
		winner = "post"
		reason = "点赞数相同，帖子优先"
	}

	if winner == "post" {
		c.JSON(http.StatusOK, gin.H{
			"bestComment": gin.H{
				"id":        post.ID,
				"content":   post.Content,
				"title":     post.Title,
				"author":    postAuthor,
				"authorId":  post.UserID,
				"likeCount": postLikeCount,
				"type":      "post",
				"createdAt": post.CreatedAt.Format("2006-01-02 15:04:05"),
			},
			"pkResult": gin.H{
				"winner":          "post",
				"postLikes":       postLikeCount,
				"topCommentLikes": topCommentLikeCount,
				"reason":          reason,
			},
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"bestComment": gin.H{
				"id":          topComment.ID,
				"content":     topComment.Content,
				"author":      commentAuthor,
				"authorId":    topComment.UserID,
				"replyToUser": topComment.ReplyToUser,
				"likeCount":   topCommentLikeCount,
				"type":        "comment",
				"createdAt":   topComment.CreatedAt.Format("2006-01-02 15:04:05"),
			},
			"pkResult": gin.H{
				"winner":          "comment",
				"postLikes":       postLikeCount,
				"topCommentLikes": topCommentLikeCount,
				"reason":          reason,
			},
		})
	}
}
