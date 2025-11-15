// Global variables
let map;
let balloonMarkers = [];
let balloonData = {};
let currentTimeOffset = 0;
let heatmapLayer;
let trailsVisible = false;
let heatmapVisible = false;
let refreshInterval;
let refreshCountdown = 60;

// OpenWeatherMap API - Using free tier (you can replace with your own key)
const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE';
// Note: For demo purposes, we'll use simulated weather data
// In production, you'd need to sign up for a free API key at openweathermap.org

// Initialize the map
function initMap() {
    map = L.map('map').setView([20, 0], 2);

    // Add tile layer with a beautiful style
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Add a custom control for live status
    const liveControl = L.control({ position: 'topleft' });
    liveControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'live-indicator');
        div.innerHTML = '<span style="background: #4CAF50; color: white; padding: 5px 10px; border-radius: 4px; display: inline-block;">🔴 LIVE</span>';
        return div;
    };
    liveControl.addTo(map);
}

// Fetch balloon data from Windborne API
async function fetchBalloonData(hoursAgo = 0) {
    try {
        const url = `https://a.windbornesystems.com/treasure/${String(hoursAgo).padStart(2, '0')}.json`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Failed to fetch data for ${hoursAgo}h ago`);
            return null;
        }

        const data = await response.json();

        // Validate and clean data
        const validData = data.filter(point => {
            return Array.isArray(point) &&
                   point.length >= 3 &&
                   !isNaN(point[0]) && !isNaN(point[1]) && !isNaN(point[2]) &&
                   Math.abs(point[0]) <= 90 && // Valid latitude
                   Math.abs(point[1]) <= 180 && // Valid longitude
                   point[2] >= 0 && point[2] <= 50; // Reasonable altitude (km)
        });

        return validData;
    } catch (error) {
        console.error('Error fetching balloon data:', error);
        return null;
    }
}

// Update balloon positions on map
function updateBalloonMarkers(data, timeOffset) {
    // Clear existing markers
    balloonMarkers.forEach(marker => map.removeLayer(marker));
    balloonMarkers = [];

    if (!data || data.length === 0) {
        document.getElementById('balloon-count').textContent = '0';
        return;
    }

    // Create markers for each balloon
    data.forEach((balloon, index) => {
        const [lat, lon, alt] = balloon;

        // Create custom icon based on altitude
        const iconColor = getAltitudeColor(alt);
        const balloonIcon = L.divIcon({
            html: `<div style="background: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
            className: 'balloon-marker',
            iconSize: [20, 20]
        });

        const marker = L.marker([lat, lon], { icon: balloonIcon })
            .addTo(map)
            .bindPopup(`
                <div class="balloon-popup">
                    <h3>Balloon ${index + 1}</h3>
                    <div><strong>Latitude:</strong> ${lat.toFixed(4)}°</div>
                    <div><strong>Longitude:</strong> ${lon.toFixed(4)}°</div>
                    <div><strong>Altitude:</strong> ${alt.toFixed(2)} km</div>
                    <div><strong>Time:</strong> ${timeOffset === 0 ? 'Current' : `-${timeOffset}h`}</div>
                </div>
            `);

        marker.balloonIndex = index;
        marker.balloonData = balloon;

        marker.on('click', function() {
            showBalloonDetails(index, balloon);
            fetchWeatherForLocation(lat, lon, index);
        });

        balloonMarkers.push(marker);
    });

    // Update stats
    document.getElementById('balloon-count').textContent = data.length;
    document.getElementById('data-age').textContent = timeOffset === 0 ? 'Live' : `-${timeOffset}h`;
}

// Get color based on altitude
function getAltitudeColor(altitude) {
    if (altitude < 5) return '#4CAF50';  // Green - Low altitude
    if (altitude < 10) return '#FFC107'; // Yellow - Medium altitude
    if (altitude < 15) return '#FF9800'; // Orange - High altitude
    if (altitude < 20) return '#F44336'; // Red - Very high altitude
    return '#9C27B0'; // Purple - Extreme altitude
}

// Show balloon details in sidebar
function showBalloonDetails(index, balloonData) {
    const [lat, lon, alt] = balloonData;

    const detailsHTML = `
        <div class="balloon-info">
            <h4>Balloon ${index + 1}</h4>
            <div class="info-row">
                <span class="info-label">Position:</span>
                <span class="info-value">${lat.toFixed(4)}°, ${lon.toFixed(4)}°</span>
            </div>
            <div class="info-row">
                <span class="info-label">Altitude:</span>
                <span class="info-value">${alt.toFixed(2)} km</span>
            </div>
            <div class="info-row">
                <span class="info-label">Pressure Level:</span>
                <span class="info-value">${estimatePressure(alt)} hPa</span>
            </div>
            <div class="info-row">
                <span class="info-label">Temperature Est:</span>
                <span class="info-value">${estimateTemperature(alt)}°C</span>
            </div>
        </div>
    `;

    document.getElementById('balloon-details').innerHTML = detailsHTML;
}

