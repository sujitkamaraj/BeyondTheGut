CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE symptom_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    symptom_name VARCHAR(100),
    morning_severity VARCHAR(20),
    afternoon_severity VARCHAR(20),
    evening_severity VARCHAR(20),
    night_severity VARCHAR(20),
    cause VARCHAR(50)
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

CREATE TABLE period_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    on_period BOOLEAN
);

CREATE TABLE food_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    morning_trigger TEXT,
    morning_non_trigger TEXT,
    morning_unsure TEXT,
    afternoon_trigger TEXT,
    afternoon_non_trigger TEXT,
    afternoon_unsure TEXT,
    evening_trigger TEXT,
    evening_non_trigger TEXT,
    evening_unsure TEXT,
    night_trigger TEXT,
    night_non_trigger TEXT,
    night_unsure TEXT
);
