import workoutDB from './db.js';

// API Configuration
const API_URL = 'http://localhost:5000/api';

// Global chart variable
let progressChart = null;

// Fetch workout data from backend
async function fetchWorkoutData() {
    try {
        const response = await fetch(`${API_URL}/workouts`);
        if (!response.ok) throw new Error('Failed to fetch workout data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching workout data:', error);
        return [];
    }
}

// Update the progress chart with daily statistics
async function updateProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    try {
        const dailyStats = await workoutDB.getAllDailyStats();
        
        // Sort stats by date
        dailyStats.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const dates = dailyStats.map(stat => {
            const date = new Date(stat.date);
            return date.toLocaleDateString();
        });
        
        const completionRates = dailyStats.map(stat => stat.completionRate);
        const totalExercises = dailyStats.map(stat => stat.totalExercises);
        const completedExercises = dailyStats.map(stat => stat.completedExercises);

        // Destroy existing chart if it exists
        if (progressChart) {
            progressChart.destroy();
        }

        // Create new chart
        progressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Completion Rate (%)',
                        data: completionRates,
                        backgroundColor: 'rgba(79, 70, 229, 0.8)',
                        borderColor: 'rgb(79, 70, 229)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barThickness: 20,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Total Exercises',
                        data: totalExercises,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barThickness: 20,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Completed Exercises',
                        data: completedExercises,
                        backgroundColor: 'rgba(245, 158, 11, 0.8)',
                        borderColor: 'rgb(245, 158, 11)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barThickness: 20,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dataset = context.dataset;
                                if (dataset.label === 'Completion Rate (%)') {
                                    return `Completion: ${context.raw.toFixed(1)}%`;
                                }
                                return `${dataset.label}: ${context.raw}`;
                            }
                        },
                        padding: 8,
                        titleFont: {
                            size: 12
                        },
                        bodyFont: {
                            size: 12
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Completion Rate (%)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                size: 10
                            },
                            padding: 5
                        },
                        grid: {
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Number of Exercises',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 10
                            },
                            padding: 5
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 10
                            },
                            maxRotation: 45,
                            minRotation: 45,
                            padding: 5
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating progress chart:', error);
    }
}

// Update statistics
async function updateStatistics() {
    try {
        const dailyStats = await workoutDB.getAllDailyStats();
        
        // Total workouts
        document.getElementById('totalWorkouts').textContent = dailyStats.length;

        // Total completed exercises
        const totalCompleted = dailyStats.reduce((sum, stat) => sum + stat.completedExercises, 0);
        document.getElementById('totalCompleted').textContent = totalCompleted;

        // Average completion rate
        const avgCompletion = dailyStats.reduce((sum, stat) => sum + stat.completionRate, 0) / (dailyStats.length || 1);
        document.getElementById('avgCompletion').textContent = `${avgCompletion.toFixed(1)}%`;

        // Best day
        if (dailyStats.length > 0) {
            const bestDay = dailyStats.reduce((best, current) => 
                current.completionRate > best.completionRate ? current : best
            );
            const bestDate = new Date(bestDay.date);
            document.getElementById('bestDay').textContent = bestDate.toLocaleDateString();
        }
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Export function to update the chart when a new workout is saved
export async function updateChartOnSave() {
    await updateProgressChart();
    await updateStatistics();
}

// Initialize the progress chart
export async function initProgressChart() {
    await updateProgressChart();
    await updateStatistics();
}

// Function to update summary statistics
function updateSummaryStatistics(dailyWorkouts) {
    const statsContainer = document.querySelector('.stats-container');
    if (!statsContainer) return;

    const stats = [
        {
            title: 'Total Days Tracked',
            value: dailyWorkouts.length,
            icon: 'fas fa-calendar',
            color: 'text-blue-600'
        },
        {
            title: 'Average Completion Rate',
            value: dailyWorkouts.length > 0 
                ? (dailyWorkouts.reduce((sum, workout) => 
                    sum + (workout.completedExercises / workout.totalExercises) * 100, 0) / dailyWorkouts.length).toFixed(1) + '%'
                : '0%',
            icon: 'fas fa-chart-line',
            color: 'text-green-600'
        },
        {
            title: 'Total Workouts',
            value: dailyWorkouts.reduce((sum, workout) => sum + workout.totalExercises, 0),
            icon: 'fas fa-dumbbell',
            color: 'text-purple-600'
        }
    ];

    statsContainer.innerHTML = stats.map(stat => `
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="flex items-center">
                <i class="${stat.icon} ${stat.color} text-2xl mr-3"></i>
                <div>
                    <h4 class="text-gray-600 text-sm">${stat.title}</h4>
                    <p class="text-2xl font-bold">${stat.value}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper function to check if all exercises in a workout are completed
function isWorkoutComplete(workout) {
    return workout.exercises.every(exercise => exercise.completed);
} 