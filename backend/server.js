const express = require('express');
const mongoose = require('mongoose');

const app = express();

// MongoDB connection configuration
mongoose.connect('mongodb+srv://ankitpathak11525:QSYVHDTaw1Z2CWzc@cluster0.fb8heue.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => {
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

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

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
        const data = await Leaderboard.find({
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

        const data = await Leaderboard.find({
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
        const data = await Leaderboard.find({
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
        const userRank = await Leaderboard.find({
            userId: userId
        }).sort({ score: -1, timestamp: 1 });
        res.json(userRank);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
