package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"tapspot/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	MaxImageSize = 10 * 1024 * 1024 // 10MB
	UploadDir    = "uploads"
)

// UploadImage 上传图片
func UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请选择要上传的图片"})
		return
	}

	// 检查文件大小
	if file.Size > MaxImageSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "图片大小不能超过 10MB"})
		return
	}

	// 检查文件类型
	contentType := file.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "只能上传图片文件"})
		return
	}

	// 创建上传目录
	uploadPath := filepath.Join(".", UploadDir)
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建上传目录失败"})
		return
	}

	// 生成唯一文件名
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".jpg"
	}
	filename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
	filePath := filepath.Join(uploadPath, filename)

	// 保存文件
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存图片失败"})
		return
	}

	// 返回图片URL
	imageURL := fmt.Sprintf("/%s/%s", UploadDir, filename)

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"url":      imageURL,
		"filename": filename,
	})
}

// UploadPostImage 上传帖子图片（支持创建帖子时一起上传）
func UploadPostImage(c *gin.Context) {
	userID := c.GetUint("userID")

	// 可选：检查用户是否存在
	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未登录"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请选择要上传的图片"})
		return
	}

	// 检查文件大小
	if file.Size > MaxImageSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "图片大小不能超过 10MB"})
		return
	}

	// 检查文件类型
	contentType := file.Header.Get("Content-Type")
	allowedTypes := []string{"image/jpeg", "image/png", "image/gif", "image/webp"}
	isAllowed := false
	for _, t := range allowedTypes {
		if contentType == t {
			isAllowed = true
			break
		}
	}
	if !isAllowed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "支持的图片格式：JPG, PNG, GIF, WEBP"})
		return
	}

	// 创建上传目录
	uploadPath := filepath.Join(".", UploadDir)
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建上传目录失败"})
		return
	}

	// 生成唯一文件名
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		// 根据content-type推断扩展名
		switch contentType {
		case "image/jpeg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/gif":
			ext = ".gif"
		case "image/webp":
			ext = ".webp"
		}
	}
	filename := fmt.Sprintf("post_%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
	filePath := filepath.Join(uploadPath, filename)

	// 保存文件
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存图片失败"})
		return
	}

	// 返回图片URL
	imageURL := fmt.Sprintf("/%s/%s", UploadDir, filename)

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"url":      imageURL,
		"filename": filename,
	})
}
