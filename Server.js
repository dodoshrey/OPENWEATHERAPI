const express = require('express');
const path = require("path");
const app = express();
const port = 3000;
let publicPath = path.resolve(__dirname, "public");

app.use(express.static(publicPath));
app.listen(port, () => console.log(`Server is listening on port ${port}!`));
 
const fetch = require("node-fetch");                                            // API CALL
const APIkey = "0c73e0761fdd918f29bf3a63c6f0c6c7";                              // API KEY

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/Client.html"));
});
app.get("/weather/:location", Weathercheck);

// Main function for getting the weather for the upcoming 5-days
async function Weathercheck(req, res) {
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${req.params.location}&units=metric&appid=${APIkey}`;
    let response = await fetch(url);
    let weatherData = await response.json();

    let packfor, rain, date = '';
    let temp, windSpeed = 0;
    let forecastArray = {
      umbrella : '',
      packfor: '',
      forecastList :[]
    };

    var t = 0;
    for(var index = 0; index < (weatherData.list.length); index++) {
        t = t + weatherData.list[index].main.temp;
    }
    t = t / weatherData.list.length;                                            // Mean temprature
    if (t >= -10 && t <= 10) {                                                  // Tell user what weather their clothes should be packed for
        packfor = "COLD";
    } else if (t > 10 && t <= 20) {
        packfor = "WARM";
    } else {
        packfor = "HOT";
    }
    forecastArray.packfor = "Pack your clothes for " + packfor + " weather.";

    var u = 0;
    for(index = 0; index < (weatherData.list.length); index++) {
        if (weatherData.list[index].rain != undefined) {
            if (JSON.stringify(weatherData).substr(6,5) !== '') {
                u = u + 1;
            }
        }        
    }
    if (u > 10) {
        forecastArray.umbrella = 'You\'ll need an umbrella.';                        // Tell user if they should packfor an umbrella
    } else {
        forecastArray.umbrella = 'No umbrella required.';
    }

    const rain_check = (weatherData) => {
        if (weatherData != undefined) {
            if (JSON.stringify(weatherData).substr(6,5) !== '') {
                rain = parseFloat((JSON.stringify(weatherData)).substr(6,5));       // Converts rain(in mm) to a string
            } 
        } else { 
            rain = 'No rain';
        }
        return rain;
    }

    for(index = 0; index < (weatherData.list.length); index++) {
        date = weatherData.list[index].dt_txt;
        temp = weatherData.list[index].main.temp;
        rain = rain_check(weatherData.list[index].rain);
        windSpeed = weatherData.list[index].wind.speed;

        forecastArray.forecastList.push(
            {
                Date: date,
                Temp: temp,
                Rainfall: rain,
                Windspeed: windSpeed
            }
        );
    }
    res.json(forecastArray);                                                    // returns JSON of forecast to be printed on screen 
}