// Server action: create animal profile (temporary implementation)
"use server";

// Import necessary modules
import { createClient } from "@/utils/supabase/server";

// Helper: upload a photo (File | base64 | Buffer) and return public URL or null
async function uploadProfilePhoto(
  supabase: any,
  bucketName: string,
  source: File | string | Buffer | null | undefined,
  folder = "animal-reports",
  filenamePrefix?: string | number
): Promise<string | null> {
  if (!source) return null;
  try {
    // If it's a local blob URL, can't fetch on server
    if (typeof source === "string") {
      if (source.startsWith("blob:")) {
        console.warn("Cannot upload local blob URL on server");
        return null;
      }
      if (source.startsWith("data:")) {
        // base64 data URL
        const parts = source.split(",");
        const meta = parts[0];
        const b64 = parts[1];
        const buffer = Buffer.from(b64, "base64");
        const contentType = meta.split(":")[1].split(";")[0] ?? "image/jpeg";
        const prefix = filenamePrefix ? `${filenamePrefix}_` : "";
        const filename = `${folder}/${prefix}${Date.now()}.jpg`;
        const { data: upData, error: upErr } = await supabase.storage
          .from(bucketName)
          .upload(filename, buffer, { contentType, upsert: false });
        if (upErr || !upData) {
          console.error("Storage upload error (base64):", upErr, upData);
          console.error("Upload details (base64):", { bucketName, filename, contentType, bufferSize: buffer.length });
          return null;
        }
        const { data: urlData, error: urlErr } = await supabase.storage
          .from(bucketName)
          .getPublicUrl(filename);
        if (urlErr) {
          console.error("getPublicUrl error:", urlErr, urlData);
          return null;
        }
        return (urlData as any)?.publicUrl ?? null;
      }
      // If it's already a remote URL, return it as-is
      return source;
    }

    // File or Buffer
    const f: any = source as any;
    const originalName = f.name || `${Date.now()}.jpg`;
    const ext = originalName.split(".").pop() || "jpg";
    const prefix = filenamePrefix ? `${filenamePrefix}_` : "";
    const filename = `${folder}/${prefix}${Date.now()}_${originalName}`;
    const { data: upData, error: upErr } = await supabase.storage
      .from(bucketName)
      .upload(filename, f, { upsert: false });
    if (upErr || !upData) {
      console.error("Storage upload error:", upErr, upData);
      console.error("Upload details:", { bucketName, filename, fileSize: (f as any).size || (f as Buffer).length });
      return null;
    }
    const { data: urlData, error: urlErr } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);
    if (urlErr) {
      console.error("getPublicUrl error:", urlErr, urlData);
      return null;
    }
    return (urlData as any)?.publicUrl ?? null;
  } catch (e) {
    console.error("uploadProfilePhoto failed:", e);
    return null;
  }
}

// Report theme type definition
export type ReportTheme = "blue" | "green" | "orange" | "pink";

// Manage animal profiles in the database
type CreateAnimalInput = {
  name?: string;
  species?: string;
  breed?: string;
  description?: string;
  status?: string;
  gender?: string;
  location?: string;
  vaccinationStatus?: string;
  photoUrl?: string;
  dateSeen?: string | null;
  date_seen?: string | null;
  area?: string | null;
  landmark?: string | null;
  road?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  healthIssues?: string | null;
  health_issues?: string | null;
  animalCollar?: string | null;
  animal_collar?: string | null;
  otherInformation?: string | null;
  other_information?: string | null;
  // optional compatibility with snake_case payloads
  animal_name?: string;
  animal_species?: string;
  animal_breed?: string;
  animal_description?: string;
  animal_status?: string;
  animal_gender?: string;
  vaccination_status?: string;
  photo?: File | string;
  // support animal_type from the form
  animal_type?: string;
  animalType?: string;
  // new fields
  recorderName?: string;
  recorder_name?: string;
  animalTheme?: string;
  animal_theme?: string;
  [key: string]: any;
};

