document.getElementById('search-btn').addEventListener('click', getWeather);
document.getElementById('city-input').addEventListener('keypress', e => e.key === 'Enter' && getWeather());

function getWeather() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) return;
    
    document.getElementById('error-message').classList.add('hide');
    
    fetch(`https://wttr.in/${city}?format=j1`)
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => {
            const current = data.current_condition[0];
            
            document.getElementById('city-name').textContent = data.nearest_area[0].areaName[0].value;
            document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('temperature').textContent = `${current.temp_C}°C`;
            document.getElementById('feels-like').textContent = `Feels like: ${current.FeelsLikeC}°C`;
            document.getElementById('condition').textContent = current.weatherDesc[0].value;
            document.getElementById('humidity').textContent = `${current.humidity}%`;
            document.getElementById('wind').textContent = `${current.windspeedKmph} km/h`;
            document.getElementById('pressure').textContent = `${current.pressure} mb`;
            
            const forecastContainer = document.getElementById('forecast-container');
            forecastContainer.innerHTML = '';
            
            for (let i = 0; i < 3 && i < data.weather.length; i++) {
                const day = data.weather[i];
                const date = new Date(day.date);
                forecastContainer.innerHTML += `
                    <div class="forecast-item">
                        <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        <div class="forecast-temp">${day.avgtempC}°C</div>
                        <div class="forecast-condition">${day.hourly[4].weatherDesc[0].value}</div>
                        <div class="forecast-detail">Humidity: ${day.hourly[4].humidity}%</div>
                        <div class="forecast-detail">Wind: ${day.hourly[4].windspeedKmph} km/h</div>
                    </div>
                `;
            }
        })
        .catch(() => document.getElementById('error-message').classList.remove('hide'));
}

getWeather();
