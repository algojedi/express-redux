const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')))

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'))
})

const key = '8a0b62877ddc2d6904b6b5df35fa49fd';
let url = 'https://api.openweathermap.org/data/2.5/weather?'; //current weather
let url2 = 'https://api.openweathermap.org/data/2.5/forecast?'; //current weather


app.get('/api', (req, res) => {

    const userCity = req.query.city;
    const getMetric = req.query.units === 'metric' ? '&units=metric' : '&units=imperial';
    
    fetch(url + 'q=' + userCity + '&appid=' + key + getMetric)
        .then(response => response.json())
        .then(json => res.send(json))
        .catch (err => console.log('there was an error fetching from weather data 1 day'));
}); 

app.get('/5day', (req, res) => {

    const userCity = req.query.city;
    const getMetric = req.query.units === 'metric' ? '&units=metric' : '&units=imperial';

    fetch(url2 + 'q=' + userCity + '&appid=' + key + getMetric)
        .then(resp => resp.json()) // Convert data to json
        .then(json => res.send(json))
        .catch(err => console.log('there was an error fetching from weather data 5 day'));
}); 


// Choose the port and start the server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Mixing it up on port ${PORT}`)
})