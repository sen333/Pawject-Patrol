// NOTE: Temporary admin animal profiles page for backend testing
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Upload } from "lucide-react";
import { createAnimalProfile } from "@/actions/profiles/admin";

// Animal row type with optional fields to accommodate slight column name variations
type Animal = {
	animal_id: string;
	created_at: string | null;
	animal_name?: string | null;
	animal_species?: string | null; // some schemas use animal_species
	animal_breed?: string | null;
	animal_description?: string | null; // animal_description or
	animal_descr?: string | null;       // animal_descr (shortened)
	animal_status?: string | null;
	animal_photo?: string | null;
};

// Map a status string to simple badge classes
function statusClasses(status?: string | null) {
	const s = (status || "").toLowerCase();
	if (s.includes("adopt")) return "bg-green-100 text-green-700";
	if (s.includes("rescue") || s.includes("shelter")) return "bg-blue-100 text-blue-700";
	if (s.includes("treat") || s.includes("care")) return "bg-yellow-100 text-yellow-700";
	if (s.includes("lost") || s.includes("missing")) return "bg-red-100 text-red-700";
	return "bg-gray-100 text-gray-700";
}

// Admin profiles list page - reads animals from the `animal` table
export default function AdminProfilesPage() {
	const BUCKET = "Animal Profile Photos" as const;
	const router = useRouter();

	// UI state
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [animals, setAnimals] = useState<Animal[]>([]);


	// Form state for new animal profile
	const [name, setName] = useState("");
	const [species, setSpecies] = useState("");
	const [breed, setBreed] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState("In Shelter");
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitMsg, setSubmitMsg] = useState<string | null>(null);

	// Restore form data from sessionStorage on mount
	useEffect(() => {
		const savedData = sessionStorage.getItem('animalProfileFormData');
		if (savedData) {
			try {
				const data = JSON.parse(savedData);
				if (data.name) setName(data.name);
				if (data.species) setSpecies(data.species);
				if (data.breed) setBreed(data.breed);
				if (data.description) setDescription(data.description);
				if (data.status) setStatus(data.status);
				if (data.photoBase64 && data.photoName && data.photoType) {
					setPhotoPreview(data.photoBase64);
					// Reconstruct File from base64
					fetch(data.photoBase64)
						.then(res => res.blob())
						.then(blob => {
							const file = new File([blob], data.photoName, { type: data.photoType });
							setPhotoFile(file);
						});
				}
			} catch (error) {
				console.error('Failed to restore form data:', error);
			}
		}
	}, []);

	// Verify admin, then fetch animals
	useEffect(() => {
		let mounted = true;

		const run = async () => {
			// Check authentication
			const { data: { user }, error: authError } = await supabase.auth.getUser();
			if (!mounted) return;

			if (authError || !user) {
				router.replace("/admin/login");
				return;
			}

			// Verify user is an admin
			const { data: admin, error: adminError } = await supabase
				.from("admin")
				.select("auth_id")
				.eq("auth_id", user.id)
				.maybeSingle();
			if (!mounted) return;

			if (adminError || !admin) {
				await supabase.auth.signOut();
				router.replace("/admin/login?error=unauthorized");
				return;
			}

			await fetchAnimals();
		};

		run();
		return () => { mounted = false; };
	}, [router]);

	// Fetch animals helper
	const fetchAnimals = async () => {
		setLoading(true);
		setError(null);
		const { data, error } = await supabase
			.from("animal")
			.select("*")
			.order("created_at", { ascending: false })
			.limit(100);

		if (error) {
			setError(error.message);
			setAnimals([]);
		} else {
			setAnimals((data || []) as Animal[]);
		}
		setLoading(false);
	};

	// Handle local photo preview
	const handlePhotoChange = (file: File | null) => {
		setPhotoFile(file);
		setPhotoPreview(file ? URL.createObjectURL(file) : null);
	};

	// Upload photo and return the public URL
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

	// Navigate to confirmation page
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Save all form data to sessionStorage
		const formData: any = {
			name,
			species,
			breed,
			description,
			status,
		};
		
		if (photoFile && photoPreview) {
			formData.photoBase64 = photoPreview;
			formData.photoName = photoFile.name;
			formData.photoType = photoFile.type;
		}
		
		sessionStorage.setItem('animalProfileFormData', JSON.stringify(formData));
		
		// Build query params
		const params = new URLSearchParams({
			name,
			species,
			breed,
			description,
			status,
			photoUrl: photoPreview || '',
		});
		
		router.push(`/admin/profiles/animal/confirm?${params.toString()}`);
	};

	return (
		<main className="min-h-screen bg-yellow-50">
			<div className="max-w-6xl mx-auto p-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-gray-900">Animal Profiles</h1>
						<p className="text-sm text-gray-600">Temporary listing of animals from the database</p>
					</div>
					<Link href="/admin/profiles" className="text-sm text-purple-700 hover:underline">← Back to Animal Profiles</Link>
				</div>

				{/* Creation Form */}
				<form onSubmit={handleSubmit} className="mt-6 bg-white rounded-xl border p-5 grid gap-4 md:grid-cols-2">
					<div className="md:col-span-2">
						<h2 className="text-lg font-semibold text-gray-800">Animal Details</h2>
						<p className="text-xs text-gray-500">Fill required details and upload a photo.</p>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Name *</label>
						<input value={name} onChange={e=>setName(e.target.value)} required className="border rounded-md px-2 py-1 text-sm" placeholder="e.g. Buddy" />
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Species *</label>
						<input value={species} onChange={e=>setSpecies(e.target.value)} required className="border rounded-md px-2 py-1 text-sm" placeholder="e.g. Dog" />
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Breed</label>
						<input value={breed} onChange={e=>setBreed(e.target.value)} className="border rounded-md px-2 py-1 text-sm" placeholder="e.g. Labrador" />
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Status *</label>
						<select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded-md px-2 py-1 text-sm">
							<option>In Shelter</option>
							<option>Available for Adoption</option>
							<option>Under Treatment</option>
							<option>Lost / Missing</option>
						</select>
					</div>
					<div className="md:col-span-2 flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Description</label>
						<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="border rounded-md px-2 py-1 text-sm resize-y" placeholder="Short physical / behavioral notes" />
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Photo</label>
						<div className="flex items-center gap-4">
							<div
								className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer"
								onClick={() => document.getElementById('admin-photo-input')?.click()}
							>
								{photoPreview ? (
									<img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
								) : (
									<div className="flex flex-col items-center text-gray-500 text-[10px] gap-1">
										<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
											<circle cx="12" cy="13" r="4" />
										</svg>
										<span>Photo</span>
									</div>
								)}
							</div>
							<input id="admin-photo-input" type="file" accept="image/*" onChange={e=>handlePhotoChange(e.target.files?.[0]||null)} className="text-xs" />
						</div>
						<p className="text-[10px] text-gray-400 flex items-center gap-1"><Upload className="w-3 h-3" /> Click box to upload (stored public).</p>
					</div>
					<div className="md:col-span-2 flex items-center gap-3 mt-2">
						<button type="submit" className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm hover:bg-purple-700">
							Confirm Animal
						</button>
						{submitMsg && <span className="text-xs text-gray-600">{submitMsg}</span>}
					</div>
				</form>



				{/* Footer hint */}
				<p className="mt-3 text-[11px] text-gray-500">This page is temporary and for testing purposes only.</p>
			</div>
		</main>
	);
}

