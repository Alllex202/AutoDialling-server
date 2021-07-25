module.exports = (app) => {
    // use controllers

    const router = require('express').Router();

    // router.get('/', )

    app.use('/api', router);
};
