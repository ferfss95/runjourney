"use server";

import {
  createSession,
  getSessionCookieOptions,
  validateCredentials,
} from "@/lib/auth";
import { JWT_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginFormAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Preencha todos os campos" };
  }

  if (!validateCredentials(username, password)) {
    return { error: "Credenciais inválidas" };
  }

  const token = await createSession(username);
  const cookieStore = await cookies();
  cookieStore.set(JWT_COOKIE_NAME, token, getSessionCookieOptions());

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set(JWT_COOKIE_NAME, "", getSessionCookieOptions(0));
  redirect("/login");
}
