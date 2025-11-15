# Windborne Balloon Constellation Tracker

## Live Atmospheric Monitoring with Weather Correlation

This interactive web application visualizes Windborne's live balloon constellation data combined with simulated weather patterns to provide insights into atmospheric conditions globally.

## Features

- **Real-time Balloon Tracking**: Live positions updated every 60 seconds
- **24-Hour History**: Navigate through the last 24 hours of balloon positions
- **Weather Correlation**: Shows weather conditions at balloon locations
- **Interactive Visualizations**:
  - Trail paths showing balloon movement over time
  - Heatmap of balloon density
  - Altitude distribution charts
  - Coverage analysis

## Why Weather Data Integration?

I chose to integrate weather data (simulated in demo) because balloons provide unique atmospheric measurements at various altitudes, while ground-based weather stations provide complementary surface conditions. This combination allows for:
- Vertical atmospheric profiling when comparing balloon altitude data with surface weather
- Understanding how upper atmosphere conditions relate to ground weather patterns
- Identifying areas where balloon data could improve weather forecasting

## Technical Implementation

- Pure JavaScript with Leaflet.js for mapping
- Fetches live data from Windborne API every 60 seconds
- Robust error handling for corrupted data
- Responsive design for all devices
- Keyboard shortcuts for power users (H: trails, T: heatmap, C: center)

## Local Development

```bash
# Serve locally
python3 -m http.server 8000
# Open http://localhost:8000
```

## API Integration Note

For production deployment with real weather data:
1. Sign up for free OpenWeatherMap API key
2. Replace `YOUR_API_KEY_HERE` in app.js
3. Uncomment the actual API calls (currently using simulated data for demo)