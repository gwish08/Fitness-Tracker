CREATE DATABASE IF NOT EXISTS fitness_tracker;
USE fitness_tracker;


CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS exercises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS workouts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  sets INT,
  reps INT,
  weight DECIMAL(10, 2),
  workout_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, workout_date),
  INDEX idx_exercise (exercise_id)
);

INSERT INTO exercises (name) VALUES
  ('Bench Press'),
  ('Squat'),
  ('Deadlift'),
  ('Barbell Row'),
  ('Overhead Press'),
  ('Pull-ups'),
  ('Dips'),
  ('Bicep Curls'),
  ('Tricep Extensions'),
  ('Leg Press'),
  ('Lunges'),
  ('Plank'),
  ('Running'),
  ('Cycling')
ON DUPLICATE KEY UPDATE name=name;