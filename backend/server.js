const express = require('express');
const mysql = require('mysql');

const app = express();

// MySQL database connection configuration
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'Blacklight'
});

// Test MySQL connection
pool.getConnection((err, connection) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL database');

    pool.query(`select * from Blacklight.leaderboard`,(err,res)=>{
        // console.log(res);
    })

    // Define routes inside the callback function to ensure they have access to the connection
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get('/current-week-leaderboard', (req, res) => {
        pool.query(`
        SELECT *
        FROM leaderboard
        WHERE timestamp >= CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY
              AND timestamp < CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY + INTERVAL 7 DAY
        ORDER BY score DESC
        LIMIT 200`,(err,data)=>{
                    console.log(data);
                    res.json(data);
        })
    });
    
    app.get('/last-week-leaderboard/:country', (req, res) => {
        const country_code = req.params.country;
        console.log(country_code);
        pool.query(`
        SELECT *
        FROM leaderboard
        WHERE Country='${country_code}' AND timestamp >= CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY - INTERVAL 1 WEEK
              AND timestamp < CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY
        ORDER BY score DESC
        LIMIT 200`,(err,data)=>{
                    console.log(data);
                    res.json(data);
        })
        
    });
    
    app.get('/user-rank/:userId', (req, res) => {
        const userId = req.params.userId;
        // Implement logic to fetch user rank given the userId
    });
    

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    connection.release();
});
