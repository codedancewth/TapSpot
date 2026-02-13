package routes

import (
	"tapspot/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		// Spot 相关路由
		api.GET("/spots", controllers.GetSpots)
		api.GET("/spots/:id", controllers.GetSpot)
		api.POST("/spots", controllers.CreateSpot)
		api.PUT("/spots/:id", controllers.UpdateSpot)
		api.DELETE("/spots/:id", controllers.DeleteSpot)
		api.GET("/spots/nearby", controllers.GetNearbySpots)
		api.GET("/spots/bounds", controllers.GetSpotsInBounds)

		// Review 相关路由
		api.GET("/spots/:id/reviews", controllers.GetSpotReviews)
		api.POST("/spots/:id/reviews", controllers.CreateReview)
		api.PUT("/reviews/:id", controllers.UpdateReview)
		api.DELETE("/reviews/:id", controllers.DeleteReview)
		api.POST("/reviews/:id/like", controllers.LikeReview)

		// 统计路由
		api.GET("/stats", controllers.GetStats)
		api.GET("/countries", controllers.GetCountries)
	}
}
