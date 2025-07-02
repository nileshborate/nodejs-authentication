import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('june2025', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});
