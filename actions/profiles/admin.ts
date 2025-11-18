// Server action: create animal profile (temporary implementation)
"use server";

// Import necessary modules
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Manage animal profiles in the database
type CreateAnimalInput = {
  name: string;
  species: string;
  breed: string;
  description: string;
  status: string;
  photoUrl?: string;
};

// Function to update an existing animal profile
type UpdateAnimalInput = {
  id: string;
  name: string;
  species: string;
  breed: string;
  description: string;
  status: string;
  photoUrl?: string;
};

// Function to create a new animal profile
export async function createAnimalProfile(input: CreateAnimalInput) {
  try {
    // Initialize Supabase server client using cookies for auth context
    const cookieStore = await cookies();

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Basic validation
    if (!input.name.trim()) {
      return { success: false, error: "Name is required" };
    }

    // Insert into animal table (column names may vary; adjust if needed)
    const { data, error } = await supabase.from("animal").insert({
      animal_name: input.name.trim(),
      animal_species: input.species.trim(),
      animal_breed: input.breed.trim() || null,
      animal_description: input.description.trim() || null,
      animal_status: input.status.trim(),
      animal_photo: input.photoUrl || null,
    }).select();

    // Handle potential errors
    if (error) {
      console.error("Database insert error:", error);
      return { success: false, error: error.message };
    }
    
    // Success
    console.log("Animal created successfully:", data);
    return { success: true };
  } catch (e: any) {
    // Handle unexpected errors
    return { success: false, error: e?.message || "Unexpected error" };
  }
}

// Function to update an existing animal profile
export async function updateAnimalProfile(input: UpdateAnimalInput) {
  try {
    // Initialize Supabase server client using cookies for auth context
    const cookieStore = await cookies();

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Basic validation
    if (!input.name.trim()) {
      return { success: false, error: "Name is required" };
    }

    // Prepare data for update
    const updateData: any = {
      animal_name: input.name.trim(),
      animal_species: input.species.trim(),
      animal_breed: input.breed.trim() || null,
      animal_description: input.description.trim() || null,
      animal_status: input.status.trim(),
    };

    // Only update photo if a new one is provided
    if (input.photoUrl) {
      updateData.animal_photo = input.photoUrl;
    }

    // Update the animal profile in the database
    const { data, error } = await supabase
      .from("animal")
      .update(updateData)
      .eq("animal_id", input.id)
      .select();

    // Handle potential errors
    if (error) {
      console.error("Database update error:", error);
      return { success: false, error: error.message };
    }
    
    // Success
    console.log("Animal updated successfully:", data);
    return { success: true };
  } catch (e: any) {
    // Handle unexpected errors
    return { success: false, error: e?.message || "Unexpected error" };
  }
}

// Function to delete an animal profile by ID
export async function deleteAnimalProfile(id: string) {
  try {
    // Initialize Supabase server client using cookies for auth context
    const cookieStore = await cookies();

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Delete the animal profile from the database
    const { error } = await supabase
      .from("animal")
      .delete()
      .eq("animal_id", id);

    // Handle potential errors
    if (error) {
      console.error("Database delete error:", error);
      return { success: false, error: error.message };
    }
    
    // Success
    console.log("Animal deleted successfully:", id);
    return { success: true };
  } catch (e: any) {
    // Handle unexpected errors
    return { success: false, error: e?.message || "Unexpected error" };
  }
}
