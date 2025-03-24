require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;
// Using environment variable for the secret key would be more secure
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";

// Configure PostgreSQL pool based on environment
let poolConfig;

if (process.env.DATABASE_URL) {
  // Heroku PostgreSQL configuration
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Needed for Heroku PostgreSQL
    }
  };
} else {
  // Local PostgreSQL configuration
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'IBS',
    password: process.env.DB_PASSWORD || '1234',
    port: process.env.DB_PORT || 5432
  };
}

const pool = new Pool(poolConfig);

app.use(cors());
app.use(bodyParser.json());

const path = require('path');

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// User Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
        if (user.rows.length === 0) return res.status(400).json({ message: "Invalid username or password" });

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) return res.status(400).json({ message: "Invalid username or password" });

        const token = jwt.sign({ userId: user.rows[0].id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.userId = decoded.userId;
        next();
    });
};

// Save symptom log
app.post('/symptoms', verifyToken, async (req, res) => {
    const { symptoms, notes, period, foodLog } = req.body;

    try {
        for (const symptom of symptoms) {
            await pool.query(
                "INSERT INTO symptom_logs (user_id, symptom_name, morning_severity, afternoon_severity, evening_severity, night_severity, cause) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                [req.userId, symptom.name, symptom.morning, symptom.afternoon, symptom.evening, symptom.night, symptom.cause]
            );
        }

        await pool.query("INSERT INTO notes (user_id, note) VALUES ($1, $2)", [req.userId, notes]);
        await pool.query("INSERT INTO period_status (user_id, on_period) VALUES ($1, $2)", [req.userId, period]);

        await pool.query(
            "INSERT INTO food_logs (user_id, morning_trigger, morning_non_trigger, morning_unsure, afternoon_trigger, afternoon_non_trigger, afternoon_unsure, evening_trigger, evening_non_trigger, evening_unsure, night_trigger, night_non_trigger, night_unsure) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
            [req.userId, foodLog.morning.trigger, foodLog.morning.nonTrigger, foodLog.morning.unsure,
                foodLog.afternoon.trigger, foodLog.afternoon.nonTrigger, foodLog.afternoon.unsure,
                foodLog.evening.trigger, foodLog.evening.nonTrigger, foodLog.evening.unsure,
                foodLog.night.trigger, foodLog.night.nonTrigger, foodLog.night.unsure]
        );

        res.json({ message: "Data saved successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Connection test endpoint (useful for debugging)
app.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'success',
            timestamp: result.rows[0].now,
            environment: process.env.DATABASE_URL ? 'heroku' : 'local'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message,
            environment: process.env.DATABASE_URL ? 'heroku' : 'local'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.DATABASE_URL ? 'Production (Heroku)' : 'Local development'}`);
});