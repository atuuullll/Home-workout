import matplotlib.pyplot as plt
import os

def generate_workout_graph(data, output_path):
    """
    Generate a workout graph based on the provided data.

    Args:
        data (dict): A dictionary where keys are dates (str) and values are workout counts (int).
        output_path (str): Path to save the generated graph image.
    """
    dates = list(data.keys())
    counts = list(data.values())

    plt.figure(figsize=(10, 6))
    plt.plot(dates, counts, marker='o', linestyle='-', color='green')
    plt.title('Daily Workout Progress')
    plt.xlabel('Date')
    plt.ylabel('Workouts Completed')
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()

    # Save the graph as an image
    plt.savefig(output_path)
    plt.close()

if __name__ == "__main__":
    # Example data for testing
    example_data = {
        "2025-05-01": 3,
        "2025-05-02": 5,
        "2025-05-03": 4
    }
    output_file = os.path.join(os.getcwd(), 'daily_workout_graph.png')
    generate_workout_graph(example_data, output_file)
    print(f"Graph saved to {output_file}")