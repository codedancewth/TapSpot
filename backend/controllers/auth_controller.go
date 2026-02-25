package controllers

import (
	"fmt"
	"net/http"
	"tapspot/dto"
	"tapspot/services"

	"github.com/gin-gonic/gin"
)

// AuthController 认证控制器
type AuthController struct {
	authService *services.AuthService
}

// NewAuthController 创建认证控制器实例
func NewAuthController() *AuthController {
	return &AuthController{
		authService: services.NewAuthService(),
	}
}

// Register 用户注册
func (ac *AuthController) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Message: getValidationErrorMessage(err),
		})
		return
	}

	// 获取用户 IP 地址
	ip := c.ClientIP()
	if ip == "" {
		ip = c.GetHeader("X-Real-IP")
	}
	if ip == "" {
		ip = c.GetHeader("X-Forwarded-For")
	}

	resp, err := ac.authService.Register(&req, ip)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dto.AuthResponse{
		Success: true,
		Message: "注册成功",
		Data:    resp,
	})
}

// Login 用户登录
func (ac *AuthController) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errMsg := "请输入用户名和密码"
		if req.Username == "" {
			errMsg = "用户名不能为空"
		} else if req.Password == "" {
			errMsg = "密码不能为空"
		}
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Message: errMsg,
		})
		return
	}

	resp, err := ac.authService.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.AuthResponse{
		Success: true,
		Message: "登录成功",
		Data:    resp,
	})
}

// GetCurrentUser 获取当前用户信息
func (ac *AuthController) GetCurrentUser(c *gin.Context) {
	userID := GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Success: false,
			Message: "请先登录",
		})
		return
	}

	userInfo, err := ac.authService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.AuthResponse{
		Success: true,
		Data:    gin.H{"user": userInfo},
	})
}

// GetUserProfile 获取用户完整资料
func (ac *AuthController) GetUserProfile(c *gin.Context) {
	userIDStr := c.Param("id")
	var userID uint
	if _, err := fmt.Sscanf(userIDStr, "%d", &userID); err != nil || userID == 0 {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Message: "无效的用户 ID",
		})
		return
	}

	profile, err := ac.authService.GetUserProfile(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.AuthResponse{
		Success: true,
		Data:    gin.H{"user": profile},
	})
}

// UpdateProfile 更新用户资料
func (ac *AuthController) UpdateProfile(c *gin.Context) {
	userID := GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Success: false,
			Message: "请先登录",
		})
		return
	}

	var req dto.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Message: getValidationErrorMessage(err),
		})
		return
	}

	if err := ac.authService.UpdateProfile(userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.AuthResponse{
		Success: true,
		Message: "更新成功",
	})
}

// ChangePassword 修改密码
func (ac *AuthController) ChangePassword(c *gin.Context) {
	userID := GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Success: false,
			Message: "请先登录",
		})
		return
	}

	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Message: getValidationErrorMessage(err),
		})
		return
	}

	if err := ac.authService.ChangePassword(userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.AuthResponse{
		Success: true,
		Message: "密码修改成功",
	})
}

// GetUserID 从 gin.Context 获取 userID
func GetUserID(c *gin.Context) uint {
	userID, exists := c.Get("userID")
	if !exists {
		return 0
	}
	return userID.(uint)
}

// getValidationErrorMessage 获取友好的验证错误消息
func getValidationErrorMessage(err error) string {
	return "请求参数错误，请检查输入"
}
