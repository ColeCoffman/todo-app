"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register } from "@/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const [state, registerAction] = useFormState(register, {});
  const router = useRouter();

  // Redirect when registration is successful
  if (state.success) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-pink-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-[400px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-500 mt-2">Start managing your tasks today</p>
        </div>

        <form action={registerAction} className="flex flex-col gap-4">
          {/* First Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="first_name" className="text-gray-700">
              First Name
            </Label>
            <Input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="First Name"
              className="rounded-md"
            />
          </div>
          {state?.errors?.first_name && (
            <p className="text-red-500 text-sm">{state.errors.first_name[0]}</p>
          )}

          {/* Last Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="last_name" className="text-gray-700">
              Last Name
            </Label>
            <Input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Last Name"
              className="rounded-md"
            />
          </div>
          {state?.errors?.last_name && (
            <p className="text-red-500 text-sm">{state.errors.last_name[0]}</p>
          )}

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
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Log in
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
      {pending ? "Creating account..." : "Sign up"}
    </Button>
  );
}
