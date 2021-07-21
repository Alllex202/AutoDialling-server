const express = require('express');
const path = require('path');

const port = process.env.PORT_AUTODIALLING || 3000;
const hostname = '10.0.0.2';
const app = express();

app.use(express.static(__dirname + 'sounds/'));

app.get('/test', (req, res) => {
    res.download(`${__dirname}/sounds/test.g722`, 'test.g722');
});

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port} прослушивается...`);
});
