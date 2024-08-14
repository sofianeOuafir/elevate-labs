'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class GameEvent extends Model {}

  GameEvent.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "COMPLETED",
    },
    occurred_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'GameEvent',
    timestamps: true,
  });

  GameEvent.associate = function(models) {
    GameEvent.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return GameEvent;
};
