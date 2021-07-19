
// class Entry {
//     constructor(officeAddress, datetime, service, firstName, secondName, phoneNumber, identifier) {
//         this.officeAddress = officeAddress;
//         this.datetime = datetime;
//         this.service = service;
//         this.firstName = firstName;
//         this.secondName = secondName;
//         this.phoneNumber = phoneNumber;
//         this.identifier = identifier;
//     }
//
//     add() {
//         const sql = `INSERT INTO entries(office_address, datetime, service, first_name, second_name, phone_number, identifier)
//             VALUES (?, ?, ?, ?, ?, ?, ?);`;
//         const params = [
//             this.officeAddress,
//             this.datetime,
//             this.service,
//             this.firstName,
//             this.secondName,
//             this.phoneNumber,
//             this.identifier
//         ];
//         db.query(sql, params, (err, results) => {
//             if (err) {
//                 return console.error(`Ошибка добавление новой записи (entry) в БД!: ${err}`);
//             } else {
//                 console.log(results);
//             }
//         });
//     }
//
//     /**
//      *
//      * @param id personal key (pk)
//      */
//     static get(id) {
//         const sql = `SELECT * FROM entries
//             WHERE id = ?;`;
//         db.query(sql, [id], (err, results) => {
//             if (err) {
//                 return console.error(`Ошибка получения записи (entry) из БД!: ${err}`);
//             } else {
//                 console.log(results);
//             }
//         });
//     }
//
//     static getAll() {
//         const sql = `SELECT * FROM entries;`;
//         db.query(sql, (err, results) => {
//             if (err) {
//                 return console.error(`Ошибка получения всех записей (entry) из БД!: ${err}`);
//             } else {
//                 console.log(results);
//             }
//         });
//     }
// }


module.exports = (Sequelize, sequelize) => {
    return sequelize.define('entry', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        officeAddress: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        deleted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        datetime: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        service: {
            type: Sequelize.STRING(150),
            allowNull: false,
        },
        firstName: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        secondName: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        phoneNumber: {
            type: Sequelize.STRING(15),
        },
        identifier: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
    });
};

// const now = new Date();

// const entry = new Entry(
//     'qwe',
//     `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
//     'mfc',
//     'John',
//     'Smith',
//     null,
//     `id${now.getTime()}`);

// Entry.getAll();
// Entry.get(1);
// entry.add();
