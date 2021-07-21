const {sequelize, Sequelize} = require('../models');
const dbConfig = require('../config/db.config');

createDB();

function createDB() {
    sequelize
        .sync({force: true})
        .then(() => console.log('SYNC GOOD'))
        .catch(err => {
            if (err.original.errno === 1049) {
                const _sequelize = new Sequelize('', dbConfig.user, dbConfig.password, {
                    dialect: dbConfig.dialect,
                    host: dbConfig.host,
                    port: dbConfig.port,
                    define: {
                        timestamps: false,
                    },
                });

                _sequelize
                    .query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} ;`, {})
                    .then(() => {
                        console.log('Created new db and resync');
                        createDB();
                    })
                    .catch(err => {
                        throw new Error('ERR new db');
                    })
            } else {
                throw new Error('ERR SYNC');
            }
        });
}