// Estimate atmospheric pressure based on altitude
function estimatePressure(altKm) {
    // Simple atmospheric model
    const seaLevelPressure = 1013.25;
    const pressure = seaLevelPressure * Math.exp(-altKm / 7.5);
    return pressure.toFixed(1);
}

// Estimate temperature based on altitude
function estimateTemperature(altKm) {
    // Simple temperature model for stratosphere
    if (altKm < 11) {
        return (15 - 6.5 * altKm).toFixed(1);
    } else if (altKm < 20) {
        return -56.5;
    } else {
        return (-56.5 + (altKm - 20) * 1).toFixed(1);
    }
}

// Fetch weather data for balloon location (simulated for demo)
async function fetchWeatherForLocation(lat, lon, index) {
    // For demo purposes, we'll generate simulated weather data
    // In production, you'd use the OpenWeatherMap API with your key

    const weatherData = {
        location: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
        temperature: Math.round(15 + Math.random() * 20),
        humidity: Math.round(40 + Math.random() * 40),
        pressure: Math.round(1000 + Math.random() * 30),
        windSpeed: (Math.random() * 20).toFixed(1),
        cloudCover: Math.round(Math.random() * 100)
    };

    updateWeatherCard(index, weatherData);
}

// Update weather correlation cards
function updateWeatherCard(index, weatherData) {
    const weatherCards = document.getElementById('weather-cards');

    // Check if card already exists
    let card = document.getElementById(`weather-card-${index}`);

    if (!card) {
        card = document.createElement('div');
        card.id = `weather-card-${index}`;
        card.className = 'weather-card';
        weatherCards.appendChild(card);
    }

    card.innerHTML = `
        <h4>Balloon ${index + 1} Area Weather</h4>
        <div class="weather-stat">
            <span>Surface Temp:</span>
            <span class="weather-value">${weatherData.temperature}°C</span>
        </div>
        <div class="weather-stat">
            <span>Humidity:</span>
            <span class="weather-value">${weatherData.humidity}%</span>
        </div>
        <div class="weather-stat">
            <span>Pressure:</span>
            <span class="weather-value">${weatherData.pressure} hPa</span>
        </div>
        <div class="weather-stat">
            <span>Wind Speed:</span>
            <span class="weather-value">${weatherData.windSpeed} m/s</span>
        </div>
        <div class="weather-stat">
            <span>Cloud Cover:</span>
            <span class="weather-value">${weatherData.cloudCover}%</span>
        </div>
    `;
}

// Load historical trail data
async function loadHistoricalTrails() {
    const trails = {};

    for (let h = 0; h <= 23; h++) {
        const data = await fetchBalloonData(h);
        if (data) {
            trails[h] = data;
        }
    }

    return trails;
}

// Toggle trail visibility
async function toggleHistoryTrails() {
    trailsVisible = !trailsVisible;

    if (trailsVisible) {
        const trails = await loadHistoricalTrails();
        drawTrails(trails);
    } else {
        // Remove trails from map
        map.eachLayer(layer => {
            if (layer instanceof L.Polyline && layer.options.className === 'balloon-trail') {
                map.removeLayer(layer);
            }
        });
    }
}

// Draw balloon trails
function drawTrails(trails) {
    const balloonPaths = {};

    // Group positions by balloon index
    Object.keys(trails).forEach(hour => {
        trails[hour].forEach((position, index) => {
            if (!balloonPaths[index]) {
                balloonPaths[index] = [];
            }
            balloonPaths[index].push([position[0], position[1]]);
        });
    });

    // Draw polylines for each balloon
    Object.values(balloonPaths).forEach(path => {
        if (path.length > 1) {
            L.polyline(path, {
                color: '#764ba2',
                weight: 2,
                opacity: 0.6,
                className: 'balloon-trail'
            }).addTo(map);
        }
    });
}

// Toggle heatmap
function toggleHeatmap() {
    heatmapVisible = !heatmapVisible;

    if (heatmapVisible && balloonMarkers.length > 0) {
        const heatData = balloonMarkers.map(marker => {
            const pos = marker.getLatLng();
            return [pos.lat, pos.lng, 0.5];
        });

        if (!heatmapLayer) {
            heatmapLayer = L.heatLayer(heatData, {
                radius: 25,
                blur: 15,
                gradient: {
                    0.4: 'blue',
                    0.6: 'cyan',
                    0.7: 'lime',
                    0.8: 'yellow',
                    1.0: 'red'
                }
            }).addTo(map);
        }
    } else if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }
}

