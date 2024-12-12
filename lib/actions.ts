"use server";

import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
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

export async function logout() {}
