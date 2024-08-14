'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Must be a valid email address"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
  });

  User.associate = function(models) {
    // One user can have many game events
    User.hasMany(models.GameEvent, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return User;
};
