"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

type Animal = {
	animal_id: string;
	animal_name: string | null;
	animal_species: string | null;
	animal_breed: string | null;
	animal_description: string | null;
	animal_status: string | null;
	animal_photo: string | null;
	created_at: string | null;
};

function statusBadgeClasses(status?: string | null) {
	const s = (status || "").toLowerCase();
	if (s.includes("available")) return "bg-green-100 text-green-800 border-green-200";
	if (s.includes("adopted")) return "bg-gray-100 text-gray-800 border-gray-200";
	if (s.includes("pending")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
	if (s.includes("shelter") || s.includes("rescue")) return "bg-blue-100 text-blue-800 border-blue-200";
	if (s.includes("treat") || s.includes("care")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
	if (s.includes("lost") || s.includes("missing")) return "bg-red-100 text-red-800 border-red-200";
	return "bg-gray-100 text-gray-800 border-gray-200";
}

export default function AnimalDetailPage() {
	const params = useParams();
	const id = params?.id as string | undefined;
	const [animal, setAnimal] = useState<Animal | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;
		let active = true;
		const fetchOne = async () => {
			setLoading(true);
			setError(null);
			const { data, error } = await supabase
				.from("animal")
				.select("*")
				.eq("animal_id", id)
				.maybeSingle();
			if (!active) return;
			if (error) {
				setError(error.message);
				setAnimal(null);
			} else {
				setAnimal(data as Animal);
			}
			setLoading(false);
		};
		fetchOne();
		return () => {
			active = false;
		};
	}, [id]);

	return (
		<main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
			<div className="max-w-5xl mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-extrabold text-gray-900">Animal Profile</h1>
					<Link href="/catalog" className="text-sm text-purple-700 hover:underline">← Back to Catalog</Link>
				</div>

				{loading && (
					<div className="py-24 text-center text-gray-500">Loading...</div>
				)}
				{error && (
					<div className="py-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4">
						Error: {error}
					</div>
				)}
				{!loading && !error && !animal && (
					<div className="py-24 text-center text-gray-500">Animal not found.</div>
				)}

				{animal && (
					<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
						<div className="relative h-80 bg-gradient-to-br from-purple-100 to-pink-100">
							{animal.animal_photo ? (
								<img
									src={animal.animal_photo}
									alt={animal.animal_name || "Animal"}
									className="w-full h-full object-cover"
									onError={(e) => {
										(e.currentTarget as HTMLImageElement).style.display = "none";
									}}
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
									No photo
								</div>
							)}
							<div className={`absolute top-4 right-4 px-4 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(animal.animal_status)}`}>
								{animal.animal_status || "Unknown"}
							</div>
						</div>
						<div className="p-6 md:p-8">
							<h2 className="text-3xl font-bold text-gray-900 mb-2">{animal.animal_name || "Unnamed"}</h2>
							<p className="text-sm text-gray-600 mb-4">
								{[animal.animal_breed, animal.animal_species].filter(Boolean).join(" • ") || "Unknown"}
							</p>
							{animal.animal_description && (
								<p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
									{animal.animal_description}
								</p>
							)}
							<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
								<div>
									<dt className="font-medium text-gray-600">Status</dt>
									<dd className="text-gray-800">{animal.animal_status || "Unknown"}</dd>
								</div>
								<div>
									<dt className="font-medium text-gray-600">Species</dt>
									<dd className="text-gray-800">{animal.animal_species || "Unknown"}</dd>
								</div>
								<div>
									<dt className="font-medium text-gray-600">Breed</dt>
									<dd className="text-gray-800">{animal.animal_breed || "—"}</dd>
								</div>
								<div>
									<dt className="font-medium text-gray-600">Created</dt>
									<dd className="text-gray-800">{animal.created_at ? new Date(animal.created_at).toLocaleString() : "—"}</dd>
								</div>
							</dl>
							<div className="mt-8 flex gap-3">
								<Link
									href="/catalog"
									className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
								>
									Back
								</Link>
								<button
									disabled={!statusBadgeClasses(animal.animal_status).includes("green")}
									className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-semibold disabled:opacity-50"
								>
									Adopt Request
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}

