package services

import (
	"errors"
	"tapspot/dto"
	"tapspot/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("tapspot-secret-key-2026-change-in-production")

// AuthService 认证服务
type AuthService struct{}

// NewAuthService 创建认证服务实例
func NewAuthService() *AuthService {
	return &AuthService{}
}

// Register 用户注册
func (s *AuthService) Register(req *dto.RegisterRequest) (*dto.RegisterResponse, error) {
	// 检查用户名是否已存在
	var existingUser models.User
	if err := models.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		return nil, errors.New("用户名已存在")
	}

	// 检查邮箱是否已存在（如果提供）
	if req.Email != "" {
		if err := models.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
			return nil, errors.New("邮箱已被注册")
		}
	}

	// 检查手机号是否已存在（如果提供）
	if req.Phone != "" {
		if err := models.DB.Where("phone = ?", req.Phone).First(&existingUser).Error; err == nil {
			return nil, errors.New("手机号已被注册")
		}
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("密码加密失败")
	}

	// 创建用户
	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Nickname: req.Nickname,
		Gender:   req.Gender,
		Bio:      req.Bio,
		Avatar:   req.Avatar,
		Email:    req.Email,
		Phone:    req.Phone,
	}

	if err := models.DB.Create(&user).Error; err != nil {
		return nil, errors.New("注册失败，请稍后重试")
	}

	return &dto.RegisterResponse{
		User: dto.UserInfo{
			ID:        user.ID,
			Username:  user.Username,
			Nickname:  user.Nickname,
			Avatar:    user.Avatar,
			Gender:    user.Gender,
			Bio:       user.Bio,
			Email:     user.Email,
			Phone:     user.Phone,
			CreatedAt: user.CreatedAt,
		},
	}, nil
}

// Login 用户登录
func (s *AuthService) Login(req *dto.LoginRequest) (*dto.LoginResponse, error) {
	// 查找用户
	var user models.User
	if err := models.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	// 生成 JWT
	token, err := s.GenerateToken(user.ID, user.Username)
	if err != nil {
		return nil, errors.New("生成 token 失败")
	}

	return &dto.LoginResponse{
		User: dto.UserInfo{
			ID:        user.ID,
			Username:  user.Username,
			Nickname:  user.Nickname,
			Avatar:    user.Avatar,
			Gender:    user.Gender,
			Bio:       user.Bio,
			Email:     user.Email,
			Phone:     user.Phone,
			CreatedAt: user.CreatedAt,
		},
		Token: token,
	}, nil
}

// GetUserByID 根据 ID 获取用户信息
func (s *AuthService) GetUserByID(userID uint) (*dto.UserInfo, error) {
	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		return nil, errors.New("用户不存在")
	}

	return &dto.UserInfo{
		ID:        user.ID,
		Username:  user.Username,
		Nickname:  user.Nickname,
		Avatar:    user.Avatar,
		Gender:    user.Gender,
		Bio:       user.Bio,
		Email:     user.Email,
		Phone:     user.Phone,
		CreatedAt: user.CreatedAt,
	}, nil
}

// GetUserProfile 获取用户完整资料（包含统计数据）
func (s *AuthService) GetUserProfile(userID uint) (*dto.UserProfile, error) {
	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		return nil, errors.New("用户不存在")
	}

	// 统计发帖数
	var postCount int64
	models.DB.Model(&models.Post{}).Where("user_id = ?", userID).Count(&postCount)

	// 统计获得的点赞数
	var likeCount int64
	models.DB.Model(&models.Like{}).
		Joins("JOIN posts ON likes.post_id = posts.id").
		Where("posts.user_id = ?", userID).
		Count(&likeCount)

	return &dto.UserProfile{
		ID:             user.ID,
		Username:       user.Username,
		Nickname:       user.Nickname,
		Avatar:         user.Avatar,
		Gender:         user.Gender,
		Bio:            user.Bio,
		Email:          user.Email,
		Phone:          user.Phone,
		CreatedAt:      user.CreatedAt,
		PostCount:      postCount,
		LikeCount:      likeCount,
		FollowerCount:  0, // 预留
		FollowingCount: 0, // 预留
	}, nil
}

// UpdateProfile 更新用户资料
func (s *AuthService) UpdateProfile(userID uint, req *dto.UpdateProfileRequest) error {
	updates := make(map[string]interface{})

	if req.Nickname != "" {
		updates["nickname"] = req.Nickname
	}
	if req.Gender != "" {
		updates["gender"] = req.Gender
	}
	updates["bio"] = req.Bio
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}
	if req.Email != "" {
		// 检查邮箱是否被其他用户使用
		var existingUser models.User
		if err := models.DB.Where("email = ? AND id != ?", req.Email, userID).First(&existingUser).Error; err == nil {
			return errors.New("邮箱已被其他用户使用")
		}
		updates["email"] = req.Email
	}
	if req.Phone != "" {
		// 检查手机号是否被其他用户使用
		var existingUser models.User
		if err := models.DB.Where("phone = ? AND id != ?", req.Phone, userID).First(&existingUser).Error; err == nil {
			return errors.New("手机号已被其他用户使用")
		}
		updates["phone"] = req.Phone
	}

	if len(updates) == 0 {
		return errors.New("没有需要更新的字段")
	}

	if err := models.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		return errors.New("更新失败")
	}

	return nil
}

// ChangePassword 修改密码
func (s *AuthService) ChangePassword(userID uint, req *dto.ChangePasswordRequest) error {
	// 获取用户
	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		return errors.New("用户不存在")
	}

	// 验证旧密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return errors.New("原密码错误")
	}

	// 加密新密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("密码加密失败")
	}

	// 更新密码
	if err := models.DB.Model(&models.User{}).Where("id = ?", userID).Update("password", string(hashedPassword)).Error; err != nil {
		return errors.New("修改密码失败")
	}

	return nil
}

// GenerateToken 生成 JWT token
func (s *AuthService) GenerateToken(userID uint, username string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(7 * 24 * time.Hour).Unix(), // 7 天过期
		"iat":      time.Now().Unix(),
		"iss":      "tapspot",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// GetJWTSecret 获取 JWT 密钥（供中间件使用）
func GetJWTSecret() []byte {
	return jwtSecret
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
			Gender:   "other",
		}
		models.DB.Create(&testUser)
	}
}
