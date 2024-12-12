"use server";

import { db } from "@/lib/db";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface LoginState {
  errors?: {
    email?: string[];
    password?: string[];
  };
  success?: boolean;
}

interface RegisterState {
  errors?: {
    first_name?: string[];
    last_name?: string[];
    email?: string[];
    password?: string[];
  };
  success?: boolean;
}

export async function login(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  const errors: LoginState["errors"] = {};

  if (!email) {
    errors.email = ["Email is required"];
  }
  if (!password) {
    errors.password = ["Password is required"];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const user = await db.verifyCredentials(email, password);

    if (!user) {
      return {
        errors: {
          email: ["Invalid email or password"],
        },
      };
    }

    await createSession(user.id);
    // console.log("Created session for user:", user.id);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      errors: {
        email: ["An error occurred during login"],
      },
    };
  }
}

export async function register(
  prevState: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  const errors: RegisterState["errors"] = {};

  if (!first_name) errors.first_name = ["First name is required"];
  if (!last_name) errors.last_name = ["Last name is required"];
  if (!email) errors.email = ["Email is required"];
  if (!password) errors.password = ["Password is required"];
  if (password && password.length < 8) {
    errors.password = ["Password must be at least 8 characters"];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return {
        errors: {
          email: ["Email already in use"],
        },
      };
    }

    await db.createUser({
      first_name,
      last_name,
      email,
      password,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      errors: {
        email: ["An error occurred during registration"],
      },
    };
  } finally {
    if ((prevState as RegisterState)?.success) {
      redirect("/login");
    }
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function getTasks() {
  const session = await getSession();
  if (!session || !session.userId) return null;

  try {
    const tasks = await db.getTasks(session.userId);
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return null;
  }
}

export async function createTask(text: string, categoryId?: string) {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    const task = await db.createTask(session.userId, text, categoryId);
    revalidatePath("/dashboard");
    return task;
  } catch (error) {
    console.error("Error creating task:", error);
    return null;
  }
}

export async function getCategories() {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    const categories = await db.getCategories(session.userId);
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
}

export async function createCategory(name: string, color: string) {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    const category = await db.createCategory(session.userId, name, color);
    revalidatePath("/dashboard");
    return category;
  } catch (error) {
    console.error("Error creating category:", error);
    return null;
  }
}

export async function updateTask(
  taskId: string,
  updates: { completed?: boolean }
) {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    const task = await db.updateTask(taskId, session.userId, updates);
    return task;
  } catch (error) {
    console.error("Error updating task:", error);
    return null;
  }
}

export async function deleteTask(taskId: string) {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    const success = await db.deleteTask(taskId, session.userId);
    return success;
  } catch (error) {
    console.error("Error deleting task:", error);
    return null;
  }
}
