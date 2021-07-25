module.exports = (app) => {
    // use controllers

    const api = require('./api');

    api(app);
};