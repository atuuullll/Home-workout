// Database module for workout data storage
class WorkoutDB {
    constructor() {
        this.dbName = 'workoutDB';
        this.dbVersion = 2; // Increment version for schema update
        this.storeName = 'workouts';
        this.dailyStatsStore = 'dailyStats';
        this.db = null;
    }

    // Initialize the database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Error opening database');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create or update workouts store
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('date', 'date', { unique: false });
                }

                // Create daily stats store
                if (!db.objectStoreNames.contains(this.dailyStatsStore)) {
                    const statsStore = db.createObjectStore(this.dailyStatsStore, { keyPath: 'date' });
                    statsStore.createIndex('date', 'date', { unique: true });
                }
            };
        });
    }

    // Save a workout plan
    async saveWorkout(workout) {
        return new Promise((resolve, reject) => {
            if (!workout || !workout.exercises || !Array.isArray(workout.exercises)) {
                reject(new Error('Invalid workout data'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // Validate and prepare workout data
            const workoutData = {
                ...workout,
                date: workout.date || new Date().toISOString(),
                exercises: workout.exercises.map(exercise => ({
                    name: exercise.name?.trim() || '',
                    sets: Math.max(1, parseInt(exercise.sets) || 1),
                    reps: Math.max(1, parseInt(exercise.reps) || 1),
                    completed: Boolean(exercise.completed)
                }))
            };
            
            const request = store.add(workoutData);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Failed to save workout'));
        });
    }

    // Save daily statistics
    async saveDailyStats(stats) {
        return new Promise((resolve, reject) => {
            if (!stats || typeof stats !== 'object') {
                reject(new Error('Invalid statistics data'));
                return;
            }

            const transaction = this.db.transaction([this.dailyStatsStore], 'readwrite');
            const store = transaction.objectStore(this.dailyStatsStore);
            
            const today = new Date().toISOString().split('T')[0];
            const statsData = {
                date: today,
                totalExercises: Math.max(0, parseInt(stats.totalExercises) || 0),
                completedExercises: Math.max(0, parseInt(stats.completedExercises) || 0),
                completionRate: Math.min(100, Math.max(0, parseFloat(stats.completionRate) || 0)),
                totalSets: Math.max(0, parseInt(stats.totalSets) || 0),
                totalReps: Math.max(0, parseInt(stats.totalReps) || 0),
                lastUpdated: new Date().toISOString()
            };

            const request = store.put(statsData);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Failed to save daily statistics'));
        });
    }

    // Get all daily statistics
    async getAllDailyStats() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.dailyStatsStore], 'readonly');
            const store = transaction.objectStore(this.dailyStatsStore);
            const request = store.getAll();

            request.onsuccess = () => {
                const stats = request.result;
                // Sort by date in ascending order
                stats.sort((a, b) => new Date(a.date) - new Date(b.date));
                resolve(stats);
            };
            request.onerror = () => reject(new Error('Failed to fetch daily statistics'));
        });
    }

    // Get daily statistics by date range
    async getDailyStatsByDateRange(startDate, endDate) {
        return new Promise((resolve, reject) => {
            if (!startDate || !endDate) {
                reject(new Error('Invalid date range'));
                return;
            }

            const transaction = this.db.transaction([this.dailyStatsStore], 'readonly');
            const store = transaction.objectStore(this.dailyStatsStore);
            const index = store.index('date');
            const range = IDBKeyRange.bound(startDate, endDate);
            const request = index.getAll(range);

            request.onsuccess = () => {
                const stats = request.result;
                // Sort by date in ascending order
                stats.sort((a, b) => new Date(a.date) - new Date(b.date));
                resolve(stats);
            };
            request.onerror = () => reject(new Error('Failed to fetch daily statistics by date range'));
        });
    }

    // Get all workouts
    async getAllWorkouts() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const workouts = request.result;
                // Sort by date in ascending order
                workouts.sort((a, b) => new Date(a.date) - new Date(b.date));
                resolve(workouts);
            };
            request.onerror = () => reject(new Error('Failed to fetch workouts'));
        });
    }

    // Get workouts by date range
    async getWorkoutsByDateRange(startDate, endDate) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('date');
            const range = IDBKeyRange.bound(startDate, endDate);
            const request = index.getAll(range);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Delete a workout
    async deleteWorkout(id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                reject(new Error('Invalid workout ID'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete workout'));
        });
    }
}

// Create and export a singleton instance
const workoutDB = new WorkoutDB();
export default workoutDB; 