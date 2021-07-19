const Excel = require('exceljs');
const path = require('path');
const {sequelize, entries: Entry, calls: Call} = require('../models');

function parseTableToDB(file) {
    try {
        const wb = new Excel.Workbook();
        wb.xlsx.readFile(file)
            .then(wb => {
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

                    Entry
                        .create(entry)
                        .then(entry => {
                            console.log(`Запись ${i} из ${countRows}`);
                            console.log(`PHONE_NUMBER: ${entry.phoneNumber}`)
                            if (entry.deleted || !entry.phoneNumber) {
                                return;
                            }
                            Call
                                .create({
                                    entryId: entry.id,
                                })
                                .then(() => {
                                    console.log(`Звонок ${i} из ${countRows}`);
                                })
                                .catch(err => {
                                    console.log(`Ошибка звонка ${i}: ${err}`);
                                });
                        })
                        .catch(err => {
                            console.log(`Ошибка записи ${i}: ${err}`);
                        });

                    // const entry = new Entry(
                    //     row.getCell(1).value,
                    //     row.getCell(4).value,
                    //     row.getCell(8).value,
                    //     row.getCell(15).value,
                    //     row.getCell(16).value,
                    //     row.getCell(18).value,
                    //     row.getCell(21).value,
                    // );
                    // console.log(`Запись ${i} из ${countRows}`);
                    //
                    // entry.add();
                }
            });
    } catch (e) {
        console.log('Не удалось прочитать таблицу');
        console.log(e);
    }
}

module.exports = parseTableToDB;

sequelize
    .sync()
    .then(() => {
        console.log('Good sync');
        parseTableToDB(path.join(__dirname, '..', '..', 'files', 'testWB.xlsx'));
    })
    .catch(err => {
        console.log(`Ошибка при синхронизации БД; ${err}`);
    });
