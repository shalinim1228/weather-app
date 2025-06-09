const apiKey = '893f2695964c1797a75f8686740e11ba';
const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const locationDiv = document.getElementById('location');
const datetimeDiv = document.getElementById('datetime');
const tempDiv = document.getElementById('temp');
const descDiv = document.getElementById('desc');
const humidityDiv = document.getElementById('humidity');
const precipitationDiv = document.getElementById('precipitation');
const windDiv = document.getElementById('wind');
const weatherIcon = document.getElementById('weather-icon');
const errorDiv = document.getElementById('error');
const locationBtn = document.getElementById('location-btn');

function formatDateTime(dt) {
  const date = new Date(dt * 1000);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const day = days[date.getDay()];
  const time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  return `${time} | ${day}`;
}

function cToF(c) {
  return (c * 9/5 + 32).toFixed(1);
}

function showWeather(data) {
  locationDiv.textContent = `${data.name}, ${data.sys.country}`;
  datetimeDiv.textContent = formatDateTime(data.dt);
  const tempC = data.main.temp;
  const tempF = cToF(tempC);
  tempDiv.textContent = `${Math.round(tempC)}°C | ${tempF}°F`;
  descDiv.textContent = data.weather[0].description;
  humidityDiv.textContent = `Humidity: ${data.main.humidity}%`;
  windDiv.textContent = `Wind Speed: ${data.wind.speed} km/h`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  weatherIcon.style.display = 'block';
  weatherIcon.alt = data.weather[0].description;
  // Precipitation: OpenWeatherMap's "rain" or "snow" may be undefined
  let precipitation = 0;
  if (data.rain && data.rain['1h']) precipitation = data.rain['1h'];
  else if (data.snow && data.snow['1h']) precipitation = data.snow['1h'];
  precipitationDiv.textContent = `Precipitation: ${precipitation}%`;
  errorDiv.style.display = 'none';
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

async function getWeatherByCity(city) {
  errorDiv.style.display = 'none';
  weatherIcon.style.display = 'none';
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    if (data.cod !== 200) {
      throw new Error(data.message);
    }
    showWeather(data);
  } catch (err) {
    showError('City not found. Please try again.');
  }
}

async function getWeatherByCoords(lat, lon) {
  errorDiv.style.display = 'none';
  weatherIcon.style.display = 'none';
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    if (data.cod !== 200) {
      throw new Error(data.message);
    }
    showWeather(data);
  } catch (err) {
    showError('Unable to get weather for your location.');
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    getWeatherByCity(city);
  }
});

locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        showError('Unable to access your location.');
      }
    );
  } else {
    showError('Geolocation is not supported by your browser.');
  }
}); 