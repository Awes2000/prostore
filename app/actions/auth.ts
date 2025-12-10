"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { signUpSchema } from "@/lib/schemas/auth";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";

// Sign in action
export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
}

// Sign out action
export async function signOutAction() {
  await signOut({ redirect: false });
}

// Sign up action
export async function signUpAction(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = signUpSchema.safeParse(data);

  if (!validated.success) {
    const errors = validated.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return { error: firstError || "Validation failed" };
  }

  const { name, email, password } = validated.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email already registered" };
    }

    const hashedPassword = hashSync(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "Failed to create account" };
  }
}
