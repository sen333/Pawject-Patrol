"use server";

import { createClient } from "@/utils/supabase/server";

// Define possible report themes
export type ReportTheme = 'blue' | 'green' | 'orange' | 'purple';

// Data structure for creating a new animal report
export interface AnimalReportInsert {
	recorder_name?: string;      // text
	animal_name?: string;        // text
	animal_type?: string;        // text
	animal_gender?: string;      // 'unknown' | 'male' | 'female'
	date_seen?: string;          // ISO timestamptz
	animal_description?: string; // text
	area?: string;				 // text
	landmark?: string;			 // text
	road?: string;				 // text
	health_issues?: string;      // null or description if issues
	animal_collar?: string;      // null or description if collar present
	other_information?: string;  // null or additional info
	report_theme?: ReportTheme;  // chosen color theme
	latitude: number;            // float8
	longitude: number;           // float8
	photo?: File;                // Image file to upload
}

// Helper function to upload photo to Supabase Storage and return public URL
async function uploadAnimalPhoto(file: File, reportId: number): Promise<string | null> {
	const supabase = await createClient();
	
	// Create a unique filename: reportId_timestamp.extension
	const fileExt = file.name.split('.').pop();
	const fileName = `${reportId}_${Date.now()}.${fileExt}`;
	const filePath = `animal-reports/${fileName}`;

	// Upload the file to Supabase Storage
	const { error: uploadError } = await supabase.storage
		.from('Animal Photos') // Using your existing bucket name
		.upload(filePath, file, {
			cacheControl: '3600',
			upsert: false
		});

	// Handle upload error
	if (uploadError) {
		console.error('Photo upload error:', uploadError);
		return null;
	}

	// Get public URL from Supabase Storage for Animal Photos bucket
	const { data: { publicUrl } } = supabase.storage
		.from('Animal Photos')
		.getPublicUrl(filePath);

	// Return the public URL
	return publicUrl;
}

// Create a new animal report with optional photo upload
export async function createAnimalReport(data: AnimalReportInsert) {
	const supabase = await createClient();

	// Get current user to set reporter_id implicitly (RLS relies on auth.uid())
	const { data: { user }, error: userError } = await supabase.auth.getUser();

	// Handle unauthenticated user
	if (userError || !user) {
		return { success: false, error: "Not authenticated" };
	}

	// Insert new report record
	const insertPayload = {
		user_id: user.id,
		recorder_name: data.recorder_name ?? null,
		animal_name: data.animal_name ?? null,
		animal_type: data.animal_type ?? 'other',
		animal_gender: data.animal_gender ?? 'unknown',
		date_seen: data.date_seen ?? null,
		animal_description: data.animal_description ?? null,
		area: data.area ?? null,
		landmark: data.landmark ?? null,
		road: data.road ?? null,
		health_issues: data.health_issues ?? null,
		animal_collar: data.animal_collar ?? null,
		other_information: data.other_information ?? null,
		report_theme: data.report_theme ?? null,
		latitude: data.latitude,
		longitude: data.longitude
	} as const;

	// Insert the report and get the generated report_id
	const { data: inserted, error } = await supabase
		.from('animal_report')
		.insert(insertPayload)
		.select('report_id')
		.single();

	// Handle insertion error
	if (error) {
		console.error('createAnimalReport error', error);
		return { success: false, error: error.message };
	}

	// If photo is provided, upload it and update the report
	if (data.photo && inserted?.report_id) {
		const photoUrl = await uploadAnimalPhoto(data.photo, inserted.report_id);
		
		// If upload succeeded, update the report with the photo URL
		if (photoUrl) {
			// Update the report with the photo URL
			await supabase
				.from('animal_report')
				.update({ photo_url: photoUrl })
				.eq('report_id', inserted.report_id);
		}
	}

	// Return success with the new report ID
	return { success: true, reportId: inserted?.report_id };
}

