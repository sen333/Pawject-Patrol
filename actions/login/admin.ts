"use server"

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Action to handle admin login
export const adminLoginAction = async (FormData: FormData) => {

  // Extract login credentials from FormData
  const loginCredentials = {
    email: FormData.get("email") as string,
    password: FormData.get("password") as string,
  };

  // Create Supabase client
  const supabase = await createClient();

  // Attempt to sign in with provided credentials
  const { data, error: authError } = await supabase.auth.signInWithPassword(loginCredentials);

  // Handle authentication error (minimal error logging)
  if (authError) {
    console.error('[adminLoginAction] Auth error:', authError.message);
    return { success: false, message: "Invalid email or password" };
  }

  // Handle missing user data
  if (!data.user) {
    return { success: false, message: "Invalid email or password" };
  }

  // Query the admin table to verify admin status
  const { data: adminData, error: adminError } = await supabase
    .from("admin")
    .select("auth_id")
    .eq("auth_id", data.user?.id)
    .single();

  // Handle admin check error (minimal error logging)
  if (adminError) {
    console.error('[adminLoginAction] Admin check error:', adminError.message);
    await supabase.auth.signOut();
    return { success: false, message: "You are not an admin" };
  }

  // If no admin record found, sign out and return error
  if (!adminData) {
    await supabase.auth.signOut();
    return { success: false, message: "You are not an admin" };
  }

  // Successful admin login (no logging for production)
  return { success: true, message: "Login successful" };
};

// Action to handle admin logout
export const adminLogoutAction = async () => {
  const { auth } = await createClient();

  // Sign out the admin user
  const { error } = await auth.signOut();

  // Handle sign-out error
  if (error) {
    return error;
  }

  // Redirect to admin login page after logout
  redirect("/admin/login");
};