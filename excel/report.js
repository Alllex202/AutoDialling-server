const Excel = require('exceljs');
const path = require('path');
const {Sequelize, sequelize, calls: Call, entries: Entry} = require('../models');
const {Op} = Sequelize;

const columnsReport = [
    {header: 'Офис', key: 'officeAddress', width: 10},
    {header: 'Удалена клиентом', key: 'deleted', width: 10},
    {header: 'Дата и время записи', key: 'datetime', width: 10, style: { numFmt: 'dd.mm.yyyy hh:mm' }},
    {header: 'Услуга', key: 'service', width: 10},
    {header: 'Имя', key: 'firstName', width: 10},
    {header: 'Фамилия', key: 'secondName', width: 10},
    {header: 'Телефон', key: 'phoneNumber', width: 10},
    {header: 'Идентификатор', key: 'identifier', width: 10},
    {header: 'Статус', key: 'status', width: 10},
];

const columnsDetailedInfo = [
    {header: 'Офис', key: 'officeAddress', width: 10},
    {header: 'Удалена клиентом', key: 'deleted', width: 10},
    {header: 'Дата и время записи', key: 'datetime', width: 10, style: { numFmt: 'dd.mm.yyyy hh:mm' }},
    {header: 'Услуга', key: 'service', width: 10},
    {header: 'Имя', key: 'firstName', width: 10},
    {header: 'Фамилия', key: 'secondName', width: 10},
    {header: 'Телефон', key: 'phoneNumber', width: 10},
    {header: 'Идентификатор', key: 'identifier', width: 10},
    {header: 'Количество звонков', key: 'callsCount', width: 10},
    {header: 'Результат', key: 'result', width: 10},
    {header: 'Соединение с оператором', key: 'operatorConnection', width: 10},
];

function exportTableReportFromDB(fromDate, toDate) {
    try {
        Entry
            .findAll({
                include: [{
                    model: Call,
                    attributes: [
                        'callsCount',
                        'result',
                        'operatorConnection',
                    ],
                }],
                where: {
                    datetime: {
                        [Op.gte]: fromDate,
                        [Op.lte]: toDate,
                    }
                },
            })
            .then(entries => {
                exportWorkbook(createReport(entries), 'export.xlsx');
            })
            .catch(err => {
                console.log(`ERROR getting results for report: ${err}`);
            });
    } catch (e) {
        console.log('Error getTableReportFromDB!');
        console.log(e);
    }

    function createReport(entries) {
        const wb = new Excel.Workbook();
        const ws = wb.addWorksheet('Отчет');
        const ws2 = wb.addWorksheet('Подробная информация');

        ws.columns = columnsReport;
        ws2.columns = columnsDetailedInfo;

        for (let entry of entries) {
            addRowReport(ws, entry);
            addRowDetailedInfo(ws2, entry);
        }

        autoWidth(ws);
        autoWidth(ws2);

        return wb;
    }

    function exportWorkbook(wb, pathFile) {
        wb.xlsx.writeFile(pathFile)
            .then(() => {
                console.log('Export SUCCESS!');
            })
            .catch(err => {
                console.log('Export ERROR!');
                console.log(err);
            })
    }

    function addRowReport(ws, entry) {
        ws.addRow({
            officeAddress: entry.officeAddress,
            deleted: entry.deleted,
            datetime: entry.datetime,
            service: entry.service,
            firstName: entry.firstName,
            secondName: entry.secondName,
            phoneNumber: entry.phoneNumber,
            identifier: entry.identifier,
            status: getStatus(entry),
        });

        function getStatus(entry) {
            let status = '';
            if (!entry.call) {
                return status;
            }
            if (entry.call.result === true) {
                status = 'Подтверждено';
            } else if (entry.call.result === false) {
                if (entry.call.operatorConnection) {
                    status = 'Соединено с оператором';
                } else {
                    status = 'Отменено';
                }
            } else {
                status = 'Не определено';
            }
            return status;

        }
    }

    function addRowDetailedInfo(ws, entry) {
        ws.addRow({
            officeAddress: entry.officeAddress,
            deleted: entry.deleted,
            datetime: entry.datetime,
            service: entry.service,
            firstName: entry.firstName,
            secondName: entry.secondName,
            phoneNumber: entry.phoneNumber,
            identifier: entry.identifier,
            callsCount: entry.call?.callsCount,
            result: entry.call?.result,
            operatorConnection: entry.call?.operatorConnection,
        });
    }
}

/**
 * Autofit columns by width
 *
 * @param worksheet {Excel.Worksheet}
 * @param minimalWidth
 */
function autoWidth(worksheet, minimalWidth = 10) {
    worksheet.columns.forEach((column) => {
        let maxColumnLength = 0;
        column.eachCell({includeEmpty: true}, (cell) => {
            maxColumnLength = Math.max(
                maxColumnLength,
                minimalWidth,
                cell.value ? cell.value.toString().length : 0
            );
        });
        column.width = maxColumnLength + 2;
    });
}

// sequelize
//     .sync()
//     .then(() => {
//         console.log('Good sync');
//         exportTableReportFromDB(new Date('2021-06-30 00:00:00'), new Date('2021-06-30 23:59:59'));
//     })
//     .catch(err => {
//         console.log(`Ошибка при синхронизации БД; ${err}`);
//     });

module.exports = exportTableReportFromDB;