// Function to update an existing animal profile
type UpdateAnimalInput = {
  id: string;
  name?: string;
  species?: string;
  breed?: string;
  description?: string;
  status?: string;
  gender?: string;
  location?: string;
  vaccinationStatus?: string;
  photoUrl?: string;
  dateSeen?: string | null;
  date_seen?: string | null;
  area?: string | null;
  landmark?: string | null;
  road?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  healthIssues?: string | null;
  health_issues?: string | null;
  animalCollar?: string | null;
  animal_collar?: string | null;
  otherInformation?: string | null;
  other_information?: string | null;
  // optional snake_case compatibility
  animal_name?: string;
  animal_species?: string;
  animal_breed?: string;
  animal_description?: string;
  animal_status?: string;
  animal_gender?: string;
  vaccination_status?: string;
  // new fields
  recorderName?: string;
  recorder_name?: string;
  animalTheme?: string;
  animal_theme?: string;
  // support animal_type from the form
  animal_type?: string;
  animalType?: string;
  [key: string]: any;
};

// Function to create a new animal profile
export async function createAnimalProfile(input: CreateAnimalInput) {
  try {
    const supabase = await createClient();
    const name = (input.name ?? input.animal_name ?? "").toString().trim();
    if (!name) {
      return { success: false, error: "Name is required" };
    }

    // Use Animal Profile Photos bucket for admin uploads
    const bucketName = "Animal Profile Photos";

    const species = ((input.species ?? input.animal_species ?? input.animal_type ?? input.animalType) || "").toString().trim();
    const breed = ((input.breed ?? input.animal_breed) || "").toString().trim();
    const description = ((input.description ?? input.animal_description) || "").toString().trim();
    let status = ((input.status ?? input.animal_status) || "").toString().trim();
    if (!status) status = "Unknown";
    const gender = ((input.gender ?? input.animal_gender) || "").toString().trim();
    const vaccination = ((input.vaccinationStatus ?? input.vaccination_status) || "").toString().trim();
    let photo = ((input.photo as any) ?? input.photoBase64 ?? input.photoUrl ?? null) as string | null | File;
    if (typeof photo === "string" && photo.startsWith("blob:")) {
      // local blob/object URLs can't be fetched server-side; treat as no photo so upload won't save the blob URL
      console.warn("Ignoring local blob URL for photo; expecting File or base64 instead.");
      photo = null;
    }
    const recorder = (input.recorderName ?? input.recorder_name) ?? null;
    const theme = (input.animalTheme ?? input.animal_theme) ?? null;
    const dateSeenVal = (input.dateSeen ?? input.date_seen) ?? null;
    const areaVal = (input.area ?? null) ?? null;
    const landmarkVal = (input.landmark ?? null) ?? null;
    const roadVal = (input.road ?? null) ?? null;
    const latVal = (input.latitude ?? input.lat ?? null) ?? null;
    const lngVal = (input.longitude ?? input.lng ?? null) ?? null;
    const healthVal = (input.healthIssues ?? input.health_issues ?? null) ?? null;
    const collarVal = (input.animalCollar ?? input.animal_collar ?? null) ?? null;
    const otherVal = (input.otherInformation ?? input.other_information ?? null) ?? null;

    const insertPayload: any = {
      animal_name: name,
      animal_species: species || null,
      animal_breed: breed || null,
      animal_description: description || null,
      animal_status: status || null,
      animal_gender: gender || null,
      vaccination_status: vaccination || null,
      animal_photo: null,
      recorder_name: recorder || null,
      animal_theme: theme || null,
      date_seen: dateSeenVal,
      area: areaVal,
      landmark: landmarkVal,
      road: roadVal,
      latitude: latVal !== null ? Number(latVal as any) : null,
      longitude: lngVal !== null ? Number(lngVal as any) : null,
      health_issues: healthVal,
      animal_collar: collarVal,
      other_information: otherVal,
    };

    // Insert first to obtain an animal_id for filename prefix
    const { data: insertedData, error: insertErr } = await supabase.from("animal").insert(insertPayload).select().single();
    if (insertErr) {
      console.error("Database insert error:", insertErr);
      return { success: false, error: insertErr.message };
    }

    const insertedId = (insertedData as any)?.animal_id;
    if (photo) {
      const uploaded = await uploadProfilePhoto(supabase, bucketName, photo, "animal-reports", insertedId ?? undefined);
      if (uploaded) {
        // update the inserted row with the photo URL
        const { error: updErr } = await supabase
          .from("animal")
          .update({ animal_photo: uploaded })
          .eq("animal_id", insertedId);
        if (updErr) console.error("Failed to update animal with photo URL:", updErr);
      }
    }
    return { success: true };
    
  } catch (e: any) {
    return { success: false, error: e?.message || "Unexpected error" };
  }
}

