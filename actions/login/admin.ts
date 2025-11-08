"use server"

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const adminLoginAction = async (FormData: FormData) => {
  const loginCredentials = {
    email: FormData.get("email") as string,
    password: FormData.get("password") as string,
  };

  console.log('[adminLoginAction] Attempting login for:', loginCredentials.email);

  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.signInWithPassword(loginCredentials);

  if (authError) {
    console.log('[adminLoginAction] Auth error:', authError.message);
    return { success: false, message: "Invalid email or password" };
  }

  if (!data.user) {
    console.log('[adminLoginAction] No user data returned');
    return { success: false, message: "Invalid email or password" };
  }

  console.log('[adminLoginAction] Auth successful, checking admin status for user:', data.user.id);

  const { data: adminData, error: adminError } = await supabase
    .from("admin")
    .select("auth_id")
    .eq("auth_id", data.user?.id)
    .single();

  if (adminError) {
    console.log('[adminLoginAction] Admin check error:', adminError.message);
    await supabase.auth.signOut();
    return { success: false, message: "You are not an admin" };
  }

  if (!adminData) {
    console.log('[adminLoginAction] User not found in admin table');
    await supabase.auth.signOut();
    return { success: false, message: "You are not an admin" };
  }

  console.log('[adminLoginAction] Login successful for admin:', data.user.id);
  return { success: true, message: "Login successful" };
};

export const adminLogoutAction = async () => {
  const { auth } = await createClient();

  const { error } = await auth.signOut();

  if (error) {
    return error;
  }

  redirect("/admin/login");
};