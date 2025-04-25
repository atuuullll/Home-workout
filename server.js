const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workout-tracker', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Server will continue running without database connection');
    }
};

// Exercise Schema
const exerciseSchema = new mongoose.Schema({
    name: String,
    sets: Number,
    reps: Number,
    completed: Boolean
});

// Workout Schema
const workoutSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    exercises: [exerciseSchema],
    totalExercises: Number,
    completedExercises: Number,
    totalSets: Number,
    totalReps: Number
});

const Workout = mongoose.model('Workout', workoutSchema);

// API Routes
// Get all workouts
app.get('/api/workouts', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database connection not available' });
        }
        const workouts = await Workout.find().sort({ date: -1 });
        res.json(workouts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get workout by date
app.get('/api/workouts/:date', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database connection not available' });
        }
        const workout = await Workout.findOne({ date: new Date(req.params.date) });
        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }
        res.json(workout);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new workout
app.post('/api/workouts', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database connection not available' });
    }

    const workout = new Workout({
        exercises: req.body.exercises,
        totalExercises: req.body.exercises.length,
        completedExercises: req.body.exercises.filter(ex => ex.completed).length,
        totalSets: req.body.exercises.reduce((sum, ex) => sum + ex.sets, 0),
        totalReps: req.body.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0)
    });

    try {
        const newWorkout = await workout.save();
        res.status(201).json(newWorkout);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update workout
app.put('/api/workouts/:id', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database connection not available' });
    }

    try {
        const workout = await Workout.findById(req.params.id);
        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        workout.exercises = req.body.exercises;
        workout.totalExercises = req.body.exercises.length;
        workout.completedExercises = req.body.exercises.filter(ex => ex.completed).length;
        workout.totalSets = req.body.exercises.reduce((sum, ex) => sum + ex.sets, 0);
        workout.totalReps = req.body.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0);

        const updatedWorkout = await workout.save();
        res.json(updatedWorkout);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete workout
app.delete('/api/workouts/:id', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database connection not available' });
    }

    try {
        const workout = await Workout.findById(req.params.id);
        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        await workout.deleteOne();
        res.json({ message: 'Workout deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB(); // Connect to MongoDB after server starts
}); 