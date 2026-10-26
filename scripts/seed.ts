import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { v7 as uuidv7 } from "uuid";

dotenv.config();

const seedDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("Reading profiles from JSON file...");
    const data = await fs.readFile(path.resolve("profiles.json"), "utf-8");
    const jsonContent = JSON.parse(data);
    
    // Profiles array from your JSON structure
    const profiles = jsonContent.profiles;

    if (!Array.isArray(profiles)) {
      throw new Error("JSON structure invalid: 'profiles' array not found.");
    }

    console.log(`Starting seed for ${profiles.length} records...`);

    const sql = `
      INSERT IGNORE INTO profiles 
      (id, name, gender, gender_probability, age, age_group, country_id, country_name, country_probability, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const p of profiles) {
      // Ensure we match the exact DB structure and provide fallbacks
      await connection.execute(sql, [
        p.id || uuidv7(), // Use existing ID or generate required UUID v7
        p.name || null,
        p.gender || null,
        p.gender_probability || 0,
        p.age || 0,
        p.age_group || null,
        p.country_id || null,
        p.country_name || null,
        p.country_probability || 0,
        p.created_at || new Date().toISOString().slice(0, 19).replace('T', ' ') // Format for MySQL TIMESTAMP
      ]);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await connection.end();
    process.exit();
  }
};

seedDatabase();