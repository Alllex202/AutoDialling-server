// const Entry = require('./entry');
// const Call = require('./call');
//
// module.exports = {
//     Call,
//     Entry,
// };

const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    dialect: dbConfig.dialect,
    host: dbConfig.host,
    port: dbConfig.port,
    define: {
        timestamps: false,
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// models
db.entries = require('./entry')(Sequelize, sequelize);
db.calls = require('./call')(Sequelize, sequelize);

//extra-setup
db.entries.hasOne(db.calls, {
    foreignKey: {
        allowNull: false,
    },
    onDelete: 'cascade',
});

module.exports = db;

// -------------TEST--------------------------
//
//
//
// db.sequelize.sync()
//     .then(() => {
//         console.log('Good');
//
//         const now = new Date();
//
//         db.entries
//             .create({
//                 officeAddress: 'qwe',
//                 datetime: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
//                 service: 'service123',
//                 firstName: 'Alex333',
//                 secondName: 'GOAT',
//                 phoneNumber: '1256975',
//                 identifier: `id${now.getTime()}`,
//             })
//             .then((entry) => {
//                 console.log(`NEW ENTRY: ${entry.id}, ${entry.firstName}`);
//                 db.calls.create({
//                     entryId: entry.id,
//                 })
//                     .then(call => {
//                         console.log('call add good');
//                         // entry.setCall(call)
//                         //     .then(res => {
//                         //         console.log('set good');
//                         //     })
//                         //     .catch(err => {
//                         //         console.log(`set err: ${err}`);
//                         //     });
//                         // call.setEntry(entry)
//                         //     .then(res => {
//                         //         console.log('set good');
//                         //     })
//                         //     .catch(err => {
//                         //         console.log(`set err: ${err}`);
//                         //     });
//                     })
//                     .catch(err => {
//                         console.log(`Ошибка при добавлении звонка: ${err}`);
//                     });
//             })
//             .catch(err => {
//                 console.log(`Ошибка при добавлении записи: ${err}`);
//             });
//     })
//     .catch(() => console.log('err'));
