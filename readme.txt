Will It Rain On My Parade? (WIRMP)
=================================

Project overview
----------------

"Will It Rain On My Parade?" (WIRMP) is a single-page front-end web application (contained in `index.html`) that provides a compact weather + celestial outlook and a simple event-safety score for a selected location and date. It demonstrates how to combine free weather APIs (Open-Meteo) with simulated environmental datasets (placeholders for NASA datasets) to produce a human-friendly event-safety summary.

Key features
------------

- Location geocoding (free) using Open-Meteo's geocoding API.
- Weather forecast (current + 7-day) using Open-Meteo's forecast API.
- Event Safety Score: a composite percentage (0-100) based on rain probability, wind, UV, and simulated NASA-derived metrics (AOD, snow cover, soil moisture).
- Celestial outlook (sunrise/sunset, moon phase, approximate dark-sky start) computed from forecast data and a simple moon-phase estimator.
- Download capability: the UI can export the last-fetched data as JSON or CSV.
- Lightweight front-end only: uses Tailwind CSS (CDN), Lucide icons (CDN), and an Unsplash background image.

Files
-----

- `index.html` — Complete application: UI markup, styles, and JavaScript logic.
- `readme.txt` — This documentation file.

APIs and external resources used
-------------------------------

1) Open-Meteo (Geocoding)
	 - Purpose: Convert a free-form place name to latitude/longitude (used to fetch weather for the requested location).
	 - Endpoint used in code:
		 `https://geocoding-api.open-meteo.com/v1/search?name={name}&count=1&language=en&format=json`
	 - Required parameters (as used):
		 - `name` — place name (URL-encoded)
		 - `count=1` — return a single best match
	 - Example (request):
		 GET https://geocoding-api.open-meteo.com/v1/search?name=New%20York&count=1&language=en&format=json
	 - Example (important response fields used by app):
		 {
			 "results": [{
				 "id": 5128581,
				 "name": "New York",
				 "latitude": 40.7128,
				 "longitude": -74.0060,
				 "country": "United States",
				 "timezone": "America/New_York"
			 }]
		 }
	 - Notes: Open-Meteo geocoding is public and does not require an API key. Watch for rate limits in heavy use.

2) Open-Meteo (Forecast)
	 - Purpose: Retrieve current and daily/hourly forecast data used for weather summary, cloud cover, UV, precipitation probability, wind, and other fields.
	 - Endpoint used in code:
		 `https://api.open-meteo.com/v1/forecast?...` with query parameters constructed in `fetchRealWeatherForecast`.
	 - Important query parameters typically included by the app (see code):
		 - `latitude`, `longitude` — coordinates from the geocoder
		 - `timezone` — desired timezone for returned timestamps
		 - `hourly` & `daily` — comma-separated lists of requested variables (the app expects certain fields)
		 - `forecast_days=7` — 7-day daily forecast
	 - Example (response fields relied upon by the app):
		 {
			 "latitude": 40.71,
			 "longitude": -74.01,
			 "elevation": 10.0,
			 "timezone": "America/New_York",
			 "current": {
				 "time": "2025-10-05T12:00",
				 "cloud_cover": 45,
				 "relative_humidity_2m": 60
			 },
			 "daily": {
				 "time": ["2025-10-05","2025-10-06", ...],
				 "weather_code": [/* WMO codes */],
				 "temperature_2m_max": [18.5, ...],
				 "temperature_2m_min": [10.1, ...],
				 "precipitation_probability_max": [10, ...],
				 "uv_index_max": [3.5, ...],
				 "rain_sum": [0.0, ...],
				 "sunrise": ["2025-10-05T10:00:00Z", ...],
				 "sunset": ["2025-10-05T22:00:00Z", ...]
			 },
			 "hourly": { /* used for some celestial/dark-sky heuristics */ }
		 }
	 - Notes: Open-Meteo is free to use without authentication and supports many variables. If you change which variables the app requests, update the code that reads those arrays.

3) Tailwind CSS and Lucide Icons (CDNs)
	 - Tailwind: used for rapid styling via the CDN script tag.
	 - Lucide: icon set created via `lucide.createIcons()` in the code.
	 - These are included via external <script> tags in `index.html` and require internet access to load.

4) Unsplash (Background image)
	 - A background image URL from Unsplash is used in CSS for visual style. This is not an API integration — it's a static image URL.

