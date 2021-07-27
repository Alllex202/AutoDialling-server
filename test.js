const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const url = 'https://admin2.jefile.fr/api/report/downloadAppointments?endDate=1627379427536&lineId=10125&shopId=7&startDate=1627293027536&term=123';
fetch(url, {
    method: 'GET',
    headers: {
        Cookie: 'SID=510afe25-5e53-408a-923d-e514328720df'
    },
})
    .then(res => {
        const fileStream = fs.createWriteStream(path.join(__dirname, 'install' + Date.now().toString() + '.xlsx'));
        const download = () => new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on('error', reject);
            fileStream.on('finish', resolve);
        });
        download()
            .then(() => {
                console.log('Download done');
            })
            .catch((err) => {
                console.log('err', err);
            })
    })
    .catch(err => console.log(err.status));