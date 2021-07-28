module.exports = (Sequelize, sequelize) => {
    return sequelize.define('request', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
    });
};