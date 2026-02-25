package dto

import "time"

// ========== 注册相关 ==========

// RegisterRequest 注册请求
type RegisterRequest struct {
	Username     string `json:"username" binding:"required,min=3,max=50"`
	Password     string `json:"password" binding:"required,min=6,max=100"`
	PasswordConf string `json:"password_conf" binding:"required,eqfield=Password"`
	Nickname     string `json:"nickname" binding:"required,min=1,max=50"`
	Gender       string `json:"gender" binding:"required,oneof=male female other"`
	Bio          string `json:"bio" binding:"max=500"`
	Avatar       string `json:"avatar" binding:"omitempty,url"`
	Email        string `json:"email" binding:"omitempty,email"`
	Phone        string `json:"phone" binding:"omitempty"`
}

// RegisterResponse 注册响应
type RegisterResponse struct {
	User UserInfo `json:"user"`
}

// ========== 登录相关 ==========

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse 登录响应
type LoginResponse struct {
	User  UserInfo `json:"user"`
	Token string   `json:"token"`
}

// ========== 用户信息相关 ==========

// UserInfo 用户基本信息（用于响应）
type UserInfo struct {
	ID        uint      `json:"id"`
	Username  string    `json:"username"`
	Nickname  string    `json:"nickname"`
	Avatar    string    `json:"avatar"`
	Gender    string    `json:"gender"`
	Bio       string    `json:"bio"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	CreatedAt time.Time `json:"created_at"`
}

// UserProfile 用户完整资料（用于个人资料页面）
type UserProfile struct {
	ID           uint      `json:"id"`
	Username     string    `json:"username"`
	Nickname     string    `json:"nickname"`
	Avatar       string    `json:"avatar"`
	Gender       string    `json:"gender"`
	Bio          string    `json:"bio"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	CreatedAt    time.Time `json:"created_at"`
	PostCount    int64     `json:"post_count"`    // 发帖数
	LikeCount    int64     `json:"like_count"`    // 获得的总点赞数
	FollowerCount int64    `json:"follower_count"` // 粉丝数（预留）
	FollowingCount int64   `json:"following_count"` // 关注数（预留）
}

// ========== 更新资料相关 ==========

// UpdateProfileRequest 更新个人资料请求
type UpdateProfileRequest struct {
	Nickname string `json:"nickname" binding:"omitempty,min=1,max=50"`
	Gender   string `json:"gender" binding:"omitempty,oneof=male female other"`
	Bio      string `json:"bio" binding:"max=500"`
	Avatar   string `json:"avatar" binding:"omitempty,url"`
	Email    string `json:"email" binding:"omitempty,email"`
	Phone    string `json:"phone" binding:"omitempty"`
}

// ChangePasswordRequest 修改密码请求
type ChangePasswordRequest struct {
	OldPassword     string `json:"old_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6,max=100"`
	NewPasswordConf string `json:"new_password_conf" binding:"required,eqfield=NewPassword"`
}

// ========== 通用响应 ==========

// AuthResponse 认证通用响应
type AuthResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// ErrorResponse 错误响应
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
