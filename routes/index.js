const fetch = require('node-fetch');
const {hostname, port} = require('../config/server.config');

module.exports = (app) => {
    // use controllers

    const api = require('./api');

    app
        .get('/test', (req, res) => {
            fetch(`http://${hostname}:${port}/api/startCalling`, {
                method: 'POST',
            })
                .then(() => console.log(1))
                .catch(() => console.log(2));
            res.send('qweewq');
        });

    api(app);
};