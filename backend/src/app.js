const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const { connectDB } = require('./config/db');
const cors = require('cors'); // Import the cors middleware

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Routes
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});