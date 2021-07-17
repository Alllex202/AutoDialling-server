const Excel = require('exceljs');
const path = require('path');

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
                    if (row.getCell(3).value === 'Удалена') {
                        continue;
                    }

                    // write in db
                }
            });


    } catch (e) {
        console.log('Не удалось прочитать таблицу');
        console.log(e);
    }
}

parseTableToDB(path.join(__dirname, '..', '..', 'files', 'testWB.xlsx'));
