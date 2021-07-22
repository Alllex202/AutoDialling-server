const express = require('express');
const path = require('path');
const {hostname, port} = require('./config/server.config');
const callTo = require('./voip');

// const port = serverConfig.port;
// const hostname = serverConfig.host;
const app = express();

// app.use(express.static(__dirname + 'sounds/'), (res, req) => {});

app.get('/1', (req, res) => {
    res.download(`${__dirname}/sounds/alaw.wav`, '1.wav');
});

app.get('/2', (req, res) => {
    res.download(`${__dirname}/sounds/default.mp3`, '2.mp3');
});

app.get('/3', (req, res) => {
    res.download(`${__dirname}/sounds/g722.g722`, '3.g722');
});

app.get('/4', (req, res) => {
    res.download(`${__dirname}/sounds/g729.g729`, '4.g729');
});

app.get('/5', (req, res) => {
    res.download(`${__dirname}/sounds/high.wav`, '5.wav');
});

app.get('/6', (req, res) => {
    res.download(`${__dirname}/sounds/raw.raw`, '6.raw');
});

app.get('/7', (req, res) => {
    res.download(`${__dirname}/sounds/standart.wav`, '7.wav');
});

app.get('/8', (req, res) => {
    res.download(`${__dirname}/sounds/ulaw.wav`, '8.wav');
});

app.get('/operator', (req, res) => {
    res.download(`${__dirname}/sounds/operator.wav`, 'operator.wav');
});

app.get('/question', (req, res) => {
    res.download(`${__dirname}/sounds/question.wav`, 'question.wav');
});

app.get('/signal', (req, res) => {
    res.download(`${__dirname}/sounds/signal.wav`, 'signal.wav');
});

app.get('/hello', (req, res) => {
    res.download(`${__dirname}/sounds/hello.wav`, 'hello.wav');
});

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port} прослушивается...`);
    callTo('PJSIP/1010', 12, 30);
    // require('./voip/test.js');
});
