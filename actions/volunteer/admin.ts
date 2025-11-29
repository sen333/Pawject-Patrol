"use server";

import { createClient, getUser } from "@/utils/supabase/server";

type ListOpts = {
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
  from?: string;
};

export async function listVolunteerCalls(opts: ListOpts = {}) {
  const supabase = await createClient();
  const { status, limit = 20, offset = 0, search, from } = opts;

  let q: any = supabase
    .from("volunteer_call")
    .select("*")
    .order("call_starttime", { ascending: true })
    .range(offset, offset + limit - 1);

  if (status) q = q.eq("call_status", status);
  if (search) q = q.ilike("call_title", `%${search}%`);
  if (from) q = q.gte("call_starttime", from);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getVolunteerCall(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("volunteer_call").select("*").eq("call_id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createVolunteerCall(payload: any, userId?: string) {
  const supabase = await createClient();
  // If no userId provided, try to read the current authenticated user from the server
  let adminId = userId;
  if (!adminId) {
    try {
      const user = await getUser();
      adminId = user?.id || undefined;
    } catch (e) {
      // ignore - we'll handle missing user below
    }
  }

  // We'll resolve the correct `admin_id` PK from the `admin` table. The authenticated
  // user id (auth uid) may be stored in `auth_id`, while `admin_id` is the table PK.
  const row: any = { ...payload };

  // If RLS is enabled and there's no authenticated admin, inserts will fail due to policies.
  // Throw a helpful error so callers can handle auth/login first.
  if (!adminId) {
    throw new Error('Cannot create volunteer call: no authenticated admin. Log in or run this with an admin/service role.');
  }

  // Verify that the authenticated user is present in the `public.admin` table so the
  // foreign-key constraint (admin_id -> public.admin(admin_id)) won't fail.
  try {
    // First try matching on `auth_id` (the column that usually stores the auth uid).
    let existingAdmin: any = null;
    let adminErr: any = null;

    ({ data: existingAdmin, error: adminErr } = await supabase
      .from("admin")
      .select("admin_id, auth_id")
      .eq("auth_id", adminId)
      .maybeSingle());

    if (adminErr) throw adminErr;

    // If not found by auth_id, try matching by admin_id (in case caller passed an admin_id)
    if (!existingAdmin) {
      ({ data: existingAdmin, error: adminErr } = await supabase
        .from("admin")
        .select("admin_id, auth_id")
        .eq("admin_id", adminId)
        .maybeSingle());
      if (adminErr) throw adminErr;
    }

    if (!existingAdmin) {
      // Provide a helpful SQL hint: insert an admin row that maps the auth uid to an admin.
      const hintSql = `-- If you intend this auth user to be an admin, insert into public.admin:\nINSERT INTO public.admin (auth_id, added_at) VALUES ('${adminId}', now());`;
      throw new Error(`Insert failed: admin auth id ${adminId} is not present in table public.admin.\nQuick fix (run in Supabase SQL editor):\n${hintSql}`);
    }

    // Use the resolved admin_id PK (on the admin table) as the FK for volunteer_call.
    row.admin_id = existingAdmin.admin_id;
  } catch (e) {
    // Re-throw errors for the caller to surface (server action will return as a 500).
    throw e;
  }

  const { data, error } = await supabase.from("volunteer_call").insert(row).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateVolunteerCall(id: string, updates: any) {
  const supabase = await createClient();
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from("volunteer_call").update(updates).eq("call_id", id).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteVolunteerCall(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("volunteer_call").delete().eq("call_id", id);
  if (error) throw error;
  return true;
}

// Basic signup: tries to increment `filled` and then creates an assignment row.
// This implementation is best-effort; for production use create an RPC function
// to perform the capacity-check and insert atomically in Postgres.
export async function signUpForCall(callId: string, payload: { user_id?: string; name?: string; email?: string; role?: string; }) {
  const supabase = await createClient();
  const sup = supabase;

  // Try to fetch a capacity column if your schema has one. If not present, treat as unlimited.
  const { data: call, error: callErr } = await sup.from("volunteer_call").select("capacity, call_id").eq("call_id", callId).maybeSingle();
  if (callErr) throw callErr;

  const capacity = typeof call?.capacity === "number" ? call.capacity : 0;

  // Count existing confirmed responses in the `volunteer_response` table
  let responseCount = 0;
  try {
    const countRes: any = await sup
      .from("volunteer_response")
      .select("response_id", { count: "exact", head: true })
      .eq("call_id", callId)
      .eq("response_stat", "confirmed");
    responseCount = countRes.count || 0;
  } catch (e) {
    // If volunteer_response table is missing, fall back to 0
    responseCount = 0;
  }

  let assignmentStatus = "confirmed";
  // If capacity is set and reached, mark as waitlist
  if (capacity > 0 && responseCount >= capacity) {
    assignmentStatus = "waitlist";
  }

  // Insert into the `volunteer_response` table. This table (from your screenshots)
  // has columns like response_id, created_at, user_id, call_id, response_stat
  const insertRow: any = {
    call_id: callId,
    user_id: payload.user_id || null,
    response_stat: assignmentStatus,
  };

  const { data: response, error: respErr } = await sup.from("volunteer_response").insert(insertRow).select().maybeSingle();
  if (respErr) {
    // surface helpful error if insertion fails (e.g., table/column missing)
    throw respErr;
  }

  return { response, assignmentStatus };
}
