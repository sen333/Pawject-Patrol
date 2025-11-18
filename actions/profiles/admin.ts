// Server action: create animal profile (temporary implementation)
"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type CreateAnimalInput = {
  name: string;
  species: string;
  breed: string;
  description: string;
  status: string;
  photoUrl?: string;
};

export async function createAnimalProfile(input: CreateAnimalInput) {
  try {
    // Init Supabase server client using cookies for auth context
    const cookieStore = await cookies();
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

    if (error) {
      console.error("Database insert error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("Animal created successfully:", data);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Unexpected error" };
  }
}

type UpdateAnimalInput = {
  id: string;
  name: string;
  species: string;
  breed: string;
  description: string;
  status: string;
  photoUrl?: string;
};

export async function updateAnimalProfile(input: UpdateAnimalInput) {
  try {
    const cookieStore = await cookies();
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

    if (!input.name.trim()) {
      return { success: false, error: "Name is required" };
    }

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

    const { data, error } = await supabase
      .from("animal")
      .update(updateData)
      .eq("animal_id", input.id)
      .select();

    if (error) {
      console.error("Database update error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("Animal updated successfully:", data);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Unexpected error" };
  }
}

export async function deleteAnimalProfile(id: string) {
  try {
    const cookieStore = await cookies();
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

    const { error } = await supabase
      .from("animal")
      .delete()
      .eq("animal_id", id);

    if (error) {
      console.error("Database delete error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("Animal deleted successfully:", id);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Unexpected error" };
  }
}