5) NASA datasets (simulated placeholders in code)
	 - The code intentionally contains simulated NASA-derived metrics (AOD, snow cover, soil moisture) in `fetchNasaData(...)` and other helper functions.
	 - These are placeholders so the demo remains fully client-only and works without API keys or server-side proxies.
	 - Recommended real NASA data sources (to replace the placeholders):
		 - Aerosol / AOD: MODIS (MAIAC) Level-2/Level-3 aerosol products; alternatively use NASA Earthdata or MERRA-2 reanalysis aerosol optical depth. Note: MODIS APIs and many NASA services require an Earthdata login or a server-side proxy.
		 - Snow cover: MODIS Snow Cover (MOD10A1), VIIRS snow cover products.
		 - Soil moisture: NASA SMAP Level-2/Level-3 products.
	 - Important: many NASA APIs or data catalogs have authentication, CORS restrictions, or large data payloads; for browser-only apps a server-side component (proxy) or preprocessed tile/summary service is recommended.

How the app uses these APIs (data contract)
-----------------------------------------

The JavaScript in `index.html` expects the following data shapes (these are the minimal fields the app reads):

- Weather (Open-Meteo) — `weatherData` (object)
	- `weatherData.elevation` — number (meters)
	- `weatherData.current` — object with:
		- `cloud_cover` (number, percent)
		- `relative_humidity_2m` (number, percent)
	- `weatherData.daily` — object with parallel arrays:
		- `time` (array of ISO dates: "YYYY-MM-DD")
		- `weather_code` (array of WMO weather codes)
		- `temperature_2m_max` (array of numbers, °C)
		- `temperature_2m_min` (array of numbers, °C)
		- `precipitation_probability_max` or `precipitation_probability_max` (array, percent)
		- `uv_index_max` (array of numbers)
		- `rain_sum` (array of mm)
		- `sunrise`, `sunset` (array of ISO datetimes)
	- `weatherData.hourly` — used for some dark-sky heuristics (times/`is_day` values)

- NASA placeholder data — `nasaData` (object returned by `fetchNasaData`):
	- `airQualityAOD` — number (AOD unitless, e.g., 0.0 - 1.0)
	- `hasSnowCover` — boolean
	- `soilMoisture` — number (0.0 - 1.0)

- Celestial data — `celestialData` (object from `fetchCelestialData`):
	- `sunrise` — string (human-friendly time)
	- `sunset` — string
	- `moonPhase` — string (description + emoji)
	- `darkSkyStart` — string (approximate local time when darkness suitable for stargazing begins)
	- `mainEvent` — string (summary for the night)

Event Safety Score
------------------

The safety score (`calculateEventSafetyScore`) is a deterministic combination of:
- Rain probability (reduces score up to 50 points)
- Max wind (reduces score up to 30 points)
- UV index (reduces score up to 20 points for high UV)
- Air quality (AOD) deduction (max 15)
- Ground conditions: snow or saturated soil (max 20)

Inputs to the function: `(rainProb, maxWind, uvIndex, airQualityAOD, hasSnowCover, soilMoisture)` and it returns `{ score, text }` where `score` is an integer 0-100 and `text` is a short human-readable status.

How to run locally
-------------------

This is a static front-end app. You can open `index.html` directly in a modern browser, but some browsers restrict fetch() from file:// origins. For a reliable local test, run a simple static server in the project directory.

Using Python 3 (PowerShell on Windows):

```powershell
python -m http.server 8000
# Then open http://localhost:8000/index.html in your browser
```

Using VS Code: install and use the "Live Server" extension and open the workspace root, then click "Go Live".

Notes about CORS and browser limitations
---------------------------------------

- Open-Meteo endpoints allow cross-origin requests and are safe to call directly from the browser. Some other APIs (not used directly here) require server-side proxies or API keys.
- NASA data endpoints often require authentication or return large datasets; for production use you'll likely need a backend to authenticate, cache, and pre-aggregate NASA data.

Developer notes & where to look in `index.html`
----------------------------------------------

- Geocoding: `geocodeLocation()` — calls the Open-Meteo geocoding API.
- Weather fetch: `fetchRealWeatherForecast(lat, lon, elevation, startDate)` — constructs an Open-Meteo forecast URL and fetches JSON.
- NASA placeholders: `fetchNasaData(lat, lon, dateValue, weatherData)` — returns simulated `airQualityAOD`, `hasSnowCover`, `soilMoisture` for demo purposes. Replace this function with real API calls if desired.
- Celestial: `fetchCelestialData(dateValue, lat, lon, weatherData)` — simulates moon phase and dark-sky heuristics.
- Download: `downloadData(format)` — compiles `lastWeatherData`, `lastNasaData`, `lastCelestialData`, and `lastSafetyScores` into JSON/CSV for client-side download.

