import workoutDB from './db.js';
import { initProgressChart, updateChartOnSave } from './charts.js';

// Initialize the database and chart
workoutDB.init().then(() => {
    initProgressChart();
}).catch(error => {
    console.error('Failed to initialize database:', error);
});

// API Configuration
const API_URL = 'http://localhost:5000/api';

// DOM Elements
let mobileMenuButton;
let mobileMenu;
let workoutForm;
let workoutContainer;
let progressBar;
let completedCount;
let totalCount;
let saveWorkoutButton;
let workoutDate;

// State
let exercises = [];
let lastSaveTime = localStorage.getItem('lastSaveTime') || Date.now();

// Initialize currentWorkout
let currentWorkout = {
    exercises: [],
    completed: 0,
    date: new Date().toISOString(),
    totalExercises: 0,
    completedExercises: 0,
    completionRate: 0,
    totalSets: 0,
    totalReps: 0
};

// Initialize DOM elements
function initDOMElements() {
    mobileMenuButton = document.getElementById('mobile-menu-button');
    mobileMenu = document.getElementById('mobile-menu');
    workoutForm = document.getElementById('workout-form');
    workoutContainer = document.getElementById('workout-container');
    progressBar = document.getElementById('progress-bar');
    completedCount = document.getElementById('completed-count');
    totalCount = document.getElementById('total-count');
    saveWorkoutButton = document.getElementById('save-workout');
    workoutDate = document.getElementById('workout-date');

    // Add event listeners only if elements exist
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    if (workoutForm) {
        workoutForm.addEventListener('submit', handleWorkoutFormSubmit);
    }

    if (saveWorkoutButton) {
        saveWorkoutButton.addEventListener('click', saveWorkoutToDB);
    }
}

// Handle workout form submission
function handleWorkoutFormSubmit(e) {
    e.preventDefault();
    
    try {
        const name = document.getElementById('exercise-name')?.value.trim();
        const sets = parseInt(document.getElementById('exercise-sets')?.value);
        const reps = parseInt(document.getElementById('exercise-reps')?.value);

        // Validate input
        if (!name) {
            throw new Error('Please enter an exercise name');
        }
        if (isNaN(sets) || sets < 1) {
            throw new Error('Please enter a valid number of sets (minimum 1)');
        }
        if (isNaN(reps) || reps < 1) {
            throw new Error('Please enter a valid number of reps (minimum 1)');
        }

        // Add exercise to current workout
        currentWorkout.exercises.push({
            name: name,
            sets: sets,
            reps: reps,
            completed: false
        });

        workoutForm.reset();
        renderWorkouts();
        
    } catch (error) {
        showErrorMessage(error.message);
    }
}

// Show error message
function showErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorMessage.textContent = message;
    document.body.appendChild(errorMessage);
    
    setTimeout(() => {
        errorMessage.remove();
    }, 3000);
}

// Show success message
function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successMessage.textContent = message;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// Exercise class
class Exercise {
    constructor(name, sets, reps) {
        this.id = Date.now().toString();
        this.name = name;
        this.sets = sets;
        this.reps = reps;
        this.completed = false;
    }
}

// API Functions
async function fetchWorkouts() {
    try {
        const response = await fetch(`${API_URL}/workouts`);
        if (!response.ok) throw new Error('Failed to fetch workouts');
        return await response.json();
    } catch (error) {
        console.error('Error fetching workouts:', error);
        return [];
    }
}

