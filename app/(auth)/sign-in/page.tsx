import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="space-y-6 rounded-lg bg-white p-8 shadow">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-gray-500">
          Enter your credentials to access your account
        </p>
      </div>

      <SignInForm />

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-blue-600 hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
