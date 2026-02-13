-- TapSpot Database Initialization Script
-- MySQL 8.0+

-- Create database
CREATE DATABASE IF NOT EXISTS tapspot 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE tapspot;

-- Create spots table (will be auto-created by GORM, but here's the structure)
CREATE TABLE IF NOT EXISTS spots (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    address VARCHAR(500),
    category VARCHAR(50),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_lat_lng (latitude, longitude),
    INDEX idx_country (country),
    INDEX idx_category (category),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    spot_id BIGINT UNSIGNED NOT NULL,
    author VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    images TEXT,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_spot_id (spot_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
INSERT IGNORE INTO spots (name, description, latitude, longitude, country, city, category, rating, review_count) VALUES
('Eiffel Tower', 'Iconic iron tower in Paris', 48.8584, 2.2945, 'France', 'Paris', 'Attraction', 4.7, 12500),
('Statue of Liberty', 'Famous statue in New York Harbor', 40.6892, -74.0445, 'United States', 'New York', 'Attraction', 4.6, 8900),
('Great Wall of China', 'Ancient fortification in China', 40.4319, 116.5704, 'China', 'Beijing', 'Historical', 4.8, 7500),
('Taj Mahal', 'White marble mausoleum in India', 27.1751, 78.0421, 'India', 'Agra', 'Historical', 4.9, 6800),
('Sydney Opera House', 'Performing arts center in Sydney', -33.8568, 151.2153, 'Australia', 'Sydney', 'Attraction', 4.5, 5200),
('Colosseum', 'Ancient amphitheater in Rome', 41.8902, 12.4922, 'Italy', 'Rome', 'Historical', 4.6, 6100),
('Machu Picchu', 'Inca citadel in Peru', -13.1631, -72.5450, 'Peru', 'Cusco', 'Historical', 4.8, 4300),
('Pyramids of Giza', 'Ancient Egyptian pyramids', 29.9792, 31.1342, 'Egypt', 'Giza', 'Historical', 4.7, 3900),
('Burj Khalifa', 'Tallest building in the world', 25.1972, 55.2744, 'United Arab Emirates', 'Dubai', 'Attraction', 4.4, 2800),
('Christ the Redeemer', 'Art Deco statue in Rio', -22.9519, -43.2106, 'Brazil', 'Rio de Janeiro', 'Attraction', 4.5, 3200);

-- Insert sample reviews
INSERT IGNORE INTO reviews (spot_id, author, content, rating, likes) VALUES
(1, 'Traveler123', 'Absolutely breathtaking at night! The light show is magical.', 5, 42),
(1, 'ParisLover', 'A must-visit in Paris. The view from the top is incredible.', 4, 28),
(2, 'NYCVisitor', 'The ferry ride was amazing and the statue is huge!', 5, 35),
(2, 'HistoryBuff', 'Very educational tour. Learned a lot about American history.', 4, 19),
(3, 'AdventureSeeker', 'Hiking the wall was challenging but worth every step.', 5, 56),
(3, 'Photographer', 'Stunning views for photography. Best in the morning.', 4, 31),
(4, 'RomanticTraveler', 'The most beautiful building I have ever seen. Pure love.', 5, 48),
(4, 'ArchitectureFan', 'Incredible craftsmanship and attention to detail.', 5, 27),
(5, 'MusicLover', 'Amazing acoustics inside. Saw a wonderful opera.', 4, 22),
(5, 'SydneyLocal', 'Iconic landmark. The harbor view is spectacular.', 5, 18);

-- Create a user for the application (optional)
CREATE USER IF NOT EXISTS 'tapspot_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON tapspot.* TO 'tapspot_user'@'localhost';
FLUSH PRIVILEGES;

-- Show table information
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'tapspot'
ORDER BY TABLE_NAME;

-- Show sample data
SELECT 
    s.name,
    s.country,
    s.city,
    s.rating,
    s.review_count,
    COUNT(r.id) as actual_reviews
FROM spots s
LEFT JOIN reviews r ON s.id = r.spot_id
GROUP BY s.id
ORDER BY s.rating DESC;
