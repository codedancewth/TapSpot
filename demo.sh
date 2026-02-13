#!/bin/bash

# TapSpot Demo Data Generator
# This script adds demo data to the TapSpot application

set -e

echo "🎭 Generating demo data for TapSpot..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
if ! curl -s http://localhost:8080/api/v1/stats > /dev/null; then
    echo -e "${YELLOW}⚠ Backend is not running on localhost:8080${NC}"
    echo "Please start the backend first:"
    echo "  cd backend && go run main.go"
    exit 1
fi

echo -e "${GREEN}✓ Backend is running${NC}"

# Sample data
spots=(
    '{"name":"Tokyo Tower","description":"Communications and observation tower in Tokyo","latitude":35.6586,"longitude":139.7454,"country":"Japan","city":"Tokyo","category":"Attraction"}'
    '{"name":"Big Ben","description":"Iconic clock tower in London","latitude":51.5007,"longitude":-0.1246,"country":"United Kingdom","city":"London","category":"Historical"}'
    '{"name":"Santorini Sunset View","description":"Beautiful sunset spot in Greece","latitude":36.3932,"longitude":25.4615,"country":"Greece","city":"Santorini","category":"Nature"}'
    '{"name":"Times Square","description":"Major commercial intersection in NYC","latitude":40.7580,"longitude":-73.9855,"country":"United States","city":"New York","category":"Urban"}'
    '{"name":"Amazon Rainforest","description":"Largest tropical rainforest","latitude":-3.4653,"longitude":-62.2159,"country":"Brazil","city":"Amazonas","category":"Nature"}'
    '{"name":"Mount Fuji","description":"Iconic volcano in Japan","latitude":35.3606,"longitude":138.7274,"country":"Japan","city":"Shizuoka","category":"Mountain"}'
    '{"name":"Venice Canals","description":"Famous canals in Italy","latitude":45.4408,"longitude":12.3155,"country":"Italy","city":"Venice","category":"Attraction"}'
    '{"name":"Great Barrier Reef","description":"World largest coral reef system","latitude":-18.2871,"longitude":147.6992,"country":"Australia","city":"Queensland","category":"Nature"}'
    '{"name":"Niagara Falls","description":"Famous waterfalls on US-Canada border","latitude":43.0962,"longitude":-79.0377,"country":"Canada","city":"Ontario","category":"Nature"}'
    '{"name":"Dubai Mall","description":"World largest shopping mall","latitude":25.1972,"longitude":55.2793,"country":"United Arab Emirates","city":"Dubai","category":"Shopping"}'
)

reviews=(
    '{"author":"TravelExpert","content":"Absolutely stunning views from the top!","rating":5}'
    '{"author":"LocalGuide","content":"Best visited during weekdays to avoid crowds.","rating":4}'
    '{"author":"PhotographyFan","content":"Perfect spot for sunset photography.","rating":5}'
    '{"author":"FoodLover","content":"Amazing food options nearby.","rating":4}'
    '{"author":"AdventureSeeker","content":"Once in a lifetime experience!","rating":5}'
    '{"author":"NatureLover","content":"Breathtaking natural beauty.","rating":5}'
    '{"author":"HistoryBuff","content":"Rich historical significance.","rating":4}'
    '{"author":"FamilyTraveler","content":"Great for family visits.","rating":4}'
    '{"author":"BudgetTraveler","content":"Worth every penny!","rating":5}'
    '{"author":"SoloTraveler","content":"Safe and enjoyable solo experience.","rating":4}'
)

echo "📍 Adding demo spots..."
spot_ids=()
for spot_data in "${spots[@]}"; do
    response=$(curl -s -X POST http://localhost:8080/api/v1/spots \
        -H "Content-Type: application/json" \
        -d "$spot_data")
    
    if echo "$response" | grep -q '"success":true'; then
        spot_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d: -f2)
        spot_ids+=("$spot_id")
        spot_name=$(echo "$spot_data" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓ Added: $spot_name${NC}"
    else
        echo "Failed to add spot: $spot_data"
    fi
done

echo ""
echo "💬 Adding demo reviews..."
for spot_id in "${spot_ids[@]}"; do
    # Add 2-3 reviews per spot
    for i in {1..3}; do
        review_index=$((RANDOM % ${#reviews[@]}))
        review_data="${reviews[$review_index]}"
        
        curl -s -X POST "http://localhost:8080/api/v1/spots/$spot_id/reviews" \
            -H "Content-Type: application/json" \
            -d "$review_data" > /dev/null
        
        # Random likes
        like_count=$((RANDOM % 20))
        for ((j=0; j<like_count; j++)); do
            curl -s -X POST "http://localhost:8080/api/v1/reviews/$((i))/like" > /dev/null
        done
    done
    echo -e "${GREEN}✓ Added reviews for spot $spot_id${NC}"
done

echo ""
echo "📊 Getting current statistics..."
stats=$(curl -s http://localhost:8080/api/v1/stats)
total_spots=$(echo "$stats" | grep -o '"total_spots":[0-9]*' | cut -d: -f2)
total_reviews=$(echo "$stats" | grep -o '"total_reviews":[0-9]*' | cut -d: -f2)
total_countries=$(echo "$stats" | grep -o '"total_countries":[0-9]*' | cut -d: -f2)

echo ""
echo "🎉 Demo data generation complete!"
echo ""
echo "📈 Current Statistics:"
echo "   Total Spots: $total_spots"
echo "   Total Reviews: $total_reviews"
echo "   Total Countries: $total_countries"
echo ""
echo "🌍 Open your browser to see the demo:"
echo "   http://localhost:3000"
echo ""
echo "💡 Tips:"
echo "- Click anywhere on the map to add new spots"
echo "- Click on markers to view details and reviews"
echo "- Use the search bar to find specific locations"
echo "- Filter by country using the right panel"
echo ""
echo "Enjoy exploring TapSpot! 🗺️"
