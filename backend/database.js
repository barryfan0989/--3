const mysql = require('mysql2/promise');
require('dotenv').config();

// 建立資料庫連線池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ticket_simulator',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 測試連線
pool.getConnection()
  .then(connection => {
    console.log('資料庫連線成功！');
    connection.release();
  })
  .catch(err => {
    console.error('資料庫連線失敗:', err);
  });

module.exports = pool;
