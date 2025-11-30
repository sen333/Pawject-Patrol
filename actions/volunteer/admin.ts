// Server-side code for managing volunteer calls in the admin interface
"use server";

// Import necessary modules
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Define the VolunteerCall type
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

// Helper function to get Supabase client
async function getSupabase() {
  return await createClient();
}

// Function to list volunteer calls with optional search and limit
export async function listVolunteerCalls(opts?: { search?: string; limit?: number }) {

  // Log incoming options for debugging
  try {
    const supabase = await getSupabase();

    // Check for search parameter and build query accordingly
    let q: any = supabase.from("volunteer_call").select("*");
    if (opts?.search) {
      // Make consistent search string
      const s = opts.search;

      // Search in title, details, or location
      q = q.or(`call_title.ilike.%${s}%,call_details.ilike.%${s}%,call_location.ilike.%${s}%`);
    }
    // Default ordering by created_at descending
    q = q.order("created_at", { ascending: false });
    
    // Apply limit if specified
    if (opts?.limit) q = q.limit(opts.limit);

    // Execute the query
    const { data, error } = await q;
    
    // Handle any errors
    if (error) {
      console.error("listVolunteerCalls error:", error);
      return [];
    }

    // Additional debugging
    try {} catch (e) {}

    // Return the list of volunteer calls
    return (data || []) as VolunteerCall[];
  } catch (e) {
    // Log unexpected errors
    console.error(e);

    // Return empty list on error
    return [];
  }
}

// Function to get a single volunteer call by ID
export async function getVolunteerCall(id?: string) {
  // Check for valid ID
  if (!id) return null;

  // Fetch the volunteer call from the database
  try {
    // Create Supabase client
    const supabase = await getSupabase();

    // Query the volunteer_call table for the specified ID
    const { data, error } = await supabase.from("volunteer_call").select("*").eq("call_id", id).single();
    
    // Handle any errors
    if (error) {
      console.error("getVolunteerCall error:", error);
      return null;
    }

    // Return the volunteer call data
    return data as VolunteerCall;
  } 
  // Catch unexpected errors
  catch (e) {
    // Log the error
    console.error(e);

    // Return null on error
    return null;
  }
}

// Server action to create a new volunteer call
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

    // Check for service role key to use elevated privileges
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Create Supabase client with service role
        const svc = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );

        // Insert the new volunteer call into the database
        const res = await svc.from("volunteer_call").insert(payload).select();

        // Handle any errors
        if (res.error) {
          console.error("createAction (service) error:", res.error);
          return;
        }

        // Revalidate the admin volunteer list so the UI updates immediately
        try { revalidatePath('/admin/volunteer'); } catch (_) {}

        // Perform redirect outside of catch handling below by throwing through
        redirect("/admin/volunteer");

        // Successful completion
        return;
      } catch (e: any) {
        // Check if Next's redirect throws, rethrow so the runtime can handle navigation
        if (e && typeof e === 'object' && (String((e as any).digest || '').startsWith('NEXT_REDIRECT') || String((e as any).message || '').includes('NEXT_REDIRECT'))) {
          throw e;
        }

        // Log unexpected errors
        console.error("createAction service client error:", e);
        return;
      }
    }

    // Create Supabase client
    const supabase = await getSupabase();

    // Insert the new volunteer call into the database
    const { data, error } = await supabase.from("volunteer_call").insert(payload).select();

    // Handle any errors
    if (error) {
      console.error("createAction error:", error);
      return;
    }

    // After creating, revalidate the admin list and redirect back
    try { revalidatePath('/admin/volunteer'); } catch (_) {}
    redirect("/admin/volunteer");

    // Successful completion
    return;
  } catch (e: any) {
    // If Next's redirect throws, rethrow so the runtime can handle navigation
    if (e && typeof e === 'object' && (String((e as any).digest || '').startsWith('NEXT_REDIRECT') || String((e as any).message || '').includes('NEXT_REDIRECT'))) {
      throw e;
    }
    // Log unexpected errors
    console.error(e?.message || "Unexpected error");
    // End function
    return;
  }
}