// Function to update an existing animal profile
export async function updateAnimalProfile(input: UpdateAnimalInput) {
  try {
    const supabase = await createClient();
    const name = (input.name ?? input.animal_name ?? "").toString().trim();
    if (!name) {
      return { success: false, error: "Name is required" };
    }
    const bucketName = "Animal Profile Photos";
    const species = ((input.species ?? input.animal_species ?? input.animal_type ?? input.animalType) || "").toString().trim();
    const breed = ((input.breed ?? input.animal_breed) || "").toString().trim();
    const description = ((input.description ?? input.animal_description) || "").toString().trim();
    let status = ((input.status ?? input.animal_status) || "").toString().trim();
    if (!status) status = "Unknown";
    const gender = ((input.gender ?? input.animal_gender) || "").toString().trim();
    const vaccination = ((input.vaccinationStatus ?? input.vaccination_status) || "").toString().trim();
    const recorder = (input.recorderName ?? input.recorder_name) ?? null;
    const theme = (input.animalTheme ?? input.animal_theme) ?? null;

    const updateData: any = {
      animal_name: name,
      animal_species: species || null,
      animal_breed: breed || null,
      animal_description: description || null,
      animal_status: status || null,
      animal_gender: gender || null,
      vaccination_status: vaccination || null,
      recorder_name: recorder || null,
      animal_theme: theme || null,
      date_seen: (input.dateSeen ?? input.date_seen) ?? null,
      area: (input.area ?? null) ?? null,
      landmark: (input.landmark ?? null) ?? null,
      road: (input.road ?? null) ?? null,
      latitude: (input.latitude ?? input.lat ?? null) !== null ? Number((input.latitude ?? input.lat ?? null) as any) : null,
      longitude: (input.longitude ?? input.lng ?? null) !== null ? Number((input.longitude ?? input.lng ?? null) as any) : null,
      health_issues: (input.healthIssues ?? input.health_issues) ?? null,
      animal_collar: (input.animalCollar ?? input.animal_collar) ?? null,
      other_information: (input.otherInformation ?? input.other_information) ?? null,
    };
    // Handle photo upload for updates as well
    // Prefer an actual File or base64 payload over a preview URL; ignore local blob: URLs
    let photoVal = ((input as any).photo ?? (input as any).photoBase64 ?? input.photoUrl ?? null) as string | null | File | undefined;
    if (photoVal && typeof photoVal === "string" && photoVal.startsWith("blob:")) {
      photoVal = null;
    }
    if (photoVal) {
      const uploaded = await uploadProfilePhoto(supabase, bucketName, photoVal, "animal-reports", input.id);
      if (uploaded) updateData.animal_photo = uploaded;
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
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Unexpected error" };
  }
}

// Function to delete an animal profile by ID
export async function deleteAnimalProfile(id: string) {
  try {
    // Create Supabase client with proper auth context
    const supabase = await createClient();

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
    
    return { success: true };
  } catch (e: any) {
    // Handle unexpected errors
    return { success: false, error: e?.message || "Unexpected error" };
  }
}
