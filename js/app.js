// Using localStorage for simplicity

let workouts = [];
let currentUid = null;

document.addEventListener('DOMContentLoaded', () => {
    // Attach form listener immediately to prevent refresh
    const workoutForm = document.getElementById('workout-form');
    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUid) {
            console.log('No user ID available');
            return;
        }
        const name = document.getElementById('exercise-name').value;
        const sets = document.getElementById('exercise-sets').value;
        const reps = document.getElementById('exercise-reps').value;
        if (name && sets && reps) {
            const exercise = { name, sets: parseInt(sets), reps: parseInt(reps), completed: false };
            workouts.push(exercise);
            addExerciseToUI(exercise);
            saveWorkouts(currentUid, workouts);
            workoutForm.reset();
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('mark-complete')) {
            if (!currentUid) return;
            const card = e.target.closest('.bg-[#06402B]/20');
            const index = Array.from(card.parentNode.children).indexOf(card);
            workouts[index].completed = true;
            e.target.textContent = 'Completed';
            e.target.disabled = true;
            updateProgress();
            saveWorkouts(currentUid, workouts);
        }
    });

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUid = user.uid;
            loadWorkouts(currentUid);
        } else {
            // User not signed in, for testing, use dummy uid
            currentUid = 'test-user';
            loadWorkouts(currentUid);
        }
    });
});

function addExerciseToUI(exercise) {
    const container = document.getElementById('workout-container');
    const card = document.createElement('div');
    card.className = 'bg-[#06402B]/20 rounded-lg p-4';
    const buttonText = exercise.completed ? 'Completed' : 'Mark Complete';
    const buttonDisabled = exercise.completed ? 'disabled' : '';
    card.innerHTML = `
        <h3 class="text-lg font-semibold text-white">${exercise.name}</h3>
        <p class="text-gray-300">Sets: ${exercise.sets} | Reps: ${exercise.reps}</p>
        <button class="mt-2 bg-[#06402B] text-white px-4 py-2 rounded mark-complete" ${buttonDisabled}>${buttonText}</button>
    `;
    container.appendChild(card);
    updateProgress();
}

function updateProgress() {
    const total = workouts.length;
    const completed = workouts.filter(w => w.completed).length;
    document.getElementById('total-count').textContent = total;
    document.getElementById('completed-count').textContent = completed;
    const percent = total > 0 ? (completed / total) * 100 : 0;
    document.getElementById('progress-bar').style.width = `${percent}%`;
}

function saveWorkouts(uid, workouts) {
    try {
        localStorage.setItem('workouts', JSON.stringify(workouts));
        console.log('Workouts saved successfully');
    } catch (error) {
        console.error('Error saving workouts:', error);
    }
}

function loadWorkouts(uid) {
    try {
        const stored = localStorage.getItem('workouts');
        if (stored) {
            workouts = JSON.parse(stored) || [];
            // Clear existing UI before adding
            const container = document.getElementById('workout-container');
            container.innerHTML = '';
            workouts.forEach(addExerciseToUI);
            updateProgress();
            console.log('Workouts loaded successfully');
        } else {
            workouts = [];
            const container = document.getElementById('workout-container');
            container.innerHTML = '';
            updateProgress();
            console.log('No workouts found');
        }
    } catch (error) {
        console.error('Error loading workouts:', error);
    }
}
