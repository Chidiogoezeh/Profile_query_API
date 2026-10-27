USE profile_query;

CREATE TABLE profiles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    gender VARCHAR(50),
    gender_probability FLOAT,
    age INT,
    age_group VARCHAR(20),
    country_id VARCHAR(2),
    country_name VARCHAR(255), 
    country_probability FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);