Limitations & recommended next steps
-----------------------------------

1. Replace simulated NASA data with real datasets:
	 - Implement server-side proxies to fetch MODIS/SMAP/Aerosol data or use a third-party service with suitable CORS and practical payloads.
	 - Precompute or request lightweight summary statistics (daily AOD, snow-flag, soil moisture index) rather than raw swath-level products.

2. Add caching and rate-limit handling:
	 - Implement in-memory or disk caching on a backend to avoid repeatedly fetching large datasets.

3. Add tests and type checking:
	 - Split JS into modules, add small unit tests for `calculateEventSafetyScore`, and add TypeScript or JSDoc types to document expected data shapes.

4. Accessibility and localization:
	 - Ensure color contrasts and ARIA labels for screen readers, and allow locale-specific date/time formatting.

5. Packaging and deployment:
	 - Create a minimal server (Node/Express or static hosting) to handle any required API keys or NASA authentication.

Acknowledgements & Licenses
--------------------------

- Weather data provided by Open-Meteo (public/free). Check Open-Meteo terms for commercial use.
- Icons: Lucide (CDN)
- CSS: Tailwind (CDN)
- Unsplash image used as background (see the URL in `index.html`). Respect Unsplash license terms and attribution requirements if publishing.

Contact / Development
---------------------

If you want me to wire up a server-side proxy for NASA datasets, implement real NASA endpoints, or convert the project to a modular JS/TypeScript app with tests and CI, tell me which direction you prefer and I will create a plan and PR-style changes.

----

Generated: Oct 05, 2025 — created to document the current `index.html` implementation and the APIs/resources it uses.

Recent changes (Oct 05, 2025)
----------------------------

This project was updated to fetch and override the temperature shown in the main UI from two additional sources depending on the selected date:

- NASA POWER (historical): for past dates the app fetches hourly temperature from the NASA POWER API and uses that single hourly value to replace the temperature display in `#current-temperature`.
- OpenWeather (forecast): for future dates the app calls the OpenWeather 5-day forecast and picks the nearest forecast hour to the requested datetime to replace `#current-temperature`.

Implementation details
- Two helper functions were added to `index.html`:
	- `fetchTemperatureFromNASA(lat, lon, dateValue, timeValue)` — calls the NASA POWER hourly endpoint (proxied via `https://api.allorigins.win/raw?url=`) and returns an hourly temperature in °C or null if unavailable.
	- `fetchTemperatureFromOpenWeather(lat, lon, dateValue, timeValue)` — calls OpenWeather's 5-day forecast, finds the closest timestamp, and returns the temperature in °C or null.
- The main form handler now attempts a temperature override after fetching the Open-Meteo forecast and the simulated NASA dataset. If either helper returns a valid temperature, the app replaces only the `#current-temperature` text while leaving all other UI elements and scoring logic unchanged.

Important notes and caveats
- NASA POWER calls in the app use a public CORS proxy (`allorigins`) for the demo. This is not suitable for production — run a server-side proxy to avoid reliability and privacy issues.
- The OpenWeather API key is currently read from a string in the script. For production, put the API key on a server and call it from a backend endpoint.
- NASA POWER hourly parameters used: `T2M` (2m temperature). NASA POWER does not directly provide cloud cover in the chosen parameter set; if you want cloud/overcast to be overridden as well, the code can approximate it from humidity/precipitation or request different parameters.

How to test the change locally
1. Start a local static server at the project root (PowerShell):

```powershell
python -m http.server 8000
# Open http://localhost:8000/index.html
```

2. Pick a past date in the date picker and click SEARCH. Check the `#current-temperature` value — it should be replaced by the NASA POWER hourly value (when available). Look in the developer console for any warnings if the proxy fails.

3. Pick a future date and click SEARCH. The `#current-temperature` should show the nearest-hour temperature from OpenWeather's forecast.

If you want me to also override the cloud/overcast summary from NASA-derived proxies or add a secure server-side proxy for NASA/OpenWeather calls, I can implement that next.

