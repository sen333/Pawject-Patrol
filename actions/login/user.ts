"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signInWithGoogle = async () => {
  const supabase = await createClient();
  const originUrl = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${originUrl}/auth/callback?next=/`,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
};