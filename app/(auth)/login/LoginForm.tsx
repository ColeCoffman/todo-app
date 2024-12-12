"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/actions";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [state, loginAction] = useFormState(login, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
      <div className="bg-white p-8 rounded-lg shadow-xl w-[400px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Login to your account
          </h1>
          <p className="text-gray-500 mt-2">Access your tasks efficiently</p>
        </div>

        <form action={loginAction} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-md"
            />
          </div>
          {state?.errors?.email && (
            <p className="text-red-500 text-sm">{state.errors.email[0]}</p>
          )}

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              className="rounded-md"
            />
          </div>
          {state?.errors?.password && (
            <p className="text-red-500 text-sm">{state.errors.password[0]}</p>
          )}

          <SubmitButton />

          <p className="text-center text-gray-600 text-sm mt-4">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-2"
    >
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}
