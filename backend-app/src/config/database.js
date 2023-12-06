const mysql = require('mysql2/promise');

const dbConfig = {
  host: '35.237.5.10',
  user: 'root',
  password: 'j~:C=Yex*PI4St|^',
  database: 'recipefy',
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
