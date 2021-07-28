const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    dialect: dbConfig.dialect,
    host: dbConfig.host,
    port: dbConfig.port,
    define: {
        // timestamps: false,
    },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// models
db.Entry = require('./entry')(Sequelize, sequelize);
db.Call = require('./call')(Sequelize, sequelize);
db.Request = require('./request')(Sequelize, sequelize);

//extra-setup
db.Entry.hasOne(db.Call, {
    foreignKey: {
        allowNull: false,
    },
    onDelete: 'cascade',
});
db.Request.hasMany(db.Entry, {
    foreignKey: {
        allowNull: false,
    },
    onDelete: 'cascade',
});

module.exports = db;
