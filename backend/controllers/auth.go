package controllers

import (
	"net/http"
	"tapspot/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("tapspot-secret-key-2026") // JWT密钥

// Claims JWT声明
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// RegisterRequest 注册请求
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6,max=100"`
	Nickname string `json:"nickname"`
}

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Register 用户注册
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请填写完整信息: " + err.Error(),
		})
		return
	}

	// 检查用户名是否已存在
	var existingUser models.User
	if err := models.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "用户名已存在",
		})
		return
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "密码加密失败",
		})
		return
	}

	// 创建用户
	nickname := req.Nickname
	if nickname == "" {
		nickname = req.Username
	}

	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Nickname: nickname,
	}

	if err := models.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "注册失败",
		})
		return
	}

	// 生成JWT
	token, err := generateToken(user.ID, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "生成token失败",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "注册成功",
		"data": gin.H{
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"nickname": user.Nickname,
			},
			"token": token,
		},
	})
}

// Login 用户登录
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请填写用户名和密码",
		})
		return
	}

	// 查找用户
	var user models.User
	if err := models.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "用户名或密码错误",
		})
		return
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "用户名或密码错误",
		})
		return
	}

	// 生成JWT
	token, err := generateToken(user.ID, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "生成token失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "登录成功",
		"data": gin.H{
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"nickname": user.Nickname,
				"avatar":   user.Avatar,
				"bio":      user.Bio,
			},
			"token": token,
		},
	})
}

// GetCurrentUser 获取当前用户信息
func GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "未登录",
		})
		return
	}

	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "用户不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
			"bio":      user.Bio,
		},
	})
}

// generateToken 生成JWT token
func generateToken(userID uint, username string) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // 7天过期
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "tapspot",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// AuthMiddleware JWT认证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "请先登录",
			})
			c.Abort()
			return
		}

		// Bearer token格式
		tokenString := authHeader
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenString = authHeader[7:]
		}

		token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "token无效或已过期",
			})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(*Claims); ok {
			c.Set("userID", claims.UserID)
			c.Set("username", claims.Username)
		}

		c.Next()
	}
}

// CreateTestUser 创建测试用户（仅开发用）
func CreateTestUser() {
	var user models.User
	if err := models.DB.Where("username = ?", "root").First(&user).Error; err != nil {
		// 用户不存在，创建
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("root"), bcrypt.DefaultCost)
		testUser := models.User{
			Username: "root",
			Password: string(hashedPassword),
			Nickname: "管理员",
		}
		models.DB.Create(&testUser)
	}
}