// Server action to update an existing volunteer call
export async function updateAction(formData: FormData): Promise<void> {
  
  // Try to update the volunteer call
  try {
    // Get the ID from the form data
    const id = String(formData.get("id") || "");

    // Check for missing ID
    if (!id) {
      // Log error and exit
      console.error("updateAction missing id");
      return;
    }

    // Create Supabase client
    const supabase = await getSupabase();

    // Build the update data object from form data
    const updateData: any = {};

    // Populate updateData with provided fields
    if (formData.has("call_title")) updateData.call_title = String(formData.get("call_title") || null) || null;
    if (formData.has("call_details")) updateData.call_details = String(formData.get("call_details") || null) || null;
    if (formData.has("call_location")) updateData.call_location = String(formData.get("call_location") || null) || null;
    if (formData.has("call_starttime")) updateData.call_starttime = String(formData.get("call_starttime") || null) || null;
    if (formData.has("call_endtime")) updateData.call_endtime = String(formData.get("call_endtime") || null) || null;
    if (formData.has("capacity")) updateData.capacity = formData.get("capacity") ? Number(String(formData.get("capacity"))) : null;
    if (formData.has("call_status")) updateData.call_status = String(formData.get("call_status") || "") || null;

    // Perform the update in the database
    const { error } = await supabase.from("volunteer_call").update(updateData).eq("call_id", id).select();
    
    // Handle any errors
    if (error) console.error("updateAction error:", error);
    
    // Revalidate the admin volunteer list so the UI updates immediately
    else {
      try { revalidatePath('/admin/volunteer'); } catch (_) {}
    }

    // Successful completion: redirect back to the admin volunteer list
    return;
  } 
  // Catch unexpected errors
  catch (e: any) {
    // If Next's redirect throws, rethrow so the runtime can handle navigation
    if (e && typeof e === 'object' && (String((e as any).digest || '').startsWith('NEXT_REDIRECT') || String((e as any).message || '').includes('NEXT_REDIRECT'))) {
      throw e;
    }

    // Log unexpected errors
    console.error(e?.message || "Unexpected error");

    // End function
    return;
  }
}

// Server action to delete a volunteer call by ID
export async function deleteAction(formData: FormData): Promise<void> {
  // Try to delete the volunteer call
  try {
    // Get the ID from the form data
    const id = String(formData.get("id") || "");

    // Check for missing ID
    if (!id) {
      // Log error and exit
      console.error("deleteAction missing id");
      return;
    }
    
    // Perform the deletion
    let error: any = null;

    // Use service role if available for elevated privileges
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Create Supabase client with service role
        const svc = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );

        // Fetch the volunteer call before deletion for any necessary checks or logging
        const before = await svc.from("volunteer_call").select("*").eq("call_id", id).maybeSingle();
       
        // Delete the volunteer call from the database
        const res = await svc.from("volunteer_call").delete().eq("call_id", id).select();
        
        // Handle any errors
        error = res.error;

        // Log error if occurred
        if (error) console.error("deleteAction (service) error:", error);
      } catch (e) {
        // If Next's redirect throws, rethrow so the runtime can handle navigation
        if (e && typeof e === 'object' && (String((e as any).digest || '').startsWith('NEXT_REDIRECT') || String((e as any).message || '').includes('NEXT_REDIRECT'))) {
          throw e;
        }
        // Log unexpected errors
        console.error("deleteAction service client error:", e);

        // End function
        return;
      }
    } else {
      // Create Supabase client
      const supabase = await getSupabase();

      // Fetch the volunteer call before deletion for any necessary checks or logging
      const before = await supabase.from("volunteer_call").select("*").eq("call_id", id).maybeSingle();
      
      // Delete the volunteer call from the database
      const res = await supabase.from("volunteer_call").delete().eq("call_id", id).select();
      
      // Handle any errors
      error = res.error;

      // Log error if occurred
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
    
    // Log unexpected errors
    console.error(e?.message || "Unexpected error");

    // End function
    return;
  }
}

// Function to delete a volunteer call by ID, returning success status
export async function deleteVolunteerCall(id?: string) {
  // Check for valid ID
  if (!id) return { success: false, error: "missing id" };

  // Perform the deletion
  try {
    // Manage error state
    let error: any = null;

    // Use service role if available for elevated privileges
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Create Supabase client with service role
      const svc = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      // Delete the volunteer call from the database
      const { data, error: svcErr } = await svc.from("volunteer_call").delete().eq("call_id", id).select();
      
      // Handle any errors
      error = svcErr;

      // Check for errors
      if (error) return { success: false, error: String((error as any).message || error) };
    } else {
      // Create Supabase client
      const supabase = await getSupabase();

      // Delete the volunteer call from the database
      const { data, error: authErr } = await supabase.from("volunteer_call").delete().eq("call_id", id).select();
      
      // Handle any errors
      error = authErr;

      // Check for errors
      if (error) return { success: false, error: String((error as any).message || error) };
    }

    // Revalidate the admin volunteer list so the UI updates immediately
    try { revalidatePath('/admin/volunteer'); } catch (_) {}

    // Return success
    return { success: true };
  } catch (e: any) {
    // Log unexpected errors and return failure
    return { success: false, error: e?.message || String(e) };
  }
}
