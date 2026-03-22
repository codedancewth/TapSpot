package controllers

import (
	"embed"
	"encoding/json"
	"io"
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

//go:embed poi_data.json
var poiFS embed.FS

// POI 兴趣点
type POI struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	TypeName  string  `json:"typeName"`
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lng"`
	Address   string  `json:"address"`
	City      string  `json:"city"`
	District  string  `json:"district"`
}

// 缓存加载的 POI 数据
var cachedPois []POI = nil

// LoadPOIData 加载 POI 数据
func LoadPOIData() ([]POI, error) {
	if cachedPois != nil {
		return cachedPois, nil
	}
	data, err := poiFS.ReadFile("poi_data.json")
	if err != nil {
		return nil, err
	}
	var wrapper struct {
		POIs []POI `json:"pois"`
	}
	if err := json.Unmarshal(data, &wrapper); err != nil {
		return nil, err
	}
	cachedPois = wrapper.POIs
	return cachedPois, nil
}

// GetAllPOIs 获取所有 POI
func GetAllPOIs(c *gin.Context) {
	pois, err := LoadPOIData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "加载POI数据失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"pois": pois})
}

// GetPOIs POI搜索API（基于真实数据）
func GetPOIs(c *gin.Context) {
	location := c.Query("location") // "lng,lat"
	radius := 50000 // 50km
	if r := c.Query("radius"); r != "" {
		if parsed, err := strconv.Atoi(r); err == nil {
			radius = parsed
		}
	}
	poiType := c.Query("type") // scenic, food, hotel, shopping, entertainment, swim
	city := c.Query("city")

	if location == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少 location 参数"})
		return
	}

	lngStr, latStr := splitLocation(location)
	lng, lat := parseFloat64Pair(lngStr, latStr)

	pois, err := LoadPOIData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "加载POI数据失败"})
		return
	}

	type poiWithDist struct {
		POI      POI
		Distance float64
	}
	var results []poiWithDist

	for _, poi := range pois {
		if poiType != "" && poi.Type != poiType {
			continue
		}
		if city != "" && poi.City != city {
			continue
		}
		dx := (poi.Longitude - lng) * math.Cos(lat*math.Pi/180) * 111000
		dy := (poi.Latitude - lat) * 111000
		dist := math.Sqrt(dx*dx + dy*dy)
		if dist <= float64(radius) {
			results = append(results, poiWithDist{POI: poi, Distance: dist})
		}
	}

	for i := 0; i < len(results); i++ {
		for j := i + 1; j < len(results); j++ {
			if results[i].Distance > results[j].Distance {
				results[i], results[j] = results[j], results[i]
			}
		}
	}

	max := 50
	if len(results) < max {
		max = len(results)
	}
	poisOut := make([]POI, max)
	for i := 0; i < max; i++ {
		poisOut[i] = results[i].POI
	}

	c.JSON(http.StatusOK, gin.H{"pois": poisOut, "count": len(poisOut)})
}

// ReverseGeocode 逆地理编码API
func ReverseGeocode(c *gin.Context) {
	location := c.Query("location")
	if location == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少 location 参数"})
		return
	}
	lngStr, latStr := splitLocation(location)
	lng, lat := parseFloat64Pair(lngStr, latStr)

	pois, err := LoadPOIData()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": "1", "info": "OK",
			"regeocode": gin.H{"formatted_address": "中国"},
		})
		return
	}

	minDist := 999999.0
	nearest := ""
	for _, poi := range pois {
		dx := (poi.Longitude - lng) * math.Cos(lat*math.Pi/180) * 111000
		dy := (poi.Latitude - lat) * 111000
		dist := math.Sqrt(dx*dx + dy*dy)
		if dist < minDist {
			minDist = dist
			nearest = poi.City + poi.District + poi.Address
		}
	}
	if nearest == "" {
		nearest = "未知地点"
	}
	c.JSON(http.StatusOK, gin.H{
		"status": "1", "info": "OK",
		"regeocode": gin.H{"formatted_address": nearest},
	})
}

// HealthCheck 健康检查
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// GetPOICount 获取 POI 总数
func GetPOICount(c *gin.Context) {
	pois, err := LoadPOIData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "加载POI数据失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": len(pois)})
}

// ServePoiFile 读取 poi_data.json 文件内容
func ServePoiFile(c *gin.Context) {
	f, err := poiFS.Open("poi_data.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "文件不存在"})
		return
	}
	defer f.Close()
	data, _ := io.ReadAll(f)
	c.Data(http.StatusOK, "application/json; charset=utf-8", data)
}
