module.exports = (Sequelize, sequelize) => {
    return sequelize.define('call', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        callsCount: {
            type: Sequelize.TINYINT({unsigned: true}),
            allowNull: false,
            defaultValue: 0,
        },
        result: {
            type: Sequelize.BOOLEAN,
        },
        operatorConnection: {
            type: Sequelize.BOOLEAN,
        }
    });
};
