 // 默认查询合肥市的天气信息
    var city = '合肥';
    var url = 'https://restapi.amap.com/v3/weather/weatherInfo?key=5adf0a4fe6040268c8f5dbed90e67a4a&city=' + city;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.status === '1') {
          displayWeather(data.lives[0]);
        } else {
          document.getElementById('weatherInfo').innerText = '未找到合肥市的天气信息';
        }
      })
      .catch(error => {
        console.error('获取天气信息时出错:', error);
        document.getElementById('weatherInfo').innerText = '获取天气信息时出错';
      });

    function displayWeather(weatherData) {
      var weatherInfoDiv = document.getElementById('weatherInfo');
      weatherInfoDiv.innerHTML = `
	<img src="./assets/weather/${weatherData.weather}.png" alt="${weatherData.weather}" class="weather-icon"><span>${weatherData.temperature}℃</span>
      `;
	  
    }
