const Excel = require('exceljs');
const path = require('path');
const {sequelize, entries: Entry, calls: Call} = require('../models');

async function parseTableToDB(file) {
    return new Promise((resolve, reject) => {
        const wb = new Excel.Workbook();
        wb.xlsx.readFile(file)
            .then(async wb => {
                await readWorkbook(wb);
                resolve();
            })
            .catch(err => {
                console.log('Не удалось прочитать таблицу', err);
                reject(err);
            });
    });
}

async function readWorkbook(wb) {
    const ws = wb.worksheets.find(el => el.name === 'Записи');
    const indexRowHeader = 5;

    const headerRow = ws.getRow(indexRowHeader);
    if (!(headerRow.cellCount === 21
        && headerRow.getCell(1).value === 'Офис'
        && headerRow.getCell(21).value === 'Идентификатор')) {
        throw new Error('Проверка заголовков завершилась неудачно');
    }

    const countRows = ws.lastRow.getCell(4).value.result;
    if (!countRows || countRows === 0) {
        throw new Error('Записи в таблице отсутствуют');
    }

    for (let i = 1; i <= countRows; i++) {
        // console.log(i)
        const row = ws.getRow(indexRowHeader + i);

        // if (row.getCell(3).value === 'Удалена') {
        //     continue;
        // }

        const entry = {
            officeAddress: row.getCell(1).value,
            deleted: row.getCell(3).value === 'Удалена',
            datetime: row.getCell(4).value,
            service: row.getCell(8).value,
            firstName: row.getCell(15).value,
            secondName: row.getCell(16).value,
            phoneNumber: row.getCell(18).value,
            identifier: row.getCell(21).value,
        };

        await writeEntryToDB(entry, countRows, i);
        // console.log('id ' + i)
    }
}

async function writeEntryToDB(entry, countRows, i) {
    return new Promise((resolve, reject) => {
        // console.log('writeEntryToDB ', i)
        Entry
            .create(entry, {logging: false})
            .then(entry => {
                // console.log(`Запись ${i} из ${countRows}`);
                // console.log(`PHONE_NUMBER: ${entry.phoneNumber}`)
                // console.log('Entry ', i)
                if (entry.deleted || !entry.phoneNumber) {
                    resolve();
                    return;
                }
                Call
                    .create({
                        entryId: entry.id,
                    }, {logging: false})
                    .then(() => {
                        // console.log('Call ', i)
                        // console.log(`Звонок ${i} из ${countRows}`);
                        resolve();
                    })
                    .catch(err => {
                        // console.log(`Ошибка звонка ${i}: ${err}`);
                        reject(err);
                    });
            })
            .catch(err => {
                // console.log(`Ошибка записи ${i}: ${err}`);
                reject(err);
            });
    });
}

module.exports.parseTableToDB = parseTableToDB;

// sequelize
//     .sync()
//     .then(() => {
//         console.log('Good sync');
//         parseTableToDB(path.join(__dirname, '..', '..', 'files', 'testWB.xlsx'));
//     })
//     .catch(err => {
//         console.log(`Ошибка при синхронизации БД; ${err}`);
//     });
