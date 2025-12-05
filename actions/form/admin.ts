"use server";

import { createClient } from "@/utils/supabase/server";

// Define the structure of an admin animal report summary
export interface AdminAnimalReportSummary {
	report_id: string; // UUID
	report_title: string | null;
	reporter_name: string | null;
	animal_name: string | null;
	animal_type: string | null;
	animal_gender: string | null;
	date_seen: string | null;
	area: string | null;
	landmark: string | null;
	created_at: string | null;
	photo_url: string | null;
	latitude: number | null;
	longitude: number | null;
	report_status: string | null; // 'Pending' | 'Accepted' | 'Rejected'
	health_issues?: string | null;
	animal_collar?: string | null;
	other_information?: string | null;
}

// Fetch recent animal reports for admin dashboard, prioritize Pending > Accepted > Rejected
export async function getRecentAnimalReports(limit = 50): Promise<AdminAnimalReportSummary[]> {
	const supabase = await createClient();

	// Verify admin authentication
	const { data: { user }, error: authError } = await supabase.auth.getUser();

	// Fetch animal reports
	const { data, error } = await supabase
		.from("animal_report")
		.select(
			"report_id, report_title, reporter_name, animal_name, animal_type, animal_gender, date_seen, area, landmark, created_at, photo_url, latitude, longitude, report_status, health_issues, animal_collar, other_information"
		)
		.order("created_at", { ascending: false })
		.limit(limit * 3); // Fetch more to sort by status

	// Handle fetch error
	if (error) {
		console.error("getRecentAnimalReports error", error);
		return [];
	}

	// Prioritize: Pending > Accepted > Rejected
	const sorted = (data ?? []).sort((a, b) => {
		const statusOrder: Record<string, number> = { 'Pending': 0, 'Accepted': 1, 'Rejected': 2 };
		const aOrder = statusOrder[a.report_status || 'Pending'] ?? 3;
		const bOrder = statusOrder[b.report_status || 'Pending'] ?? 3;
		return aOrder - bOrder;
	});

	// Return only the requested number of reports
	return sorted.slice(0, limit);
}

// Fetch single report by id (UUID)
export async function getAnimalReportById(id: string) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("animal_report")
		.select("*")
		.eq("report_id", id)
		.single();

	if (error) {
		console.error("getAnimalReportById error", error);
		return null;
	}
	return data;
}

// Update report status (Accept or Reject)
export async function updateReportStatus(reportId: string, status: 'Accepted' | 'Rejected') {
	const supabase = await createClient();
	
	// Verify admin authentication
	const { data: { user }, error: authError } = await supabase.auth.getUser();
	if (authError || !user) {
		console.error('updateReportStatus auth error', authError);
		return { success: false, error: 'Not authenticated' };
	}

	// Verify user is admin
	const { data: admin, error: adminError } = await supabase
		.from('admin')
		.select('auth_id')
		.eq('auth_id', user.id)
		.maybeSingle();

	// Handle admin check error
	if (adminError || !admin) {
		console.error('updateReportStatus admin check error', adminError);
		return { success: false, error: 'Not authorized' };
	}

	// Update the report status
	const { data, error } = await supabase
		.from('animal_report')
		.update({ report_status: status })
		.eq('report_id', reportId)
		.select();
	
	// Handle update error
	if (error) {
		console.error('updateReportStatus error', error);
		return { success: false, error: error.message };
	}
	
	// Successfully updated
	console.log('Report status updated successfully:', data);
	return { success: true };
}

