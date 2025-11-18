"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Upload } from "lucide-react";
import { updateAnimalProfile } from "@/actions/profiles/admin";

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

const BUCKET = "Animal Profile Photos" as const;

export default function EditAnimalPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string | undefined;

	const [animal, setAnimal] = useState<Animal | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Form state
	const [name, setName] = useState("");
	const [species, setSpecies] = useState("");
	const [breed, setBreed] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState("In Shelter");
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitMsg, setSubmitMsg] = useState<string | null>(null);

	// Fetch animal data
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
			} else if (data) {
				const animalData = data as Animal;
				setAnimal(animalData);
				// Pre-populate form
				setName(animalData.animal_name || "");
				setSpecies(animalData.animal_species || "");
				setBreed(animalData.animal_breed || "");
				setDescription(animalData.animal_description || "");
				setStatus(animalData.animal_status || "In Shelter");
				setPhotoPreview(animalData.animal_photo || null);
			}
			setLoading(false);
		};
		fetchOne();
		return () => {
			active = false;
		};
	}, [id]);

	const handlePhotoChange = (file: File | null) => {
		setPhotoFile(file);
		setPhotoPreview(file ? URL.createObjectURL(file) : animal?.animal_photo || null);
	};

	const uploadPhoto = async (): Promise<string | undefined> => {
		if (!photoFile) return undefined;
		try {
			const ext = photoFile.name.split('.')?.pop() || 'jpg';
			const path = `${crypto.randomUUID()}.${ext}`;
			const { error } = await supabase.storage.from(BUCKET).upload(path, photoFile, {
				cacheControl: '3600', upsert: false,
			});
			if (error) {
				console.warn('Photo upload error', error.message);
				return undefined;
			}
			const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
			return urlData.publicUrl;
		} catch (e) {
			console.warn('Photo upload exception', e);
			return undefined;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!id) return;
		setSubmitting(true);
		setSubmitMsg(null);
		try {
			const photoUrl = await uploadPhoto();
			const res = await updateAnimalProfile({
				id,
				name,
				species,
				breed,
				description,
				status,
				photoUrl,
			});
			if (!res.success) {
				setSubmitMsg(res.error || 'Failed to update profile');
			} else {
				setSubmitMsg('Animal profile updated successfully');
				setTimeout(() => {
					router.push(`/admin/profiles/animal/${id}`);
				}, 1000);
			}
		} catch (err: any) {
			setSubmitMsg(err?.message || 'Unexpected error');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-extrabold text-gray-900">Edit Animal Profile</h1>
					<Link href={`/admin/profiles/animal/${id}`} className="text-sm text-purple-700 hover:underline">
						← Back to Profile
					</Link>
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
					<form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
						<div className="grid gap-6 md:grid-cols-2">
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Name *</label>
								<input
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
									placeholder="e.g. Buddy"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Species *</label>
								<input
									value={species}
									onChange={(e) => setSpecies(e.target.value)}
									required
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
									placeholder="e.g. Dog"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Breed</label>
								<input
									value={breed}
									onChange={(e) => setBreed(e.target.value)}
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
									placeholder="e.g. Labrador"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Status *</label>
								<select
									value={status}
									onChange={(e) => setStatus(e.target.value)}
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
								>
									<option>In Shelter</option>
									<option>Available for Adoption</option>
									<option>Under Treatment</option>
									<option>Lost / Missing</option>
								</select>
							</div>
							<div className="md:col-span-2 flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Description</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={4}
									className="border border-gray-300 rounded-md px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
									placeholder="Physical and behavioral notes"
								/>
							</div>
							<div className="md:col-span-2 flex flex-col gap-2">
								<label className="text-sm font-semibold text-gray-700">Photo</label>
								<div className="flex items-start gap-4">
									<div
										className="w-32 h-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-400 transition-colors"
										onClick={() => document.getElementById('edit-photo-input')?.click()}
									>
										{photoPreview ? (
											<img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
										) : (
											<div className="flex flex-col items-center text-gray-400 text-xs gap-1">
												<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
													<circle cx="12" cy="13" r="4" />
												</svg>
												<span>Click to upload</span>
											</div>
										)}
									</div>
									<div className="flex-1">
										<input
											id="edit-photo-input"
											type="file"
											accept="image/*"
											onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
											className="text-xs"
										/>
										<p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
											<Upload className="w-3 h-3" /> Upload a new photo to replace the current one
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-8 flex items-center gap-3">
							<button
								type="submit"
								disabled={submitting}
								className="px-6 py-2 rounded-md bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{submitting ? 'Saving...' : 'Save Changes'}
							</button>
							<Link
								href={`/admin/profiles/animal/${id}`}
								className="px-6 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
							>
								Cancel
							</Link>
							{submitMsg && (
								<span className={`text-sm ${submitMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
									{submitMsg}
								</span>
							)}
						</div>
					</form>
				)}
			</div>
		</main>
	);
}
