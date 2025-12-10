"use client";

import { signOutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

interface UserButtonProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function UserButton({ user }: UserButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOutAction();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
        {user.role === "admin" && (
          <span className="mt-1 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
            Admin
          </span>
        )}
      </div>
      <button
        onClick={handleSignOut}
        className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  );
}
