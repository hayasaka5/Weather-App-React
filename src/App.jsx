import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import cloud from './assets/cloud.png';
import clear from './assets/clear.png';
import drizzle from './assets/drizzle.png';
import mist from './assets/cloud.png';
import rain from './assets/rain.png';
import sand from './assets/sand.png';
import snow from './assets/snow.png';
import thunderstorm from './assets/thunderstorm.png';
import sunRain from './assets/sunRain.png';
import tornado from './assets/tornado.png';
import blue from './assets/blue.png';
import moreBlue from './assets/moreBlue.png';
import defaultBackground from './assets/default.png';
import mobileDefaulght from './assets/mobileDefaulght.png'; // мобильный фон

function App() {
  const [location, setLocation] = useState({ latitude: null, longitude: null, name: '' });
  const [weather, setWeather] = useState([]);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [error, setError] = useState(null);
  const [background, setBackground] = useState(defaultBackground);
  const [temperatureText, setTemperatureText] = useState("It's hot.");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          const apiKey = 'xd';
          const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
          
          fetch(url)
            .then((response) => { 
              if (!response.ok) {
                throw new Error(`Error fetching weather data: HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              const dailyWeather = {};

              setLocation(prevState => ({
                ...prevState,
                name: data.city.name
              }));

              const temp = Math.round(data.list[0].main.temp); 
              setCurrentTemp(temp);

              updateTemperatureText(temp);
              updateBackground(temp, isMobile);

              data.list.forEach(forecast => {
                const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
                const main = forecast.weather[0].main.toLowerCase();
                const description = forecast.weather[0].description;

                if (!dailyWeather[date]) {
                  dailyWeather[date] = { icons: [], temps: [], descriptions: [] };
                }

                dailyWeather[date].icons.push(main);
                dailyWeather[date].temps.push(forecast.main.temp);
                dailyWeather[date].descriptions.push(description);
              });

              for (const date in dailyWeather) {
                const temps = dailyWeather[date].temps;
                const minTemp = Math.round(Math.min(...temps));
                const maxTemp = Math.round(Math.max(...temps));
                const avgTemp = Math.round(temps.reduce((sum, temp) => sum + temp, 0) / temps.length);
                const mainWeather = dailyWeather[date].icons[0];
                const mainDescription = dailyWeather[date].descriptions[0];

                dailyWeather[date] = {
                  icon: getWeatherIcon(mainWeather),
                  temp: {
                    min: minTemp,
                    max: maxTemp,
                    avg: avgTemp
                  },
                  description: mainDescription
                };
              }

              setWeather(Object.entries(dailyWeather));
              setError(null);
            })
            .catch(error => setError(error.message));
        },
        (error) => setError(error.message)
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, [isMobile]);

  const getWeatherIcon = (main) => {
    switch (main) {
      case 'clear':
        return clear;
      case 'clouds':
        return cloud;
      case 'drizzle':
        return drizzle;
      case 'mist':
      case 'haze':
      case 'fog':
        return mist;
      case 'rain':
        return rain;
      case 'sunRain':
        return sunRain;
      case 'sand':
      case 'dust':
      case 'ash':
        return sand;
      case 'snow':
        return snow;
      case 'thunderstorm':
        return thunderstorm;
      case 'tornado':
      case 'squall':
        return tornado;
      default:
        return cloud;
    }
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const updateTemperatureText = (temp) => {
    if (temp <= 10) {
      setTemperatureText("It's cold.");
    } else if (temp <= 20) {
      setTemperatureText("It's warm.");
    } else {
      setTemperatureText("It's hot.");
    }
  };

  const updateBackground = (temp, isMobile) => {
    let backgroundImage;
    if (temp <= 10) {
      backgroundImage = isMobile ? mobileDefaulght : blue;
    } else {
      backgroundImage = isMobile ? mobileDefaulght : defaultBackground;
    }
    setBackground(backgroundImage);
  };

  return (
    <div className={styles.app} style={{ backgroundImage: `url(${background})` }}>
      <div className={styles.top}>
        <a className={styles.topText}>{temperatureText}</a>
        <div className={styles.topLocation}>
          {error ? (
            <p>Error: {error}</p>
          ) : weather.length === 0 ? (
            <p>Getting location...</p>
          ) : (
            <div>{location.name}</div>
          )}
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.bottomDayWrap}>
          {weather.map(([date, day], index) => (
            <div key={index} className={styles.bottomDay}>
              <img src={day.icon} alt={day.description} />
              <div>
                <div className={styles.dayDescription}>
                  {day.description.charAt(0).toUpperCase() + day.description.slice(1)}
                </div>
                <div className={styles.dayTemp}>
                  {day.temp.min}°C/{day.temp.max}°C/{day.temp.avg}°C
                  <br />
                  min/max/avg
                </div>
              </div>
              <div className={styles.currentDay}>{getDayName(new Date(date))}</div>
            </div>
          ))}
        </div>
        <div className={styles.currentTemp}>
          {currentTemp !== null ? `${currentTemp}°C` : 'N/A'}
        </div>
        <div className={styles.topLocationMobile}>
          {error ? (
            <p>Error: {error}</p>
          ) : weather.length === 0 ? (
            <p>Getting location...</p>
          ) : (
            <div>{location.name}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
