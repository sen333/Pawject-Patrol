"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";

type Animal = {
	animal_id?: string;
	created_at?: string | null;
	animal_name?: string | null;
	animal_species?: string | null;
	animal_breed?: string | null;
	animal_description?: string | null;
	animal_status?: string | null;
	animal_photo?: string | null;
};

// Actual bucket id from Supabase
const BUCKET = "Animal Profile Photos" as const;

function statusBadgeClasses(status?: string | null) {
	const s = (status || "").toLowerCase();
	if (s.includes("available")) return "bg-green-100 text-green-800 border-green-200";
	if (s.includes("shelter") || s.includes("rescue")) return "bg-blue-100 text-blue-800 border-blue-200";
	if (s.includes("treat") || s.includes("care")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
	if (s.includes("lost") || s.includes("missing")) return "bg-red-100 text-red-800 border-red-200";
	return "bg-gray-100 text-gray-800 border-gray-200";
}

export default function AdminProfilesListPage() {
	const [animals, setAnimals] = useState<Animal[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);



	useEffect(() => {
		let active = true;
		const load = async () => {
			setLoading(true);
			setError(null);
			const { data, error } = await supabase
				.from("animal")
				.select("*")
				.order("created_at", { ascending: false })
				.limit(200);
			if (!active) return;
			if (error) {
				setError(error.message);
				setAnimals([]);
			} else {
				setAnimals((data || []) as Animal[]);
			}
			setLoading(false);
		};
		load();
		return () => {
			active = false;
		};
	}, []);

	return (
		<main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-extrabold text-gray-900">Animal Profiles</h1>
						<p className="text-sm text-gray-600">All profiles, similar to the public catalog</p>
					</div>
					<div className="flex items-center gap-3">
						<Link
							href="/admin/profiles/animal"
							className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 shadow"
						>
							Add Animal Profile
						</Link>
						<Link href="/admin" className="text-sm text-purple-700 hover:underline">← Back to Admin</Link>
					</div>
				</div>

				{loading && (
					<div className="py-16 text-center text-gray-500">Loading animals…</div>
				)}

				{error && (
					<div className="py-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4">
						{error}
					</div>
				)}

				{!loading && animals.length === 0 && (
					<div className="text-center py-16 text-gray-500">No animals found.</div>
				)}

				{/* Grid of animal cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{animals.map((a, idx) => {
						const name = a.animal_name || "Unnamed";
						const species = a.animal_species || "Unknown";
						const breed = a.animal_breed || "";
						const status = a.animal_status || "";
						const photo = a.animal_photo || "";
						return (
							<div
								key={(a.animal_id as string) || `${name}-${idx}`}
								className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
							>
								<div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100">
									{photo ? (
										// Use img to avoid remotePatterns config requirements
										<img
											src={photo}
											alt={name}
											className="w-full h-full object-cover"
											loading="lazy"
											onError={(e) => {
												const img = e.currentTarget as HTMLImageElement;
												const tried = img.getAttribute("data-try") || "0";
												// Try replacing encoded space bucket with hyphenated id, then underscored id
												if (tried === "0" && img.src.includes("/Animal%20Profile%20Photos/")) {
													img.setAttribute("data-try", "1");
													img.src = img.src.replace("/Animal%20Profile%20Photos/", "/" + BUCKET + "/");
													return;
												}
												if (tried === "1" && img.src.includes("/" + BUCKET + "/")) {
													img.setAttribute("data-try", "2");
													img.src = img.src.replace("/" + BUCKET + "/", "/animal_profile_photos/");
													return;
												}
												// Fallback: clear src to show placeholder
												img.src = "";
											}}
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
											No photo
										</div>
									)}
									<div
										className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(
											status
										)}`}
									>
										{status || "Unknown"}
									</div>
								</div>
								<div className="p-6">
									<h3 className="text-2xl font-bold text-gray-900 mb-1">{name}</h3>
									<p className="text-sm text-gray-600 mb-4">
										{breed ? `${breed} • ${species}` : species}
									</p>
									{a.animal_description && (
										<p className="text-sm text-gray-700 line-clamp-3 mb-4">{a.animal_description}</p>
									)}
									<Link
										href={`/admin/profiles/animal/${a.animal_id}`}
										className="inline-block px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
									>
										Edit Animal
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</main>
	);
}

