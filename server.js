require('dotenv').config();

const express = require('express');
const {hostname, port} = require('./config/server.config');
const voip = require('./voip');
const db = require('./models');
const routes = require('./routes');

db.sequelize.sync({logging: false})
    .then(() => console.log('Done database sync'))
    .catch(err => {
        console.log('Ошибка синхронизации базы данных');
        console.log(err);
    });

voip.connect()
    .then(() => {
        console.log('Done connect Asterisk');
    })
    .catch(err => {
        console.log('Ошибка подключения к Asterisk');
        console.log(err);
    });


const app = express();

routes(app);

routesSounds(app);

app.listen(port, hostname, () => {
    console.log(`Порт ${port} прослушивается...`);
});

function routesSounds(app) {

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

    app.get('/table', (req, res) => {
        res.download(`${__dirname}/../files/tester.xlsx`);
    });

}