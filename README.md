# TapSpot - Discover Places Through Real Reviews

TapSpot lets you tap any location on the map and see what people really think. Real reviews, pinned right where they belong. Discover places through the eyes of others—just tap and go.

## 🚀 Features

- 🌍 **Interactive World Map**: Click anywhere on the map to view or add spots
- 📍 **Real Reviews**: User-generated reviews with ratings and photos
- 🎯 **Smart Filtering**: Filter by country, category, and rating
- 📊 **Live Statistics**: Real-time stats on spots, reviews, and countries
- 💫 **Beautiful UI**: Modern, responsive design with smooth animations
- 🔍 **Search Functionality**: Find spots by name, location, or category

## 🏗️ Architecture

```
TapSpot/
├── backend/          # Go backend (Gin + GORM + MySQL)
├── frontend/         # React frontend (Vite + Tailwind CSS + Leaflet)
└── README.md         # This file
```

## 🛠️ Tech Stack

### Backend
- **Go 1.21+** - High-performance backend
- **Gin** - HTTP web framework
- **GORM** - ORM for database operations
- **MySQL** - Relational database
- **JWT** - Authentication (optional)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet** - Interactive maps
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Go 1.21+
- Node.js 18+
- MySQL 8.0+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/codedancewth/TapSpot.git
cd TapSpot
```

### 2. Backend Setup
```bash
cd backend

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials

# Install dependencies
go mod download

# Run database migrations (auto-migrate on startup)
# Start the server
go run main.go
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Database Setup
```sql
-- Create database
CREATE DATABASE tapspot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- The application will automatically create tables via GORM AutoMigrate
```

## 🚀 Running the Application

1. **Start MySQL** service
2. **Start Backend** (port 8080):
   ```bash
   cd backend
   go run main.go
   ```
3. **Start Frontend** (port 3000):
   ```bash
   cd frontend
   npm run dev
   ```
4. Open browser: http://localhost:3000

## 📖 API Documentation

### Base URL: `http://localhost:8080/api/v1`

### Endpoints

#### Spots
- `GET /spots` - List spots with pagination
- `GET /spots/:id` - Get spot details
- `POST /spots` - Create new spot
- `PUT /spots/:id` - Update spot
- `DELETE /spots/:id` - Delete spot
- `GET /spots/nearby` - Get nearby spots
- `GET /spots/bounds` - Get spots in map bounds

#### Reviews
- `GET /spots/:id/reviews` - Get spot reviews
- `POST /spots/:id/reviews` - Create review
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review
- `POST /reviews/:id/like` - Like review

#### Statistics
- `GET /stats` - Get global statistics
- `GET /countries` - Get country list with counts

## 🎨 Features in Detail

### Map Interface
- **Drag & Zoom**: Smooth map navigation
- **Custom Markers**: Color-coded by rating
- **Click to Add**: Add spots anywhere on the map
- **Real-time Updates**: Live data synchronization

### Spot Management
- **Rich Details**: Name, description, category, location
- **Rating System**: 1-5 star ratings with averages
- **Review System**: User reviews with likes
- **Category Filtering**: Filter by restaurant, hotel, etc.

### User Experience
- **Responsive Design**: Works on desktop and mobile
- **Dark Theme**: Eye-friendly dark mode
- **Smooth Animations**: CSS transitions and effects
- **Loading States**: Visual feedback for async operations

## 🔧 Configuration

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tapspot
PORT=8080
GIN_MODE=debug
```

### Frontend (vite.config.js)
- Proxy configured to backend
- Tailwind CSS for styling
- Leaflet map tiles from OpenStreetMap

## 📁 Project Structure

### Backend
```
backend/
├── main.go                 # Application entry point
├── config/
│   └── database.go         # Database configuration
├── models/
│   └── models.go           # Data models (Spot, Review)
├── controllers/
│   ├── spot.go             # Spot controllers
│   └── review.go           # Review controllers
├── routes/
│   └── routes.go           # API routes
└── .env.example            # Environment variables template
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── StatsPanel.jsx      # Statistics panel
│   │   ├── CountryList.jsx     # Country list
│   │   ├── SpotModal.jsx       # Spot details modal
│   │   └── CreateSpotModal.jsx # Create spot modal
│   ├── App.jsx                 # Main application
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
└── package.json                # Dependencies
```

## 🚀 Deployment

### Backend Deployment
```bash
# Build binary
cd backend
go build -o tapspot

# Run with environment variables
DB_HOST=localhost DB_PORT=3306 DB_USER=root DB_PASSWORD=xxx ./tapspot
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist/ folder to any static hosting
```

### Docker (Optional)
```dockerfile
# Backend Dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o tapspot
CMD ["./tapspot"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- [Leaflet](https://leafletjs.com/) for interactive maps
- [React Leaflet](https://react-leaflet.js.org/) for React integration
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ by the TapSpot team
