const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'F@iyaz121',
    database: 'social_media_api',
});

module.exports = db;
