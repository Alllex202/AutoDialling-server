module.exports = (app) => {
    // use controllers
    const callController = require('../controllers/call.controller');

    const router = require('express').Router();

    router.post('/startCalling', callController.startCalling);

    app.use('/api', router);
};
