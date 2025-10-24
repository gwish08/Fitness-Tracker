// server.js - Main Express Server
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();


app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fitness_tracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};


app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, email || null]
        );

        const token = jwt.sign(
            { id: result.insertId, username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: result.insertId, username }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});


app.get('/api/workouts/:date', authenticateToken, async (req, res) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;

        const [workouts] = await pool.query(
            `SELECT w.*, e.name as exercise_name 
       FROM workouts w
       JOIN exercises e ON w.exercise_id = e.id
       WHERE w.user_id = ? AND w.workout_date = ?
       ORDER BY w.created_at DESC`,
            [userId, date]
        );

        res.json(workouts);
    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json({ error: 'Server error fetching workouts' });
    }
});

app.post('/api/workouts', authenticateToken, async (req, res) => {
    try {
        const { exercise_name, sets, reps, weight, workout_date } = req.body;
        const userId = req.user.id;

        if (!exercise_name || !workout_date) {
            return res.status(400).json({ error: 'Exercise name and date required' });
        }

        let [exercises] = await pool.query(
            'SELECT * FROM exercises WHERE name = ?',
            [exercise_name]
        );

        let exerciseId;
        if (exercises.length === 0) {
            const [result] = await pool.query(
                'INSERT INTO exercises (name) VALUES (?)',
                [exercise_name]
            );
            exerciseId = result.insertId;
        } else {
            exerciseId = exercises[0].id;
        }

        const [result] = await pool.query(
            `INSERT INTO workouts (user_id, exercise_id, sets, reps, weight, workout_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, exerciseId, sets || null, reps || null, weight || null, workout_date]
        );

        res.status(201).json({
            message: 'Workout added successfully',
            workout: {
                id: result.insertId,
                exercise_name,
                sets,
                reps,
                weight,
                workout_date
            }
        });
    } catch (error) {
        console.error('Add workout error:', error);
        res.status(500).json({ error: 'Server error adding workout' });
    }
});

app.delete('/api/workouts/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [workouts] = await pool.query(
            'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (workouts.length === 0) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        await pool.query('DELETE FROM workouts WHERE id = ?', [id]);

        res.json({ message: 'Workout deleted successfully' });
    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json({ error: 'Server error deleting workout' });
    }
});

app.get('/api/exercises', authenticateToken, async (req, res) => {
    try {
        const [exercises] = await pool.query('SELECT * FROM exercises ORDER BY name');
        res.json(exercises);
    } catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({ error: 'Server error fetching exercises' });
    }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [stats] = await pool.query(
            `SELECT 
        COUNT(DISTINCT workout_date) as total_days,
        COUNT(*) as total_exercises,
        e.name as most_common_exercise,
        COUNT(w.exercise_id) as exercise_count
       FROM workouts w
       JOIN exercises e ON w.exercise_id = e.id
       WHERE w.user_id = ?
       GROUP BY w.exercise_id
       ORDER BY exercise_count DESC
       LIMIT 1`,
            [userId]
        );

        res.json(stats[0] || {});
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Server error fetching stats' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Fitness Tracker API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});