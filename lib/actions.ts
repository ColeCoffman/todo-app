"use server";

import { db } from "@/lib/db";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { cookies } from "next/headers";

interface LoginState {
  errors?: {
    email?: string[];
    password?: string[];
  };
  success?: boolean;
}

interface RegisterState {
  errors?: {
    email?: string[];
    password?: string[];
    first_name?: string[];
    last_name?: string[];
  };
  success?: boolean;
}

export async function login(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      errors: {
        email: !email ? ["Email is required"] : undefined,
        password: !password ? ["Password is required"] : undefined,
      },
    };
  }

  try {
    const response = await fetch("http://nginx/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.error || "Login failed");
    }

    await createSession(data.user.id);

    return { success: true };
  } catch (err) {
    console.error("Login error:", err);
    return {
      errors: {
        email: [(err as Error).message || "An unexpected error occurred"],
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

  try {
    const response = await fetch("http://nginx/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.error || "Registration failed");
    }

    return { success: true };
  } catch (err) {
    console.error("Registration error:", err);
    return {
      errors: {
        email: [(err as Error).message || "An unexpected error occurred"],
      },
    };
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
