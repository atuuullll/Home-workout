const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'workout' directory
app.use(express.static(path.join(__dirname)));

// Load API configuration
let apiConfig = {};
fs.readFile('api_config.xml', (err, data) => {
    if (err) {
        console.error('Error reading API config:', err);
        return;
    }
    xml2js.parseString(data, (err, result) => {
        if (err) {
            console.error('Error parsing API config:', err);
            return;
        }
        const api = result.apiConfig.api[0];
        apiConfig = {
            baseUrl: api.baseUrl[0],
            key: api.parameters[0].parameter.find(p => p.name[0] === 'key').value[0],
            cx: api.parameters[0].parameter.find(p => p.name[0] === 'cx').value[0],
        };
    });
});

// In-memory storage for workouts
let workouts = [];

// API Routes
// Get all workouts
app.get('/api/workouts', async (req, res) => {
    try {
        res.json(workouts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get workout by date
app.get('/api/workouts/:date', async (req, res) => {
    try {
        const workout = {}; // Placeholder for workout data
        res.json(workout);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new workout
app.post('/api/workouts', async (req, res) => {
    try {
        const workoutData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            exercises: req.body.exercises,
            totalExercises: req.body.exercises.length,
            completedExercises: req.body.exercises.filter(ex => ex.completed).length,
            totalSets: req.body.exercises.reduce((sum, ex) => sum + ex.sets, 0),
            totalReps: req.body.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0)
        };

        workouts.push(workoutData);
        res.status(201).json(workoutData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update workout
app.put('/api/workouts/:id', async (req, res) => {
    try {
        const workoutData = {
            exercises: req.body.exercises,
            totalExercises: req.body.exercises.length,
            completedExercises: req.body.exercises.filter(ex => ex.completed).length,
            totalSets: req.body.exercises.reduce((sum, ex) => sum + ex.sets, 0),
            totalReps: req.body.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0)
        };

        const updatedWorkout = {
            id: req.params.id,
            ...workoutData
        };
        res.json(updatedWorkout);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete workout
app.delete('/api/workouts/:id', async (req, res) => {
    try {
        res.json({ message: 'Workout deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search route
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const response = await axios.get(apiConfig.baseUrl, {
            params: {
                key: apiConfig.key,
                cx: apiConfig.cx,
                q: query,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Google Custom Search API:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch search results', details: error.response?.data || error.message });
    }
});

// Fallback route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});