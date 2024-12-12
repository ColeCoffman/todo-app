import { Pool } from "pg";
import { hash, compare } from "bcryptjs";

// Create a connection pool
const pool = new Pool({
  user: "postgres",
  password: "PASS123",
  host: "db", // This matches your docker-compose service name
  port: 5432,
  database: "todo_app",
});

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface UserCreate {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export const db = {
  // Create a new user
  async createUser({
    first_name,
    last_name,
    email,
    password,
  }: UserCreate): Promise<User> {
    const hashedPassword = await hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, first_name, last_name, email`,
      [first_name, last_name, email, hashedPassword]
    );

    return result.rows[0];
  },

  // Get user by email (for login)
  async getUserByEmail(
    email: string
  ): Promise<(User & { password_hash: string }) | null> {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, password_hash
       FROM users
       WHERE email = $1`,
      [email]
    );

    return result.rows[0] || null;
  },

  // Verify user credentials
  async verifyCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        // console.log("No user found with this email");
        return null;
      }

      const validPassword = await compare(password, user.password_hash);
      //   console.log("Password valid:", validPassword);

      if (!validPassword) {
        // console.log("Invalid password");
        return null;
      }

      // Don't return the password hash
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error("Error in verifyCredentials:", error);
      return null;
    }
  },
};
