const express = require('express');
const mongoose = require('mongoose');
const dotenv= require("dotenv");
dotenv.config({ path: "./config.env" });

const app = express();
const MONGOURI=process.env.MONGO_URI;
// MongoDB connection configuration
mongoose.connect(MONGOURI).then(() => {
    console.log('Connected to MongoDB database');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Define MongoDB schema
const leaderboardSchema = new mongoose.Schema({
    userId: String,
    score: Number,
    timestamp: Date,
    country: String
});

const leaderboard = mongoose.model('leaderboard', leaderboardSchema);

// Test MongoDB connection
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/specific-timestamp/:timestamp', async (req, res) => {
    const timestampString = req.params.timestamp;

    // Convert the timestamp string to a Date object
    const specificTimestamp = new Date(timestampString);
    
    try {
        console.log(specificTimestamp);
        const data = await leaderboard.find({
            timestamp: specificTimestamp
        });
        res.json(data);
        console.log(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/current-week-leaderboard', async (req, res) => {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    try {

        const data = await leaderboard.find({
            timestamp: {$gte: startOfWeek, $lt: endOfWeek }
        }).sort({ score: -1 }).limit(200);
        res.json(data);
        console.log(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/last-week-leaderboard/:country', async (req, res) => {
    const country_code = req.params.country;
    const currentDate = new Date();
    const startOfLastWeek = new Date(currentDate);
    startOfLastWeek.setDate(currentDate.getDate() - currentDate.getDay() - 7);
    startOfLastWeek.setHours(0, 0, 0, 0);
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
    
    try {
        const data = await leaderboard.find({
            country: country_code,
            timestamp: { $gte: startOfLastWeek, $lt: endOfLastWeek }
        }).sort({ score: -1 }).limit(200);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/user-rank/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        // First, find the user's score
        const userScore = await leaderboard.findOne({ userId });

        if (!userScore) {
            // If user is not found, return an error
            return res.status(404).json({ error: 'User not found' });
        }

        // Count the number of users with a higher score than the current user
        const rank = await leaderboard.countDocuments({ score: { $gt: userScore.score } });

        // Rank starts from 1, so add 1 to the rank
        const userRank = rank + 1;

        // Now, return the user's rank
        res.json({ userId, rank: userRank });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const PORT = process.env.PORT ;
console.log(PORT);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});