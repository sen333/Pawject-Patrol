"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogIn, MapPin, PawPrint, Unlink2, ArrowRight } from "lucide-react";
import { FaMars, FaVenus } from "react-icons/fa";
import { supabase } from "@/utils/supabase/client";

// Animal type definition
type Animal = {
	animal_id?: string;
	created_at?: string | null;
	animal_name?: string | null;
	animal_species?: string | null;
	animal_breed?: string | null;
	animal_gender?: string | null;
	animal_description?: string | null;
	animal_status?: string | null;
	animal_photo?: string | null;
	animal_affiliation?: string | null;
	animal_collar?: string | null;
	animal_theme?: string | null;
};

// Actual bucket id from Supabase
const BUCKET = "Animal Profile Photos" as const;

// Helper: convert animal_theme name to hex color
function getThemeColor(theme: string | null | undefined): string {
	if (!theme) return "#689668"; // default green
	const themeMap: Record<string, string> = {
		blue: "#5E9BBA",
		green: "#689668",
		orange: "#DCB57E",
		pink: "#C575AD",
	};
	return themeMap[theme.toLowerCase()] || "#689668";
}

// Admin Profiles List Page Component
export default function AdminProfilesListPage() {
	const [animals, setAnimals] = useState<Animal[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<'all' | 'cat' | 'dog'>('all');

	// Fetch animals on mount
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

	// Filter animals by species and search (same as catalog)
	const filteredAnimals = animals.filter(a => {
		// Filter by species
		if (filter !== 'all') {
			const species = (a.animal_species || '').toLowerCase();
			if (species !== filter) return false;
		}
		// Filter by search (name, breed, species, gender)
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			if (
				!(a.animal_name || "").toLowerCase().includes(q) &&
				!(a.animal_breed || "").toLowerCase().includes(q) &&
				!(a.animal_species || "").toLowerCase().includes(q) &&
				!(a.animal_gender || "").toLowerCase().includes(q)
			) {
				return false;
			}
		}
		return true;
	});

	 return (
	 <>
	 {/* Floating Add Animal Button */}
	 <Link
	 href="/admin/profiles/animal"
	 aria-label="Add Animal"
	 className="fixed bottom-4 right-6 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 bg-[#E1E69D] text-[#3C3333] hover:text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:bg-[#C2C876] transition-colors z-20"
	 >
	 <svg
	 xmlns="http://www.w3.org/2000/svg"
	 viewBox="0 0 24 24"
	 fill="none"
	 stroke="currentColor"
	 strokeWidth={2}
	 strokeLinecap="round"
	 strokeLinejoin="round"
	 className="w-7 h-7 animate-pulse"
	 >
	 <line x1="12" y1="5" x2="12" y2="19" />
	 <line x1="5" y1="12" x2="19" y2="12" />
	 </svg>
	 </Link>

	 <main className="min-h-screen bg-[#E6E6E6]">
	 <div className="max-w-7xl mx-auto px-4 py-0">
	 {/* Navigation header */}
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
	 {/* Page header below navigation, styled like animal profile form */}
	<header className="flex flex-col items-start justify-center py-6 mb-6">
		 <h1
			 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1"
			 style={{
				 color: "#C2C876",
				 WebkitTextStrokeWidth: ".5px",
				 WebkitTextStrokeColor: "#3C3333",
				 fontFamily: '"Kawaii RT", sans-serif',
				 fontStyle: "normal",
				 fontWeight: 400,
				 lineHeight: "normal",
				 outlineColor: "#3C3333",
			 }}
		 >
			 Animal Profiles
		 </h1>
		 <p
			 className="text-xs sm:text-sm md:text-md"
			 style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif' }}
		 >
			 View and manage all animal profiles in the system
		 </p>
	 </header>

					{/* Filter Buttons and Search input in one row */}
					<div className="flex flex-wrap gap-2 mb-6 mt-2 items-center justify-between">
						<div className="flex gap-2">
							<button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-full font-medium transition-all ${filter === 'all' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'}`}>All Animals</button>
							<button onClick={() => setFilter('cat')} className={`px-6 py-2 rounded-full font-medium transition-all ${filter === 'cat' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'}`}>🐱 Cats</button>
							<button onClick={() => setFilter('dog')} className={`px-4 py-2 rounded-full font-medium transition-all ${filter === 'dog' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'}`}>🐶 Dogs</button>
						</div>
						<div className="flex-1 flex justify-end min-w-[300px]">
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search by name, breed, or species..."
								className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
							/>
						</div>
					</div>

					{loading && <div className="py-16 text-center text-gray-500">Loading animals…</div>}

					{error && (
						<div className="py-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4">
							{error}
						</div>
					)}

					{!loading && filteredAnimals.length === 0 && (
						<div className="text-center py-16 text-gray-500">No animals found.</div>
					)}

					{/* Grid of animal cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredAnimals.map((pet, idx) => {
							const color = getThemeColor(pet.animal_theme);
							return (
								<div
									key={(pet.animal_id as string) || `animal-${idx}`}
									className="shadow-lg hover:shadow-xl transition rounded-2xl overflow-hidden flex flex-col h-full bg-transparent"
								>
									{/* Image Section */}
									<div className="relative h-64 w-full bg-white">
										{pet.animal_photo ? (
											<Image
												src={pet.animal_photo}
												alt={pet.animal_name || "Animal"}
												fill
												className="object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
												No photo
											</div>
										)}
										<div className="absolute bottom-3 left-3 text-white">
											<h3 className="text-xl font-extrabold drop-shadow">
												{pet.animal_name || "Unnamed"}
											</h3>
											<p className="text-sm font-medium drop-shadow">{pet.animal_breed || "Unknown breed"}</p>
										</div>
									</div>

									{/* Colored Panel */}
									<div
										className="flex-1 flex flex-col justify-between p-5 rounded-b-2xl"
										style={{
											backgroundColor: color,
											color: "#E6E6E6",
											fontFamily: '"Genty Sans", sans-serif',
											fontSize: "15px",
											fontStyle: "normal",
											fontWeight: 500,
											lineHeight: "20px",
											minHeight: "180px",
											marginTop: "-1px",
										}}
									>
										<p className="mb-3 flex items-center gap-2">
											<MapPin className="w-4 h-4" /> {pet.animal_affiliation || "CSM"}
										</p>

										<div className="grid grid-cols-3 gap-3 mb-4 text-center">
											{[
												{
													icon: <PawPrint className="w-5 h-5 mx-auto" />,
													label: pet.animal_species || "Unknown",
												},
												{
													icon:
														pet.animal_gender === "Male" ? (
															<FaMars className="w-5 h-5 mx-auto" />
														) : (
															<FaVenus className="w-5 h-5 mx-auto" />
														),
													label: pet.animal_gender || "Unknown",
												},
												{
													icon: <Unlink2 className="w-5 h-5 mx-auto" />,
													label: pet.animal_collar || "None",
												},
											].map((pill, i) => (
												<div
													key={i}
													className="backdrop-blur-md rounded-xl py-2 flex flex-col items-center gap-1 border border-white"
													style={{ backgroundColor: "rgba(0,0,0,0.15)", color: "#E6E6E6" }}
												>
													{pill.icon}
													<span className="text-xs">{pill.label}</span>
												</div>
											))}
										</div>

										<Link
											href={`/admin/profiles/animal/${pet.animal_id}`}
											className="flex items-center gap-2 font-semibold"
										>
											Edit Details <ArrowRight className="w-4 h-4" />
										</Link>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</main>
		</>
	);
}

