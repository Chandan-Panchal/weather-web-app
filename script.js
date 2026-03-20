/**
 * Weather App - Core Logic
 * Handles API integration, UI updates, and dynamic features.
 */

// --- Configuration ---
const API_KEY = '25c9b0cc1e3acb4ba6fa58fbc7eea7c9'; // Provided by user
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// --- State Management ---
let currentCity = 'New York'; // Default city
let isCelsius = true;
let weatherData = null;

// --- DOM Elements ---
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorText = document.getElementById('errorText');

const cityNameEl = document.getElementById('cityName');
const dateTimeEl = document.getElementById('dateTime');
const weatherIconEl = document.getElementById('weatherIcon');
const temperatureEl = document.getElementById('temperature');
const unitTextEl = document.getElementById('unitText');
const descriptionEl = document.getElementById('description');
const feelsLikeEl = document.getElementById('feelsLike');
const feelsLikeUnitEl = document.getElementById('feelsLikeUnit');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const pressureEl = document.getElementById('pressure');
const visibilityEl = document.getElementById('visibility');
const unitToggle = document.getElementById('unitToggle');

/**
 * Fetch weather data from OpenWeatherMap API
 * @param {string} city 
 */
async function fetchWeather(city) {
    if (!city) return;

    // Show loading state
    showLoading(true);
    hideError();
    hideWeather();

    try {
        const units = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling.');
            } else if (response.status === 401) {
                throw new Error('Invalid API Key. Please update it in script.js.');
            } else {
                throw new Error('An error occurred. Please try again later.');
            }
        }

        const data = await response.json();
        weatherData = data;
        updateUI(data);
    } catch (err) {
        showError(err.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Update UI with fetched weather data
 */
function updateUI(data) {
    const { name, main, weather, wind, sys } = data;
    const condition = weather[0].main;
    const iconCode = weather[0].icon;

    // Update basic info
    cityNameEl.textContent = `${name}, ${sys.country}`;
    updateDateTime();
    
    // Update weather icon
    weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIconEl.alt = weather[0].description;
    
    // Update temperature and units
    temperatureEl.textContent = Math.round(main.temp);
    unitTextEl.textContent = isCelsius ? 'C' : 'F';
    descriptionEl.textContent = condition;
    
    feelsLikeEl.textContent = Math.round(main.feels_like);
    feelsLikeUnitEl.textContent = isCelsius ? 'C' : 'F';
    
    // Update details
    humidityEl.textContent = `${main.humidity}%`;
    windSpeedEl.textContent = `${Math.round(isCelsius ? wind.speed * 3.6 : wind.speed)} ${isCelsius ? 'km/h' : 'mph'}`;
    pressureEl.textContent = `${main.pressure} hPa`;
    visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Update background based on weather
    updateBackground(condition);

    // Show weather card
    showWeather(true);
}

/**
 * Change body background gradient based on weather condition
 */
function updateBackground(condition) {
    document.body.className = ''; // Reset
    const cond = condition.toLowerCase();

    if (cond.includes('clear')) {
        document.body.classList.add('bg-clear');
    } else if (cond.includes('cloud')) {
        document.body.classList.add('bg-clouds');
    } else if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('storm')) {
        document.body.classList.add('bg-rain');
    } else if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze')) {
        document.body.classList.add('bg-mist');
    } else {
        document.body.classList.add('bg-default');
    }
}

/**
 * Update current date and time
 */
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    dateTimeEl.textContent = now.toLocaleDateString('en-US', options);
}

/**
 * Helper: Show/Hide UI sections
 */
function showLoading(show) {
    loading.classList.toggle('hidden', !show);
}

function showError(message) {
    errorText.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function showWeather(show) {
    weatherDisplay.classList.toggle('hidden', !show);
}

function hideWeather() {
    weatherDisplay.classList.add('hidden');
}

// --- Event Listeners ---

searchBtn.addEventListener('click', () => {
    fetchWeather(cityInput.value.trim());
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchWeather(cityInput.value.trim());
    }
});

unitToggle.addEventListener('change', () => {
    isCelsius = !unitToggle.checked;
    // Re-fetch weather to get accurate conversion from API
    if (cityInput.value.trim()) {
        fetchWeather(cityInput.value.trim());
    } else if (weatherData) {
        fetchWeather(weatherData.name);
    }
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch for a default city
    fetchWeather(currentCity);
});