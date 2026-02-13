package config

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	// 从环境变量获取数据库类型
	dbType := getEnv("DB_TYPE", "sqlite") // sqlite or mysql
	
	var err error
	
	switch dbType {
	case "mysql":
		// MySQL配置
		dbHost := getEnv("DB_HOST", "localhost")
		dbPort := getEnv("DB_PORT", "3306")
		dbUser := getEnv("DB_USER", "root")
		dbPassword := getEnv("DB_PASSWORD", "")
		dbName := getEnv("DB_NAME", "tapspot")

		dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			dbUser, dbPassword, dbHost, dbPort, dbName)

		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err != nil {
			fmt.Println("Failed to connect to MySQL, falling back to SQLite:", err)
			// 回退到SQLite
			initSQLite()
			return
		}
		
		fmt.Println("Connected to MySQL database successfully!")
		
	default:
		// SQLite配置（默认）
		initSQLite()
		return
	}

	// 配置连接池
	sqlDB, err := DB.DB()
	if err != nil {
		panic("Failed to get database instance: " + err.Error())
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
}

func initSQLite() {
	var err error
	// 使用内存数据库，方便演示
	DB, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to SQLite database: " + err.Error())
	}
	
	fmt.Println("Connected to SQLite in-memory database successfully!")
	fmt.Println("Note: Data will be lost when server stops. Use MySQL for production.")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
