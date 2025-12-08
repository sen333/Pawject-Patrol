// NOTE: This is only a temporarily prompted admin reports page to test backend, not yet the final version

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

// Define the Report type
type Report = {
	report_id: string; // UUID
	report_title: string | null;
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
	const [search, setSearch] = useState("");

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
					"report_id, report_title, animal_type, animal_gender, date_seen, area, landmark, created_at, photo_url, latitude, longitude, report_status, health_issues, animal_collar, other_information"
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
		<main className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
			{/* Navigation Header */}
			<div className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
				<div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
					<Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition">
						<Menu className="w-6 h-6 text-gray-800" />
					</Link>
					<div className="flex-1 flex justify-center items-center h-full">
						<Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
					</div>
					<Link href="/admin/login" className="p-2 hover:bg-gray-100 rounded-lg transition">
						<LogIn className="w-6 h-6 text-gray-800" />
					</Link>
				</div>
			</div>

			{/* Page Header */}
			<div className="py-8" style={{ backgroundColor: '#E6E6E6' }}>
				<div className="max-w-5xl mx-auto px-6">
					<h2 
						className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1"
						style={{
							color: '#C2C876',
							WebkitTextStrokeWidth: '.5px',
							WebkitTextStrokeColor: '#3C3333',
							fontFamily: '"Kawaii RT", sans-serif',
							fontStyle: 'normal',
							fontWeight: 400,
							lineHeight: 'normal',
							outlineColor: '#3C3333',
						}}
					>
						Animal Reports
					</h2>
					<p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
						View and manage animal reports
					</p>
				</div>
			</div>

			<div className="max-w-5xl mx-auto px-6 pb-6">
				<div className="mb-4 flex gap-3 items-center justify-between">
					<div className="flex gap-3">
						<Link 
							href="/admin" 
							className="px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
							style={{ backgroundColor: '#E6E6E6', color: '#3C3333', fontFamily: '"Genty Sans", sans-serif', border: '1px solid #C2C876' }}
						>
							Admin Home
						</Link>
						<Link 
							href="/form" 
							className="px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
							style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
						>
							Open Report Form
						</Link>
					</div>
					<input
						type="text"
						placeholder="Search reports..."
						value={search}
						onChange={e => setSearch(e.target.value)}
						className="px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C2C876] bg-white min-w-[180px]"
						style={{ fontFamily: '"Genty Sans", sans-serif', color: '#3C3333' }}
					/>
				</div>

				{loading ? (
					<p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Loading reports…</p>
				) : reports.length === 0 ? (
					<p className="text-sm" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>No reports yet.</p>
				) : (
					<ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-lg">
						{reports
							.filter(r => {
								const q = search.trim().toLowerCase();
								if (!q) return true;
								return (
									(r.report_title?.toLowerCase().includes(q) || "") ||
									(r.animal_type?.toLowerCase().includes(q) || "") ||
									(r.area?.toLowerCase().includes(q) || "") ||
									(r.report_status?.toLowerCase().includes(q) || "")
								);
							})
							.map((r) => (
								<li key={r.report_id} className="p-4 flex items-center gap-4">
									<div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
										{r.photo_url ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={r.photo_url} alt={r.animal_type ?? "Animal"} className="w-full h-full object-cover" />
											) : (
												<span className="text-xs" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>No photo</span>
											)
									}
								</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-semibold truncate" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
									{r.report_title || 'Untitled Report'}
								</p>
								<p className="text-sm truncate" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
									{r.animal_type || 'animal'} ({r.animal_gender || 'unknown'})
								</p>
									<p className="text-xs truncate" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>
										{r.area || '—'} {r.landmark ? `• near ${r.landmark}` : ''}
									</p>
									<p className="text-xs" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>
										{r.date_seen ? new Date(r.date_seen).toLocaleString() : r.created_at ? new Date(r.created_at).toLocaleString() : ''}
									</p>
									<div className="flex items-center gap-2 mt-1">
										<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
											r.report_status === 'Accepted' ? 'bg-green-100 text-green-700' :
											r.report_status === 'Rejected' ? 'bg-red-100 text-red-700' :
											'bg-yellow-100 text-yellow-700'
										}`} style={{ fontFamily: '"Genty Sans", sans-serif' }}>
											{r.report_status || 'Pending'}
										</span>
									</div>
								</div>
								{r.report_id ? (
									<Link 
										href={`/admin/report/${r.report_id}`} 
										className="px-3 py-1 rounded text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
										style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
									>
										View
									</Link>
								) : (
									<span className="text-xs" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>No ID</span>
								)}
								</li>
							))}
					</ul>
				)}
			</div>
		</main>
	);
}

