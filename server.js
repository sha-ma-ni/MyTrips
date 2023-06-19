const express = require ('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use (express.json());
app.use('/api/auth', require('./routes/auth.routes'))
// app.use('/posts', postRoutes);

// Connect to MongoDB instance
mongoose.connect(process.env.DB_CONNECTION, {dbName: process.env.DATABASE});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('connected to DB');
});

//Start the web server
app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server started and listening on port ${PORT} ... `);
    }
});

