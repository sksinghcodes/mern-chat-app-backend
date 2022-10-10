require('dotenv').config();
const express = require('express');
const cors = require('cors')
const app = express();
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 4000;
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task')
const { connectToDB, checkDBConnection } = require('./db');
const { isAuthenticated } = require('./controllers/user');
connectToDB();

app.use(cors({
    credentials: true,
    origin: process.env.ORIGIN,
}));
app.use(express.json());
app.use(cookieParser());
app.use(checkDBConnection);

app.use('/api/user/', userRoutes);
app.use('/api/task/', taskRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
});