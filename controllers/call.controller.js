const fetch = require('node-fetch');
const fs = require('fs');
const path = require("path");
const voip = require('../voip');
const {attemptedCalls, delaysBetweenCallsSec} = require('../config/voip.config');
const {parseTableToDB, exportTableReportFromDB} = require('../excel');
const {sendMail} = require('../email');
const {calls: Call, entries: Entry, Sequelize} = require('../models');
const {Op} = Sequelize;

module.exports.startCalling = (req, res) => {
    console.log('startCalling');

    const tomorrow = new Date('2021-06-29');
    // console.log(tomorrow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const fromDate = new Date(`${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()} 06:00:00`);
    fromDate.setHours(fromDate.getHours() + 5);
    const toDate = new Date(`${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()} 18:59:59`);
    toDate.setHours(toDate.getHours() + 5);
    let filenameImport = '';

    getTable()
        .then(res => {
            console.log('response', res);
            return downloadFile(res);
        })
        .then(filename => {
            console.log('Файл скачали:', filename);
            filenameImport = filename;
            return parseTableToDB(path.join(__dirname, '..', '..', 'files', filename));
        })
        .then(() => {
            console.log('Parse DONE');
            return callingOnList(fromDate, toDate);
        })
        .then(() => {
            console.log('Calling DONE!');
            return exportTableReportFromDB(fromDate, toDate,
                path.join(__dirname, '..', '..', 'files', `${filenameImport.split('.')[0]}-export.xlsx`));
        })
        .then(pathFileExport => {
            console.log('Таблица экспортирована:', pathFileExport);
            return sendMail({
                to: process.env.EMAIL_EXPORT_TO,
                subject: 'Отчет по обзвону списка',
                context: `Отчет по обзвону списка на ${tomorrow.getDate()}-${tomorrow.getMonth() + 1}-${tomorrow.getFullYear()}`,
                files: [{
                    filename: 'report.xlsx',
                    path: pathFileExport,
                }],
            });
        })
        .then(() => {
            console.log('Письмо отправлено');
        })
        .catch(err => {
            console.log('Error calling:', err);
            sendMail({
                to: process.env.EMAIL_EXPORT_TO,
                subject: 'Отчет по обзвону списка',
                context: `<p>Произошла ошибка при обзвоне списка на ${tomorrow.getDate()}-${tomorrow.getMonth() + 1}-${tomorrow.getFullYear()}</p>
<br>
<h2>Error</h2>
<p>${err}</p>`,
            })
                .then(() => {
                    console.log('Отправлено письмо об ошибке');
                })
                .catch(err => {
                    console.log('Ошибка отправки письма об ошибке :', err);
                });
        });

    res.send('Процесс обзвона запущен');
};

function downloadFile(res) {
    const filename = `install${Date.now().toString()}.xlsx`;
    const fileStream = fs.createWriteStream(path.join(__dirname, '..', '..', 'files', filename));
    return new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on('error', (err) => reject(err));
        fileStream.on('finish', () => resolve(filename));
    });
}

function getTable(startDate, endDate, term = '', lineId = 10125, shopId = 7) {
    // const url = `${process.env.GET_TABLE_URL}?endDate=${endDate}&lineId=${lineId}&shopId=${shopId}&startDate=${startDate}&term=${term}`;
    // return fetch(url, {
    //     method: 'GET',
    //     headers: {
    //         Cookie: process.env.GET_TABLE_TOKEN,
    //     },
    // });

    // for test
    return fetch(`http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/table`, {
        method: 'GET'
    });
}

async function callingOnList(fromDate, toDate) {
    return new Promise((resolve, reject) => {
        console.log('callingOnList');
        let answersCount = 0;
        Entry
            .findAll({
                include: [{
                    model: Call,
                    where: {
                        callsCount: {
                            [Op.lt]: attemptedCalls,
                        },
                        result: {
                            [Op.is]: null,
                        },
                    },
                }],
                attributes: [
                    'id',
                    'datetime',
                    'phoneNumber',
                    'firstName',
                    'secondName',
                    'deleted',
                ],
                where: {
                    datetime: {
                        [Op.gte]: fromDate,
                        [Op.lte]: toDate,
                    },
                },
                logging: false,
            })
            .then(entries => {
                console.log('Сделал поиск')
                if (entries.length === 0) {
                    console.log('Length 0')
                    resolve();
                    // callback();
                    return;
                }

                for (let entry of entries) {
                    console.log(entry.id, entry.datetime, entry.phoneNumber, entry.firstName, entry.secondName,
                        entry.deleted, entry.call.id, entry.call.callsCount,
                        entry.call.result, entry.call.operatorConnection);
                    console.log('Очередь на номер', entry.phoneNumber);
                    voip
                        .callTo(entry.phoneNumber, entry.datetime.getHours(), entry.datetime.getMinutes())
                        .then(res => {
                            console.log('Позвонил на номер', entry.phoneNumber, 'result:', res);
                            Call.update(
                                {
                                    callsCount: entry.call.callsCount + 1,
                                    result: res.res.result,
                                    operatorConnection: res.res.operator,
                                },
                                {
                                    where: {
                                        id: entry.call.id,
                                    },
                                    logging: false,
                                })
                                .then(() => {
                                    console.log('Изменил БД');

                                    if (res.res.result === true || res.res.result === false) {
                                        answersCount++;
                                    }

                                    if (res.isLast) {
                                        console.log('Последний в списке');

                                        if (entries.length === answersCount) {
                                            console.log('Колчичество в списке совпадает с количеством ответов');
                                            resolve();
                                        } else {
                                            console.log('Через N секунд запустим обзвон повторно');
                                            setTimeout(() => {
                                                console.log('Запускаем обзвон снова');
                                                callingOnList(fromDate, toDate)
                                                    .then(() => {
                                                        resolve();
                                                    })
                                                    .catch(err => {
                                                        reject(err);
                                                    });
                                            }, delaysBetweenCallsSec * 1000);
                                        }
                                    }
                                })
                                .catch(err => {
                                    reject(err);
                                    // throw err;
                                });
                        })
                        .catch(err => {
                            reject(err);
                            // throw err;
                        });
                }
                // console.log(res.length);
            })
            .catch(err => {
                // console.log(err);
                reject(err);
                // throw err;
            });
    });
}

// /**
//  *
//  * @param phoneNumber {string}
//  * @param hours {number}
//  * @param minutes {number}
//  * @param callback {null | function}
//  */
// function call(phoneNumber, hours, minutes, callback = null) {
//     voip
//         .callTo(phoneNumber, hours, minutes)
//         .then(res => {
//             console.log(`RESULT:`, res);
//             callback && callback(res);
//         });
// }