async function saveWorkoutToBackend(workout) {
    try {
        const response = await fetch(`${API_URL}/workouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workout)
        });
        if (!response.ok) throw new Error('Failed to save workout');
        return await response.json();
    } catch (error) {
        console.error('Error saving workout:', error);
        throw error;
    }
}

// Check and save daily workout
async function checkAndSaveDailyWorkout() {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTime;
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (timeSinceLastSave >= twentyFourHours) {
        await saveDailyWorkout();
        lastSaveTime = now;
        localStorage.setItem('lastSaveTime', now);
    }
}

// Save daily workout
async function saveDailyWorkout() {
    if (exercises.length > 0) {
        const dailyWorkout = {
            exercises: exercises,
            totalExercises: exercises.length,
            completedExercises: exercises.filter(ex => ex.completed).length,
            totalSets: exercises.reduce((sum, ex) => sum + ex.sets, 0),
            totalReps: exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0)
        };

        try {
            await saveWorkoutToBackend(dailyWorkout);
            
            // Reset exercises for new day
            exercises = [];
            renderExercises();
            updateProgress();
            
            // Refresh the progress graph
            updateProgressGraph();
        } catch (error) {
            console.error('Error saving daily workout:', error);
            alert('Failed to save workout. Please try again.');
        }
    }
}

// Load saved workouts
async function loadSavedWorkouts() {
    try {
        const workouts = await workoutDB.getAllWorkouts();
        if (workouts.length > 0) {
            // Load the most recent workout
            const latestWorkout = workouts[workouts.length - 1];
            currentWorkout = latestWorkout;
            renderWorkouts();
            updateProgress();
            updateWorkoutDate();
        } else {
            // If no workouts exist, show today's date
            updateWorkoutDate();
        }
    } catch (error) {
        console.error('Error loading workouts:', error);
    }
}

// Update workout date display
function updateWorkoutDate() {
    const date = new Date(currentWorkout.date || Date.now());
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    workoutDate.textContent = `Date: ${date.toLocaleDateString(undefined, options)}`;
}

// Save workout to database
async function saveWorkoutToDB() {
    try {
        // Check if database is initialized
        if (!workoutDB.db) {
            await workoutDB.init();
        }

        // Validate DOM elements
        if (!workoutContainer || !progressBar || !completedCount || !totalCount) {
            throw new Error('Required elements not found. Please refresh the page.');
        }

        // Validate current workout data
        if (!currentWorkout || !currentWorkout.exercises) {
            currentWorkout = {
                exercises: [],
                date: new Date().toISOString()
            };
        }

        if (!Array.isArray(currentWorkout.exercises)) {
            throw new Error('Invalid workout data. Please refresh the page.');
        }

        if (currentWorkout.exercises.length === 0) {
            throw new Error('No exercises to save. Please add at least one exercise.');
        }

        // Calculate statistics
        const totalExercises = currentWorkout.exercises.length;
        const completedExercises = currentWorkout.exercises.filter(ex => ex.completed).length;
        const completionRate = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
        
        // Prepare workout data with data validation
        const workoutData = {
            exercises: currentWorkout.exercises.map(ex => ({
                name: ex.name?.trim() || 'Unnamed Exercise',
                sets: Math.max(1, parseInt(ex.sets) || 1),
                reps: Math.max(1, parseInt(ex.reps) || 1),
                completed: Boolean(ex.completed)
            })),
            date: new Date().toISOString(),
            totalExercises: totalExercises,
            completedExercises: completedExercises,
            completionRate: completionRate,
            totalSets: currentWorkout.exercises.reduce((sum, ex) => sum + (parseInt(ex.sets) || 1), 0),
            totalReps: currentWorkout.exercises.reduce((sum, ex) => sum + ((parseInt(ex.sets) || 1) * (parseInt(ex.reps) || 1)), 0)
        };

        // Save the workout with retry mechanism
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                await workoutDB.saveWorkout(workoutData);
                break;
            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
            }
        }
        
        // Update the current workout with the saved data
        currentWorkout = workoutData;
        
        // Update the UI
        renderWorkouts();
        updateProgress();
        
        // Save daily statistics
        const dailyStats = {
            totalExercises: totalExercises,
            completedExercises: completedExercises,
            completionRate: completionRate,
            totalSets: workoutData.totalSets,
            totalReps: workoutData.totalReps
        };
        
        await workoutDB.saveDailyStats(dailyStats);
        await updateChartOnSave();
        
        showSuccessMessage('Workout plan saved successfully!');
        
    } catch (error) {
        console.error('Error saving workout:', error);
        showErrorMessage(error.message || 'Failed to save workout plan. Please try again.');
    }
}

// Render workout cards
function renderWorkouts() {
    workoutContainer.innerHTML = '';
    currentWorkout.exercises.forEach((exercise, index) => {
        const card = document.createElement('div');
        card.className = 'bg-black border border-[#06402B] rounded-lg shadow-md p-6';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-semibold text-white">${exercise.name}</h3>
                <button class="text-red-500 hover:text-red-700" onclick="deleteExercise(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="flex justify-between text-gray-400">
                <span>${exercise.sets} sets</span>
                <span>${exercise.reps} reps</span>
            </div>
            <div class="mt-4">
                <button class="w-full bg-[#06402B] text-white py-2 rounded-lg hover:bg-[#06402B]/90 transition ${exercise.completed ? 'bg-[#06402B]/70 hover:bg-[#06402B]/60' : ''}"
                        onclick="toggleExercise(${index})">
                    ${exercise.completed ? 'Completed' : 'Mark Complete'}
                </button>
            </div>
        `;
        workoutContainer.appendChild(card);
    });
    updateProgress();
}

// Toggle exercise completion
window.toggleExercise = (index) => {
    currentWorkout.exercises[index].completed = !currentWorkout.exercises[index].completed;
    currentWorkout.completed = currentWorkout.exercises.filter(ex => ex.completed).length;
    renderWorkouts();
};

// Delete exercise
window.deleteExercise = (index) => {
    currentWorkout.exercises.splice(index, 1);
    currentWorkout.completed = currentWorkout.exercises.filter(ex => ex.completed).length;
    renderWorkouts();
};

// Update progress
function updateProgress() {
    const total = currentWorkout.exercises.length;
    const completed = currentWorkout.exercises.filter(ex => ex.completed).length;
    
    totalCount.textContent = total;
    completedCount.textContent = completed;
    progressBar.style.width = total > 0 ? `${(completed / total) * 100}%` : '0%';
}

// Check for daily save every hour
setInterval(checkAndSaveDailyWorkout, 60 * 60 * 1000);

// Initial check
checkAndSaveDailyWorkout();

// Initialize the application
async function initApp() {
    try {
        // Initialize DOM elements
        initDOMElements();
        
        // Initialize database
        await workoutDB.init();
        
        // Initialize chart
        initProgressChart();
        
        // Load saved workouts
        await loadSavedWorkouts();
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showErrorMessage('Failed to initialize application. Please refresh the page.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 