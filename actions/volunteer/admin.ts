"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type VolunteerCall = {
  call_id?: string;
  call_title?: string | null;
  call_details?: string | null;
  call_starttime?: string | null;
  call_endtime?: string | null;
  call_location?: string | null;
  capacity?: number | null;
  call_status?: string | null;
  created_at?: string | null;
};

async function getSupabase() {
  return await createClient();
}

export async function listVolunteerCalls(opts?: { search?: string; limit?: number }) {
  try {
    const supabase = await getSupabase();
    let q: any = supabase.from("volunteer_call").select("*");
    if (opts?.search) {
      const s = opts.search;
      q = q.or(`call_title.ilike.%${s}%,call_details.ilike.%${s}%,call_location.ilike.%${s}%`);
    }
    q = q.order("created_at", { ascending: false });
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) {
      console.error("listVolunteerCalls error:", error);
      return [];
    }
    try {} catch (e) {}
    return (data || []) as VolunteerCall[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getVolunteerCall(id?: string) {
  if (!id) return null;
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("volunteer_call").select("*").eq("call_id", id).single();
    if (error) {
      console.error("getVolunteerCall error:", error);
      return null;
    }
    return data as VolunteerCall;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Server actions used as form `action` handlers in pages
export async function createAction(formData: FormData): Promise<void> {
  try {
    // Log incoming form data for debugging
    try {} catch (e) {}

    const payload: any = {
      call_title: String(formData.get("call_title") || "").trim() || null,
      call_details: String(formData.get("call_details") || "").trim() || null,
      call_location: String(formData.get("call_location") || "").trim() || null,
      call_starttime: String(formData.get("call_starttime") || null) || null,
      call_endtime: String(formData.get("call_endtime") || null) || null,
      capacity: formData.get("capacity") ? Number(String(formData.get("capacity"))) : null,
      call_status: String(formData.get("call_status") || "Pending") || "Pending",
    };

    

    // Prefer service role for insert if available (bypass RLS), else use authenticated client
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const svc = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
        const res = await svc.from("volunteer_call").insert(payload).select();
        if (res.error) {
          console.error("createAction (service) error:", res.error);
          return;
        }
        // revalidate the admin volunteer list so the UI updates immediately
        try { revalidatePath('/admin/volunteer'); } catch (_) {}
        // perform redirect outside of catch handling below by throwing through
        redirect("/admin/volunteer");
        return;
      } catch (e: any) {
        // If Next's redirect throws, rethrow so the runtime can handle navigation
        if (e && typeof e === 'object' && (String((e as any).digest || '').startsWith('NEXT_REDIRECT') || String((e as any).message || '').includes('NEXT_REDIRECT'))) {
          throw e;
        }
        console.error("createAction service client error:", e);
        return;
      }
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase.from("volunteer_call").insert(payload).select();
    if (error) {
      console.error("createAction error:", error);
      return;
    }

    // After creating, revalidate the admin list and redirect back
    try { revalidatePath('/admin/volunteer'); } catch (_) {}
    redirect("/admin/volunteer");
    return;
  } catch (e: any) {
    if (e && typeof e === 'object' && (String((e as any).digest || '').startsWith('NEXT_REDIRECT') || String((e as any).message || '').includes('NEXT_REDIRECT'))) {
      throw e;
    }
    console.error(e?.message || "Unexpected error");
    return;
  }
}

export async function updateAction(formData: FormData): Promise<void> {
  try {
    const id = String(formData.get("id") || "");
    if (!id) {
      console.error("updateAction missing id");
      return;
    }
    const supabase = await getSupabase();
    const updateData: any = {};
    if (formData.has("call_title")) updateData.call_title = String(formData.get("call_title") || null) || null;
    if (formData.has("call_details")) updateData.call_details = String(formData.get("call_details") || null) || null;
    if (formData.has("call_location")) updateData.call_location = String(formData.get("call_location") || null) || null;
    if (formData.has("call_starttime")) updateData.call_starttime = String(formData.get("call_starttime") || null) || null;
    if (formData.has("call_endtime")) updateData.call_endtime = String(formData.get("call_endtime") || null) || null;
    if (formData.has("capacity")) updateData.capacity = formData.get("capacity") ? Number(String(formData.get("capacity"))) : null;
    if (formData.has("call_status")) updateData.call_status = String(formData.get("call_status") || "") || null;

    const { error } = await supabase.from("volunteer_call").update(updateData).eq("call_id", id).select();
    if (error) console.error("updateAction error:", error);
    else {
      try { revalidatePath('/admin/volunteer'); } catch (_) {}
    }
    return;
  } catch (e: any) {
    // If Next's redirect throws, rethrow so the runtime can handle navigation
    if (e && typeof e === 'object' && (String((e as any).digest || '').startsWith('NEXT_REDIRECT') || String((e as any).message || '').includes('NEXT_REDIRECT'))) {
      throw e;
    }
    console.error(e?.message || "Unexpected error");
    return;
  }
}

export async function deleteAction(formData: FormData): Promise<void> {
  try {
    const id = String(formData.get("id") || "");
    if (!id) {
      console.error("deleteAction missing id");
      return;
    }
    
    let error: any = null;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const svc = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
        const before = await svc.from("volunteer_call").select("*").eq("call_id", id).maybeSingle();
        const res = await svc.from("volunteer_call").delete().eq("call_id", id).select();
        error = res.error;
        if (error) console.error("deleteAction (service) error:", error);
      } catch (e) {
        if (e && typeof e === 'object' && (String((e as any).digest || '').startsWith('NEXT_REDIRECT') || String((e as any).message || '').includes('NEXT_REDIRECT'))) {
          throw e;
        }
        console.error("deleteAction service client error:", e);
        return;
      }
    } else {
      const supabase = await getSupabase();
      const before = await supabase.from("volunteer_call").select("*").eq("call_id", id).maybeSingle();
      const res = await supabase.from("volunteer_call").delete().eq("call_id", id).select();
      error = res.error;
      if (error) console.error("deleteAction error:", error);
    }

    // Revalidate the admin volunteer list so the UI updates immediately, then redirect
    try { revalidatePath('/admin/volunteer'); } catch (_) {}
    redirect("/admin/volunteer");
  } catch (e: any) {
    // If Next's redirect throws, rethrow so the runtime can handle navigation
    if (e && typeof e === 'object' && (String((e as any).digest || '').startsWith('NEXT_REDIRECT') || String((e as any).message || '').includes('NEXT_REDIRECT'))) {
      throw e;
    }
    console.error(e?.message || "Unexpected error");
    return;
  }
}

// Server action helper for client components: delete by id and return status
export async function deleteVolunteerCall(id?: string) {
  if (!id) return { success: false, error: "missing id" };
  try {
    let error: any = null;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const svc = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
      const { data, error: svcErr } = await svc.from("volunteer_call").delete().eq("call_id", id).select();
      error = svcErr;
      if (error) return { success: false, error: String((error as any).message || error) };
    } else {
      const supabase = await getSupabase();
      const { data, error: authErr } = await supabase.from("volunteer_call").delete().eq("call_id", id).select();
      error = authErr;
      if (error) return { success: false, error: String((error as any).message || error) };
    }

    try { revalidatePath('/admin/volunteer'); } catch (_) {}
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || String(e) };
  }
}
