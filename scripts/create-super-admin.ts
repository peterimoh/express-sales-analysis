/**
 * Script to create the first super admin user
 * Run with: npx tsx scripts/create-super-admin.ts <email> <password>
 *
 * Example:
 * npx tsx scripts/create-super-admin.ts admin@company.com "SuperAdmin@2025"
 */

import dotenv from "dotenv";
import { Pool } from "pg";
import bcrypt from "bcrypt";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function createSuperAdmin(
  email: string,
  password: string,
  fullName: string
) {
  try {
    // Check if super admin already exists
    const checkQuery =
      "SELECT id FROM users WHERE role = 'super_admin' AND is_active = true";
    const existing = await pool.query(checkQuery);

    if (existing.rows.length > 0) {
      console.log(
        "⚠️  Super admin already exists. Use a different email or update existing user."
      );
      process.exit(1);
    }

    // Check if email already exists
    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      console.log("⚠️  Email already exists. Please use a different email.");
      process.exit(1);
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert super admin
    const insertQuery = `
      INSERT INTO users (email, password_hash, role, is_password_reset_required, full_name)
      VALUES ($1, $2, 'super_admin', false, $3)
      RETURNING id, email, role
    `;

    const result = await pool.query(insertQuery, [
      email,
      password_hash,
      fullName,
    ]);

    console.log("✅ Super admin created successfully!");
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Role: ${result.rows[0].role}`);
    console.log(
      "\n⚠️  Remember to change the default password after first login!"
    );

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
    await pool.end();
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log(
    "Usage: npx tsx scripts/create-super-admin.ts <email> <password> <fullName>"
  );
  console.log(
    'Example: npx tsx scripts/create-super-admin.ts admin@company.com "SuperAdmin@2025" "John Doe"'
  );
  process.exit(1);
}

const [email, password, fullName] = args;

// Validate email format (basic check)
if (!email.includes("@")) {
  console.error("❌ Invalid email format");
  process.exit(1);
}

// Validate password length
if (password.length < 8) {
  console.error("❌ Password must be at least 8 characters long");
  process.exit(1);
}

createSuperAdmin(email, password, fullName);