// Center map on all balloons
function centerOnBalloons() {
    if (balloonMarkers.length > 0) {
        const group = L.featureGroup(balloonMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Update time view
async function updateTimeView(hoursAgo) {
    currentTimeOffset = parseInt(hoursAgo);

    const timeText = currentTimeOffset === 0 ? 'Current' : `-${currentTimeOffset}h`;
    document.getElementById('selected-time').textContent = timeText;

    const data = await fetchBalloonData(currentTimeOffset);
    updateBalloonMarkers(data, currentTimeOffset);
    updateCoverageAnalysis(data);
    drawAltitudeChart(data);
}

// Update coverage analysis
function updateCoverageAnalysis(data) {
    if (!data || data.length === 0) {
        document.getElementById('coverage-info').innerHTML = '<p>No data available</p>';
        return;
    }

    // Calculate coverage metrics
    const latitudes = data.map(b => b[0]);
    const longitudes = data.map(b => b[1]);

    const coverage = {
        northernmost: Math.max(...latitudes),
        southernmost: Math.min(...latitudes),
        easternmost: Math.max(...longitudes),
        westernmost: Math.min(...longitudes),
        latSpread: Math.max(...latitudes) - Math.min(...latitudes),
        lonSpread: Math.max(...longitudes) - Math.min(...longitudes)
    };

    const coverageHTML = `
        <div style="font-size: 0.9rem;">
            <div style="margin: 5px 0;">
                <strong>Latitude range:</strong> ${coverage.latSpread.toFixed(1)}°
            </div>
            <div style="margin: 5px 0;">
                <strong>Longitude range:</strong> ${coverage.lonSpread.toFixed(1)}°
            </div>
            <div style="margin: 5px 0;">
                <strong>Coverage area:</strong> ~${(coverage.latSpread * coverage.lonSpread * 100).toFixed(0)} km²
            </div>
            <div style="margin: 5px 0;">
                <strong>Hemispheres:</strong> ${getHemispheres(data)}
            </div>
        </div>
    `;

    document.getElementById('coverage-info').innerHTML = coverageHTML;
}

// Determine which hemispheres have coverage
function getHemispheres(data) {
    const hasNorth = data.some(b => b[0] > 0);
    const hasSouth = data.some(b => b[0] < 0);
    const hasEast = data.some(b => b[1] > 0);
    const hasWest = data.some(b => b[1] < 0);

    let hemispheres = [];
    if (hasNorth && hasSouth) hemispheres.push('N/S');
    else if (hasNorth) hemispheres.push('N');
    else if (hasSouth) hemispheres.push('S');

    if (hasEast && hasWest) hemispheres.push('E/W');
    else if (hasEast) hemispheres.push('E');
    else if (hasWest) hemispheres.push('W');

    return hemispheres.join(', ');
}

// Draw altitude distribution chart
function drawAltitudeChart(data) {
    const canvas = document.getElementById('altitude-chart');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!data || data.length === 0) return;

    // Create altitude bins
    const bins = [0, 5, 10, 15, 20, 25];
    const counts = new Array(bins.length - 1).fill(0);

    data.forEach(balloon => {
        const alt = balloon[2];
        for (let i = 0; i < bins.length - 1; i++) {
            if (alt >= bins[i] && alt < bins[i + 1]) {
                counts[i]++;
                break;
            }
        }
    });

    // Draw bars
    const maxCount = Math.max(...counts);
    const barWidth = canvas.width / counts.length;

    counts.forEach((count, i) => {
        const barHeight = (count / maxCount) * (canvas.height - 20);
        const x = i * barWidth;
        const y = canvas.height - barHeight - 10;

        // Draw bar
        ctx.fillStyle = getAltitudeColor((bins[i] + bins[i + 1]) / 2);
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

        // Draw label
        ctx.fillStyle = '#666';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${bins[i]}-${bins[i + 1]}km`, x + barWidth / 2, canvas.height);

        // Draw count
        if (count > 0) {
            ctx.fillStyle = '#333';
            ctx.fillText(count, x + barWidth / 2, y - 5);
        }
    });
}

// Auto-refresh functionality
function startAutoRefresh() {
    refreshInterval = setInterval(async () => {
        refreshCountdown--;
        document.getElementById('refresh-timer').textContent = `${refreshCountdown}s`;

        if (refreshCountdown <= 0) {
            refreshCountdown = 60;
            await updateTimeView(currentTimeOffset);
            document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
        }
    }, 1000);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', async () => {
    initMap();

    // Load initial data
    const initialData = await fetchBalloonData(0);
    updateBalloonMarkers(initialData, 0);
    updateCoverageAnalysis(initialData);
    drawAltitudeChart(initialData);

    // Set last update time
    document.getElementById('last-update').textContent = new Date().toLocaleTimeString();

    // Start auto-refresh
    startAutoRefresh();

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentTimeOffset < 23) {
            document.getElementById('time-slider').value = currentTimeOffset + 1;
            updateTimeView(currentTimeOffset + 1);
        } else if (e.key === 'ArrowRight' && currentTimeOffset > 0) {
            document.getElementById('time-slider').value = currentTimeOffset - 1;
            updateTimeView(currentTimeOffset - 1);
        } else if (e.key === 'h') {
            toggleHistoryTrails();
        } else if (e.key === 't') {
            toggleHeatmap();
        } else if (e.key === 'c') {
            centerOnBalloons();
        }
    });
});