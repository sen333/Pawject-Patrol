// NOTE: This is only a temporarily prompted admin reports page to test backend, not yet the final version

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

// Define the Report type
type Report = {
	report_id: string; // UUID
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
	report_status: string | null;
	health_issues?: string | null;
	animal_collar?: string | null;
	other_information?: string | null;
};

// Admin Reports Page Component
export default function AdminReportsPage() {
	// State for reports and loading
	const router = useRouter();
	const [reports, setReports] = useState<Report[]>([]);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	// Fetch reports on mount
	useEffect(() => {
		// Mounting flag to prevent state updates after unmount
		let mounted = true;

		// Fetch recent animal reports
		const run = async () => {
			// Verify authenticated user
			const { data: { user } } = await supabase.auth.getUser();
			
			// Check if still mounted
			if (!mounted) return;

			// Verify admin user
			if (!user) {
				router.replace("/admin/login");
				return;
			}

			// Verify admin privileges
			const { data: admin } = await supabase
				.from("admin")
				.select("auth_id")
				.eq("auth_id", user.id)
				.maybeSingle();

			// Check if still mounted
			if (!mounted) return;

			// If not an admin, redirect to login with error
			if (!admin) {
				await supabase.auth.signOut();
				router.replace("/admin/login?error=unauthorized");
				return;
			}

			// Fetch animal reports
			const { data, error } = await supabase
				.from("animal_report")
				.select(
					"report_id, animal_name, animal_type, animal_gender, date_seen, area, landmark, created_at, photo_url, latitude, longitude, report_status, health_issues, animal_collar, other_information"
				)
				.order("created_at", { ascending: false })
				.limit(50);
			
			// Check if still mounted
			if (!mounted) return;

			// Debug logging
			console.log("AdminReports fetch", { user, admin, data, error });

			// Handle fetch results
			if (!error && data) {
				// Prioritize: Pending > Accepted > Rejected
				const sorted = (data as Report[]).sort((a, b) => {
					const statusOrder: Record<string, number> = { 'Pending': 0, 'Accepted': 1, 'Rejected': 2 };
					const aOrder = statusOrder[a.report_status || 'Pending'] ?? 3;
					const bOrder = statusOrder[b.report_status || 'Pending'] ?? 3;
					return aOrder - bOrder;
				});
				// Set the sorted reports
				setReports(sorted);
			} else if (error) {
				setFetchError(error.message ?? String(error));
			}
			// Finalize loading state
			setLoading(false);
		};
		// Run the fetch
		run();
		return () => {
			mounted = false;
		};
	}, [router]);

	return (
		<main className="min-h-screen bg-yellow-50">
			<div className="max-w-5xl mx-auto p-6">
				<header className="flex items-center justify-between mb-4">
					<h1 className="text-2xl font-semibold text-gray-900">Animal Reports</h1>
					<nav className="space-x-3 text-sm">
						<Link href="/admin" className="text-gray-600 hover:underline">Admin Home</Link>
						<Link href="/form" className="text-gray-600 hover:underline">Open Report Form</Link>
					</nav>
				</header>

				{loading ? (
					<p className="text-sm text-gray-600">Loading reports…</p>
				) : reports.length === 0 ? (
					<p className="text-sm text-gray-600">No reports yet.</p>
				) : (
					<ul className="divide-y divide-gray-200 bg-white/70 rounded-xl border">
						{reports.map((r) => (
							<li key={r.report_id} className="p-4 flex items-center gap-4">
								<div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
									{r.photo_url ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={r.photo_url} alt={r.animal_name ?? 'Animal'} className="w-full h-full object-cover" />
									) : (
										<span className="text-xs text-gray-400">No photo</span>
									)}
								</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-gray-900 truncate">
									{r.animal_name || 'Unnamed'} - {r.animal_type || 'animal'} ({r.animal_gender || 'unknown'})
								</p>
								<p className="text-xs text-gray-600 truncate">
									{r.area || '—'} {r.landmark ? `• near ${r.landmark}` : ''}
								</p>
								<p className="text-xs text-gray-500">
									{r.date_seen ? new Date(r.date_seen).toLocaleString() : r.created_at ? new Date(r.created_at).toLocaleString() : ''}
								</p>
								<div className="flex items-center gap-2 mt-1">
									<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
										r.report_status === 'Accepted' ? 'bg-green-100 text-green-700' :
										r.report_status === 'Rejected' ? 'bg-red-100 text-red-700' :
										'bg-yellow-100 text-yellow-700'
									}`}>
										{r.report_status || 'Pending'}
									</span>
								</div>
							</div>
							{r.report_id ? (
								<Link href={`/admin/report/${r.report_id}`} className="text-xs text-purple-700 hover:underline whitespace-nowrap">View</Link>
							) : (
								<span className="text-xs text-gray-400">No ID</span>
							)}
							</li>
						))}
					</ul>
				)}
			</div>
		</main>
	);
}

