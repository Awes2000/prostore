import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="space-y-6 rounded-lg bg-white p-8 shadow">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-gray-500">Sign up to get started</p>
      </div>

      <SignUpForm />

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-blue-600 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
