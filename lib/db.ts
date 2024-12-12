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

export interface Task {
  id: string;
  user_id: string;
  category_id?: string;
  text: string;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
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

  // Task methods
  async getTasks(userId: string): Promise<Task[]> {
    const result = await pool.query(
      `SELECT * FROM tasks 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async createTask(
    userId: string,
    text: string,
    categoryId?: string
  ): Promise<Task> {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, category_id, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, categoryId, text]
    );
    return result.rows[0];
  },

  async updateTask(
    taskId: string,
    userId: string,
    updates: Partial<Task>
  ): Promise<Task> {
    const setClause = Object.entries(updates)
      .map(([key, _], index) => `${key} = $${index + 3}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE tasks 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [taskId, userId, ...Object.values(updates)]
    );
    return result.rows[0];
  },

  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM tasks 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [taskId, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },

  // Category methods
  async getCategories(userId: string): Promise<Category[]> {
    const result = await pool.query(
      `SELECT * FROM categories 
       WHERE user_id = $1 
       ORDER BY name`,
      [userId]
    );
    return result.rows;
  },

  async createCategory(
    userId: string,
    name: string,
    color: string
  ): Promise<Category> {
    const result = await pool.query(
      `INSERT INTO categories (user_id, name, color)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, name, color]
    );
    return result.rows[0];
  },

  async updateCategory(
    categoryId: string,
    userId: string,
    updates: Partial<Category>
  ): Promise<Category> {
    const setClause = Object.entries(updates)
      .map(([key, _], index) => `${key} = $${index + 3}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE categories 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [categoryId, userId, ...Object.values(updates)]
    );
    return result.rows[0];
  },

  async deleteCategory(categoryId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM categories 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [categoryId, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },
};
